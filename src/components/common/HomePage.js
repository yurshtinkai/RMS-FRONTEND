import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFooter } from '../../contexts/FooterContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { footerYear } = useFooter();

    useEffect(() => {
        // Apply the background class on mount
        document.body.classList.add('homepage-background');

        // Remove it on unmount
        return () => {
            document.body.classList.remove('homepage-background');
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            {/* Top Navigation Bar - Glass Effect */}
            <nav className="navbar navbar-expand-lg fixed-top"
                style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                <div className="container-fluid">
                    <div className="navbar-brand">
                        <img src="/benedicto2.png" alt="Benedicto College" style={{ height: '40px' }} />
                    </div>

                    <div className="ms-auto d-flex gap-3 align-items-center">
                        <span className="text-white d-none d-md-block opacity-75 fw-light" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                            Welcome, Student
                        </span>

                        <button
                            className="btn btn-outline-light"
                            onClick={() => navigate('/register')}
                            style={{
                                borderRadius: '30px',
                                padding: '0.5rem 1.5rem',
                                borderWidth: '1px',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Create Account
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                            style={{
                                borderRadius: '30px',
                                padding: '0.5rem 1.8rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                background: '#dd5618',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(221, 86, 24, 0.4)',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECTION 1: HERO */}
            <div className="container d-flex flex-column justify-content-center" style={{ minHeight: '100vh', paddingTop: '80px' }}>
                <div className="row align-items-center w-100 my-auto">
                    <div className="col-lg-6 text-white mb-5 mb-lg-0 pe-lg-5">
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '40px',
                            borderRadius: '20px',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h5 className="text-uppercase fw-bold mb-3" style={{ color: '#dd5618', letterSpacing: '2px' }}>
                                Student Portal
                            </h5>
                            <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Online Records Management System
                            </h1>
                            <p className="lead mb-5 opacity-90" style={{ fontWeight: '300', fontSize: '1.2rem' }}>
                                Access your grades, view your schedule, and manage your enrollment documents conveniently from anywhere.
                            </p>
                            <div className="d-flex gap-3">
                                <button
                                    className="btn btn-light btn-lg"
                                    onClick={() => navigate('/login')}
                                    style={{
                                        borderRadius: '50px',
                                        padding: '12px 35px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}
                                >
                                    Get Started <i className="fas fa-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 text-center">
                        <div className="position-relative">
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80%',
                                height: '80%',
                                background: 'radial-gradient(circle, rgba(221,86,24,0.3) 0%, rgba(0,0,0,0) 70%)',
                                filter: 'blur(40px)',
                                zIndex: -1
                            }}></div>
                            <img
                                src="/bcleads.png"
                                alt="Registrar Hero"
                                className="img-fluid"
                                style={{
                                    maxHeight: '60vh',
                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                    animation: 'float 6s ease-in-out infinite'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: FEATURES */}
            <section className="py-5" style={{ background: '#f8f9fa' }}>
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h5 className="text-uppercase fw-bold" style={{ color: '#dd5618' }}>Key Features</h5>
                        <h2 className="display-5 fw-bold text-dark">Why Use The Portal?</h2>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: 'fa-graduation-cap', title: 'Grade Viewing', text: 'View your academic grades instantly as soon as they are posted by your instructors.' },
                            { icon: 'fa-file-alt', title: 'Document Request', text: 'Request official documents like TOR and Certifications without queuing.' },
                            { icon: 'fa-calendar-check', title: 'Class Schedule', text: 'Access your up-to-date class schedule and room assignments anytime.' },
                            { icon: 'fa-user-shield', title: 'Secure Profile', text: 'Manage your personal information and account settings securely.' }
                        ].map((feature, idx) => (
                            <div className="col-md-6 col-lg-3" key={idx}>
                                <div className="card h-100 border-0 shadow-sm hover-card" style={{ transition: 'transform 0.3s' }}>
                                    <div className="card-body text-center p-4">
                                        <div className="mb-3 d-inline-block p-3 rounded-circle" style={{ background: 'rgba(221, 86, 24, 0.1)', color: '#dd5618' }}>
                                            <i className={`fas ${feature.icon} fa-2x`}></i>
                                        </div>
                                        <h4 className="card-title fw-bold mb-3">{feature.title}</h4>
                                        <p className="card-text text-muted">{feature.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: ABOUT / MISSION */}
            <section className="py-5 text-white" style={{ background: '#212529', position: 'relative', overflow: 'hidden' }}>
                <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <img src="/benedicto2.png" alt="Benedicto Logo" className="img-fluid mb-4 opacity-75" style={{ maxHeight: '100px' }} />
                            <h2 className="display-5 fw-bold mb-4">Excellence in Education</h2>
                            <p className="lead opacity-75 mb-4">
                                Benedicto College is committed to providing quality education and fostering a community of lifelong learners.
                                Our Online Records Management System is part of our digital transformation to serve you better.
                            </p>
                            <div className="row g-4 mt-2">
                                <div className="col-6">
                                    <h3 className="fw-bold" style={{ color: '#dd5618' }}>Mission</h3>
                                    <p className="small opacity-75">To develop globally competitive professionals through quality education.</p>
                                </div>
                                <div className="col-6">
                                    <h3 className="fw-bold" style={{ color: '#dd5618' }}>Vision</h3>
                                    <p className="small opacity-75">To be a premier institution of higher learning in the region.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center">
                            {/* Placeholder for an about image or graphic */}
                            <div className="p-5 rounded-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <i className="fas fa-university fa-5x mb-3 text-white-50"></i>
                                <h4 className="fw-light">Legacy of Excellence</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: STATS */}
            <section className="py-5" style={{ background: 'linear-gradient(135deg, #dd5618 0%, #ff8a50 100%)' }}>
                <div className="container py-4">
                    <div className="row text-center text-white">
                        <div className="col-md-4 mb-4 mb-md-0">
                            <h2 className="display-4 fw-bold">5,000+</h2>
                            <p className="lead">Students Enrolled</p>
                        </div>
                        <div className="col-md-4 mb-4 mb-md-0">
                            <h2 className="display-4 fw-bold">200+</h2>
                            <p className="lead">Expert Faculty</p>
                        </div>
                        <div className="col-md-4">
                            <h2 className="display-4 fw-bold">100%</h2>
                            <p className="lead">Digital Accessibility</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: FOOTER */}
            <footer className="py-5 text-start" style={{ background: '#1a1d20', color: '#abb2bf' }}>
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <h5 className="text-white mb-3">Questions?</h5>
                            <p>Contact the Registrar Office for assistance regarding your records and enrollment.</p>
                            <ul className="list-unstyled">
                                <li className="mb-2"><i className="fas fa-envelope me-2 text-primary"></i> registrar@benedicto.edu.ph</li>
                                <li className="mb-2"><i className="fas fa-phone me-2 text-primary"></i> (032) 123-4567</li>
                                <li className="mb-2"><i className="fas fa-map-marker-alt me-2 text-primary"></i> A.S. Fortuna St., Mandaue City</li>
                            </ul>
                        </div>
                        <div className="col-lg-4">
                            <h5 className="text-white mb-3">Quick Links</h5>
                            <ul className="list-unstyled">
                                <li className="mb-2"><button className="btn btn-link p-0 text-decoration-none text-muted hover-white" onClick={() => navigate('/')}>Home</button></li>
                                <li className="mb-2"><button className="btn btn-link p-0 text-decoration-none text-muted hover-white" onClick={() => navigate('/login')}>Login</button></li>
                                <li className="mb-2"><button className="btn btn-link p-0 text-decoration-none text-muted hover-white" onClick={() => navigate('/register')}>Register</button></li>
                            </ul>
                        </div>
                        <div className="col-lg-4">
                            <h5 className="text-white mb-3">Connect With Us</h5>
                            <div className="d-flex gap-3">
                                <a href="#" className="btn btn-outline-secondary rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="btn btn-outline-secondary rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-twitter"></i></a>
                                <a href="#" className="btn btn-outline-secondary rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    <hr className="my-5" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <div className="text-center small">
                        <p className="mb-0">© {footerYear} Benedicto College - Online Records Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Inline CSS for animations */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-15px); }
                        100% { transform: translateY(0px); }
                    }
                    .hover-card:hover {
                        transform: translateY(-5px) !important;
                    }
                    .hover-white:hover {
                        color: #fff !important;
                    }
                `}
            </style>
        </div>
    );
};

export default HomePage;
