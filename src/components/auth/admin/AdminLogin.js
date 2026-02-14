import React, { useState } from 'react';
import { API_BASE_URL } from '../../../utils/api';
import './AdminLogin.css';
import sessionManager from '../../../utils/sessionManager';

function AdminLogin({ onLoginSuccess, onSwitchToStudent }) {
  const [formData, setFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sessions/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'admin') {
          sessionManager.setSessionToken(data.sessionToken);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          onLoginSuccess(data);
        } else {
          setError('This account is not authorized as an administrator.');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <h2 className="text-center mb-4 text-white">System Admin Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="idNumber" className="form-label text-white">Admin ID</label>
          <input
            type="text"
            className="form-control"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            placeholder="Enter Admin ID (e.g., ADM01)"
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="password" className="form-label text-white">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Password"
            required
          />
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
      
      <button 
        className="btn btn-outline-light btn-sm w-100"
        onClick={onSwitchToStudent}
      >
        ← Back to Student Login
      </button>
      
      <div className="text-center mt-3 text-white">
        <small>Sample Admin: ADM01 / adminpass</small>
      </div>
    </div>
  );
}

export default AdminLogin;