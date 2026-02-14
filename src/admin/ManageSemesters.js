import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageSemesters() {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentSemester, setCurrentSemester] = useState({
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/semesters`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setSemesters(data);
            } else {
                setError('Failed to fetch semesters');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSemester({
            ...currentSemester,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/semesters/${currentSemester.id}`
            : `${API_BASE_URL}/semesters`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(currentSemester)
            });

            if (response.ok) {
                setShowModal(false);
                fetchSemesters();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving semester:', error);
            alert('Error saving semester');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (semester) => {
        setCurrentSemester({
            ...semester,
            startDate: semester.startDate.split('T')[0],
            endDate: semester.endDate.split('T')[0]
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this semester?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/semesters/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchSemesters();
            } else {
                alert('Failed to delete semester');
            }
        } catch (error) {
            console.error('Error deleting semester:', error);
        }
    };

    const resetForm = () => {
        setCurrentSemester({
            name: '',
            code: '',
            description: '',
            startDate: '',
            endDate: '',
            isActive: true
        });
        setIsEditing(false);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Semesters</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <i className="fas fa-plus me-2"></i> Add Semester
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
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {semesters.map(sem => (
                                    <tr key={sem.id}>
                                        <td>{sem.code}</td>
                                        <td>{sem.name}</td>
                                        <td>
                                            {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                                        </td>
                                        <td>{sem.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(sem)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(sem.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {semesters.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No semesters found</td>
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
                                <h5 className="modal-title">{isEditing ? 'Edit Semester' : 'Add Semester'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name (e.g., First Semester)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={currentSemester.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Code (e.g., 1ST_SEM)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="code"
                                            value={currentSemester.code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="description"
                                            value={currentSemester.description || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="startDate"
                                                value={currentSemester.startDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="endDate"
                                                value={currentSemester.endDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="isActive"
                                            id="isActive"
                                            checked={currentSemester.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Semester'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSemesters;
