import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState({ code: '', name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/departments`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            } else {
                setError('Failed to fetch departments');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDepartment({ ...currentDepartment, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/departments/${currentDepartment.id}`
            : `${API_BASE_URL}/departments`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(currentDepartment)
            });

            if (response.ok) {
                setShowModal(false);
                fetchDepartments();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Error saving department');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (department) => {
        setCurrentDepartment(department);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchDepartments();
            } else {
                alert('Failed to delete department');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };

    const resetForm = () => {
        setCurrentDepartment({ code: '', name: '', description: '' });
        setIsEditing(false);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Departments</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <i className="fas fa-plus me-2"></i> Add Department
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
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td>{dept.code}</td>
                                        <td>{dept.name}</td>
                                        <td>{dept.description}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(dept)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(dept.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {departments.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No departments found</td>
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
                                <h5 className="modal-title">{isEditing ? 'Edit Department' : 'Add Department'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="code"
                                            value={currentDepartment.code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={currentDepartment.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={currentDepartment.description || ''}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Department'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageDepartments;
