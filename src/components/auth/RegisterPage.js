import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentRegistration from './StudentRegistration';
import { useFooter } from '../../contexts/FooterContext';

function RegisterPage() {
    const navigate = useNavigate();
    const { footerYear } = useFooter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleRegistrationSuccess = () => {
        // After successful registration, navigate to login
        navigate('/login');
    };

    const switchToLogin = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate('/login');
        }, 150);
    };

    const formClass = `form-view ${isTransitioning ? 'fade-out' : 'fade-in'}`;

    return (
        <div className="container login-page-container">
            <div className="row align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center">
                    <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center">
                        <div className="text-center mb-4">
                            <img src="/benedicto2.png" alt="Benedicto College" style={{ height: '50px' }} />
                        </div>
                        <div className={formClass} style={{ width: '100%' }}>
                            <StudentRegistration
                                onRegistrationSuccess={handleRegistrationSuccess}
                                onSwitchToLogin={switchToLogin}
                            />
                        </div>

                        <footer className="text-center mt-4" style={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
                            © {footerYear} - Online Records Management System
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
