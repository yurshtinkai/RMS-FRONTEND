import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageSchoolYears() {
    const [schoolYears, setSchoolYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentSchoolYear, setCurrentSchoolYear] = useState({
        year: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    const fetchSchoolYears = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/school-years`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setSchoolYears(data);
            } else {
                setError('Failed to fetch school years');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSchoolYear({
            ...currentSchoolYear,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/school-years/${currentSchoolYear.id}`
            : `${API_BASE_URL}/school-years`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(currentSchoolYear)
            });

            if (response.ok) {
                setShowModal(false);
                fetchSchoolYears();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving school year:', error);
            alert('Error saving school year');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sy) => {
        setCurrentSchoolYear({
            ...sy,
            startDate: sy.startDate.split('T')[0], // Format for input date
            endDate: sy.endDate.split('T')[0]
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this school year?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/school-years/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchSchoolYears();
            } else {
                alert('Failed to delete school year');
            }
        } catch (error) {
            console.error('Error deleting school year:', error);
        }
    };

    const resetForm = () => {
        setCurrentSchoolYear({
            year: '',
            description: '',
            startDate: '',
            endDate: '',
            isCurrent: false
        });
        setIsEditing(false);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage School Years</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <i className="fas fa-plus me-2"></i> Add School Year
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
                                    <th>Year</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schoolYears.map(sy => (
                                    <tr key={sy.id} className={sy.isCurrent ? 'table-primary' : ''}>
                                        <td>
                                            {sy.year}
                                            {sy.isCurrent && <span className="badge bg-success ms-2">Current</span>}
                                        </td>
                                        <td>{new Date(sy.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(sy.endDate).toLocaleDateString()}</td>
                                        <td>{sy.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(sy)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(sy.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {schoolYears.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No school years found</td>
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
                                <h5 className="modal-title">{isEditing ? 'Edit School Year' : 'Add School Year'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Year (e.g., 2025-2026)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="year"
                                            value={currentSchoolYear.year}
                                            onChange={handleInputChange}
                                            placeholder="YYYY-YYYY"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="description"
                                            value={currentSchoolYear.description || ''}
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
                                                value={currentSchoolYear.startDate}
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
                                                value={currentSchoolYear.endDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="isCurrent"
                                            id="isCurrent"
                                            checked={currentSchoolYear.isCurrent}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isCurrent">Set as Current School Year</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create School Year'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSchoolYears;
