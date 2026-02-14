import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function SubjectSchedulesView() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    const userRole = localStorage.getItem('userRole');
    const isAccounting = userRole === 'accounting';
    const isRegistrar = userRole === 'registrar';

    // Fetch real schedule data from database
    useEffect(() => {
        fetchSchedules();
    }, [selectedYearLevel, selectedSemester, selectedSchoolYear]);

    const fetchSchedules = async () => {
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

            // Build query parameters
            const params = new URLSearchParams();
            if (selectedYearLevel) params.append('yearLevel', selectedYearLevel);
            if (selectedSemester) params.append('semester', selectedSemester);
            if (selectedSchoolYear) params.append('schoolYear', selectedSchoolYear);

            const response = await fetch(`${API_BASE_URL}/schedules/registrar/all?${params}`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📅 Registrar schedules data received:', data);
                
                // Transform the data to match the table structure
                // Each subject (lecture/lab) will be a separate row based on courseType
                const transformedSchedules = [];
                
                data.forEach(yearGroup => {
                    yearGroup.subjects.forEach(subject => {
                        if (subject.hasSchedule && subject.schedules && subject.schedules.length > 0) {
                            // Each subject already represents a unique courseType (Lecture/Lab)
                            // So we create one row per subject
                            const firstSchedule = subject.schedules[0];
                            
                            transformedSchedules.push({
                                id: firstSchedule.id, // Use actual schedule ID
                                subject: subject.courseCode,
                                description: subject.courseDescription,
                                days: firstSchedule.day || 'TBA',
                                time: firstSchedule.startTime && firstSchedule.endTime ? 
                                    `${formatTime(firstSchedule.startTime)} - ${formatTime(firstSchedule.endTime)}` : 'TBA',
                                room: firstSchedule.room || 'TBA',
                                enrollees: `${firstSchedule.currentEnrolled || 0}/${firstSchedule.maxStudents || 40}`,
                                yearLevel: yearGroup.yearLevel,
                                semester: yearGroup.semester,
                                schoolYear: firstSchedule.schoolYear || '2025-2026',
                                instructor: firstSchedule.instructor || 'TBA',
                                status: firstSchedule.scheduleStatus || 'Open',
                                units: subject.units,
                                courseType: subject.courseType
                            });
                        } else if (!subject.hasSchedule) {
                            // If subject has no schedule, show it as TBA
                            transformedSchedules.push({
                                id: `no-schedule-${subject.subjectId}`,
                                subject: subject.courseCode,
                                description: subject.courseDescription,
                                days: 'TBA',
                                time: 'TBA',
                                room: 'TBA',
                                enrollees: '0/40',
                                yearLevel: yearGroup.yearLevel,
                                semester: yearGroup.semester,
                                schoolYear: '2025-2026',
                                instructor: 'TBA',
                                status: 'No Schedule',
                                units: subject.units,
                                courseType: subject.courseType
                            });
                        }
                    });
                });
                
                setSchedules(transformedSchedules);
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch schedules:', response.status, errorText);
                setError('Failed to fetch schedule data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError('Error fetching schedule data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return 'TBA';
        
        // Handle different time formats
        let timeStr = time.toString();
        
        // If it's already in HH:MM format, use it directly
        if (/^\d{1,2}:\d{2}[AP]M$/.test(timeStr)) {
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
        
        // Try to parse as a date and format
        try {
            const date = new Date(`2000-01-01T${timeStr}`);
            if (isNaN(date.getTime())) {
                return timeStr; // Return original if can't parse
            }
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return timeStr; // Return original if error
        }
    };

    const filteredSchedules = schedules.filter(schedule =>
        schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewClick = (e) => {
        if (isAccounting) {
            e.preventDefault();
            // window.alert('Forbidden: Access is restricted to Registrar.');
        }
    };

    const handleRefresh = () => {
        fetchSchedules();
    };

    const handleExportAll = () => {
        // TODO: Implement export functionality
        alert('Export functionality will be implemented soon!');
    };

    const handlePrintAll = () => {
        // TODO: Implement print functionality
        alert('Print functionality will be implemented soon!');
    };

    // Removed Update Enrollments and Check Stats features per request

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading subject schedules...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Schedules</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={handleRefresh}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Subject Schedules</h2>
                <span className="text-muted">SUBJECT SCHEDULES / ALL</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Schedule List</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={handleRefresh}>
                            <i className="fas fa-sync-alt me-1"></i> Refresh
                        </button>
                        {/* Update Enrollments feature removed */}
                        <button className="btn btn-outline-primary me-2" onClick={handleExportAll}>
                            <i className="fas fa-file-export me-1"></i> Export All
                        </button>
                        <button className="btn btn-outline-secondary me-2" onClick={handlePrintAll}>
                            <i className="fas fa-print me-1"></i> Print All
                        </button>
                        {/* Check Stats feature removed */}
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3 gx-2">
                        <div className="col-md-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!isRegistrar}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedYearLevel}
                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                                disabled={!isRegistrar}
                            >
                                <option value="">All Year Levels</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                disabled={!isRegistrar}
                            >
                                <option value="">All Semesters</option>
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedSchoolYear}
                                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                                disabled={!isRegistrar}
                            >
                                <option value="">All School Years</option>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2023-2024">2023-2024</option>
                            </select>
                        </div>
                    </div>



                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Subject</th>
                                    <th>Year Level</th>
                                    <th>Semester</th>
                                    <th>Days</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Instructor</th>
                                    <th>Enrollees</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.length > 0 ? filteredSchedules.map(schedule => (
                                    <tr key={schedule.id}>
                                        <td>
                                            <div><strong>{schedule.subject}</strong></div>
                                            <small className="text-muted">{schedule.description}</small>
                                            <br />
                                            <small className={`badge ${schedule.courseType === 'Lecture' ? 'bg-primary' : schedule.courseType === 'Laboratory' ? 'bg-success' : 'bg-secondary'}`}>
                                                {schedule.courseType}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-primary">{schedule.yearLevel}</span>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">{schedule.semester}</span>
                                        </td>
                                        <td>{schedule.days}</td>
                                        <td>{schedule.time}</td>
                                        <td>{schedule.room}</td>
                                        <td>{schedule.instructor}</td>
                                        <td>
                                            <span className={`badge ${parseInt(schedule.enrollees.split('/')[0]) >= parseInt(schedule.enrollees.split('/')[1]) ? 'bg-danger' : 'bg-success'}`}>
                                                {schedule.enrollees}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                schedule.status === 'Open' ? 'bg-success' : 
                                                schedule.status === 'Closed' ? 'bg-danger' : 'bg-warning'
                                            }`}>
                                                {schedule.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/registrar/manage/subject-schedules/${schedule.id}/enrolled-students`}
                                                className="btn btn-sm btn-outline-primary"
                                                title="View Enrolled Students"
                                                onClick={handleViewClick}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="10" className="text-center text-muted">
                                            {schedules.length === 0 ? 'No schedules found in database.' : 'No schedules match your search criteria.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubjectSchedulesView;
