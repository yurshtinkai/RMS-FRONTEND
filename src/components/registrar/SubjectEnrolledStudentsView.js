import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function SubjectEnrolledStudentsView() {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [scheduleDetails, setScheduleDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatTime = (time) => {
        if (!time) return 'TBA';
        
        // Handle different time formats
        let timeStr = time.toString();
        
        // If it's already in HH:MM AM/PM format, use it directly
        if (/^\d{1,2}:\d{2}[AP]M$/i.test(timeStr)) {
            return timeStr;
        }
        
        // If it's in HH:MM format without AM/PM, add AM/PM
        if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
            const [hours, minutes] = timeStr.split(':');
            const hour24 = parseInt(hours);
            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
            const ampm = hour24 >= 12 ? 'PM' : 'AM';
            return `${hour12}:${minutes}${ampm}`;
        }
        
        // For any other format, return as-is
        return timeStr;
    };

    useEffect(() => {
        if (scheduleId) {
            fetchScheduleDetails();
            fetchEnrolledStudents();
        }
    }, [scheduleId]);

    const fetchScheduleDetails = async () => {
        try {
            // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setError('Session expired. Please login again.');
                    setLoading(false);
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                
                if (!sessionToken) {
                    setError('No session token found. Please login again.');
                    setLoading(false);
                    return;
                }

            const response = await fetch(`${API_BASE_URL}/schedules/registrar/all`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Handle new response format with scheduleDetails
                if (data.scheduleDetails) {
                    console.log('📅 Using schedule details from API response:', data.scheduleDetails);
                    setScheduleDetails({
                        id: data.scheduleDetails.id,
                        subject: data.scheduleDetails.courseCode,
                        description: data.scheduleDetails.courseDescription,
                        units: data.scheduleDetails.units,
                        courseType: data.scheduleDetails.courseType,
                        yearLevel: data.scheduleDetails.yearLevel,
                        semester: data.scheduleDetails.semester,
                        day: data.scheduleDetails.dayOfWeek,
                        startTime: data.scheduleDetails.startTime,
                        endTime: data.scheduleDetails.endTime,
                        room: data.scheduleDetails.room,
                        capacity: data.scheduleDetails.maxStudents,
                        enrolled: data.scheduleDetails.currentEnrolled,
                        schoolYear: data.scheduleDetails.schoolYear,
                        instructor: 'TBA'
                    });
                } else {
                    // Fallback to old format (for backward compatibility)
                    let foundSchedule = null;
                    data.forEach(yearGroup => {
                        yearGroup.subjects.forEach(subject => {
                            if (subject.hasSchedule) {
                                subject.schedules.forEach(schedule => {
                                    if (schedule.id == scheduleId) {
                                        foundSchedule = {
                                            ...schedule,
                                            subject: subject.courseCode,
                                            description: subject.courseDescription,
                                            units: subject.units,
                                            courseType: subject.courseType,
                                            yearLevel: yearGroup.yearLevel,
                                            semester: yearGroup.semester
                                        };
                                    }
                                });
                            }
                        });
                    });
                    setScheduleDetails(foundSchedule);
                }
            }
        } catch (err) {
            console.error('Error fetching schedule details:', err);
            setError('Failed to fetch schedule details.');
        }
    };

    const fetchEnrolledStudents = async () => {
        try {
            // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setError('Session expired. Please login again.');
                    setLoading(false);
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                
                if (!sessionToken) {
                    setError('No session token found. Please login again.');
                    setLoading(false);
                    return;
                }

            const response = await fetch(`${API_BASE_URL}/schedules/registrar/enrolled-students/${scheduleId}`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📋 Enrolled students data received:', data);
                console.log('📋 Data type:', typeof data);
                console.log('📋 Data length:', Array.isArray(data) ? data.length : 'Not array');
                
                // Handle different response formats from backend
                let allStudents = [];
                
                if (data.students && Array.isArray(data.students)) {
                    // New format with students array
                    console.log('📋 Processing new format with students array');
                    data.students.forEach(yearGroup => {
                        if (yearGroup.students && Array.isArray(yearGroup.students)) {
                            allStudents = [...allStudents, ...yearGroup.students];
                        }
                    });
                } else if (Array.isArray(data)) {
                    // If it's an array, check if it has year groups or direct students
                    if (data.length > 0 && data[0].yearLevel && data[0].students) {
                        // Grouped by year level format
                        console.log('📋 Processing grouped format');
                        data.forEach(yearGroup => {
                            if (yearGroup.students && Array.isArray(yearGroup.students)) {
                                allStudents = [...allStudents, ...yearGroup.students];
                            }
                        });
                    } else if (data.length > 0 && data[0].id) {
                        // Direct students array format
                        console.log('📋 Processing direct students format');
                        allStudents = data;
                    } else {
                        console.log('📋 Unknown array format, treating as direct students');
                        allStudents = data;
                    }
                } else if (data && data.enrolledStudents) {
                    // Single object with enrolledStudents property
                    console.log('📋 Processing enrolledStudents property format');
                    allStudents = data.enrolledStudents;
                } else {
                    console.log('📋 Unknown data format, treating as direct students');
                    allStudents = data;
                }
                
                console.log('📋 Final processed students array:', allStudents);
                setEnrolledStudents(allStudents);
                
                // Handle schedule details if provided in the response
                if (data.scheduleDetails) {
                    console.log('📅 Setting schedule details from enrolled students response:', data.scheduleDetails);
                    setScheduleDetails({
                        id: data.scheduleDetails.id,
                        subject: data.scheduleDetails.courseCode,
                        description: data.scheduleDetails.courseDescription,
                        units: data.scheduleDetails.units,
                        courseType: data.scheduleDetails.courseType,
                        yearLevel: data.scheduleDetails.yearLevel,
                        semester: data.scheduleDetails.semester,
                        day: data.scheduleDetails.dayOfWeek,
                        startTime: data.scheduleDetails.startTime,
                        endTime: data.scheduleDetails.endTime,
                        room: data.scheduleDetails.room,
                        capacity: data.scheduleDetails.maxStudents,
                        enrolled: data.scheduleDetails.currentEnrolled,
                        schoolYear: data.scheduleDetails.schoolYear,
                        instructor: 'TBA'
                    });
                }
            } else {
                const errorText = await response.text();
                console.log('📋 Response not ok:', response.status, errorText);
                setEnrolledStudents([]);
            }
        } catch (err) {
            console.error('Error fetching enrolled students:', err);
            setError('Failed to fetch enrolled students.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/registrar/manage/subject-schedules');
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading enrolled students...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error</h4>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={handleBack}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="m-0">Subject Enrolled Students</h2>
                    <span className="text-muted">SUBJECT SCHEDULES / ENROLLED STUDENTS</span>
                </div>
                <button className="btn btn-outline-secondary" onClick={handleBack}>
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Schedules
                </button>
            </div>

            {scheduleDetails && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                        <h4 className="card-title mb-0">
                            <i className="fas fa-book me-2"></i>
                            Schedule Details
                        </h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <h5 className="text-primary">{scheduleDetails.subject}</h5>
                                <p className="text-muted mb-2">{scheduleDetails.description}</p>
                                <div className="row">
                                    <div className="col-6">
                                        <strong>Year Level:</strong> {scheduleDetails.yearLevel}
                                    </div>
                                    <div className="col-6">
                                        <strong>Semester:</strong> {scheduleDetails.semester}
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <strong>Units:</strong> {scheduleDetails.units}
                                    </div>
                                    <div className="col-6">
                                        <strong>Type:</strong> {scheduleDetails.courseType}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-6">
                                        <strong>Day:</strong> {scheduleDetails.day}
                                    </div>
                                    <div className="col-6">
                                        <strong>Time:</strong> {scheduleDetails.startTime && scheduleDetails.endTime ? 
                                            `${formatTime(scheduleDetails.startTime)} - ${formatTime(scheduleDetails.endTime)}` : 'TBA'}
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <strong>Room:</strong> {scheduleDetails.room || 'TBA'}
                                    </div>
                                    <div className="col-6">
                                        <strong>Instructor:</strong> {scheduleDetails.instructor || 'TBA'}
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-6">
                                        <strong>Capacity:</strong> {scheduleDetails.maxStudents}
                                    </div>
                                    <div className="col-6">
                                        <strong>Enrolled:</strong> {scheduleDetails.currentEnrolled}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">
                        <i className="fas fa-users me-2"></i>
                        Enrolled Students ({enrolledStudents.length})
                    </h4>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={fetchEnrolledStudents}>
                            <i className="fas fa-sync-alt me-1"></i> Refresh
                        </button>
                        <button className="btn btn-outline-success">
                            <i className="fas fa-file-export me-1"></i> Export List
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {enrolledStudents.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Gender</th>
                                        <th>Year Level</th>
                                        <th>Semester</th>
                                        <th>Enrollment Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrolledStudents.map((student, index) => (
                                        <tr key={student.id || index}>
                                            <td>
                                                {student.idNumber || 'N/A'}
                                            </td>
                                            <td>
                                                <div><strong>{student.fullName || `${student.lastName || ''}, ${student.firstName || ''}`}</strong></div>
                                                {student.middleName && <small className="text-muted">{student.middleName}</small>}
                                            </td>
                                            <td>
                                                {student.gender || 'N/A'}
                                            </td>
                                            <td>
                                                {student.yearLevel || 'N/A'}
                                            </td>
                                            <td>
                                                {student.semester || 'N/A'}
                                            </td>
                                            <td>
                                                {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="text-muted">
                                <i className="fas fa-users fa-3x mb-3"></i>
                                <h5>No Students Enrolled</h5>
                                <p>This subject currently has no enrolled students.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubjectEnrolledStudentsView;
