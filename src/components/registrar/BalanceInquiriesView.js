import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function BalanceInquiriesView() {
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingBalance, setUpdatingBalance] = useState(null);
    const [resolvingInquiry, setResolvingInquiry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBalanceInquiries();
        
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchBalanceInquiries, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Filter inquiries based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredInquiries(inquiries);
        } else {
            const filtered = inquiries.filter(inquiry => {
                const studentName = inquiry.student ? 
                    `${inquiry.student.firstName} ${inquiry.student.lastName}`.toLowerCase() : '';
                const studentId = inquiry.student?.idNumber?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();
                
                return studentName.includes(searchLower) || studentId.includes(searchLower);
            });
            setFilteredInquiries(filtered);
        }
    }, [inquiries, searchTerm]);

    const fetchBalanceInquiries = async () => {
        try {
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                setError('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/accounting/balance-inquiries`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setInquiries(data.data || []);
                setFilteredInquiries(data.data || []);
                setError('');
            } else {
                setError('Failed to fetch balance inquiries');
            }
        } catch (error) {
            console.error('Error fetching balance inquiries:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBalance = async (studentId, newBalance) => {
        setUpdatingBalance(studentId);
        try {
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                alert('Session expired. Please login again.');
                setUpdatingBalance(null);
                return;
            }

            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/accounting/update-balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    studentId,
                    balance: parseFloat(newBalance)
                })
            });

            if (response.ok) {
                const result = await response.json();
                fetchBalanceInquiries(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Failed to update balance: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
            alert('Network error occurred');
        } finally {
            setUpdatingBalance(null);
        }
    };

    const markAsResolved = async (inquiryId) => {
        setResolvingInquiry(inquiryId);
        try {
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                alert('Session expired. Please login again.');
                setResolvingInquiry(null);
                return;
            }

            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/accounting/resolve-inquiry/${inquiryId}`, {
                method: 'PUT',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {

                fetchBalanceInquiries(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`Failed to mark inquiry as resolved: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error resolving inquiry:', error);
            alert('Network error occurred');
        } finally {
            setResolvingInquiry(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">
                        <i className="fas fa-question-circle text-primary me-2"></i>
                        Balance Inquiries
                    </h3>
                    <p className="text-muted mb-0">Manage student tuition balance inquiries</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={fetchBalanceInquiries}
                        disabled={loading}
                    >
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                    </button>
                    <span className="badge bg-info fs-6">
                        {inquiries.length} pending inquiry{inquiries.length !== 1 ? 'ies' : ''}
                    </span>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
            )}

            {/* Search Bar */}
            <div className="card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by student name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                        title="Clear search"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <small className="text-muted">
                                Showing {filteredInquiries.length} of {inquiries.length} inquiries
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {filteredInquiries.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <i className="fas fa-inbox fa-3x mb-3 text-muted"></i>
                            <h5>{searchTerm ? 'No matching inquiries found' : 'No balance inquiries'}</h5>
                            <p>{searchTerm ? 
                                `No inquiries match "${searchTerm}". Try a different search term.` : 
                                'When students ask about their tuition balance, they will appear here.'
                            }</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th><i className="fas fa-id-card me-1"></i>Student ID</th>
                                        <th><i className="fas fa-user me-1"></i>Student Name</th>
                                        <th><i className="fas fa-dollar-sign me-1"></i>Current Balance</th>
                                        <th><i className="fas fa-calendar me-1"></i>Inquiry Date</th>
                                        <th><i className="fas fa-edit me-1"></i>Update Balance</th>
                                        <th><i className="fas fa-check me-1"></i>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInquiries.map(inquiry => (
                                        <tr key={inquiry.id}>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {inquiry.student?.idNumber || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>
                                                    {inquiry.student ? 
                                                        `${inquiry.student.firstName} ${inquiry.student.lastName}` : 
                                                        'Loading...'
                                                    }
                                                </strong>
                                            </td>
                                            <td>
                                                <span className={`fw-bold ${inquiry.currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                                    ₱{inquiry.currentBalance?.toFixed(2) || '0.00'}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="input-group input-group-sm" style={{ minWidth: '150px' }}>
                                                    <span className="input-group-text">₱</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        placeholder="New balance"
                                                        defaultValue={inquiry.currentBalance || 0}
                                                        min="0"
                                                        id={`balance-input-${inquiry.id}`}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    {/* Blue Update Balance Button - now on the left */}
                                                    <button 
                                                        className="btn btn-outline-primary btn-xs"
                                                        style={{ fontSize: '1.5rem', padding: '0.25rem 0.5rem' }}
                                                        onClick={(e) => {
                                                            try {
                                                                // Find the input field using the unique ID
                                                                const inputElement = document.getElementById(`balance-input-${inquiry.id}`);
                                                                if (!inputElement) {
                                                                    console.error('Input element not found for inquiry:', inquiry.id);
                                                                    alert('Error: Could not find input field. Please refresh the page.');
                                                                    return;
                                                                }
                                                                
                                                                const newBalance = inputElement.value;
                                                                if (newBalance !== '' && !isNaN(parseFloat(newBalance))) {
                                                                    handleUpdateBalance(inquiry.studentId, newBalance);
                                                                } else {
                                                                    alert('Please enter a valid balance amount');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error in update balance click handler:', error);
                                                                alert('An error occurred. Please refresh the page and try again.');
                                                            }
                                                        }}
                                                        disabled={updatingBalance === inquiry.studentId}
                                                    >
                                                        {updatingBalance === inquiry.studentId ? (
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        ) : (
                                                            <i className="fas fa-save"></i>
                                                        )}
                                                    </button>
                                                    
                                                    {/* Green Balance Inquiries Button - now on the right */}
                                                    {inquiry.status === 'pending' ? (
                                                        <button 
                                                            className="btn btn-outline-success btn-xs"
                                                            style={{ fontSize: '1.5rem', padding: '0.25rem 0.5rem' }}
                                                            onClick={() => markAsResolved(inquiry.id)}
                                                            disabled={resolvingInquiry === inquiry.id}
                                                        >
                                                            {resolvingInquiry === inquiry.id ? (
                                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-check me-1"></i>
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BalanceInquiriesView;
