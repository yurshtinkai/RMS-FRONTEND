import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';
import '../components/registrar/Dashboard.css'; // Reusing existing styles
import { useFooter } from '../contexts/FooterContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

/**
 * Admin Dashboard Component
 * 
 * Features:
 * - Real-time statistics from database
 * - Interactive charts and graphs
 * - Student enrollment analytics
 * - Request management overview
 * - Session-based authentication
 */

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        newStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        suspendedStudents: 0,
        graduatedStudents: 0,
        totalEnrolledStudents: 0,
        bsitStudents: 0,
        genderDistribution: {
            male: 0,
            female: 0,
            other: 0
        },
        yearLevelDistribution: {
            firstYear: 0,
            secondYear: 0,
            thirdYear: 0,
            fourthYear: 0
        },
        semesterDistribution: {
            firstSemester: 0,
            secondSemester: 0,
            summer: 0
        },
        courseDistribution: [],
        monthlyEnrollments: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBsitDetails, setShowBsitDetails] = useState(false);

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
        try {
            // Validate and refresh session first
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                setError('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            const sessionToken = sessionManager.getSessionToken();
            // Reuse registrar stats endpoint since backend middleware now allows admin
            const response = await fetch(`${API_BASE_URL}/registrar/dashboard/stats`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();

                setStats({
                    totalStudents: data.totalStudents || 0,
                    totalCourses: data.totalCourses || 0,
                    totalRequests: data.totalRequests || 0,
                    pendingRequests: data.pendingRequests || 0,
                    approvedRequests: data.approvedRequests || 0,
                    rejectedRequests: data.rejectedRequests || 0,
                    newStudents: data.newStudents || 0,
                    activeStudents: data.activeStudents || 0,
                    inactiveStudents: data.inactiveStudents || 0,
                    suspendedStudents: data.suspendedStudents || 0,
                    graduatedStudents: data.graduatedStudents || 0,
                    totalEnrolledStudents: data.totalEnrolledStudents || 0,
                    bsitStudents: data.bsitStudents || 0,
                    bsitGenderDistribution: {
                        male: data.bsitGenderDistribution?.male || 0,
                        female: data.bsitGenderDistribution?.female || 0,
                        other: data.bsitGenderDistribution?.other || 0
                    },
                    genderDistribution: {
                        male: data.genderDistribution?.male || 0,
                        female: data.genderDistribution?.female || 0,
                        other: data.genderDistribution?.other || 0
                    },
                    yearLevelDistribution: {
                        firstYear: data.yearLevelDistribution?.firstYear || 0,
                        secondYear: data.yearLevelDistribution?.secondYear || 0,
                        thirdYear: data.yearLevelDistribution?.thirdYear || 0,
                        fourthYear: data.yearLevelDistribution?.fourthYear || 0
                    },
                    semesterDistribution: {
                        firstSemester: data.semesterDistribution?.firstSemester || 0,
                        secondSemester: data.semesterDistribution?.secondSemester || 0,
                        summer: data.semesterDistribution?.summer || 0
                    },
                    courseDistribution: data.courseDistribution || [],
                    monthlyEnrollments: data.monthlyEnrollments || []
                });
            } else {
                setError('Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        const interval = setInterval(fetchDashboardStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Chart data configurations (Same as Registrar Dashboard)
    const requestStatusData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [stats.pendingRequests, stats.approvedRequests, stats.rejectedRequests],
            backgroundColor: ['#FFA726', '#66BB6A', '#EF5350'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const studentStatusData = {
        labels: ['New Students', 'Active Students', 'Inactive Students'],
        datasets: [{
            data: [stats.newStudents, stats.activeStudents, stats.inactiveStudents],
            backgroundColor: ['#42A5F5', '#66BB6A', '#AB47BC'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const monthlyEnrollmentData = {
        labels: stats.monthlyEnrollments.map(m => m.month) || [], // Dynamic labels
        datasets: [{
            label: 'Student Enrollments',
            data: stats.monthlyEnrollments.map(m => m.count) || [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const courseDistributionData = {
        labels: stats.courseDistribution.map(c => c.name) || [],
        datasets: [{
            label: 'Students per Course',
            data: stats.courseDistribution.map(c => c.studentCount) || [],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            borderWidth: 1,
            borderColor: '#fff'
        }]
    };

    const genderDistributionData = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [
                stats.genderDistribution ? stats.genderDistribution.male : 0,
                stats.genderDistribution ? stats.genderDistribution.female : 0
            ],
            backgroundColor: ['#2196F3', '#E91E63'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const yearLevelDistributionData = {
        labels: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        datasets: [{
            label: 'Students per Year Level',
            data: [
                stats.yearLevelDistribution ? stats.yearLevelDistribution.firstYear : 0,
                stats.yearLevelDistribution ? stats.yearLevelDistribution.secondYear : 0,
                stats.yearLevelDistribution ? stats.yearLevelDistribution.thirdYear : 0,
                stats.yearLevelDistribution ? stats.yearLevelDistribution.fourthYear : 0
            ],
            backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'],
            borderWidth: 1,
            borderColor: '#fff'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true }
            }
        }
    };

    const lineChartOptions = {
        ...chartOptions,
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
            x: { grid: { color: 'rgba(0,0,0,0.1)' } }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <div className="alert alert-danger">Error loading dashboard: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="h3 mb-0 text-gray-800">
                            <i className="fas fa-tachometer-alt text-primary me-2"></i>
                            Admin Dashboard
                        </h1>
                        <p className="text-muted">Real-time overview of student information system</p>
                    </div>
                    <div className="last-updated">
                        <p className="text-muted mb-0">
                            <i className="fas fa-clock me-1"></i>
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                        <small className="text-muted">Auto-refreshes every 30 seconds</small>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-primary">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Students</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalStudents?.toLocaleString() || '0'}</div>
                                </div>
                                <div className="col-auto"><i className="fas fa-users fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ... (Other cards similar to Registrar) */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-success">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Active Students</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.activeStudents?.toLocaleString() || '0'}</div>
                                </div>
                                <div className="col-auto"><i className="fas fa-user-check fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-warning">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Pending Requests</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.pendingRequests?.toLocaleString() || '0'}</div>
                                </div>
                                <div className="col-auto"><i className="fas fa-clock fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-info">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Total Courses</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalCourses?.toLocaleString() || '0'}</div>
                                </div>
                                <div className="col-auto"><i className="fas fa-graduation-cap fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row mb-4">
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary"><i className="fas fa-chart-pie me-2"></i>Request Status</h6>
                        </div>
                        <div className="card-body"><div style={{ height: '300px' }}><Pie data={requestStatusData} options={chartOptions} /></div></div>
                    </div>
                </div>
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-success"><i className="fas fa-chart-pie me-2"></i>Student Status</h6>
                        </div>
                        <div className="card-body"><div style={{ height: '300px' }}><Pie data={studentStatusData} options={chartOptions} /></div></div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-xl-8 col-lg-7 mb-4">
                    <div className="chart-card">
                        <div className="card-header"><h6 className="m-0 font-weight-bold text-primary"><i className="fas fa-chart-line me-2"></i>Monthly Enrollments</h6></div>
                        <div className="card-body"><div style={{ height: '300px' }}><Line data={monthlyEnrollmentData} options={lineChartOptions} /></div></div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-5 mb-4">
                    <div className="chart-card">
                        <div className="card-header"><h6 className="m-0 font-weight-bold text-info"><i className="fas fa-chart-bar me-2"></i>Students per Course</h6></div>
                        <div className="card-body"><div style={{ height: '300px' }}><Bar data={courseDistributionData} options={chartOptions} /></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;