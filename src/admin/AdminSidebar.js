import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';
import { useProfilePhoto } from '../contexts/ProfilePhotoContext';

function AdminSidebar({ onProfileClick }) {
    const location = useLocation();
    const { profilePic, updateProfilePhoto } = useProfilePhoto();
    const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);

    // UI toggles for collapsible menus
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Manage Accounts', path: '/admin/accounts', icon: 'fa-users-cog' },
        { name: 'System Settings', path: '/admin/settings', icon: 'fa-cogs' },
        {
            name: 'School Management',
            icon: 'fa-university',
            subItems: [
                { name: 'Departments', path: '/admin/manage/departments' },
                { name: 'School Years', path: '/admin/manage/school-years' },
                { name: 'Semesters', path: '/admin/manage/semesters' },
                { name: 'Courses', path: '/admin/manage/courses' },
                { name: 'Subjects', path: '/admin/manage/subjects' },
                { name: 'Schedules', path: '/admin/manage/schedules' }
            ]
        }
    ];

    const handlePhotoPreview = () => { if (profilePic) setPhotoPreviewModalOpen(true); };

    const handleProfilePicChange = async (e) => {
        // ... (Include profile pic upload logic if needed, or simplify for admin)
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

            // Using registrar-photos endpoint for now, or create admin-photos
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
        if (itemName === 'School Management') {
            e.preventDefault();
            setManageOpen(!isManageOpen);
        }
    };

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
                        {/* Admin might not need to upload photo via sidebar, but keeping it for consistency */}
                        <label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label>
                        <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} />
                    </div>
                    <h5>Administrator</h5>
                </div>

                <div className="sidebar-nav">
                    <ul className="nav flex-column">
                        {menuItems.map(item => (
                            <li className="nav-item" key={item.name}>
                                {item.subItems ? (
                                    <>
                                        <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e) => handleMenuClick(e, item.name)}>
                                            <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                            <i className={`fas fa-chevron-down transition-transform ${((item.name === 'School Management' && isManageOpen)) ? 'rotate-180' : ''}`}></i>
                                        </a>
                                        <div className={`collapse ${((item.name === 'School Management' && isManageOpen)) ? 'show' : ''}`}>
                                            <ul className="nav flex-column ps-3">
                                                {item.subItems.map(subItem => (
                                                    <li className="nav-item" key={subItem.name}>
                                                        <Link
                                                            to={subItem.path}
                                                            className={`nav-link sub-item ${(location.pathname === subItem.path) ? 'active' : ''}`} >
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

export default AdminSidebar;
