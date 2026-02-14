import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function AccountManagementView() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState({});
    
    // This state will now hold the info for the reset password modal
    const [resetInfo, setResetInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [accountToReset, setAccountToReset] = useState(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            setError('');
            setDebugInfo({});
            
            try {
                // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    throw new Error('Session expired. Please login again.');
                }
                
                const sessionToken = sessionManager.getSessionToken();
                console.log('Session Token:', sessionToken ? 'Exists' : 'Missing');
                
                if (!sessionToken) {
                    throw new Error('No session token found. Please login as registrar first.');
                }

                console.log('Fetching from:', `${API_BASE_URL}/accounts`);
                
                const response = await fetch(`${API_BASE_URL}/accounts`, {
                    headers: { 
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.log('Error response:', errorData);
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Received data:', data);
                console.log('Data length:', data.length);
                
                setAccounts(data);
                setDebugInfo({
                    sessionToken: sessionToken ? 'Present' : 'Missing',
                    apiUrl: `${API_BASE_URL}/accounts`,
                    responseStatus: response.status,
                    dataLength: data.length,
                    sampleData: data[0] || 'No data'
                });
                
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
                setDebugInfo({
                    error: err.message,
                    sessionToken: getSessionToken() ? 'Present' : 'Missing',
                    apiUrl: `${API_BASE_URL}/accounts`
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // --- START: This function now handles resetting the password ---
    const handleResetPassword = (account) => {
        // Show confirmation modal instead of browser alert
        setAccountToReset(account);
        setShowConfirmModal(true);
    };

    const confirmPasswordReset = async () => {
        if (!accountToReset) return;

        try {
            const response = await fetch(`${API_BASE_URL}/accounts/${accountToReset.id}/reset-password`, {
                method: 'PATCH',
                headers: { 'X-Session-Token': getSessionToken() },
            });

            if (!response.ok) {
                throw new Error('Failed to reset password.');
            }
            
            const data = await response.json();

            // Set state to show the modal with the new password
            setResetInfo({
                idNumber: data.idNumber,
                password: data.newPassword,
            });

            // Close confirmation modal
            setShowConfirmModal(false);
            setAccountToReset(null);

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const cancelPasswordReset = () => {
        setShowConfirmModal(false);
        setAccountToReset(null);
    };
    // --- END: This function now handles resetting the password ---
    
    const filteredAccounts = accounts.filter(acc => {
        const fullName = `${acc.lastName}, ${acc.firstName} ${acc.middleName || ''}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return acc.idNumber.toLowerCase().includes(search) || fullName.includes(search);
    });

    if (loading) return (
        <div className="container-fluid">
            <h2 className="mb-4">Account Management</h2>
            <div className="alert alert-info">
                <h4>Loading student data...</h4>
                <p>Please wait while we fetch student information from the database.</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="container-fluid">
            <h2 className="mb-4">Account Management</h2>
            <div className="alert alert-danger">
                <h4>Error Loading Data</h4>
                <p><strong>Error:</strong> {error}</p>
                
                {/* Debug Information */}
                <div className="mt-3">
                    <h5>Debug Information:</h5>
                    <pre className="bg-light p-2 rounded">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
                
                <div className="mt-3">
                    <h5>Possible Solutions:</h5>
                    <ul>
                        <li>Make sure you're logged in as registrar (A001)</li>
                        <li>Check if the backend server is running</li>
                        <li>Verify the database has student data</li>
                        <li>Check browser console for more details</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Account Management</h2>
            
            {/* Debug Information */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="alert alert-info mb-4">
                    <h5>Debug Info:</h5>
                    <pre className="mb-0">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )} */}
            
            {/* Registration Statistics */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h5 className="card-title">Total Students</h5>
                            <h3>{accounts.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h5 className="card-title">Fully Enrolled</h5>
                            <h3>{accounts.filter(acc => acc.isFullyEnrolled).length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <h5 className="card-title">Registered Only</h5>
                            <h3>{accounts.filter(acc => acc.isRegistered && !acc.isFullyEnrolled).length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-secondary text-white">
                        <div className="card-body">
                            <h5 className="card-title">Not Registered</h5>
                            <h3>{accounts.filter(acc => !acc.isRegistered).length}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Student Account List</h4>
                </div>
                <div className="card-body">
                     <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by ID Number or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID Number</th>
                                    <th>Name of Student</th>
                                    <th>Course</th>
                                    <th>Year Level</th>
                                    <th>Semester</th>
                                    <th>Registration Status</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.length > 0 ? filteredAccounts.map(acc => (
                                    <tr key={acc.id} className={acc.isFullyEnrolled ? 'table-success' : acc.isRegistered ? 'table-warning' : ''}>
                                        <td>{acc.idNumber}</td>
                                        <td>{`${acc.lastName}, ${acc.firstName} ${acc.middleName || ''}`}</td>
                                        <td>{acc.course}</td>
                                        <td>
                                            <span className={`badge ${acc.currentYearLevel === 'Not registered' ? 'bg-secondary' : 'bg-primary'}`}>
                                                {acc.currentYearLevel}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${acc.currentSemester === 'Not registered' ? 'bg-secondary' : 'bg-primary'}`}>
                                                {acc.currentSemester}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                acc.registrationStatus === 'Approved' ? 'bg-success' : 
                                                acc.registrationStatus === 'Pending' ? 'bg-warning' : 
                                                acc.registrationStatus === 'Rejected' ? 'bg-danger' : 'bg-secondary'
                                            }`}>
                                                {acc.registrationStatus === 'Approved' ? 'Enrolled' : acc.registrationStatus}
                                            </span>
                                        </td>
                                        <td>{acc.registrationDate || 'Not registered'}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-warning"  
                                                title="Reset Password"
                                                onClick={() => handleResetPassword(acc)}
                                            >
                                                <i className="fas fa-key"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted">
                                            <div className="py-4">
                                                <h5>No students found</h5>
                                                <p className="text-muted mb-0">
                                                    {accounts.length === 0 
                                                        ? 'No student accounts exist in the database.' 
                                                        : 'No students match your search criteria.'}
                                                </p>
                                                {accounts.length === 0 && (
                                                    <div className="mt-3">
                                                        <button 
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => window.location.reload()}
                                                        >
                                                            Refresh Data
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- START: Updated modal to show new password --- */}
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="custom-modal-overlay" onClick={cancelPasswordReset}>
                    <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-modal-content">
                            <div className="custom-modal-header">
                                <div className="custom-modal-title">
                                    <i className="fas fa-key"></i>
                                    <span>Confirm Password Reset</span>
                                </div>
                                <button className="custom-modal-close" onClick={cancelPasswordReset}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="custom-modal-body">
                                <div className="custom-form-group">
                                    <p className="custom-confirm-text">
                                        Are you sure you want to reset the password for <strong>{accountToReset?.idNumber}</strong>?
                                    </p>
                                    <p className="custom-warning-text">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        This action cannot be undone. The student will need to use the new password to log in.
                                    </p>
                                </div>
                            </div>
                            <div className="custom-modal-footer">
                                <button className="custom-btn custom-btn-secondary" onClick={cancelPasswordReset}>
                                    Cancel
                                </button>
                                <button className="custom-btn custom-btn-primary" onClick={confirmPasswordReset}>
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {resetInfo && (
                <div className="modal-overlay" onClick={() => setResetInfo(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Password Reset Successfully</h3>
                        <div className="modal-body">
                            <p>Please provide the student with their new credentials:</p>
                            <pre>
                                {`ID Number: ${resetInfo.idNumber}\nNew Password: ${resetInfo.password}`}
                            </pre>
                        </div>
                        <button onClick={() => setResetInfo(null)} className="btn btn-primary">
                            OK
                        </button>
                    </div>
                </div>
            )}
            {/* --- END: Updated modal --- */}
        </div>
    );
}

export default AccountManagementView;