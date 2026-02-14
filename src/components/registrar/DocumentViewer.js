import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import './DocumentViewer.css';

function DocumentViewer() {
  const { idNo, documentType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.document) {
      setDocument(location.state.document);
      setLoading(false);
    } else {
      // If no document in state, fetch it from the API
      fetchDocumentDetails();
    }
  }, [location.state, documentType, idNo]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/students/${idNo}/requirements`, {
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken'),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.requirementsDetails && data.requirementsDetails[documentType]) {
          setDocument({
            ...data.requirementsDetails[documentType],
            type: documentType
          });
        } else {
          setError('Document not found');
        }
      } else {
        setError('Failed to fetch document details');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTitle = (documentType) => {
    const titles = {
      psa: 'PSA Birth Certificate',
      validId: 'Valid ID',
      form137: 'Form 137',
      idPicture: '2x2 ID Picture'
    };
    return titles[documentType] || documentType;
  };

  const getDocumentIcon = (documentType) => {
    const icons = {
      psa: 'fas fa-certificate',
      validId: 'fas fa-id-card',
      form137: 'fas fa-file-alt',
      idPicture: 'fas fa-image'
    };
    return icons[documentType] || 'fas fa-file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (document && document.documentUrl) {
      const downloadUrl = document.documentUrl.startsWith('/api/') 
        ? `http://localhost:5000${document.documentUrl}`
        : `${API_BASE_URL}${document.documentUrl}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.fileName || `${documentType}_document`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${idNo}/verify-requirement`, {
        method: 'POST',
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requirementType: documentType,
          status: 'verified'
        })
      });

      if (response.ok) {
        // Update local state
        setDocument(prev => ({
          ...prev,
          status: 'verified'
        }));
        // Show success message
        alert('Document verified successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to verify document');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="document-viewer-page">
        <div className="container-fluid">
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="document-viewer-page">
        <div className="container-fluid">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle text-warning"></i>
            </div>
            <h3>Document Not Found</h3>
            <p>{error || 'The requested document could not be loaded.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer-page">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
                         <div className="d-flex align-items-center">
               <div>
                 <h1 className="page-title">
                   {getDocumentTitle(documentType)}
                 </h1>
                 <p className="page-subtitle">
                   Document Viewer - Student: <strong>{idNo}</strong>
                 </p>
               </div>
             </div>
                                                   <div className="header-actions">
                <button
                  className="btn btn-outline-secondary back-btn me-2"
                  onClick={() => navigate(-1)}
                  title="Go Back"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back
                </button>
                {document.status !== 'verified' && (
                  <button
                    className="btn btn-success"
                    onClick={handleVerify}
                    title="Verify Document"
                  >
                    <i className="fas fa-check-double me-2"></i>
                    Verify
                  </button>
                )}
              </div>
          </div>
        </div>

        {/* Document Information */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="info-item">
                      <label className="info-label">File Name</label>
                      <div className="info-value">{document.fileName}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="info-item">
                      <label className="info-label">File Size</label>
                      <div className="info-value">{formatFileSize(document.fileSize)}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="info-item">
                      <label className="info-label">Upload Date</label>
                      <div className="info-value">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="info-item">
                      <label className="info-label">Status</label>
                      <div className="info-value">
                        <span className={`status-badge ${document.status || 'submitted'}`}>
                          <i className={`fas fa-${document.status === 'verified' ? 'check-circle' : 
                                         document.status === 'rejected' ? 'times-circle' : 'clock'} me-1`}></i>
                          {document.status ? document.status.charAt(0).toUpperCase() + document.status.slice(1) : 'Submitted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-eye me-2"></i>
                  Document Preview
                </h5>
              </div>
              <div className="card-body">
                                 <div className="preview-container">
                   {document.type === 'idPicture' ? (
                     <div className="image-zoom-container">
                       <img
                         src={document.documentUrl.startsWith('/api/') 
                           ? `http://localhost:5000${document.documentUrl}`
                           : `${API_BASE_URL}${document.documentUrl}`}
                         alt="Document Preview"
                         className="document-image"
                         style={{ 
                           maxWidth: '100%', 
                           maxHeight: '65vh', 
                           width: 'auto', 
                           height: 'auto',
                           objectFit: 'contain'
                         }}
                       />
                     </div>
                   ) : (
                     <iframe
                       src={document.documentUrl.startsWith('/api/') 
                         ? `http://localhost:5000${document.documentUrl}`
                         : `${API_BASE_URL}${document.documentUrl}`}
                       width="100%"
                       height="65vh"
                       title="Document Preview"
                       className="document-iframe"
                     ></iframe>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
