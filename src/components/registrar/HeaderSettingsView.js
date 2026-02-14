import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

const DEFAULT_HEADER = "🔐 Welcome Back";

export default function HeaderSettingsView() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(DEFAULT_HEADER);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch current setting on component mount
  useEffect(() => {
    fetchCurrentSetting();
  }, []);

  const fetchCurrentSetting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/settings?key=login_title`, {
        headers: {
          'X-Session-Token': sessionManager.getSessionToken()
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDraft(data.data.value || DEFAULT_HEADER);
        }
      }
    } catch (error) {
      console.error('Error fetching login title setting:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMessage("");
  }, [draft]);

  const save = async () => {
    const next = (draft || "").trim() || DEFAULT_HEADER;
    
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionManager.getSessionToken()
        },
        body: JSON.stringify({
          key: 'login_title',
          value: next,
          description: 'Login form title displayed on the login page',
          category: 'ui'
        })
      });

      if (response.ok) {
        setDraft(next);
        setMessage("✅ Saved successfully!");
      } else {
        const error = await response.json();
        setMessage(`❌ Failed to save: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      setMessage("❌ Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionManager.getSessionToken()
        },
        body: JSON.stringify({
          key: 'login_title',
          value: DEFAULT_HEADER,
          description: 'Login form title displayed on the login page',
          category: 'ui'
        })
      });

      if (response.ok) {
        setDraft(DEFAULT_HEADER);
        setMessage("✅ Reset to default");
      } else {
        const error = await response.json();
        setMessage(`❌ Failed to reset: ${error.message}`);
      }
    } catch (error) {
      console.error('Error resetting setting:', error);
      setMessage("❌ Error resetting. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => navigate(-1);

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Portal Settings</h1>

      <div className="mb-3">
        <label className="form-label">Portal Header Title</label>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 520 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !saving) save();
              if (e.key === "Escape") cancel();
            }}
            maxLength={80}
            placeholder="Enter header text"
            autoFocus
            disabled={loading || saving}
          />
          <button 
            type="button" 
            className="btn-save" 
            onClick={save}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={cancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-link p-0 ms-2"
            onClick={reset}
            title="Reset to default"
            disabled={loading || saving}
          >
            Reset to default
          </button>
        </div>
        {message && <div className="small text-muted mt-2">{message}</div>}
        {loading && <div className="small text-muted mt-2">Loading current setting...</div>}
      </div>

      <div className="mt-4">
        <div className="text-muted">Preview</div>
        <h2 className="mt-2">{draft}</h2>
      </div>
    </div>
  );
}
