import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_BASE_URL, getSessionToken } from './utils/api';
import { getStudentProfileImage, setStudentProfileImage } from './utils/cleanupProfileImages';
import { cleanupSharedProfileImages } from './utils/cleanupProfileImages';
import { FooterProvider } from './contexts/FooterContext';
import { ProfilePhotoProvider } from './contexts/ProfilePhotoContext';

// Import components
import Login from './components/auth/Login';
import RegisterPage from './components/auth/RegisterPage';
import HomePage from './components/common/HomePage';
import StudentRequestForm from './components/student/StudentRequestForm';
import StudentRequestTable from './components/student/StudentRequestTable';
import StudentHomePage from './components/student/StudentHomePage';
import StudentSidebar from './components/student/StudentSidebar';
import Sidebar from './components/registrar/Sidebar';
import AllRegistrationsView from './components/registrar/AllRegistrationsView';
import UnenrolledRegistrationsView from './components/registrar/UnenrolledRegistrationsView';
import NewEnrollmentView from './components/registrar/NewEnrollmentView';
import RequestManagementView from './components/registrar/RequestManagementView';
import ImageViewModal from './components/common/ImageViewModal';
import DocumentViewModal from './components/common/DocumentViewModal';
import AllStudentsView from './components/registrar/AllStudentsView';
import StudentDetailView from './components/registrar/StudentDetailView';
import Dashboard from './components/registrar/Dashboard';
import SubjectSchedulesView from './components/registrar/SubjectSchedulesView';
import SubjectEnrolledStudentsView from './components/registrar/SubjectEnrolledStudentsView';
import ScheduleDetailsView from './components/registrar/ScheduleDetailsView';
import SchoolYearSemesterView from './components/registrar/SchoolYearSemesterView';
import ViewGradesView from './components/registrar/ViewGradesView';
import EncodeEnrollmentView from './components/registrar/EncodeEnrollmentView';
import UnassessedStudentView from './components/registrar/UnassessedStudentView';
import ViewAssessmentView from './components/registrar/ViewAssessmentView'
import SubjectScheduleDetailView from './components/registrar/SubjectScheduleDetailView';
import AccountManagementView from './components/registrar/AccountManagementView';
import NotificationBell from './components/common/NotificationBell';
import StudentProfile from './components/student/StudentProfile';
import StudentRegistrationForm from './components/student/StudentRegistrationForm';
import EditStudentDetailView from './components/registrar/EditStudentDetailView';
import EnrollmentStatusView from './components/student/EnrollmentStatusView';
import SubjectScheduleView from './components/student/SubjectScheduleView';
import DocumentApprovalModal from './components/registrar/DocumentApprovalModal';
import RequestFromRegistrarView from './components/registrar/RequestFromRegistrarView';
import BalanceInquiriesView from './components/registrar/BalanceInquiriesView';
import { createDummyRegistrations } from './data/dummyData';
import { getUserRole } from './utils/api';
import HeaderSettingsView from "./components/registrar/HeaderSettingsView";
import SettingsPage from "./components/registrar/SettingsPage";
import BillingPage from './components/student/BillingPage';
import UploadDocuments from './components/registrar/UploadDocuments';
import DocumentViewer from './components/registrar/DocumentViewer';
import RegistrarProfile from './components/registrar/RegistrarProfile';
import AdminDashboard from './admin/AdminDashboard';
import AdminSidebar from './admin/AdminSidebar';
import ManageDepartments from './admin/ManageDepartments';
import ManageSchoolYears from './admin/ManageSchoolYears';
import ManageSemesters from './admin/ManageSemesters';
import ManageCourses from './admin/ManageCourses';
import ManageSubjects from './admin/ManageSubjects';
import ManageSchedules from './admin/ManageSchedules';



const RegistrarLayout = ({ onProfileClick, setStudentToEnroll }) => (
  <ProfilePhotoProvider>
    <div className="registrar-layout">
      <Sidebar onProfileClick={onProfileClick} setStudentToEnroll={setStudentToEnroll} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  </ProfilePhotoProvider>
);

