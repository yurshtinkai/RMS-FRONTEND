import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import { useProfilePhoto } from '../../contexts/ProfilePhotoContext';

function SettingsPage() {
    const { profilePic, updateProfilePhoto, profilePicUpdated, clearProfilePicUpdateFlag } = useProfilePhoto();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [activeModule, setActiveModule] = useState('my-account');

    // Profile-related state
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
    const [emailError, setEmailError] = useState('');
    const [currentFullName, setCurrentFullName] = useState(localStorage.getItem('fullName'));

    const userRole = localStorage.getItem('userRole');
    const idNumber = localStorage.getItem('idNumber');
    const email = localStorage.getItem('email');

    // Fetch settings and profile data on component mount
    useEffect(() => {
        fetchSettings();
        loadProfileData();
        // If navigated with state to open a specific module, honor it
        try {
            const navState = window.history.state && window.history.state.usr;
            if (navState && navState.openModule) {
                setActiveModule(navState.openModule);
            }
        } catch { }
    }, []);

    // Profile-related functions
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

    // Build display name using structured fields so multi-word first names are preserved
    const getStructuredDisplayName = () => {
        const first = (profile?.firstName ?? localStorage.getItem('firstName') ?? '').trim();
        const middle = (profile?.middleName ?? localStorage.getItem('middleName') ?? '').trim();
        const last = (profile?.lastName ?? localStorage.getItem('lastName') ?? '').trim();
        if (first || last) {
            const middleInitial = middle ? `${middle.charAt(0).toUpperCase()}.` : '';
            return middleInitial ? `${first} ${middleInitial} ${last}`.trim() : `${first} ${last}`.trim();
        }
        // Fallback to legacy fullName parsing
        return formatDisplayName(currentFullName);
    };

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
                localStorage.setItem('firstName', data.firstName || '');
                localStorage.setItem('middleName', data.middleName || '');
                localStorage.setItem('lastName', data.lastName || '');

                // Update the currentFullName state to trigger re-render
                setCurrentFullName(fullName);

                // Always update email and idNumber (also store scoped email)
                try {
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('idNumber', data.idNumber);
                    if (data.idNumber) {
                        localStorage.setItem(`email:${data.idNumber}`, data.email || '');
                    }
                } catch { }
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    };

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
        setEmailError('');
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

        // Require Gmail address only
        const email = editProfileData.email.trim();
        const isGmail = /^[^\s@]+@gmail\.com$/i.test(email);
        if (!isGmail) {
            setEmailError('Email must be a Gmail address (@gmail.com)');
            return;
        } else {
            setEmailError('');
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
                // Update localStorage with new data
                const newFullName = `${editProfileData.firstName} ${editProfileData.middleName} ${editProfileData.lastName}`.trim();
                localStorage.setItem('fullName', newFullName);
                const currentId = (localStorage.getItem('idNumber') || '').trim();
                const newId = editProfileData.idNumber.trim();
                const newEmail = editProfileData.email.trim();
                localStorage.setItem('email', newEmail);
                localStorage.setItem('idNumber', newId);
                try {
                    if (newId) localStorage.setItem(`email:${newId}`, newEmail);
                    if (currentId && currentId !== newId) {
                        // clean old scoped email if id changed
                        localStorage.removeItem(`email:${currentId}`);
                    }
                } catch { }
                localStorage.setItem('firstName', editProfileData.firstName.trim());
                localStorage.setItem('middleName', editProfileData.middleName.trim());
                localStorage.setItem('lastName', editProfileData.lastName.trim());
                // Store a displayName override to preserve multi-word first name + middle initial formatting
                const displayNameOverride = `${editProfileData.firstName.trim()} ${editProfileData.middleName.trim() ? editProfileData.middleName.trim().charAt(0).toUpperCase() + '.' : ''} ${editProfileData.lastName.trim()}`.replace(/\s+/g, ' ').trim();
                // Save both global (backward-compat) and per-user scoped versions
                localStorage.setItem('displayFullName', displayNameOverride);
                if (currentId) localStorage.setItem(`displayFullName:${currentId}`, displayNameOverride);
                // Also set navbar immediately to reflect change
                try { window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { displayFullName: displayNameOverride } })); } catch { }

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

                // Dispatch custom event to notify navbar of the update with structured names
                window.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: {
                        fullName: newFullName,
                        firstName: editProfileData.firstName.trim(),
                        middleName: editProfileData.middleName.trim(),
                        lastName: editProfileData.lastName.trim(),
                        displayFullName: displayNameOverride
                    }
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

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/settings`, {
                headers: {
                    'X-Session-Token': sessionManager.getSessionToken()
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data.data || []);
            } else {
                console.error('Failed to fetch settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (setting) => {
        setEditingKey(setting.key);
        setEditValue(setting.value);
    };

    const handleSave = async (key) => {
        try {
            setSaving(true);
            setMessage('');
            setMessageType('');

            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionManager.getSessionToken()
                },
                body: JSON.stringify({
                    key: key,
                    value: editValue
                })
            });

            if (response.ok) {
                // Update local state
                setSettings(prev => prev.map(setting =>
                    setting.key === key
                        ? { ...setting, value: editValue }
                        : setting
                ));
                setEditingKey(null);
                setEditValue('');

                // Show success message
                setMessage('✅ Setting updated successfully!');
                setMessageType('success');

                // Clear message after 3 seconds
                setTimeout(() => {
                    setMessage('');
                    setMessageType('');
                }, 3000);
            } else {
                const error = await response.json();
                setMessage(`❌ Failed to update setting: ${error.message}`);
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            setMessage('❌ Error updating setting. Please try again.');
            setMessageType('danger');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const getSettingDisplayName = (key) => {
        const displayNames = {
            'login_title': 'Login Form Title',
            'login_subtitle': 'Login Form Subtitle',
            'system_name': 'System Name',
            'institution_name': 'Institution Name',
            'institution_address': 'Institution Address',
            'institution_phone': 'Institution Phone',
            'institution_email': 'Institution Email',
            'academic_year': 'Current Academic Year',
            'semester': 'Current Semester',
            'max_login_attempts': 'Maximum Login Attempts',
            'session_timeout': 'Session Timeout (minutes)',
            'maintenance_mode': 'Maintenance Mode',
            'registration_open': 'Registration Status',
            'enrollment_deadline': 'Enrollment Deadline',
            'grade_submission_deadline': 'Grade Submission Deadline'
        };
        return displayNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getSettingDescription = (setting) => {
        const descriptions = {
            'login_title': 'The main title displayed on the login page',
            'login_subtitle': 'The subtitle or description text below the login title',
            'system_name': 'The official name of the registrar management system',
            'institution_name': 'The full name of your educational institution',
            'institution_address': 'Complete address of the institution',
            'institution_phone': 'Main contact phone number for the institution',
            'institution_email': 'Primary email address for institutional communications',
            'academic_year': 'Current academic year (e.g., 2024-2025)',
            'semester': 'Current semester (1st Semester, 2nd Semester, Summer)',
            'max_login_attempts': 'Maximum number of failed login attempts before account lockout',
            'session_timeout': 'Duration in minutes before user session expires',
            'maintenance_mode': 'Enable/disable maintenance mode for system updates',
            'registration_open': 'Whether new student registration is currently open',
            'enrollment_deadline': 'Last date for student enrollment',
            'grade_submission_deadline': 'Deadline for faculty to submit grades'
        };
        return descriptions[setting.key] || setting.description || 'No description available';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'ui': 'primary',
            'general': 'secondary',
            'security': 'warning',
            'notification': 'info',
            'institution': 'success',
            'academic': 'dark',
            'system': 'danger'
        };
        return colors[category] || 'secondary';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>⚙️ System Settings</h2>
                <div className="text-muted">
                    <small>Configure system-wide settings and preferences</small>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="row">
                {/* Sidebar Menu */}
                <div className="col-md-3 pe-0">
                    <div className="border-end me-4">
                        <div className="px-3 py-2 text-muted fw-semibold small d-flex align-items-center">
                            <i className="fas fa-list me-2"></i>
                            Settings Menu
                        </div>
                        <nav className="nav flex-column">
                            <button
                                className={`nav-link text-start ${activeModule === 'my-account' ? 'active' : ''}`}
                                onClick={() => setActiveModule('my-account')}
                            >
                                <i className="fas fa-user me-2"></i>
                                My Account
                            </button>
                            <button
                                className={`nav-link text-start ${activeModule === 'application-config' ? 'active' : ''}`}
                                onClick={() => setActiveModule('application-config')}
                            >
                                <i className="fas fa-cogs me-2"></i>
                                Application Configuration
                            </button>
                            <button
                                className={`nav-link text-start ${activeModule === 'login-preview' ? 'active' : ''}`}
                                onClick={() => setActiveModule('login-preview')}
                            >
                                <i className="fas fa-eye me-2"></i>
                                Login Form Preview
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9">
                    {/* Message Display */}
                    {message && (
                        <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                            {message}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setMessage('');
                                    setMessageType('');
                                }}
                            ></button>
                        </div>
                    )}

                    {/* My Account Module */}
                    {activeModule === 'my-account' && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-user me-2"></i>
                                    My Account
                                </h5>
                                <small className="opacity-75 text-black">Manage your profile and account settings</small>
                            </div>
                            <div className="card-body">
                                {/* Profile Management Section */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="me-3">
                                                        {profilePic && !imageError ? (
                                                            <img
                                                                src={profilePic}
                                                                alt="Profile"
                                                                className="rounded-circle"
                                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                onError={() => setImageError(true)}
                                                            />
                                                        ) : (
                                                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                                <i className="fas fa-user text-white"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-1">{getStructuredDisplayName()}</h6>
                                                        <small className="text-muted">{profile?.email || email || 'N/A'}</small>
                                                        <div className="mt-1">
                                                            <span className="badge bg-success">Active Now</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={getStructuredDisplayName()}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={profile?.email || email || 'N/A'}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button className="btn btn-primary" onClick={handleEditProfile}>
                                                        <i className="fas fa-edit me-2"></i>
                                                        Update Profile
                                                    </button>
                                                    <button className="btn btn-outline-secondary" onClick={() => setShowPasswordModal(true)}>
                                                        <i className="fas fa-key me-2"></i>
                                                        Change Password
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="mb-3">Account Information</h6>
                                                <div className="row mb-2">
                                                    <div className="col-6">
                                                        <small className="text-muted">Account Created:</small>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="fw-bold">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</small>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-6">
                                                        <small className="text-muted">User ID:</small>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="fw-bold">{profile?.idNumber || idNumber || 'N/A'}</small>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-6">
                                                        <small className="text-muted">Status:</small>
                                                    </div>
                                                    <div className="col-6">
                                                        <span className="badge bg-success">Verified</span>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-6">
                                                        <small className="text-muted">Role:</small>
                                                    </div>
                                                    <div className="col-6">
                                                        <span className={`badge ${userRole === 'registrar' ? 'bg-primary' : userRole === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                                                            {userRole === 'registrar' ? 'Registrar' : userRole === 'admin' ? 'Administrator' : 'Accounting'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Application Configuration Module */}
                    {activeModule === 'application-config' && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-cogs me-2"></i>
                                    Application Configuration
                                </h5>
                                <small className="opacity-75">Manage system-wide application settings and preferences</small>
                            </div>
                            <div className="card-body">
                                {settings.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <h5>No settings found</h5>
                                        <p>System settings will appear here when available.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Setting</th>
                                                    <th>Current Value</th>
                                                    <th>Description</th>
                                                    <th>Category</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {settings.map((setting) => (
                                                    <tr key={setting.key}>
                                                        <td>
                                                            <strong>{getSettingDisplayName(setting.key)}</strong>
                                                            <br />
                                                            <small className="text-muted">{setting.key}</small>
                                                        </td>
                                                        <td>
                                                            {editingKey === setting.key ? (
                                                                <div className="input-group">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        placeholder="Enter new value..."
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex align-items-center">
                                                                    <code className="bg-light p-2 rounded">
                                                                        {setting.value}
                                                                    </code>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {getSettingDescription(setting)}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge bg-${getCategoryColor(setting.category)}`}>
                                                                {setting.category}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {editingKey === setting.key ? (
                                                                <div className="btn-group btn-group-sm">
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => handleSave(setting.key)}
                                                                        disabled={saving}
                                                                    >
                                                                        {saving ? (
                                                                            <>
                                                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                                                Saving...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <i className="fas fa-check me-1"></i>
                                                                                Save
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-secondary"
                                                                        onClick={handleCancel}
                                                                        disabled={saving}
                                                                    >
                                                                        <i className="fas fa-times me-1"></i>
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => handleEdit(setting)}
                                                                >
                                                                    <i className="fas fa-edit me-1"></i>
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Login Form Preview Module */}
                    {activeModule === 'login-preview' && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-eye me-2"></i>
                                    Login Form Preview
                                </h5>
                                <small className="opacity-75">Preview how the login form will appear to users</small>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="mb-3">Live Preview</h6>
                                        <div className="row justify-content-center">
                                            <div className="col-md-8">
                                                <div className="card border-2 border-primary shadow-sm">
                                                    <div className="card-body text-center p-4">
                                                        {/* Institution Logo/Header */}
                                                        <div className="mb-4">
                                                            <div className="d-flex align-items-center justify-content-center mb-3">
                                                                <img
                                                                    src="/benedicto2.png"
                                                                    alt="Institution Logo"
                                                                    style={{ height: '50px', width: 'auto' }}
                                                                    className="me-2"
                                                                />
                                                                <div>
                                                                    <h4 className="mb-0 text-primary">
                                                                        {settings.find(s => s.key === 'institution_name')?.value || 'Benedicto College'}
                                                                    </h4>
                                                                    <small className="text-muted">
                                                                        {settings.find(s => s.key === 'system_name')?.value || 'Registrar Management System'}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Login Form */}
                                                        <h3 className="mb-3 text-dark">
                                                            {settings.find(s => s.key === 'login_title')?.value || '🔐 Welcome Back'}
                                                        </h3>
                                                        <p className="text-muted mb-4">
                                                            {settings.find(s => s.key === 'login_subtitle')?.value || 'Sign in to your account with your ID and password'}
                                                        </p>

                                                        <div className="mb-3">
                                                            <div className="input-group">
                                                                <span className="input-group-text">
                                                                    <i className="fas fa-user"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="ID Number"
                                                                    disabled
                                                                    value="Preview Mode"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <div className="input-group">
                                                                <span className="input-group-text">
                                                                    <i className="fas fa-lock"></i>
                                                                </span>
                                                                <input
                                                                    type="password"
                                                                    className="form-control"
                                                                    placeholder="Password"
                                                                    disabled
                                                                    value="••••••••"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button className="btn btn-primary w-100 mb-3" disabled>
                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                            Login as Registrar
                                                        </button>

                                                        <div className="mt-3">
                                                            <small className="text-muted">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                This is a preview of how the login form will appear to users
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <h6 className="mb-3">Configuration Summary</h6>
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">Institution Name</span>
                                                <span className="badge bg-primary rounded-pill">
                                                    {settings.find(s => s.key === 'institution_name')?.value || 'Benedicto College'}
                                                </span>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">System Name</span>
                                                <span className="badge bg-secondary rounded-pill">
                                                    {settings.find(s => s.key === 'system_name')?.value || 'Registrar Management System'}
                                                </span>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">Login Title</span>
                                                <span className="badge bg-info rounded-pill">
                                                    {settings.find(s => s.key === 'login_title')?.value || '🔐 Welcome Back'}
                                                </span>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">Login Subtitle</span>
                                                <span className="badge bg-warning rounded-pill">
                                                    {settings.find(s => s.key === 'login_subtitle')?.value || 'Sign in to your account'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="alert alert-info">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-lightbulb me-2"></i>
                                                    Preview Tips
                                                </h6>
                                                <ul className="mb-0 small">
                                                    <li>Changes are reflected in real-time</li>
                                                    <li>All settings are automatically saved</li>
                                                    <li>Preview shows actual login form appearance</li>
                                                    <li>Mobile responsive design included</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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

            {/* Edit Profile Modal (pure CSS) */}
            {showEditModal && (
                <div className="edit-profile-overlay">
                    <div className="edit-profile-container">
                        <div className="edit-profile-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Edit Profile Details</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="mb-0">
                                            <label className="form-label fw-bold">ID Number *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={editProfileData.idNumber}
                                                onChange={(e) => setEditProfileData({ ...editProfileData, idNumber: e.target.value })}
                                                placeholder="Enter ID number"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-0">
                                            <label className="form-label fw-bold">Email Address *</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                value={editProfileData.email}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditProfileData({ ...editProfileData, email: val });
                                                    if (/^[^\s@]+@gmail\.com$/i.test(val.trim())) {
                                                        setEmailError('');
                                                    } else {
                                                        setEmailError('Email must be a Gmail address (@gmail.com)');
                                                    }
                                                }}
                                                placeholder="Enter email address"
                                                style={emailError ? { borderColor: '#dc3545' } : undefined}
                                                required
                                            />
                                            {emailError && (
                                                <div className="mt-1" style={{ color: '#dc3545', fontSize: '0.875rem' }}>
                                                    {emailError}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-3 mt-3">
                                    <div className="col-md-4">
                                        <div className="mb-0">
                                            <label className="form-label fw-bold">First Name *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={editProfileData.firstName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({ ...editProfileData, firstName: capitalizedValue });
                                                }}
                                                placeholder="Enter first name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-0">
                                            <label className="form-label fw-bold">Middle Name</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={editProfileData.middleName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({ ...editProfileData, middleName: capitalizedValue });
                                                }}
                                                placeholder="Enter middle name"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-0">
                                            <label className="form-label fw-bold">Last Name *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={editProfileData.lastName}
                                                onChange={(e) => {
                                                    const capitalizedValue = e.target.value.split(' ').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                    ).join(' ');
                                                    setEditProfileData({ ...editProfileData, lastName: capitalizedValue });
                                                }}
                                                placeholder="Enter last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="alert alert-info mt-3 py-2">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Fields marked with <b>*</b> are required.
                                </div>
                                {successMessage && (
                                    <div className="alert alert-success mt-2">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {successMessage}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer edit-profile-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveProfile}
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
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

export default SettingsPage;
