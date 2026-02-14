import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentSubject, setCurrentSubject] = useState({
        code: '',
        name: '',
        units: '',
        courseId: '',
        yearLevel: '',
        semester: '',
        isActive: true
    });
    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSubjects();
        fetchCourses();
    }, []);

    const fetchSubjects = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/subjects`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                // Map backend fields to frontend expected fields
                const mappedData = data.map(subject => ({
                    ...subject,
                    code: subject.courseCode,
                    name: subject.courseDescription
                }));
                setSubjects(mappedData);
            } else {
                setError('Failed to fetch subjects');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: { 'X-Session-Token': sessionToken }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSubject({
            ...currentSubject,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/subjects/${currentSubject.id}`
            : `${API_BASE_URL}/subjects`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(currentSubject)
            });

            if (response.ok) {
                setShowModal(false);
                fetchSubjects();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Error saving subject');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setCurrentSubject(subject);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchSubjects();
            } else {
                alert('Failed to delete subject');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    };

    const resetForm = () => {
        setCurrentSubject({
            code: '',
            name: '',
            units: '',
            courseId: '',
            yearLevel: '',
            semester: '',
            isActive: true
        });
        setIsEditing(false);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Subjects</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <i className="fas fa-plus me-2"></i> Add Subject
                </button>
            </div>

            {loading && <div className="text-center"><div className="spinner-border"></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Units</th>
                                    <th>Course</th>
                                    <th>Year/Sem</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(subject => (
                                    <tr key={subject.id}>
                                        <td>{subject.code}</td>
                                        <td>{subject.name}</td>
                                        <td>{subject.units}</td>
                                        <td>
                                            {courses.find(c => c.id === subject.courseId)?.code || 'N/A'}
                                        </td>
                                        <td>{subject.yearLevel} - {subject.semester}</td>
                                        <td>{subject.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(subject)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(subject.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="7" className="text-center">No subjects found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? 'Edit Subject' : 'Add Subject'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Subject Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="code"
                                            value={currentSubject.code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subject Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={currentSubject.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Units</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="units"
                                            value={currentSubject.units}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Course</label>
                                        <select
                                            className="form-select"
                                            name="courseId"
                                            value={currentSubject.courseId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Course (Optional)</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.code}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Year Level</label>
                                            <select
                                                className="form-select"
                                                name="yearLevel"
                                                value={currentSubject.yearLevel}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Semester</label>
                                            <select
                                                className="form-select"
                                                name="semester"
                                                value={currentSubject.semester}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Semester</option>
                                                <option value="First Semester">First Semester</option>
                                                <option value="Second Semester">Second Semester</option>
                                                <option value="Summer">Summer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="isActive"
                                            id="isActive"
                                            checked={currentSubject.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Subject'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSubjects;