const AdminLayout = ({ onProfileClick }) => (
  <ProfilePhotoProvider>
    <div className="registrar-layout"> {/* Reusing registrar layout class for consistent styling */}
      <AdminSidebar onProfileClick={onProfileClick} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  </ProfilePhotoProvider>
);

function App() {
  const [userRole, setUserRole] = useState(getUserRole());
  const [navbarName, setNavbarName] = useState(() => {
    const userRole = localStorage.getItem('userRole');

    // Prefer per-user override (preserves multi-word first names)
    const currentId = localStorage.getItem('idNumber') || '';
    const overrideDisplay = (localStorage.getItem(`displayFullName:${currentId}`) || localStorage.getItem('displayFullName') || '').trim();
    if (overrideDisplay) return overrideDisplay;
    const f = (localStorage.getItem('firstName') || '').trim();
    const m = (localStorage.getItem('middleName') || '').trim();
    const l = (localStorage.getItem('lastName') || '').trim();
    if (f && l) {
      const mi = m ? `${m.charAt(0).toUpperCase()}.` : '';
      return mi ? `${f} ${mi} ${l}` : `${f} ${l}`;
    }

    // Fallback: use legacy fullName exactly as provided (supports multi-word and middle initials)
    const fullName = localStorage.getItem('fullName');

    if (!fullName) return localStorage.getItem('idNumber');
    try { localStorage.setItem('displayFullName', fullName); } catch { }
    return fullName;

    return fullName;
  });
  const [modalImage, setModalImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [registrations, setRegistrations] = useState(createDummyRegistrations());
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [assessment, setAssessment] = useState([]);
  const [studentProfilePic, setStudentProfilePic] = useState(null);
  const [profilePicError, setProfilePicError] = useState(false);

  // Responsive logo switching
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 991);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load profile picture for navbar (both student and registrar)
  useEffect(() => {
    // Clean up any invalid profile images first
    cleanupSharedProfileImages();


    if (userRole === 'student') {
      const studentId = localStorage.getItem('idNumber');
      if (studentId) {
        // First try to load from localStorage for immediate display
        const profilePic = getStudentProfileImage(studentId);
        setStudentProfilePic(profilePic);
        setProfilePicError(false);

        // Then fetch from server to get the latest photo
        const loadStudentProfilePhoto = async () => {
          try {
            const sessionToken = getSessionToken();
            if (sessionToken) {
              const response = await fetch(`${API_BASE_URL}/students/profile`, {
                headers: { 'X-Session-Token': sessionToken }
              });

              if (response.ok) {
                const data = await response.json();

                if (data.profilePhoto) {
                  // Handle different photo URL formats
                  let photoUrl;
                  if (data.profilePhoto.startsWith('http')) {
                    photoUrl = data.profilePhoto;
                  } else if (data.profilePhoto.startsWith('/api/')) {
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    photoUrl = `${baseUrl}${data.profilePhoto}`;
                  } else {
                    photoUrl = `${API_BASE_URL}${data.profilePhoto}`;
                  }

                  setStudentProfilePic(photoUrl);
                  setStudentProfileImage(studentId, photoUrl);
                  setProfilePicError(false);
                } else {
                }
              } else {
              }
            }
          } catch (error) {
            console.error('🔍 App.js - Error fetching student profile photo:', error);
          }
        };

        loadStudentProfilePhoto();
      }
    } else if (userRole === 'registrar' || userRole === 'accounting') {
      // Load registrar profile picture from database
      const loadRegistrarProfilePhoto = async () => {
        try {
          const sessionToken = getSessionToken();
          if (sessionToken) {
            const response = await fetch(`${API_BASE_URL}/registrar-photos/profile`, {
              headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.profilePhoto) {
                // Convert relative URL to full URL
                const fullPhotoUrl = data.profilePhoto.startsWith('http')
                  ? data.profilePhoto
                  : `${API_BASE_URL}${data.profilePhoto}`;
                setStudentProfilePic(fullPhotoUrl);
              } else {
                setStudentProfilePic(null);
              }
              setProfilePicError(false);
            } else {
              setStudentProfilePic(null);
              setProfilePicError(false);
            }
          }
        } catch (error) {
          console.error('Error loading registrar profile photo:', error);
          setStudentProfilePic(null);
          setProfilePicError(false);
        }
      };

      loadRegistrarProfilePhoto();
    }
  }, [userRole]);

  // Function to refresh profile picture in navbar
  const refreshProfilePic = () => {

    if (userRole === 'student') {
      const studentId = localStorage.getItem('idNumber');
      if (studentId) {
        // First try localStorage for immediate display
        const profilePic = getStudentProfileImage(studentId);
        setStudentProfilePic(profilePic);
        setProfilePicError(false);

        // Then fetch from server to get the latest photo
        const loadStudentProfilePhoto = async () => {
          try {
            const sessionToken = getSessionToken();
            if (sessionToken) {
              const response = await fetch(`${API_BASE_URL}/students/profile`, {
                headers: { 'X-Session-Token': sessionToken }
              });

              if (response.ok) {
                const data = await response.json();

                if (data.profilePhoto) {
                  // Handle different photo URL formats
                  let photoUrl;
                  if (data.profilePhoto.startsWith('http')) {
                    photoUrl = data.profilePhoto;
                  } else if (data.profilePhoto.startsWith('/api/')) {
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    photoUrl = `${baseUrl}${data.profilePhoto}`;
                  } else {
                    photoUrl = `${API_BASE_URL}${data.profilePhoto}`;
                  }

                  setStudentProfilePic(photoUrl);
                  setStudentProfileImage(studentId, photoUrl);
                  setProfilePicError(false);
                } else {
                }
              } else {
              }
            }
          } catch (error) {
            console.error('🔄 App.js - Error refreshing student profile photo:', error);
          }
        };

        loadStudentProfilePhoto();
      }
    } else if (userRole === 'registrar' || userRole === 'accounting') {
      // Refresh registrar profile picture from database
      const loadRegistrarProfilePhoto = async () => {
        try {
          const sessionToken = getSessionToken();
          if (sessionToken) {
            const response = await fetch(`${API_BASE_URL}/registrar-photos/profile`, {
              headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.profilePhoto) {
                // Convert relative URL to full URL
                const fullPhotoUrl = data.profilePhoto.startsWith('http')
                  ? data.profilePhoto
                  : `${API_BASE_URL}${data.profilePhoto}`;
                setStudentProfilePic(fullPhotoUrl);
              } else {
                setStudentProfilePic(null);
              }
              setProfilePicError(false);
            } else {
              setStudentProfilePic(null);
              setProfilePicError(false);
            }
          }
        } catch (error) {
          console.error('Error refreshing registrar profile photo:', error);
          setStudentProfilePic(null);
          setProfilePicError(false);
        }
      };

      loadRegistrarProfilePhoto();
    }
  };

  const navigate = useNavigate();

  // Function to fetch students from backend
  const fetchStudents = async () => {
    try {

      // Use /api/accounts for registrar users to get comprehensive student data
      const endpoint = userRole === 'registrar' ? '/accounts' : '/students';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'X-Session-Token': getSessionToken(),
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {
        const students = await response.json();

        // Transform the data to match the frontend format
        let transformedStudents;

        if (userRole === 'registrar') {
          // Transform data from /api/accounts endpoint
          transformedStudents = students.map(student => ({
            id: student.id,
            idNumber: student.idNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            middleName: student.middleName,
            profilePhoto: student.profilePhoto, // Include profile photo
            name: `${student.firstName} ${student.lastName}`,
            gender: student.gender || 'N/A',
            course: student.course || 'Bachelor of Science in Information Technology',
            status: student.registrationStatus === 'Approved' ? 'Enrolled' : (student.registrationStatus || 'Not registered'),
            registrationStatus: student.registrationStatus === 'Approved' ? 'Enrolled' : (student.registrationStatus || 'Not registered'),
            registrationDate: student.registrationDate || 'N/A',
            createdAt: new Date(student.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            academicStatus: student.registrationStatus === 'Approved' ? 'Enrolled' : (student.registrationStatus || 'Not registered')
          }));
        } else {
          // Transform data from /api/students endpoint (for accounting role)
          transformedStudents = students.map(student => ({
            id: student.id,
            idNo: student.idNumber,
            profilePhoto: student.profilePhoto, // Include profile photo
            name: student.fullName || `${student.firstName} ${student.lastName}`,
            gender: student.gender || 'N/A',
            course: student.course || 'Not registered',
            status: student.isRegistered ? 'Registered' : 'Not registered',
            createdAt: new Date(student.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            academicStatus: student.academicStatus || 'Not registered'
          }));
        }
        setEnrolledStudents(transformedStudents);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch students:', response.status, response.statusText);
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.message);
    }
  };

  useEffect(() => {
    const role = getUserRole();
    if (role) {
      setUserRole(role);
      if (role === 'registrar' || role === 'accounting') {
        fetchStudents(); // Fetch students only for registrar/accounting
      }
    } else {
      document.body.classList.add('login-background');
    }
    return () => {
      document.body.classList.remove('login-background');
    };
  }, [userRole]);

  useEffect(() => {
    if (modalImage || documentModalData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalImage, documentModalData]);

  // Update navbar when userRole changes
  useEffect(() => {
    const currentUserRole = localStorage.getItem('userRole');

    if (currentUserRole === 'registrar' || currentUserRole === 'accounting') {
      // Prefer explicit displayFullName or structured parts for staff roles
      const currentId = localStorage.getItem('idNumber') || '';
      const override = (localStorage.getItem(`displayFullName:${currentId}`) || localStorage.getItem('displayFullName') || '').trim();
      if (override) {
        setNavbarName(override);
        return;
      }

      const f = (localStorage.getItem(`firstName:${currentId}`) || localStorage.getItem('firstName') || '').trim();
      const m = (localStorage.getItem(`middleName:${currentId}`) || localStorage.getItem('middleName') || '').trim();
      const l = (localStorage.getItem(`lastName:${currentId}`) || localStorage.getItem('lastName') || '').trim();
      if (f && l) {
        const mi = m ? `${m.charAt(0).toUpperCase()}.` : '';
        setNavbarName(mi ? `${f} ${mi} ${l}` : `${f} ${l}`);
        return;
      }

      // Fallback only if we don't have structured parts
      const fullName = localStorage.getItem('fullName');
      if (fullName) {
        setNavbarName(fullName);
      }
    }
  }, [userRole]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const { fullName, firstName, middleName, lastName, displayFullName } = event.detail || {};
      const userRole = localStorage.getItem('userRole');

      // For registrar/Accounting users, show FirstName + MiddleInitial + LastName using structured values when available
      const override = (displayFullName || localStorage.getItem('displayFullName') || fullName || '').trim();
      if (override) {
        setNavbarName(override);
        return;
      }
      const f = firstName || localStorage.getItem('firstName');
      const m = middleName || localStorage.getItem('middleName');
      const l = lastName || localStorage.getItem('lastName');
      if (f && l) {
        const mi = (m && m.trim() !== '') ? `${m.trim().charAt(0).toUpperCase()}.` : '';
        const formatted = mi ? `${f} ${mi} ${l}` : `${f} ${l}`;
        setNavbarName(formatted);
        return;
      }
      if (fullName) {
        const nameParts = fullName.split(' ').filter(part => part.trim() !== '');
        if (nameParts.length >= 3) {
          const first = nameParts[0];
          const middleInitial = nameParts[1].charAt(0).toUpperCase() + '.';
          const last = nameParts[nameParts.length - 1];
          setNavbarName(`${first} ${middleInitial} ${last}`);
        } else {
          setNavbarName(fullName);
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    // After login, immediately compute and set navbar from stored values
    try {
      const override = (localStorage.getItem('displayFullName') || localStorage.getItem('fullName') || '').trim();
      if (override) setNavbarName(override);
    } catch { }
    if (role === 'registrar') {
      navigate('/registrar/dashboard');
      fetchStudents(); // Fetch students when registrar logs in
    } else if (role === 'accounting') {
      navigate('/registrar/all-registrations');
      fetchStudents(); // Fetch students when accounting logs i
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'student') {
      navigate('/student/home');
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API to log the logout event
      const sessionToken = getSessionToken();
      if (sessionToken) {
        await fetch(`${API_BASE_URL}/sessions/logout`, {
          method: 'POST',
          headers: {
            'X-Session-Token': sessionToken,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error calling logout API:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('idNumber');
      localStorage.removeItem('fullName');
      localStorage.removeItem('userInfo');
      setUserRole(null);
      navigate('/login');
    }
  };

  const handleCompleteEnrollment = (enrolledStudent) => {
    const newStudent = {
      ...enrolledStudent,
      id: enrolledStudents.length + 1,
      idNo: `2024-${1000 + enrolledStudents.length + 1}`,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setEnrolledStudents(prev => [...prev, newStudent]);

    setRegistrations(prev => prev.map(reg =>
      reg.id === enrolledStudent.id ? { ...reg, status: 'enrolled' } : reg
    ));

    setStudentToEnroll(null);
    navigate('/registrar/all-students');
    alert('Enrollment Complete! Student has been added to the master list.');

    // Refresh the students list from backend
    setTimeout(() => {
      fetchStudents();
    }, 1000);
  };

  const handleEncodeStudent = (encodedStudent) => {
    const newStudent = {
      ...encodedStudent,
      idNo: encodedStudent.id,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    setEnrolledStudents(prev => {
      const isAlreadyEnrolled = prev.some(s => s.idNo === newStudent.idNo);
      if (isAlreadyEnrolled) {
        alert(`Student ${newStudent.name} is already in the master list.`);
        return prev;
      }
      alert(`Successfully encoded and added ${newStudent.name} to the All Students list.`);
      return [...prev, newStudent];
    });

    // Refresh the students list from backend
    setTimeout(() => {
      fetchStudents();
    }, 1000);
  };

  // Reflect edits from EditStudentDetailView in the Student List immediately
  const handleStudentListUpdate = (updated) => {
    if (!updated) return;
    setEnrolledStudents(prev => prev.map(s => {
      if (!s) return s;
      if (String(s.idNumber) === String(updated.idNumber)) {
        return {
          ...s,
          firstName: updated.firstName || s.firstName,
          lastName: updated.lastName || s.lastName,
          middleName: updated.middleName || s.middleName,
          gender: updated.gender || s.gender
        };
      }
      return s;
    }));
  };

  const closeDocumentModal = () => {
    setDocumentModalData(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const logoStyle = {
    width: '185px',
    height: '35px',
    marginLeft: (userRole === 'registrar' || userRole === 'accounting') ? '18%' : '0'
  };

  return (
    <FooterProvider>
      <div id="app-wrapper">
        {/* Student Navbar - Responsive logo switching */}
        {userRole === 'student' && (
          <>
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top navbar-custom-gradient shadow-sm" style={{ minHeight: '60px', zIndex: 1040 }}>
              <div className="container-fluid align-items-center p-0">
                <div className="d-flex align-items-center w-100" style={{ gap: '8px', minWidth: 0 }}>
                  {/* Desktop/Laptop logo only */}
                  {!isMobile && (
                    <img
                      src={'/benedicto2.png'}
                      className={"student-navbar-logo"}
                      alt="bclogo"
                    />
                  )}
                  {/* Hamburger on mobile shows circular BC logo */}
                  {isMobile && (
                    <button className="navbar-toggler d-lg-none" type="button" style={{ border: 'none', background: 'transparent', padding: '0 4px', marginLeft: '20px', outline: 'none', boxShadow: 'none', transition: 'none' }} onClick={() => setIsSidebarOpen(true)}>
                      <span><i className="fas fa-bars fa-lg text-white"></i></span>
                    </button>
                  )}
                  {/* Menu items for desktop/laptop */}
                  <div className="d-none d-lg-flex flex-row align-items-center ms-3">
                    <button
                      className={`btn btn-link text-white student-navbar-btn${window.location.pathname === '/student/home' ? ' active' : ''}`}
                      onClick={() => navigate('/student/home')}
                    >Home</button>
                    <button
                      className={`btn btn-link text-white student-navbar-btn${window.location.pathname === '/student/request' ? ' active' : ''}`}
                      onClick={() => navigate('/student/request')}
                    >Request</button>
                    <button
                      className={`btn btn-link text-white student-navbar-btn${window.location.pathname === '/student/my-request' ? ' active' : ''}`}
                      onClick={() => navigate('/student/my-request')}
                    >My Request</button>
                    <button
                      className={`btn btn-link text-white student-navbar-btn${window.location.pathname === '/student/billing' ? ' active' : ''}`}
                      onClick={() => navigate('/student/billing')}
                    >Billing</button>
                  </div>
                  <div className="ms-auto d-flex align-items-center justify-content-center" style={{ gap: '8px', height: '40px' }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '100%', marginRight: '15px' }}>
                      <NotificationBell />
                    </div>
                    <div className="dropdown d-flex align-items-center justify-content-center" style={{ height: '100%', marginRight: '35px' }}>
                      <button
                        className="btn btn-link p-0 border-0 bg-transparent text-white"
                        type="button"
                        id="settingsDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ outline: 'none', boxShadow: 'none', color: '#fff', minWidth: 0 }}
                      >
                        {studentProfilePic && !profilePicError ? (
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                            <img
                              src={studentProfilePic}
                              alt="Profile"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                // border: '2px solid #fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              onError={() => setProfilePicError(true)}
                            />
                            <i className="fa-solid fa-chevron-down" style={{
                              color: 'white',
                              fontSize: '10px',
                              marginLeft: '-7px',
                              fontWeight: 'bolder',
                              opacity: 0.8
                            }}></i>
                          </div>
                        ) : (
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#6c757d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '0px solid #fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              <i className="fas fa-user" style={{
                                color: 'white',
                                fontSize: '18px',
                                opacity: 0.8
                              }}></i>
                            </div>
                            <i className="fa-solid fa-chevron-down" style={{
                              color: 'white',
                              fontSize: '10px',
                              marginLeft: '-7px',
                              fontWeight: 'bolder',
                              opacity: 0.8
                            }}></i>
                          </div>
                        )}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                        <li>
                          <button className="dropdown-item" onClick={() => navigate('/student/profile')}>
                            <i className="fa-regular fa-user me-2"></i>
                            Profile
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            <i className="fa-solid fa-arrow-right-from-bracket fa-sm me-2"></i>
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            {/* Sidebar only on mobile */}
            <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navigate={navigate} />
          </>
        )}
        {/* registrar/Accounting Navbar */}
        {(userRole === 'registrar' || userRole === 'accounting' || userRole === 'admin') && (
          <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${userRole ? 'navbar-custom-gradient shadow-sm' : ''}`}>
            <div className="container-fluid">
              <img src="/benedicto2.png" style={logoStyle} alt="bclogo" />
              <div className="d-flex ms-auto align-items-center">
                <span className="navbar-text me-3 text-white">
                  <strong>{navbarName}</strong>
                </span>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle text-white"
                    type="button"
                    id="settingsDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa-solid fa-gear fa-lg"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                    <li>
                      <button className="dropdown-item" onClick={() => {
                        if (userRole === 'admin') {
                          navigate('/admin/settings', { state: { openModule: 'my-account' } });
                        } else {
                          navigate('/registrar/settings', { state: { openModule: 'my-account' } });
                        }
                      }}>
                        <i className="fa-regular fa-user me-2"></i>
                        Profile
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket fa-sm me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        )}
        <div className="content-wrapper" style={userRole === 'student' ? { marginTop: '0px' } : {}}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/student/home" element={<ProtectedRoute><StudentHomePage /></ProtectedRoute>} />
            <Route path="/student/request" element={<ProtectedRoute><StudentRequestForm /></ProtectedRoute>} />
            <Route path="/student/my-request" element={<ProtectedRoute><StudentRequestTable /></ProtectedRoute>} />

            <Route path="/student/profile" element={<ProtectedRoute><StudentProfile onProfilePicUpdate={refreshProfilePic} /></ProtectedRoute>} />
            <Route path="/student/enrollment-status" element={<ProtectedRoute><EnrollmentStatusView /></ProtectedRoute>} />
            <Route path="/student/subject-schedule" element={<ProtectedRoute><SubjectScheduleView /></ProtectedRoute>} />
            <Route path="/student/requests" element={<ProtectedRoute><StudentRequestForm /></ProtectedRoute>} />
            <Route path="/student/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
            {/* Registration is now handled within the Login component */}
            <Route
              path="/registrar"
              element={
                <ProtectedRoute>
                  <RegistrarLayout onProfileClick={setModalImage} setStudentToEnroll={setStudentToEnroll} />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<RegistrarProfile />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="all-students" element={<AllStudentsView enrolledStudents={enrolledStudents} />} />
              <Route path="students/:idNo" element={<StudentDetailView enrolledStudents={enrolledStudents} />} />
              <Route path="students/:idNo/upload-documents" element={<UploadDocuments />} />
              <Route path="students/:idNo/view-document/:documentType" element={<DocumentViewer />} />
              <Route path="students/:idNo/edit" element={<EditStudentDetailView onStudentUpdated={handleStudentListUpdate} />} />
              <Route path="all-registrations" element={<AllRegistrationsView registrations={registrations} setRegistrations={setRegistrations} />} />
              <Route
                path="enrollment/unenrolled"
                element={<UnenrolledRegistrationsView registrations={registrations} onEnrollStudent={setStudentToEnroll} />}
              />
              <Route path="enrollment/new" element={<NewEnrollmentView student={studentToEnroll} onCompleteEnrollment={handleCompleteEnrollment} registrations={registrations} setStudentToEnroll={setStudentToEnroll} />} />

              <Route path="requests" element={<RequestManagementView setDocumentModalData={setDocumentModalData} />} />
              <Route path="requests/approve-document/:requestId" element={<DocumentApprovalModal />} />
              <Route path="assessment/unassessed-student" element={<UnassessedStudentView assessment={assessment} onAssessedStudent={setAssessment} />} />
              <Route path="assessment/view-assessment" element={<ViewAssessmentView />} />
              <Route path="/registrar/request-from-registrar" element={<RequestFromRegistrarView />} />
              <Route path="/registrar/balance-inquiries" element={<BalanceInquiriesView />} />
              <Route path="manage/subject-schedules" element={<SubjectSchedulesView />} />
              <Route path="/registrar/manage/subject-schedules/:id" element={<ProtectedRoute><SubjectScheduleDetailView /></ProtectedRoute>} />
              <Route path="/registrar/manage/subject-schedules/:scheduleId/enrolled-students" element={<ProtectedRoute><SubjectEnrolledStudentsView /></ProtectedRoute>} />
              <Route path="accounts" element={<AccountManagementView />} />
              <Route path="manage/subject-schedules/:id" element={<ScheduleDetailsView />} />
              <Route path="manage/school-year-semester" element={<SchoolYearSemesterView />} />
              <Route path="manage/encode-enrollments" element={<EncodeEnrollmentView onEncodeStudent={handleEncodeStudent} />} />

            </Route>


            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout onProfileClick={setModalImage} />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Add other admin routes here */}
              <Route path="manage/departments" element={<ManageDepartments />} />
              <Route path="manage/school-years" element={<ManageSchoolYears />} />
              <Route path="manage/semesters" element={<ManageSemesters />} />
              <Route path="manage/courses" element={<ManageCourses />} />
              <Route path="manage/subjects" element={<ManageSubjects />} />
              <Route path="manage/schedules" element={<ManageSchedules />} />
            </Route>

            <Route path="*" element={<Navigate to={
              userRole === 'registrar' ? '/registrar/dashboard' :
                userRole === 'accounting' ? '/registrar/all-registrations' :
                  userRole === 'student' ? '/student/home' :
                    userRole === 'admin' ? '/admin/dashboard' :
                      '/'
            } replace />}
            />
          </Routes>
        </div>
        {modalImage && <ImageViewModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        {documentModalData && <DocumentViewModal modalData={documentModalData} onClose={closeDocumentModal} />}
      </div>
    </FooterProvider>
  );
} export default App;

