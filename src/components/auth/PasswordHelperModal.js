import React, { useState, useEffect } from 'react';
import './PasswordHelperModal.css';

function PasswordHelperModal({ isOpen, onClose, idNumber }) {
  const [hint, setHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordHint = () => {
    setIsLoading(true);
    setHint('');

    // Simulate an async AI call
    setTimeout(() => {
      let generatedHint = "I couldn't find a specific hint for that ID number. Remember, passwords are case-sensitive.";
      if (idNumber.toUpperCase().startsWith('S')) {
        generatedHint = "The password for student accounts is a common, simple word mentioned on the login page.";
      } else if (idNumber.toUpperCase().startsWith('A')) {
        generatedHint = "The password for the registrar account is 'registrarpass'.";
      } else if (idNumber.toUpperCase().startsWith('AC')) {
        generatedHint = "The password for the accounting account is related to the department name: 'accountingpass'.";
      }
      setHint(generatedHint);
      setIsLoading(false);
    }, 1500); // Simulate network delay
  };

  // Reset hint when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setHint('');
    }
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content password-helper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">
            <i className="fas fa-robot me-2"></i> Gemini Password Helper
          </h4>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <p className="text-muted">
            Enter your ID Number in the login form first, then click the button below to get a hint for your password.
          </p>
          <div className="id-display mb-3">
            <strong>ID Number:</strong> {idNumber || <span className="text-danger">Please enter in login form</span>}
          </div>
          
          <button className="btn btn-primary w-100" onClick={getPasswordHint} disabled={!idNumber || isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Thinking...</span>
              </>
            ) : (
              <span><i className="fas fa-magic me-2"></i>Get Hint</span>
            )}
          </button>

          {hint && (
            <div className="alert alert-info mt-4">
              <strong>Hint:</strong> {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PasswordHelperModal;