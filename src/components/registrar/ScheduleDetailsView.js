import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function ScheduleDetailsView() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentsLoading, setStudentsLoading] = useState(false);

    useEffect(() => {
        fetchScheduleDetails();
    }, [id]);

    const fetchScheduleDetails = async () => {
        try {
            setLoading(true);
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

            // Fetch schedule details from the database
            const response = await fetch(`${API_BASE_URL}/schedules/registrar/all`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📅 Schedule details data received:', data);
                
                // Find the specific schedule by ID
                let foundSchedule = null;
                data.forEach(yearGroup => {
                    yearGroup.subjects.forEach(subject => {
                        if (subject.hasSchedule) {
                            subject.schedules.forEach(scheduleItem => {
                                if (scheduleItem.id.toString() === id) {
                                    foundSchedule = {
                                        ...scheduleItem,
                                        courseCode: subject.courseCode,
                                        courseDescription: subject.courseDescription,
                                        units: subject.units,
                                        courseType: subject.courseType
                                    };
                                }
                            });
                        }
                    });
                });
                
                if (foundSchedule) {
                    setSchedule(foundSchedule);
                    // Fetch enrolled students for this schedule
                    fetchEnrolledStudents(foundSchedule.id);
                } else {
                    setError('Schedule not found');
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch schedule details:', response.status, errorText);
                setError('Failed to fetch schedule details. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching schedule details:', err);
            setError('Error fetching schedule details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolledStudents = async (scheduleId) => {
        try {
            setStudentsLoading(true);
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
                console.log('👥 Enrolled students data received:', data);
                setEnrolledStudents(data);
            } else {
                console.error('Failed to fetch enrolled students:', response.status);
                setEnrolledStudents([]);
            }
        } catch (err) {
            console.error('Error fetching enrolled students:', err);
            setEnrolledStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return 'TBA';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading schedule details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Schedule</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={fetchScheduleDetails}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="alert alert-warning">
                        <h4>Schedule Not Found</h4>
                        <p>The requested schedule could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Schedule Details</h2>
                <span className="text-muted fw-bold">SUBJECT SCHEDULES / SHOW</span>
            </div>

            {/* Schedule Details Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Schedule Information
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="mb-2"><strong>Course Code:</strong> {schedule.courseCode}</p>
                            <p className="mb-2"><strong>Description:</strong> {schedule.courseDescription}</p>
                            <p className="mb-2"><strong>Units:</strong> {schedule.units}</p>
                            <p className="mb-2"><strong>Course Type:</strong> 
                                <span className={`badge ms-2 ${
                                    schedule.courseType === 'Lecture' ? 'bg-primary' : 
                                    schedule.courseType === 'Laboratory' ? 'bg-info' : 'bg-warning'
                                }`}>
                                    {schedule.courseType}
                                </span>
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="mb-2"><strong>Day:</strong> {schedule.day || 'TBA'}</p>
                            <p className="mb-2"><strong>Time:</strong> {schedule.startTime && schedule.endTime ? 
                                `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}` : 'TBA'}</p>
                            <p className="mb-2"><strong>Room:</strong> {schedule.room || 'TBA'}</p>
                            <p className="mb-2"><strong>Instructor:</strong> {schedule.instructor || 'TBA'}</p>
                            <p className="mb-0"><strong>Status:</strong> 
                                <span className={`badge ms-2 ${
                                    schedule.scheduleStatus === 'Open' ? 'bg-success' : 
                                    schedule.scheduleStatus === 'Closed' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                    {schedule.scheduleStatus || 'Open'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrollment Statistics Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                        <i className="fas fa-users me-2"></i>
                        Enrollment Statistics
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row text-center">
                        <div className="col-md-4">
                            <div className="border-end">
                                <h3 className="text-primary">{schedule.currentEnrolled || 0}</h3>
                                <p className="text-muted mb-0">Current Enrollees</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border-end">
                                <h3 className="text-success">{schedule.maxStudents || 40}</h3>
                                <p className="text-muted mb-0">Maximum Capacity</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <h3 className="text-info">{schedule.units || 0}</h3>
                            <p className="text-muted mb-0">Units</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List Card */}
            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Enrolled Students</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={() => fetchEnrolledStudents(schedule.id)}>
                            <i className="fas fa-sync-alt me-1"></i> Refresh
                        </button>
                        <button className="btn btn-outline-primary me-2">
                            <i className="fas fa-file-export me-1"></i> Export
                        </button>
                        <button className="btn btn-outline-secondary">
                            <i className="fas fa-print me-1"></i> Print
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Enrollment Status</label>
                            <select className="form-select">
                                <option>All Students</option>
                                <option>Enrolled and Assessed</option>
                                <option>Enrolled Only</option>
                            </select>
                        </div>
                    </div>
                    
                    {studentsLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading enrolled students...</p>
                        </div>
                    ) : enrolledStudents.length > 0 ? (
                        <div>
                            {/* Check if this is an error message response */}
                            {enrolledStudents[0]?.message ? (
                                <div className="alert alert-info">
                                    <h5>No Enrollment Data Found</h5>
                                    <p>{enrolledStudents[0].message}</p>
                                    
                                    {/* Show debug information if available */}
                                    {enrolledStudents[0]?.debug && (
                                        <div className="mt-3">
                                            <h6>Debug Information:</h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p><strong>Requested Schedule ID:</strong> {enrolledStudents[0].debug.requestedScheduleId}</p>
                                                    <p><strong>Total Enrollments:</strong> {enrolledStudents[0].debug.totalEnrollments}</p>
                                                    <p><strong>Available Schedule IDs:</strong></p>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {enrolledStudents[0].debug.availableScheduleIds.map(id => (
                                                            <span key={id} className="badge bg-secondary">{id}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <p><strong>Sample Enrollments:</strong></p>
                                                    <small className="text-muted">
                                                        {enrolledStudents[0].debug.sampleEnrollments.map((enrollment, index) => (
                                                            <div key={index}>
                                                                Student {enrollment.studentId} → Schedule {enrollment.scheduleId} ({enrollment.currentYearLevel} Year)
                                                            </div>
                                                        ))}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <p className="text-muted mb-0 mt-3">
                                        This might be because:
                                    </p>
                                    <ul className="text-muted">
                                        <li>The schedule ID <code>{enrolledStudents[0]?.debug?.requestedScheduleId || 'unknown'}</code> doesn't exist in the <code>student_enrollments</code> table</li>
                                        <li>The schedule ID in <code>bsit_schedules</code> doesn't match the <code>scheduleId</code> in <code>student_enrollments</code></li>
                                        <li>There's a mismatch in the database structure between tables</li>
                                    </ul>
                                    <div className="mt-3">
                                        <button 
                                            className="btn btn-outline-primary me-2"
                                            onClick={() => window.open('/api/schedules/registrar/diagnostic', '_blank')}
                                        >
                                            <i className="fas fa-database me-1"></i>
                                            Check Database Structure
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => fetchEnrolledStudents(schedule.id)}
                                        >
                                            <i className="fas fa-sync-alt me-1"></i>
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Summary by Year Level */}
                                    <div className="row mb-4">
                                        {enrolledStudents.map(yearGroup => (
                                            <div key={yearGroup.yearLevel} className="col-md-3 mb-3">
                                                <div className="card bg-light">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title text-primary">{yearGroup.yearLevel} Year</h5>
                                                        <h3 className="text-success">{yearGroup.count}</h3>
                                                        <p className="text-muted mb-0">Students</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Students Table Grouped by Year Level */}
                                    {enrolledStudents.map(yearGroup => (
                                        <div key={yearGroup.yearLevel} className="mb-4">
                                            <h5 className="border-bottom pb-2 mb-3">
                                                <span className="badge bg-primary me-2">{yearGroup.yearLevel} Year</span>
                                                {yearGroup.count} Student{yearGroup.count !== 1 ? 's' : ''}
                                            </h5>
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
                                                            <th>Status</th>
                                                            <th>Schedule Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {yearGroup.students.map(student => (
                                                            <tr key={student.id}>
                                                                <td><strong>{student.idNumber}</strong></td>
                                                                <td>{student.fullName}</td>
                                                                <td>
                                                                    <span className={`badge ${
                                                                        student.gender === 'Male' ? 'bg-primary' : 'bg-pink'
                                                                    }`}>
                                                                        {student.gender}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-info">{student.yearLevel}</span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-secondary">{student.semester}</span>
                                                                </td>
                                                                <td>{formatDate(student.enrollmentDate)}</td>
                                                                <td>
                                                                    <span className={`badge ${
                                                                        student.enrollmentStatus === 'Enrolled' ? 'bg-success' : 'bg-warning'
                                                                    }`}>
                                                                        {student.enrollmentStatus}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <small>
                                                                        <div><strong>Day:</strong> {student.day || 'TBA'}</div>
                                                                        <div><strong>Time:</strong> {student.startTime && student.endTime ? 
                                                                            `${student.startTime} - ${student.endTime}` : 'TBA'}</div>
                                                                        <div><strong>Room:</strong> {student.room || 'TBA'}</div>
                                                                        <div><strong>Instructor:</strong> {student.instructor || 'TBA'}</div>
                                                                    </small>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <i className="fas fa-users fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">No Students Enrolled</h5>
                            <p className="text-muted">This schedule currently has no enrolled students.</p>
                            <div className="mt-3">
                                <button 
                                    className="btn btn-outline-primary me-2"
                                    onClick={() => window.open('/api/schedules/registrar/diagnostic', '_blank')}
                                >
                                    <i className="fas fa-database me-1"></i>
                                    Check Database Structure
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => fetchEnrolledStudents(schedule.id)}
                                >
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ScheduleDetailsView;