import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import { useProfilePhoto } from '../../contexts/ProfilePhotoContext';

function Sidebar({ onProfileClick, setStudentToEnroll }) {
    const location = useLocation();
    const { profilePic, updateProfilePhoto } = useProfilePhoto();
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [pendingRegistrarCount, setPendingRegistrarCount] = useState(0);
    const [pendingBalanceInquiriesCount, setPendingBalanceInquiriesCount] = useState(0);
    
    // UI toggles for collapsible menus
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/registrar/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/registrar/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/registrar/all-students') || location.pathname.startsWith('/registrar/students/'));
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/registrar/manage'));
    const [isAssessmentOpen, setAssessmentOpen] = useState(location.pathname.startsWith('/registrar/assessment'));
    
    const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);
    const userRole = localStorage.getItem('userRole');

    // Dummy School Year Data (Same as before)
    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    useEffect(() => {
        const fetchSchoolYears = async () => {
            const dummyData = [
                { id: 1, start_year: 2025, end_year: 2026, semester: '1st Semester' },
                { id: 2, start_year: 2025, end_year: 2026, semester: '2nd Semester' },
                { id: 3, start_year: 2025, end_year: 2026, semester: 'Summer' },
            ];
            setSchoolYears(dummyData);
            if (dummyData.length > 0) setSelectedSchoolYear(dummyData[0].id);
        };
        fetchSchoolYears();
    }, []);

    // Polling for notification badges
    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) return;
                
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/requests`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const data = await res.json();
                if (res.ok) {
                    const pendingCount = data.filter(req => 
                        req.initiatedBy === 'student' && 
                        req.status !== 'approved' && 
                        req.status !== 'ready for pick-up' &&
                        req.status !== 'rejected'
                    ).length;
                    setPendingRequestCount(pendingCount);
                }
            } catch (err) { console.error(err); }
        };

        const fetchPendingPayments = async () => {
            try {
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) return;
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/payments/pending`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const json = await res.json();
                if (res.ok) {
                    setPendingRegistrarCount(Array.isArray(json?.data) ? json.data.length : 0);
                }
            } catch (err) { console.error(err); }
        };

        const fetchBalanceInquiriesCount = async () => {
            try {
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) return;
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/accounting/balance-inquiries`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const json = await res.json();
                if (res.ok) {
                    setPendingBalanceInquiriesCount(Array.isArray(json?.data) ? json.data.length : 0);
                }
            } catch (err) { console.error(err); }
        };

        fetchPendingRequests();
        fetchPendingPayments();
        fetchBalanceInquiriesCount();
        const interval = setInterval(() => {
            fetchPendingRequests();
            fetchPendingPayments();
            fetchBalanceInquiriesCount();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        // DYNAMIC DASHBOARD PATH: Crucial for separating Admin from Registrar logic
        { 
            name: 'Dashboard', 
            path: userRole === 'admin' ? '/admin/dashboard' : '/registrar/dashboard', 
            icon: 'fa-tachometer-alt' 
        },
        { name: 'Students', icon: 'fa-users', subItems: [ { name: 'All Students', path: '/registrar/all-students' }, { name: 'New Student', path: '/registrar/enrollment/new' }] },
        { name: 'Registration', icon: 'fa-file-alt', subItems: [ { name: 'All Registrations', path: '/registrar/all-registrations' } ] },
        { name: 'Enrollment', icon: 'fa-user-check',
            subItems: [ 
              { name: 'Unenrolled Registrations', path: '/registrar/enrollment/unenrolled' }, 
              { name: 'New Enrollment', path: '/registrar/enrollment/new' } 
            ] 
        },
        { name: 'Assessment', path: '/registrar/assessment', icon: 'fa-clipboard-list', 
            subItems: [
                { name : 'Unassessed Student', path: '/registrar/assessment/unassessed-student'},
                { name : 'View Assessment', path: '/registrar/assessment/view-assessment'}
            ]
        },
        { name: 'Requests', path: '/registrar/requests', icon: 'fa-folder-open', badge: pendingRequestCount },
        { name: 'Request from Registrar', path: '/registrar/request-from-registrar', icon: 'fa-envelope-open-text', badge: pendingRegistrarCount },
        { name: 'Balance Inquiries', path: '/registrar/balance-inquiries', icon: 'fa-question-circle', badge: pendingBalanceInquiriesCount },
        { name: 'Manage', icon: 'fa-cogs',
          subItems: [
            { name: 'Subject Schedules', path: '/registrar/manage/subject-schedules' },
            { name: 'School Year & Semester', path: '/registrar/manage/school-year-semester' },
            { name: 'View Grades', path: '/registrar/manage/view-grades' },
            { name: 'Encode Enrollments', path: '/registrar/manage/encode-enrollments' }
          ]
        },
        { name: 'Accounts', path: '/registrar/accounts', icon: 'fa-user-shield' },
        { name: 'Settings', path: '/registrar/settings', icon: 'fa-cog' }
    ];

    const handlePhotoPreview = () => { if (profilePic) setPhotoPreviewModalOpen(true); };
    
    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum size is 5MB.');
            return;
        }

        try {
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                alert('Session expired. Please login again.');
                return;
            }
            const sessionToken = sessionManager.getSessionToken();
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch(`${API_BASE_URL}/registrar-photos/upload`, {
                method: 'POST',
                headers: { 'X-Session-Token': sessionToken },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const fullPhotoUrl = data.photoUrl.startsWith('http') ? data.photoUrl : `${API_BASE_URL}${data.photoUrl}`;
                updateProfilePhoto(fullPhotoUrl);
            } else {
                const errorData = await response.json();
                alert(`Failed to upload photo: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            alert('Failed to upload profile photo. Please try again.');
        }
    };

    const handleMenuClick = (e, itemName) => { 
        e.preventDefault();
        if (itemName === 'Students') setStudentOpen(!isStudentOpen);
        if (itemName === 'Registration') setRegistrationOpen(!isRegistrationOpen);
        if (itemName === 'Enrollment') setEnrollmentOpen(!isEnrollmentOpen);
        if (itemName === 'Assessment') setAssessmentOpen(!isAssessmentOpen);
        if (itemName === 'Manage') setManageOpen(!isManageOpen);
    };
    
    const handleSchoolYearChange = (e) => setSelectedSchoolYear(e.target.value);

    let visibleMenuItems;
    if (userRole === 'accounting') {
      visibleMenuItems = menuItems.filter(item =>
          ['Registration', 'Assessment', 'Request from Registrar', 'Balance Inquiries'].includes(item.name)
        ).map(item => {
          if (item.name === 'Students') {
            return { ...item, subItems: item.subItems.filter(subItem => subItem.name !== 'New Student') };
          }
          return item;
        });
    } else if (userRole === 'registrar') {
      visibleMenuItems = menuItems.filter(item => item.name !== 'Registration' && item.name !== 'Request from Registrar' && item.name !== 'Balance Inquiries');
    } else {
      // Admin sees everything
      visibleMenuItems = menuItems;
    }

    // Role Title Logic
    let roleTitle = 'Registrar';
    if (userRole === 'admin') roleTitle = 'Administrator';
    else if (userRole === 'accounting') roleTitle = 'Accounting';

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header text-center">
                    <div className="sidebar-profile-container">
                        <div onClick={handlePhotoPreview} title="Click to view photo in full screen">
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" className="sidebar-profile-pic" />
                            ) : (
                                <div className="sidebar-profile-empty"><i className="fas fa-user"></i></div>
                            )}
                        </div>
                        <label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label>
                        <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{display:'none'}}/>
                    </div>
                    {/* Correct Role Title Display */}
                    <h5>{roleTitle}</h5>
                </div>
                
                <div className="sidebar-sy-selector">
                    <select className="form-select sy-dropdown" value={selectedSchoolYear} onChange={handleSchoolYearChange}>
                        {schoolYears.map(sy => (
                            <option key={sy.id} value={sy.id}>SY {sy.start_year} - {sy.end_year} {sy.semester}</option>
                        ))}
                    </select>
                </div>
                
                <div className="sidebar-nav">
                    <ul className="nav flex-column">
                        {visibleMenuItems.map(item => (
                            <li className="nav-item" key={item.name}>
                                {item.subItems ? (
                                    <>
                                        <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e) => handleMenuClick(e, item.name)}>
                                            <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                            <i className={`fas fa-chevron-down transition-transform ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'rotate-180':''}`}></i>
                                        </a>
                                        <div className={`collapse ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'show':''}`}>
                                            <ul className="nav flex-column ps-3">
                                                {item.subItems.map(subItem => (
                                                    <li className="nav-item" key={subItem.name}>
                                                        <Link 
                                                            to={subItem.path} 
                                                            className={`nav-link sub-item ${(location.pathname === subItem.path) ? 'active' : ''}`} 
                                                            onClick={() => subItem.path === '/registrar/enrollment/new' && setStudentToEnroll(null)}>
                                                            {subItem.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <Link to={item.path} className={`nav-link d-flex justify-content-between align-items-center ${location.pathname === item.path ? 'active' : ''}`}>
                                        <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                        {item.badge > 0 && <span className="badge bg-danger rounded-pill small-badge">{item.badge}</span>}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {photoPreviewModalOpen && (
                <div className="photo-preview-overlay" onClick={() => setPhotoPreviewModalOpen(false)}>
                    <div className="photo-preview-circle">
                       {profilePic && <img src={profilePic} alt="Profile Photo" className="photo-preview-image" />}
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;