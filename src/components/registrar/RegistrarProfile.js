import React, { useState, useEffect } from 'react';
import './RegistrarProfile.css';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import { useProfilePhoto } from '../../contexts/ProfilePhotoContext';

function RegistrarProfile() {
    const { profilePic, updateProfilePhoto, profilePicUpdated, clearProfilePicUpdateFlag } = useProfilePhoto();
    const [imageError, setImageError] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [profile, setProfile] = useState(null);
    const [loginHistory, setLoginHistory] = useState([]);
    const [browserInfo, setBrowserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Edit profile state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        idNumber: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    const userRole = localStorage.getItem('userRole');
    const idNumber = localStorage.getItem('idNumber');
    
    // Make fullName reactive to localStorage changes
    const [currentFullName, setCurrentFullName] = useState(localStorage.getItem('fullName'));
    
    // Update currentFullName when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setCurrentFullName(localStorage.getItem('fullName'));
        };
        
        const handleProfileUpdate = (event) => {
            const { fullName } = event.detail;
            if (fullName) {
                setCurrentFullName(fullName);
            }
        };
        
        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Listen for profile update events
        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        // Also update when profile data is loaded
        if (profile) {
            const fullName = `${profile.firstName} ${profile.middleName || ''} ${profile.lastName}`.trim();
            setCurrentFullName(fullName);
        }
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [profile]);
    
    const fullName = currentFullName;
    
    // Function to format name with middle initial
    const formatDisplayName = (name) => {
        if (!name) return 'Registrar User';
        
        const nameParts = name.split(' ').filter(part => part.trim() !== '');
        
        if (nameParts.length === 1) {
            return nameParts[0];
        } else if (nameParts.length === 2) {
            return `${nameParts[0]} ${nameParts[1]}`;
        } else if (nameParts.length >= 3) {
            // First name + Middle initial + Last name
            const firstName = nameParts[0];
            const middleInitial = nameParts[1].charAt(0).toUpperCase() + '.';
            const lastName = nameParts[nameParts.length - 1];
            return `${firstName} ${middleInitial} ${lastName}`;
        }
        
        return name;
    };
    const email = localStorage.getItem('email');

    useEffect(() => {
        loadProfileData();
        loadLoginHistory();
        loadBrowserInfo();
    }, []);

    // Listen for profile photo updates from context
    useEffect(() => {
        if (profilePicUpdated) {
            clearProfilePicUpdateFlag();
        }
    }, [profilePicUpdated, clearProfilePicUpdateFlag]);

    const loadProfileData = async () => {
        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) return;

            const response = await fetch(`${API_BASE_URL}/accounts/profile`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                
                // Always update localStorage with the complete name from API
                const fullName = `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim();
                localStorage.setItem('fullName', fullName);
                
                // Update the currentFullName state to trigger re-render
                setCurrentFullName(fullName);
                
                // Always update email and idNumber as they might change
                localStorage.setItem('email', data.email);
                localStorage.setItem('idNumber', data.idNumber);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLoginHistory = async () => {
        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) {
                return;
            }

            const response = await fetch(`${API_BASE_URL}/sessions/history?limit=10`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setLoginHistory(data.history || []);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to load login history:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Error loading login history:', error);
        }
    };

    // Profile photo is now managed by ProfilePhotoContext

    const loadBrowserInfo = () => {
        // Get browser information
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Detect browser - order matters! Check Edge before Chrome
        let browser = 'Unknown';
        if (userAgent.includes('Edg/')) browser = 'Edge (Chromium)';
        else if (userAgent.includes('Edge/')) browser = 'Edge (Legacy)';
        else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) browser = 'Opera';
        else if (userAgent.includes('Firefox/')) browser = 'Firefox';
        else if (userAgent.includes('Chrome/')) browser = 'Chrome';
        else if (userAgent.includes('Safari/')) browser = 'Safari';
        else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';
        
        // Detect device
        let device = 'Desktop';
        if (isMobile) {
            if (/iPad/i.test(userAgent)) device = 'iPad';
            else if (/iPhone/i.test(userAgent)) device = 'iPhone';
            else if (/Android/i.test(userAgent)) device = 'Android';
            else device = 'Mobile';
        }
        
        setBrowserInfo({
            browser,
            device,
            screenResolution: `${screenWidth}x${screenHeight}`,
            lastActive: new Date().toLocaleString(),
            isMobile,
            userAgent
        });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        try {
            const sessionToken = getSessionToken();
            const response = await fetch(`${API_BASE_URL}/accounts/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                const error = await response.json();
                setPasswordError(error.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('An error occurred while changing password');
        }
    };

    // Profile editing functions
    const handleEditProfile = () => {
        // Use profile data from API if available, otherwise fallback to localStorage
        const currentProfile = profile || {};
        const currentEmail = currentProfile.email || localStorage.getItem('email') || 'registrar@benedicto.edu.ph';
        const currentIdNumber = currentProfile.idNumber || localStorage.getItem('idNumber') || 'A001';
        
        setEditProfileData({
            firstName: currentProfile.firstName || 'Registrar',
            middleName: currentProfile.middleName || '',
            lastName: currentProfile.lastName || 'User',
            email: currentEmail,
            idNumber: currentIdNumber
        });
        setShowEditModal(true);
        setSuccessMessage('');
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setSuccessMessage('');
        setEditProfileData({
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            idNumber: ''
        });
    };

    const handleSaveProfile = async () => {
        if (!editProfileData.firstName.trim() || !editProfileData.lastName.trim()) {
            alert('First Name and Last Name are required');
            return;
        }

        if (!editProfileData.email.trim()) {
            alert('Email is required');
            return;
        }

        if (!editProfileData.idNumber.trim()) {
            alert('ID Number is required');
            return;
        }

        setEditLoading(true);
        try {
            const sessionToken = getSessionToken();
            const response = await fetch(`${API_BASE_URL}/accounts/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    firstName: editProfileData.firstName.trim(),
                    middleName: editProfileData.middleName.trim(),
                    lastName: editProfileData.lastName.trim(),
                    email: editProfileData.email.trim(),
                    idNumber: editProfileData.idNumber.trim()
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Update localStorage with new data
                const newFullName = `${editProfileData.firstName} ${editProfileData.middleName} ${editProfileData.lastName}`.trim();
                localStorage.setItem('fullName', newFullName);
                localStorage.setItem('email', editProfileData.email.trim());
                localStorage.setItem('idNumber', editProfileData.idNumber.trim());
                
                // Update the reactive fullName state
                setCurrentFullName(newFullName);
                
                // Update profile state directly instead of reloading
                setProfile({
                    ...profile,
                    firstName: editProfileData.firstName.trim(),
                    middleName: editProfileData.middleName.trim(),
                    lastName: editProfileData.lastName.trim(),
                    email: editProfileData.email.trim(),
                    idNumber: editProfileData.idNumber.trim()
                });
                
                setSuccessMessage('Profile updated successfully!');
                
                // Dispatch custom event to notify navbar of the update
                window.dispatchEvent(new CustomEvent('profileUpdated', { 
                    detail: { fullName: newFullName } 
                }));
                
                // Auto-close modal after 2 seconds
                setTimeout(() => {
                    setShowEditModal(false);
                    setSuccessMessage('');
                }, 2000);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setEditLoading(false);
        }
    };

    // Profile photo upload functionality removed - now handled only in sidebar

    if (loading) {
        return (
            <div className="registrar-profile-page">
                <div className="registrar-profile-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="registrar-profile-page">
            {/* Redirect users to Settings > My Account */}
            <div style={{ padding: '40px 16px' }}>
                <h2 style={{ marginBottom: 12 }}>Profile moved</h2>
                <p style={{ marginBottom: 20 }}>Your profile and account settings now live in Settings → My Account.</p>
                <a href="/registrar/settings" className="btn btn-primary">Go to My Account</a>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change Password</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowPasswordModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handlePasswordChange}>
                                <div className="modal-body">
                                    {passwordError && (
                                        <div className="alert alert-danger">{passwordError}</div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="alert alert-success">{passwordSuccess}</div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowPasswordModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Details Modal */}
            {showEditModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-dialog">
                        <div className="custom-modal-content">
                            <div className="custom-modal-header">
                                <h5 className="custom-modal-title">Edit Profile Details</h5>
                                <button 
                                    type="button" 
                                    className="custom-modal-close" 
                                    onClick={handleCancelEdit}
                                >×</button>
                            </div>
                            <div className="custom-modal-body">
                                <div className="custom-form-row">
                                    <div className="custom-form-col-6">
                                        <div className="custom-form-group">
                                            <label className="custom-form-label">
                                                <b>ID Number *</b>
                                            </label>
                                            <input
                                                type="text"
                                                className="custom-form-control"
                                                value={editProfileData.idNumber}
                                                onChange={(e) => setEditProfileData({...editProfileData, idNumber: e.target.value})}
                                                placeholder="Enter ID number"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="custom-form-col-6">
                                        <div className="custom-form-group">
                                            <label className="custom-form-label">
                                                <b>Email Address *</b>
                                            </label>
                                            <input
                                                type="email"
                                                className="custom-form-control"
                                                value={editProfileData.email}
                                                onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="custom-form-row">
                                    <div className="custom-form-col-4">
                                        <div className="custom-form-group">
                                            <label className="custom-form-label">
                                                <b>First Name *</b>
                                            </label>
                                            <input
                                                type="text"
                                                className="custom-form-control"
                                                value={editProfileData.firstName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({...editProfileData, firstName: capitalizedValue});
                                                }}
                                                placeholder="Enter first name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="custom-form-col-4">
                                        <div className="custom-form-group">
                                            <label className="custom-form-label">
                                                <b>Middle Name</b>
                                            </label>
                                            <input
                                                type="text"
                                                className="custom-form-control"
                                                value={editProfileData.middleName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({...editProfileData, middleName: capitalizedValue});
                                                }}
                                                placeholder="Enter middle name"
                                            />
                                        </div>
                                    </div>
                                    <div className="custom-form-col-4">
                                        <div className="custom-form-group">
                                            <label className="custom-form-label">
                                                <b>Last Name *</b>
                                            </label>
                                            <input
                                                type="text"
                                                className="custom-form-control"
                                                value={editProfileData.lastName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({...editProfileData, lastName: capitalizedValue});
                                                }}
                                                placeholder="Enter last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="custom-alert-info">
                                    <i className="fas fa-info-circle"></i>
                                    Fields marked with <b>*</b> are required.
                                </div>
                                
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="custom-success-message">
                                        <i className="fas fa-check-circle"></i>
                                        {successMessage}
                                    </div>
                                )}
                            </div>
                            <div className="custom-modal-footer">
                                <button 
                                    type="button" 
                                    className="custom-btn-secondary" 
                                    onClick={handleCancelEdit}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="custom-btn-primary" 
                                    onClick={handleSaveProfile}
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <>
                                            <span className="custom-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default RegistrarProfile;