import React, { useState, useEffect } from 'react';
import { createDummySchoolYears, getDocumentTypes } from '../../data/dummyData';

function NewRequestModal({ isOpen, onClose, onConfirm, expectedDocumentType }) {
    const schoolYearsData = createDummySchoolYears();
    const documentTypes = getDocumentTypes();

    const [requestType, setRequestType] = useState(documentTypes[0].name);
    const [schoolYear, setSchoolYear] = useState(schoolYearsData[0].schoolYear);
    const [semester, setSemester] = useState(schoolYearsData[0].semester);
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');

    useEffect(() => {
        
        // Clear any existing errors when modal opens
        setAmountError('');
        
        // If a specific type is expected (coming from student's original request), lock to that
        if (expectedDocumentType) {
            setRequestType(expectedDocumentType);
            const selectedType = documentTypes.find(doc => doc.name === expectedDocumentType);
            if (selectedType) {
                setAmount(selectedType.amount.toString());
            }
        }
        // Don't auto-set amount when request type changes - let registrar input manually
    }, [expectedDocumentType, isOpen]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        // Clear error when user starts typing
        if (amountError) {
            setAmountError('');
        }
    };

    const handleSubmit = () => {
        
        // Clear previous error
        setAmountError('');
        
        // Validate amount
        const amountValue = parseFloat(amount);
        if (!amount || isNaN(amountValue) || amountValue < 0) {
            setAmountError('Please enter a valid amount (must be a positive number).');
            return;
        }
        
        if (expectedDocumentType && requestType !== expectedDocumentType) {
            alert(`Your request is incorrect because student requested ${expectedDocumentType} not ${requestType}.`);
            return;
        }
        
        onConfirm({
            documentType: requestType,
            schoolYear,
            semester,
            amount: amountValue,
        });
        onClose(); // Close modal after confirmation
    };

    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="custom-modal-content">
                    {/* Header */}
                    <div className="custom-modal-header">
                        <div className="custom-modal-title">
                            <i className="fas fa-file-alt"></i>
                            <span>New Document Request</span>
                        </div>
                        <button className="custom-modal-close" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="custom-modal-body">
                        <div className="custom-form-group">
                            <label className="custom-form-label">Request Type</label>
                            <select 
                                className="custom-form-control"
                                value={requestType} 
                                onChange={e => setRequestType(e.target.value)} 
                                disabled={!!expectedDocumentType}
                            >
                                {documentTypes.map(doc => (
                                    <option key={doc.name} value={doc.name}>{doc.name}</option>
                                ))}
                            </select>
                            {expectedDocumentType && (
                                <small className="custom-form-text">Request type locked to match the student's original request.</small>
                            )}
                        </div>

                        <div className="custom-form-group">
                            <label className="custom-form-label">School Year</label>
                            <select 
                                className="custom-form-control"
                                value={schoolYear} 
                                onChange={e => setSchoolYear(e.target.value)}
                            >
                                {schoolYearsData.map(sy => (
                                    <option key={sy.id} value={sy.schoolYear}>{sy.schoolYear}</option>
                                ))}
                            </select>
                        </div>

                        <div className="custom-form-group">
                            <label className="custom-form-label">Semester</label>
                            <select 
                                className="custom-form-control"
                                value={semester} 
                                onChange={e => setSemester(e.target.value)}
                            >
                                <option>1st Semester</option>
                                <option>2nd Semester</option>
                                <option>Summer</option>
                            </select>
                        </div>

                        <div className="custom-form-group">
                            <label className="custom-form-label">Amount</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="Enter amount (e.g., 150.00)"
                                className={`custom-form-control ${amountError ? 'custom-form-control-error' : ''}`}
                                value={amount} 
                                onChange={handleAmountChange}
                                required
                            />
                            <small className="custom-form-text">
                                Enter the exact amount for this document request
                            </small>
                            {amountError && (
                                <div className="custom-form-error">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    {amountError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="custom-modal-footer">
                        <button className="custom-btn custom-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="custom-btn custom-btn-primary" onClick={handleSubmit}>
                            Confirm Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewRequestModal;