import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function AllStudentsView({ enrolledStudents }) {
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';
    
    // Local state for students data
    const [localStudents, setLocalStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('AllStudentsView - enrolledStudents:', enrolledStudents); // Debug log
    console.log('AllStudentsView - enrolledStudents.length:', enrolledStudents?.length || 0); // Debug log
    
    // Fetch students data when component mounts
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setError('Session expired. Please login again.');
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                if (!sessionToken) {
                    setError('No session token found. Please login again.');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/students`, {
                    headers: {
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const students = await response.json();
                    console.log('AllStudentsView - Fetched students:', students);
                    
                    // Transform the data to match the expected format
                    const transformedStudents = students.map(student => {
                        // Map backend status to frontend display status
                        let displayStatus = 'Not registered';
                        if (student.academicStatus === 'Approved') {
                            displayStatus = 'Enrolled';
                        } else if (student.academicStatus === 'Pending') {
                            displayStatus = 'Pending';
                        } else if (student.academicStatus === 'Rejected') {
                            displayStatus = 'Rejected';
                        } else if (student.academicStatus) {
                            displayStatus = student.academicStatus;
                        }

                        return {
                            id: student.id,
                            idNumber: student.idNumber,
                            firstName: student.firstName,
                            lastName: student.lastName,
                            middleName: student.middleName,
                            gender: student.gender || 'N/A',
                            course: student.course || 'Not registered',
                            registrationStatus: displayStatus,
                            registrationDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : 'N/A'
                        };
                    });
                    
                    setLocalStudents(transformedStudents);
                    // Store timestamp of successful fetch
                    localStorage.setItem('lastStudentFetch', Date.now().toString());
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch students:', response.status, errorText);
                    setError('Failed to fetch students');
                }
            } catch (err) {
                console.error('Error fetching students:', err);
                setError('Error fetching students');
            } finally {
                setLoading(false);
            }
        };

        // Always fetch fresh data on component mount, regardless of props
        fetchStudents();
    }, []); // Empty dependency array - only run on mount

    // Add focus event listener to refresh data when user navigates to this page
    useEffect(() => {
        const handleFocus = () => {
            // Only refresh if we don't have data or if it's been more than 30 seconds since last fetch
            if (localStudents.length === 0 || !localStorage.getItem('lastStudentFetch')) {
                refreshStudents();
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden && localStudents.length === 0) {
                refreshStudents();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [localStudents.length]);
    
    // Use local students data if available, otherwise fall back to props
    const students = localStudents.length > 0 ? localStudents : (Array.isArray(enrolledStudents) ? enrolledStudents : []);
    
    const [searchTerm, setSearchTerm] = useState('');

    // Add a refresh function that can be called manually
    const refreshStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Validate and refresh session first
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                setError('Session expired. Please login again.');
                return;
            }
            
            const sessionToken = sessionManager.getSessionToken();
            if (!sessionToken) {
                setError('No session token found. Please login again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/students`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const students = await response.json();
                console.log('AllStudentsView - Refreshed students:', students);
                
                // Transform the data to match the expected format
                const transformedStudents = students.map(student => {
                    // Map backend status to frontend display status
                    let displayStatus = 'Not registered';
                    if (student.academicStatus === 'Approved') {
                        displayStatus = 'Enrolled';
                    } else if (student.academicStatus === 'Pending') {
                        displayStatus = 'Pending';
                    } else if (student.academicStatus === 'Rejected') {
                        displayStatus = 'Rejected';
                    } else if (student.academicStatus) {
                        displayStatus = student.academicStatus;
                    }

                    return {
                        id: student.id,
                        idNumber: student.idNumber,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        middleName: student.middleName,
                        gender: student.gender || 'N/A',
                        course: student.course || 'Not registered',
                        registrationStatus: displayStatus,
                        registrationDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : 'N/A'
                    };
                });
                
                setLocalStudents(transformedStudents);
                // Store timestamp of successful fetch
                localStorage.setItem('lastStudentFetch', Date.now().toString());
            } else {
                const errorText = await response.text();
                console.error('Failed to refresh students:', response.status, errorText);
                setError('Failed to refresh students');
            }
        } catch (err) {
            console.error('Error refreshing students:', err);
            setError('Error refreshing students');
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (e) => {
        if (!isRegistrar) {
            e.preventDefault();
            // Optionally, you can show a message, but for now, it just blocks the click.
            // alert('You do not have permission to view student details.');
        }
    };

    const filteredStudents = students.filter(student => {
        // Add null checks to prevent toLowerCase() errors
        if (!student || !student.lastName || !student.firstName || !student.idNumber) {
            return false; // Skip students with missing required data
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        const nameLower = `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.toLowerCase();
        const idNoLower = student.idNumber.toLowerCase();
        
        return nameLower.includes(searchTermLower) || idNoLower.includes(searchTermLower);
    });

    // Abbreviate course name for list view only
    const abbreviateCourse = (courseName) => {
        if (!courseName) return 'N/A';
        const normalized = String(courseName).trim().toLowerCase();
        if (normalized === 'bachelor of science in information technology' || normalized === 'bs in information technology' || normalized === 'bs information technology') {
            return 'BSIT';
        }
        return courseName;
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="m-0"></h2>
                <div>
                    <button 
                        className="btn btn-outline-primary me-2" 
                        onClick={refreshStudents}
                        disabled={loading}
                        title="Refresh student list"
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        {loading ? ' Refreshing...' : ' Refresh'}
                    </button>
                    <button className="btn btn-outline-secondary me-2">Export</button>
                    <button className="btn btn-primary">+ Add New</button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Student List</h4>
                </div>
                <div className="card-body">
                     <div className="row mb-3">
                        <div className="col-md-6"><div className="input-group">
                            <input type="text" 
                            className="form-control" 
                            placeholder="Search by ID No. or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div>
                     </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID No.</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Course</th>
                                    <th>Registration Status</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            <div className="d-flex justify-content-center align-items-center py-4">
                                                <div className="spinner-border text-primary me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span>Loading students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-danger py-4">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredStudents.length > 0 ? filteredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.idNumber || 'N/A'}</td>
                                        <td>{student.lastName && student.firstName ? `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.trim() : 'N/A'}</td>
                                        <td>{student.gender || 'N/A'}</td>
                                        <td>{abbreviateCourse(student.course)}</td>
                                        <td>
                                            <span className={`badge ${student.registrationStatus === 'Enrolled' ? 'bg-success' : 'bg-warning'}`}>
                                                {student.registrationStatus || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{student.registrationDate || 'N/A'}</td>
                                        <td>
                                            {/* Eye icon - View student details */}
                                            <Link to={`/registrar/students/${student.idNumber || '#'}`} className="btn btn-sm btn-info me-1" title="View Details">
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            {/* Pencil icon - Edit student info */}
                                            <Link to={`/registrar/students/${student.idNumber || '#'}/edit`} className="btn btn-sm btn-primary" title="Edit Info">
                                                <i className="fas fa-pencil-alt"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center text-muted">No students have completed registration yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllStudentsView;