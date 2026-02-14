import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './StudentLogin.css';
import sessionManager from '../../utils/sessionManager';


// env  localStorage keys for editable header
const ENV_HEADER = process.env.REACT_APP_STUDENT_LOGIN_HEADER || '🎓 Student Login';
const LOCAL_STORAGE_KEY_HEADER = 'studentLogin.headerText';

function StudentLogin({ onLoginSuccess, onSwitchToRegister, onSwitchToRegistrar, onSwitchToAccounting }) {
    const [formData, setFormData] = useState({
        idNumber: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


        // header editing state (with localStorage persistence)
    const [headerText, setHeaderText] = useState(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HEADER);
            return saved && saved.trim() ? saved : ENV_HEADER;
        } catch {
            return ENV_HEADER;
        }
    });
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [draftHeader, setDraftHeader] = useState(() => headerText);

    // header edit handlers
    const startEditHeader = () => {
        setDraftHeader(headerText);
        setIsEditingHeader(true);
    };
    const cancelEditHeader = () => {
        setDraftHeader(headerText);
        setIsEditingHeader(false);
    };
    const saveHeader = () => {
        const next = (draftHeader || '').trim() || ENV_HEADER;
        setHeaderText(next);
        setIsEditingHeader(false);
        try { localStorage.setItem(LOCAL_STORAGE_KEY_HEADER, next); } catch {}
    };
    const resetHeader = () => {
        try { localStorage.removeItem(LOCAL_STORAGE_KEY_HEADER); } catch {}
        setHeaderText(ENV_HEADER);
        setIsEditingHeader(false);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/sessions/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber: formData.idNumber,
                    password: formData.password
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Store session token using session manager
                sessionManager.setSessionToken(result.sessionToken);
                
                // Store user info
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                
                // Clear form
                setFormData({
                    idNumber: '',
                    password: ''
                });

                // Notify parent component about successful login
                if (onLoginSuccess) {
                    onLoginSuccess(result);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

      // New Constant For Customizable Header
const HEADER_TEXT = process.env.REACT_APP_STUDENT_LOGIN_HEADER || '🎓 Student Login';


    return (
      <div className="student-login-container">
        <div className="login-header">
          <h2>{headerText}</h2>
          <p>Access your student dashboard with your School ID and password</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="idNumber">School ID Number</label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              placeholder="e.g., 2022-00037"
              required
              maxLength="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="form-footer">
            <p>
              Don't have an account?
              <button
                type="button"
                className="btn-link"
                onClick={onSwitchToRegister}
              >
                Register here
              </button>
            </p>

            <div className="registrar-switch">
              <div>
                <button
                  type="button"
                  className="btn-link btn-registrar"
                  onClick={onSwitchToRegistrar}
                >
                  Login as Registrar
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="btn-link btn-registrar"
                  onClick={onSwitchToAccounting}
                >
                  Login as Accounting
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
}

export default StudentLogin;