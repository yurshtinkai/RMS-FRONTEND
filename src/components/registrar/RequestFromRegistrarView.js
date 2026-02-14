import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';
import CustomAlert from '../../CustomAlert';

function RequestFromRegistrarView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/pending`, {
        headers: { 'X-Session-Token': getSessionToken() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else {
        console.error('Failed to fetch pending payments');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/completed`, {
        headers: { 'X-Session-Token': getSessionToken() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else {
        console.error('Failed to fetch completed payments');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching completed payments:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    if (showArchive) {
      fetchCompletedPayments();
    } else {
      fetchPendingPayments();
    }
  };

  useEffect(() => {
    fetchData();
  }, [showArchive]);

  const handleProcessPayment = async (requestId, amount, studentName) => {
    // Set the selected request data for the modal
    setSelectedRequest({
      id: requestId,
      amount: amount,
      studentName: studentName
    });
    setShowConfirmModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken()
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          amount: selectedRequest.amount,
          paymentMethod: 'cash',
          receiptNumber: `RCP-${Date.now()}`,
          remarks: `Payment received from ${selectedRequest.studentName} - processed by accounting`
        })
      });

      if (response.ok) {
        // Set success modal data and show it
        setSuccessModalData({
          receipt: `RCP-${Date.now()}`,
          studentName: selectedRequest.studentName,
          amount: selectedRequest.amount?.toFixed(2) || '0.00'
        });
        setShowSuccessModal(true);
        fetchData(); // Refresh the current view
        setShowConfirmModal(false);
        setSelectedRequest(null);
      } else {
        const error = await response.json();
        alert(`❌ Failed to process payment: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Error processing payment. Please try again.');
    }
  };

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return requests;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return requests.filter(request => {
      const studentName = request.student 
        ? `${request.student.firstName} ${request.student.lastName}`.toLowerCase()
        : '';
      const studentId = request.student?.idNumber?.toLowerCase() || '';
      const documentType = request.documentType?.toLowerCase() || '';

      return studentName.includes(searchLower) || 
             studentId.includes(searchLower) || 
             documentType.includes(searchLower);
    });
  }, [requests, debouncedSearchTerm]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          Payment Requests from Registrar
          {showArchive && <span className="badge bg-warning ms-2">Archived</span>}
        </h3>
        <div className="d-flex align-items-center">
          <span className={`badge ${showArchive ? 'bg-warning' : 'bg-info'} me-2`}>
            {filteredRequests.length} of {requests.length} {showArchive ? 'completed' : 'pending'} requests
          </span>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by student name, ID, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              {debouncedSearchTerm && (
                <small className="text-muted">
                  Searching for: "{debouncedSearchTerm}"
                </small>
              )}
            </div>
            
            {/* Archive Button */}
            <div className="col-md-6 d-flex justify-content-end">
              <button 
                className={`btn ${showArchive ? 'btn-warning' : 'btn-outline-secondary'}`}
                onClick={() => setShowArchive(!showArchive)}
                title={showArchive ? 'View Pending Requests' : 'View Completed Requests'}
              >
                <i className={`fas ${showArchive ? 'fa-folder-open' : 'fa-archive'}`}></i>
                {showArchive ? ' Pending Requests' : ' Archive'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredRequests.length === 0 && requests.length === 0 ? (
            <div className="text-center text-muted">
              <h5>No {showArchive ? 'completed' : 'pending'} payment requests</h5>
              <p>
                {showArchive 
                  ? 'No completed payment requests in archive.'
                  : 'When registrars request documents for students, they will appear here for payment processing.'
                }
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center text-muted">
              <h5>No results found</h5>
              <p>
                {showArchive
                  ? `No completed payment requests match your search criteria: "${debouncedSearchTerm}"`
                  : `No pending payment requests match your search criteria: "${debouncedSearchTerm}"`
                }
              </p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Document Type</th>
                    <th>Amount</th>
                    <th>Requested By</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    {!showArchive && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>{req.student?.idNumber || 'N/A'}</td>
                      <td>
                        {req.student ? 
                          `${req.student.lastName}, ${req.student.firstName}` : 
                          'Loading...'
                        }
                      </td>
                      <td>
                        <span className="badge bg-info">{req.documentType}</span>
                      </td>
                      <td>
                        <strong>₱{req.amount?.toFixed(2) || '0.00'}</strong>
                      </td>
                      <td>{req.requestedBy || 'Registrar'}</td>
                      <td>{new Date(req.requestedAt || req.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'payment_required' ? 'bg-warning' :
                          req.status === 'payment_approved' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {req.status === 'payment_required' ? 'Awaiting Payment' : 
                           req.status === 'payment_approved' ? 'Payment Approved' :
                           req.status}
                        </span>
                      </td>
                      {!showArchive && (
                        <td>
                          {req.status === 'payment_required' ? (
                            <button 
                              className="btn btn-success btn-sm" 
                              onClick={() => handleProcessPayment(
                                req.id, 
                                req.amount, 
                                req.student ? `${req.student.firstName} ${req.student.lastName}` : 'Unknown Student'
                              )}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <CustomAlert
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedRequest(null);
        }}
        title="Approve Document Request?"
        hideDefaultButton={true}
        actions={
          <div className="d-flex gap-2">
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={confirmPayment}
            >
              OK
            </button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="text-start">
            <div className="mb-3">
              <strong>Student:</strong> {selectedRequest.studentName}
            </div>
            <div className="mb-3">
              <strong>Document:</strong> Others
            </div>
            <div className="mb-3">
              <strong>Amount:</strong> ₱{selectedRequest.amount?.toFixed(2) || '0.00'}
            </div>
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              This will mark the request as approved and ready for printing.
            </div>
          </div>
        )}
      </CustomAlert>

      {/* Success Modal */}
      <CustomAlert
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessModalData(null);
        }}
        title="Payment Processed Successfully!"
        hideDefaultButton={true}
        actions={
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessModalData(null);
              }}
            >
              OK
            </button>
          </div>
        }
      >
        {successModalData && (
          <div className="text-start">
            <div className="text-center mb-3">
              <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <div className="mb-3">
              <strong>Receipt:</strong> {successModalData.receipt}
            </div>
            <div className="mb-3">
              <strong>Student:</strong> {successModalData.studentName}
            </div>
            <div className="mb-3">
              <strong>Amount:</strong> ₱{successModalData.amount}
            </div>
            <div className="alert alert-success">
              <i className="fas fa-info-circle me-2"></i>
              The registrar has been notified.
            </div>
          </div>
        )}
      </CustomAlert>
    </div>
  );
}

export default RequestFromRegistrarView;