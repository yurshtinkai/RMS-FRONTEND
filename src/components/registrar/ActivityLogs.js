import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function ActivityLogs({ userId, studentName }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [showAllLogs, setShowAllLogs] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchActivityLogs();
            fetchActivitySummary();
        }
    }, [userId]);

    const fetchActivityLogs = async () => {
        try {
            const limit = showAllLogs ? 100 : 10;
            const response = await fetch(
                `${API_BASE_URL}/activity-logs/user/${userId}?limit=${limit}`, 
                {
                    headers: {
                        'X-Session-Token': sessionManager.getSessionToken()
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setLogs(data.data.logs || []);
            } else {
                console.error('Failed to fetch activity logs');
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivitySummary = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/activity-logs/user/${userId}/summary`, 
                {
                    headers: {
                        'X-Session-Token': sessionManager.getSessionToken()
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSummary(data.data);
            }
        } catch (error) {
            console.error('Error fetching activity summary:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        const icons = {
            'login': '🔑',
            'logout': '🚪',
            'view_profile': '👤',
            'update_profile': '✏️',
            'create_request': '📝',
            'view_dashboard': '📊',
            'download_document': '📥'
        };
        return icons[action] || '📋';
    };

    const getActionColor = (action) => {
        const colors = {
            'login': 'success',
            'logout': 'secondary',
            'view_profile': 'info',
            'update_profile': 'warning',
            'create_request': 'primary',
            'view_dashboard': 'info',
            'download_document': 'primary'
        };
        return colors[action] || 'secondary';
    };

    const getBrowserInfo = (userAgent) => {
        if (!userAgent) return 'Unknown Browser';
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="activity-logs-container">
            <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                        <i className="fas fa-history me-2"></i>
                        Activity Logs - {studentName}
                    </h5>
                </div>
                <div className="card-body">
                    {/* Activity Summary */}
                    {summary && (
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card border-success">
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-success">Last Login</h5>
                                        <p className="card-text">
                                            {summary.lastLogin ? (
                                                <>
                                                    <strong>{formatDate(summary.lastLogin.timestamp)}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        IP: {summary.lastLogin.ipAddress || 'N/A'}
                                                        <br />
                                                        Browser: {getBrowserInfo(summary.lastLogin.userAgent)}
                                                    </small>
                                                </>
                                            ) : (
                                                <span className="text-muted">Never logged in</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-primary">
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-primary">Recent Logins</h5>
                                        <p className="card-text">
                                            <strong className="h3">{summary.recentLoginCount}</strong>
                                            <br />
                                            <small className="text-muted">Last 30 days</small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-warning">
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-warning">Most Active</h5>
                                        <p className="card-text">
                                            {summary.actionStats && summary.actionStats.length > 0 ? (
                                                <>
                                                    <strong>{summary.actionStats[0].action.replace(/_/g, ' ')}</strong>
                                                    <br />
                                                    <small className="text-muted">{summary.actionStats[0].count} times</small>
                                                </>
                                            ) : (
                                                <span className="text-muted">No activity</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Logs */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Recent Activity</h6>
                        <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                                setShowAllLogs(!showAllLogs);
                                setLoading(true);
                                fetchActivityLogs();
                            }}
                        >
                            {showAllLogs ? 'Show Less' : 'Show More'}
                        </button>
                    </div>

                    {logs.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            <i className="fas fa-info-circle fa-2x mb-2"></i>
                            <p>No activity logs found for this student.</p>
                        </div>
                    ) : (
                        <div className="activity-timeline-container">
                            <div className="activity-timeline">
                                {logs.map((log, index) => (
                                    <div key={log.id} className={`activity-item ${index === logs.length - 1 ? 'last' : ''}`}>
                                        <div className="activity-icon">
                                            <span className={`badge bg-${getActionColor(log.action)} rounded-circle p-2`}>
                                                {getActionIcon(log.action)}
                                            </span>
                                        </div>
                                        <div className="activity-content">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">
                                                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </h6>
                                                    <p className="mb-1 text-muted">
                                                        {log.description || `User performed ${log.action.replace(/_/g, ' ')}`}
                                                    </p>
                                                    <small className="text-muted">
                                                        <i className="fas fa-clock me-1"></i>
                                                        {formatDate(log.createdAt)}
                                                        {log.ipAddress && (
                                                            <>
                                                                <span className="mx-2">•</span>
                                                                <i className="fas fa-globe me-1"></i>
                                                                {log.ipAddress}
                                                            </>
                                                        )}
                                                        {log.userAgent && (
                                                            <>
                                                                <span className="mx-2">•</span>
                                                                <i className="fas fa-desktop me-1"></i>
                                                                {getBrowserInfo(log.userAgent)}
                                                            </>
                                                        )}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .activity-timeline-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #f8f9fa;
                }
                
                .activity-timeline-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                .activity-timeline-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                
                .activity-timeline-container::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                
                .activity-timeline-container::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                .activity-timeline {
                    position: relative;
                    padding-left: 30px;
                }
                
                .activity-item {
                    position: relative;
                    padding-bottom: 20px;
                    border-left: 2px solid #e9ecef;
                }
                
                .activity-item.last {
                    border-left: none;
                }
                
                .activity-icon {
                    position: absolute;
                    left: -40px;
                    top: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 50%;
                }
                
                .activity-content {
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-left: 20px;
                    border: 1px solid #e9ecef;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .activity-content h6 {
                    color: #495057;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}

export default ActivityLogs;
