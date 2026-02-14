import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './RegistrarLogin.css';
import sessionManager from '../../utils/sessionManager';

function RegistrarLogin({ onLoginSuccess, onSwitchToStudent }) {
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

      // We clone the response because .json() can only be called once
      const data = await response.json();

      if (response.ok) {
        // Changed check from 'registrar' to 'registrar'
        if (data.user.role === 'registrar') {
          // Store session token using session manager
          sessionManager.setSessionToken(data.sessionToken);
          
          // Store user info
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          
          onLoginSuccess(data);
        } else {
          setError('This account is not authorized as a registrar.');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
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

  return (
    <div className="registrar-login-container">
      <h2 className="text-center mb-4 text-white">Registrar Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="idNumber" className="form-label text-white">Registrar ID</label>
          <input
            type="text"
            className="form-control"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            placeholder="Enter Registrar ID (e.g., A001)"
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
          {loading ? 'Logging in...' : 'Login as Registrar'}
        </button>
      </form>
      
      <button 
        className="btn btn-outline-light btn-sm w-100"
        onClick={onSwitchToStudent}
      >
        ← Back to Student Login
      </button>
      
      <div className="text-center mt-3 text-white">
        <small>Sample Registrar: A001 / registrarpass</small>
      </div>
    </div>
  );
}

export default RegistrarLogin;