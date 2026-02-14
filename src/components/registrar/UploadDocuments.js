import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import './UploadDocuments.css';

function UploadDocuments() {
  const { idNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    psa: false,
    validId: false,
    form137: false,
    idPicture: false
  });
  const [documentDetails, setDocumentDetails] = useState({
    psa: null,
    validId: null,
    form137: null,
    idPicture: null
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initialLoad, setInitialLoad] = useState(true);


  useEffect(() => {
    if (idNo) {
      fetchRequirementsStatus();
    }
  }, [idNo]);

  const fetchRequirementsStatus = async () => {
    try {
      console.log('🔍 Fetching requirements status for student:', idNo);
      console.log('🔍 API URL:', `${API_BASE_URL}/requirements/status/${idNo}`);
      
      const response = await fetch(`${API_BASE_URL}/requirements/status/${idNo}`, {
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken'),
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Requirements data received:', data);
        
        setRequirements(data.requirements || {});
        
        // If we have detailed requirements data, update document details
        if (data.requirementsDetails) {
          setDocumentDetails(data.requirementsDetails);
        }
        
        // Clear any previous error messages
        setMessage({ type: '', text: '' });
        setInitialLoad(false);
        console.log('✅ Requirements status fetched successfully');
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching requirements status:', errorData);
        setMessage({ type: 'error', text: errorData.message || 'Failed to fetch requirements status' });
      }
    } catch (error) {
      console.error('❌ Network error fetching requirements status:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleDocumentUpload = async (documentType, file) => {
    if (!file) return;

    console.log('🔍 Starting file upload for:', documentType);
    console.log('🔍 File details:', { name: file.name, size: file.size, type: file.type });

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // Validate file type
    const allowedTypes = {
      psa: ['.pdf', '.jpg', '.jpeg', '.png'],
      validId: ['.pdf', '.jpg', '.jpeg', '.png'],
      form137: ['.pdf', '.jpg', '.jpeg', '.png'],
      idPicture: ['.jpg', '.jpeg', '.png']
    };

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes[documentType].includes(fileExtension)) {
      setMessage({ type: 'error', text: `Invalid file type for ${documentType}. Allowed: ${allowedTypes[documentType].join(', ')}` });
      return;
    }

    setLoading(true);
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    const formData = new FormData();
    formData.append('document', file);
    formData.append('requirementType', documentType);
    formData.append('studentId', idNo);

    console.log('🔍 FormData prepared:', {
      document: file.name,
      requirementType: documentType,
      studentId: idNo
    });

    try {
      console.log('🔍 Sending upload request to:', `${API_BASE_URL}/requirements/upload`);
      const response = await fetch(`${API_BASE_URL}/requirements/upload`, {
        method: 'POST',
        headers: {
          'X-Session-Token': localStorage.getItem('sessionToken')
        },
        body: formData
      });

      console.log('🔍 Upload response status:', response.status);
      console.log('🔍 Upload response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful, result:', result);
        
        setRequirements(prev => ({ ...prev, [documentType]: true }));
        
        // Update document details with the uploaded file info
        setDocumentDetails(prev => ({
          ...prev,
          [documentType]: {
            fileName: result.fileName,
            documentUrl: result.documentUrl,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          }
        }));
        
        setMessage({ type: 'success', text: `${documentType} uploaded successfully!` });
        
        // Refresh requirements status after successful upload
        await fetchRequirementsStatus();
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        const errorData = await response.json();
        console.error('❌ Upload failed:', errorData);
        setMessage({ type: 'error', text: errorData.message || 'Upload failed' });
      }
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    }
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

  const getDocumentTitle = (documentType) => {
    const titles = {
      psa: 'PSA Birth Certificate',
      validId: 'Valid ID',
      form137: 'Form 137',
      idPicture: '2x2 ID Picture'
    };
    return titles[documentType] || documentType;
  };

  const getDocumentDescription = (documentType) => {
    const descriptions = {
      psa: 'Philippine Statistics Authority',
      validId: 'Government-issued ID',
      form137: 'High School Records',
      idPicture: 'Recent photo'
    };
    return descriptions[documentType] || '';
  };

  const getAcceptedFormats = (documentType) => {
    if (documentType === 'idPicture') {
      return 'JPG, PNG (Max 5MB)';
    }
    return 'PDF, JPG, PNG (Max 5MB)';
  };

  const handleViewDocument = (documentType) => {
    const document = documentDetails[documentType];
    if (document) {
      navigate(`/registrar/students/${idNo}/view-document/${documentType}`, {
        state: { document: { ...document, type: documentType } }
      });
    }
  };

  const handleDownloadDocument = (documentType) => {
    const document = documentDetails[documentType];
    if (document && document.documentUrl) {
      const link = document.createElement('a');
      const downloadUrl = document.documentUrl.startsWith('/api/') 
        ? `http://localhost:5000${document.documentUrl}`
        : `${API_BASE_URL}${document.documentUrl}`;
      link.href = downloadUrl;
      link.download = document.fileName || `${documentType}_document`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVerifyDocument = async (documentType) => {
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
        setDocumentDetails(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            status: 'verified'
          }
        }));
        setMessage({ type: 'success', text: `${documentType} document verified successfully!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to verify document' });
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-documents-page">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">
                <i className="fas fa-upload me-3"></i>
                Upload Documents
              </h1>
              <p className="page-subtitle">
                Manage enrollment requirements for student: <strong>{idNo}</strong>
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary back-btn"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
          </div>
        </div>



        {/* Message Display */}
        {message.text && !initialLoad && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ type: '', text: '' })}
            ></button>
          </div>
        )}

        {/* Progress Summary */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="progress-stat">
                      <div className="progress-number">{Object.values(requirements).filter(Boolean).length}</div>
                      <div className="progress-label">Documents Submitted</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="progress-stat">
                      <div className="progress-number">{Object.values(requirements).filter(v => !v).length}</div>
                      <div className="progress-label">Documents Pending</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="progress-stat">
                      <div className="progress-number">
                        {Object.values(documentDetails).filter(doc => doc && doc.status === 'verified').length}
                      </div>
                      <div className="progress-label">Documents Verified</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="progress-stat">
                      <div className="progress-number">
                        {Math.round((Object.values(requirements).filter(Boolean).length / Object.keys(requirements).length) * 100)}%
                      </div>
                      <div className="progress-label">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Upload Section */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-cloud-upload-alt me-2"></i>
                  Document Upload
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {Object.keys(requirements).map((documentType) => (
                    <div key={documentType} className="col-md-6 mb-4">
                      <div className="document-upload-card">
                        <div className="document-icon">
                          <i className={getDocumentIcon(documentType)}></i>
                        </div>
                        <div className="document-info">
                          <h6 className="document-title">{getDocumentTitle(documentType)}</h6>
                          <p className="document-description">{getDocumentDescription(documentType)}</p>
                          <small className="text-muted">Accepted: {getAcceptedFormats(documentType)}</small>
                        </div>
                        <div className="document-upload">
                          <input
                            type="file"
                            id={`file-${documentType}`}
                            className="file-input"
                            accept={documentType === 'idPicture' ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                            onChange={(e) => handleDocumentUpload(documentType, e.target.files[0])}
                            disabled={loading}
                          />
                          <label 
                            htmlFor={`file-${documentType}`} 
                            className={`file-label ${loading ? 'disabled' : ''}`}
                          >
                            {loading && uploadProgress[documentType] > 0 ? (
                              <div className="upload-progress">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${uploadProgress[documentType]}%` }}
                                  ></div>
                                </div>
                                <span>{uploadProgress[documentType]}%</span>
                              </div>
                            ) : (
                              <>
                                <i className="fas fa-upload me-2"></i>
                                {requirements[documentType] ? 'Replace File' : 'Choose File'}
                              </>
                            )}
                          </label>
                        </div>
                        
                        {/* Document Details and Actions */}
                        {requirements[documentType] && documentDetails[documentType] && (
                          <div className="document-details mt-3">
                            <div className="document-info-summary">
                              <div className="file-info">
                                <i className="fas fa-file me-2"></i>
                                <span className="file-name">{documentDetails[documentType].fileName}</span>
                                <small className="text-muted ms-2">
                                  ({formatFileSize(documentDetails[documentType].fileSize)})
                                </small>
                              </div>
                              <div className="upload-date">
                                <small className="text-muted">
                                  Uploaded: {new Date(documentDetails[documentType].uploadedAt).toLocaleDateString()}
                                </small>
                              </div>
                              {documentDetails[documentType].status && (
                                <div className="verification-status mt-2">
                                  <span className={`verification-badge ${documentDetails[documentType].status}`}>
                                    <i className={`fas fa-${documentDetails[documentType].status === 'verified' ? 'check-circle' : 
                                                   documentDetails[documentType].status === 'rejected' ? 'times-circle' : 'clock'} me-1`}></i>
                                    {documentDetails[documentType].status.charAt(0).toUpperCase() + documentDetails[documentType].status.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="document-actions mt-2">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleViewDocument(documentType)}
                                title="View Document"
                              >
                                <i className="fas fa-eye me-1"></i>
                                View
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success me-2"
                                onClick={() => handleDownloadDocument(documentType)}
                                title="Download Document"
                              >
                                <i className="fas fa-download me-1"></i>
                                Download
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                title="Verify Document"
                                onClick={() => handleVerifyDocument(documentType)}
                              >
                                <i className="fas fa-check-double me-1"></i>
                                Verify
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="document-status">
                          <span className={`status-badge ${requirements[documentType] ? 'submitted' : 'pending'}`}>
                            {requirements[documentType] ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-clipboard-check me-2"></i>
                  Requirements Status
                </h5>
              </div>
              <div className="card-body">
                <div className="status-summary">
                  <div className="status-item">
                    <span className="status-label">Submitted:</span>
                    <span className="status-value submitted">
                      {Object.values(requirements).filter(Boolean).length}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Pending:</span>
                    <span className="status-value pending">
                      {Object.values(requirements).filter(v => !v).length}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Total:</span>
                    <span className="status-value total">
                      {Object.keys(requirements).length}
                    </span>
                  </div>
                </div>

                <div className="requirements-list mt-4">
                  <h6 className="text-muted mb-3">Document Status</h6>
                  {Object.entries(requirements).map(([documentType, isSubmitted]) => (
                    <div key={documentType} className="requirement-item">
                      <div className="requirement-info">
                        <i className={`${getDocumentIcon(documentType)} me-2`}></i>
                        <span>{getDocumentTitle(documentType)}</span>
                      </div>
                      <span className={`requirement-status ${isSubmitted ? 'submitted' : 'pending'}`}>
                        {isSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

            
    </div>
  );
}

export default UploadDocuments;
