import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './StudentRegistration.css';

function StudentRegistration({ onRegistrationSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        idNumber: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        middleName: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idNumberError, setIdNumberError] = useState('');
    const [fullNameError, setFullNameError] = useState('');

    // Capitalize function for name fields
    const capitalizeWords = (text) => {
        if (!text) return '';
        return text.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Check for duplicate ID number
    const checkDuplicateIdNumber = async (idNumber) => {
        if (!idNumber || idNumber.length < 10) {
            setIdNumberError('');
            return false;
        }

        console.log('🔍 Checking duplicate ID number:', idNumber);

        try {
            const response = await fetch(`${API_BASE_URL}/students/check-duplicate-id/${idNumber}`);
            console.log('🔍 ID check response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 ID check response data:', data);

                if (data.exists) {
                    setIdNumberError('This School ID Number is already registered');
                    console.log('❌ Duplicate ID found:', idNumber);
                    return true;
                } else {
                    setIdNumberError('');
                    console.log('✅ ID is unique:', idNumber);
                    return false;
                }
            } else {
                console.error('❌ ID check failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Error checking duplicate ID:', error);
        }
        setIdNumberError('');
        return false;
    };

    // Check for duplicate full name
    const checkDuplicateFullName = async (firstName, lastName, middleName) => {
        if (!firstName || !lastName) {
            setFullNameError('');
            return false;
        }

        console.log('🔍 Checking duplicate full name:', { firstName, lastName, middleName });

        try {
            const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
            const response = await fetch(`${API_BASE_URL}/students/check-duplicate-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    middleName: middleName ? middleName.trim() : ''
                })
            });

            console.log('🔍 Name check response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Name check response data:', data);

                if (data.exists) {
                    setFullNameError('A student with this full name is already registered');
                    console.log('❌ Duplicate name found:', fullName);
                    return true;
                } else {
                    setFullNameError('');
                    console.log('✅ Name is unique:', fullName);
                    return false;
                }
            } else {
                console.error('❌ Name check failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Error checking duplicate name:', error);
        }
        setFullNameError('');
        return false;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // For name fields, only allow letters, spaces, and tilde
        if (['firstName', 'lastName', 'middleName'].includes(name)) {
            // Remove any characters that are not letters, spaces, or tilde
            const filteredValue = value.replace(/[^a-zA-Z\s~]/g, '');

            // Apply capitalization to name fields
            const processedValue = capitalizeWords(filteredValue);

            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        } else {
            // For other fields, use the value as is
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Use useEffect to handle duplicate validation with proper debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Check for duplicate ID number
            if (formData.idNumber && formData.idNumber.length >= 10) {
                checkDuplicateIdNumber(formData.idNumber);
            } else {
                setIdNumberError('');
            }

            // Check for duplicate full name
            if (formData.firstName && formData.lastName) {
                checkDuplicateFullName(formData.firstName, formData.lastName, formData.middleName);
            } else {
                setFullNameError('');
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.idNumber, formData.firstName, formData.lastName, formData.middleName]);

    const validateForm = () => {
        console.log('🔍 Validating form...');
        console.log('🔍 Current errors:', { idNumberError, fullNameError });
        console.log('🔍 Form data:', formData);

        // Check for duplicate errors first
        if (idNumberError || fullNameError) {
            console.log('❌ Form validation failed: Duplicate errors found');
            setError('That student with that full name is already registered');
            return false;
        }

        // Validate School ID format (YYYY-XXXXX)
        const schoolIdPattern = /^\d{4}-\d{5}$/;
        if (!schoolIdPattern.test(formData.idNumber)) {
            console.log('❌ Form validation failed: Invalid ID format');
            setError('School ID must be in the format: YYYY-XXXXX (e.g., 2022-00037)');
            return false;
        }

        // Validate password length
        if (formData.password.length < 6) {
            console.log('❌ Form validation failed: Password too short');
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            console.log('❌ Form validation failed: Passwords do not match');
            setError('Passwords do not match');
            return false;
        }

        // Validate required fields
        if (!formData.firstName || !formData.lastName) {
            console.log('❌ Form validation failed: Missing required fields');
            setError('First Name and Last Name are required');
            return false;
        }

        console.log('✅ Form validation passed');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!validateForm()) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/students/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber: formData.idNumber,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    middleName: formData.middleName
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(result.message);

                // Persist a flag so we can show the welcome prompt after first login
                try {
                    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
                    localStorage.setItem('showWelcomeRegistrationPrompt', '1');
                    localStorage.setItem('registeredStudentName', fullName);
                } catch (_) { }

                // Clear form
                setFormData({
                    idNumber: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    middleName: ''
                });

                // Notify parent component immediately about successful registration
                if (onRegistrationSuccess) {
                    onRegistrationSuccess(result);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-registration-container">
            <div className="registration-header">
                <h2>🎓 Register as New Student</h2>
                <p>Create your student account to access the student dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="idNumber">School ID Number *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="idNumber"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., 2022-00037"
                            required
                            maxLength="10"
                        />
                        <small>Format: YYYY-XXXXX (e.g., 2022-00037)</small>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="middleName">Middle Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            placeholder="Enter your middle name"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create a password (min. 6 characters)"
                            required
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            required
                            minLength="6"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-register"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register as Student'}
                    </button>
                </div>

                <div className="form-footer">
                    <p>Already have an account?
                        <button
                            type="button"
                            className="btn-link"
                            onClick={onSwitchToLogin}
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </form>

            {/* Messages */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

        </div>
    );
}

export default StudentRegistration;
