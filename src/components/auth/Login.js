import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedLogin from './UnifiedLogin';
import sessionManager from '../../utils/sessionManager';
import { useFooter } from '../../contexts/FooterContext';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { footerYear } = useFooter();

  const handleLoginSuccess = (result) => {
    // Store session token using session manager
    sessionManager.setSessionToken(result.sessionToken);

    // Store user info
    localStorage.setItem('userRole', result.user.role);
    localStorage.setItem('idNumber', result.user.idNumber);
    localStorage.setItem('userId', result.user.id); // Store the actual user ID from database

    // Clear any old cached display names to prevent conflicts
    try {
      localStorage.removeItem('displayFullName');
      localStorage.removeItem(`displayFullName:${result.user.idNumber}`);
    } catch { }

    if (result.user.role === 'student') {
      const fullName = `${result.user.firstName} ${result.user.middleName || ''} ${result.user.lastName}`;
      localStorage.setItem('fullName', fullName.trim());
      localStorage.setItem('firstName', result.user.firstName || '');
      localStorage.setItem('lastName', result.user.lastName || '');
      localStorage.setItem('middleName', result.user.middleName || '');
    } else {
      // For registrar/accounting users, include middle name if available
      const fullName = `${result.user.firstName} ${result.user.middleName || ''} ${result.user.lastName}`;
      localStorage.setItem('fullName', fullName.trim());
      localStorage.setItem('firstName', result.user.firstName || '');
      localStorage.setItem('lastName', result.user.lastName || '');
      localStorage.setItem('middleName', result.user.middleName || '');
    }

    onLoginSuccess(result.user.role);
  };

  const switchToRegister = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/register');
    }, 150);
  };

  const formClass = `form-view ${isTransitioning ? 'fade-out' : 'fade-in'}`;

  return (
    <div className="container login-page-container">
      <div className="row align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="col-12 col-md-8 col-lg-5 d-flex justify-content-center">
          <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center">
            <div className="text-center mb-4">
              <img src="/benedicto2.png" alt="Benedicto College" style={{ height: '50px' }} />
            </div>
            <div className={formClass} style={{ width: '100%' }}>
              <UnifiedLogin
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={switchToRegister}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}

            <footer className="text-center mt-4" style={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
              © {footerYear} - Online Records Management System
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;