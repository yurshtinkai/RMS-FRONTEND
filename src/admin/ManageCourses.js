import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        code: '',
        name: '',
        description: '',
        departmentId: '',
        totalUnits: 0,
        duration: 4,
        level: 'Undergraduate',
        isActive: true
    });
    const [departments, setDepartments] = useState([]); // For dropdown
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const fetchCourses = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } else {
                setError('Failed to fetch courses');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/departments`, {
                headers: { 'X-Session-Token': sessionToken }
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCourse({
            ...currentCourse,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/courses/${currentCourse.id}`
            : `${API_BASE_URL}/courses`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(currentCourse)
            });

            if (response.ok) {
                setShowModal(false);
                fetchCourses();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error saving course');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setCurrentCourse(course);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchCourses();
            } else {
                alert('Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const resetForm = () => {
        setCurrentCourse({
            code: '',
            name: '',
            description: '',
            departmentId: '',
            totalUnits: 0,
            duration: 4,
            level: 'Undergraduate',
            isActive: true
        });
        setIsEditing(false);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Courses</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <i className="fas fa-plus me-2"></i> Add Course
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
                                    <th>Department</th>
                                    <th>Level</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course.id}>
                                        <td>{course.code}</td>
                                        <td>{course.name}</td>
                                        <td>
                                            {departments.find(d => d.id === course.departmentId)?.name || 'N/A'}
                                        </td>
                                        <td>{course.level}</td>
                                        <td>{course.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(course)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(course.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No courses found</td>
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
                                <h5 className="modal-title">{isEditing ? 'Edit Course' : 'Add Course'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Code (e.g., BSIT)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="code"
                                            value={currentCourse.code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Course Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={currentCourse.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={currentCourse.description || ''}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Total Units</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="totalUnits"
                                                value={currentCourse.totalUnits}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Duration (Years)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="duration"
                                                value={currentCourse.duration}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Level</label>
                                            <select
                                                className="form-select"
                                                name="level"
                                                value={currentCourse.level}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="Undergraduate">Undergraduate</option>
                                                <option value="Graduate">Graduate</option>
                                                <option value="Postgraduate">Postgraduate</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-select"
                                            name="departmentId"
                                            value={currentCourse.departmentId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="isActive"
                                            id="isActive"
                                            checked={currentCourse.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Course'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageCourses;
