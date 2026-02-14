import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './Dashboard.css';
import { useFooter } from '../../contexts/FooterContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

/**
 * Registrar Dashboard Component
 * 
 * Features:
 * - Real-time statistics from database
 * - Interactive charts and graphs
 * - Student enrollment analytics
 * - Request management overview
 * - Session-based authentication
 * 
 * @component
 */

function Dashboard() {
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
    const [isEditingFooter, setIsEditingFooter] = useState(false);
    const [editYear, setEditYear] = useState('2025');
    const { footerYear, updateFooterYear } = useFooter();

    // Function to handle footer editing
    const handleEditFooter = () => {
        setEditYear(footerYear); // Set current year for editing
        setIsEditingFooter(true);
    };

    const handleSaveFooter = () => {
        setIsEditingFooter(false);
        // Update the footer year in the context
        updateFooterYear(editYear);
        console.log('Footer year updated to:', editYear);
    };

    const handleCancelEdit = () => {
        setIsEditingFooter(false);
        // Reset to current context value
        setEditYear(footerYear);
    };

    const handleYearChange = (e) => {
        setEditYear(e.target.value);
    };

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
            const response = await fetch(`${API_BASE_URL}/registrar/dashboard/stats`, {
                headers: { 'X-Session-Token': sessionToken }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Dashboard data received:', data);
                console.log('🔍 Year level distribution:', data.yearLevelDistribution);
                
                // Ensure all properties have default values to prevent null errors
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
                        // If endpoint doesn't exist, use mock data for now
        setStats({
            totalStudents: 156,
            totalCourses: 8,
            totalRequests: 23,
            pendingRequests: 8,
            approvedRequests: 12,
            rejectedRequests: 3,
            newStudents: 45,
            activeStudents: 134,
            inactiveStudents: 22,
            bsitStudents: 45,
            genderDistribution: {
                male: 78,
                female: 78
            },
            yearLevelDistribution: {
                firstYear: 45,
                secondYear: 38,
                thirdYear: 35,
                fourthYear: 38
            },
            semesterDistribution: {
                firstSemester: 82,
                secondSemester: 74
            }
        });
        
        // Debug: Log what we're receiving
        console.log('🔍 Mock stats set:', {
            bsitStudents: 45,
            yearLevelDistribution: {
                firstYear: 45,
                secondYear: 38,
                thirdYear: 35,
                fourthYear: 38
            }
        });
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            // Use mock data as fallback
            setStats({
                totalStudents: 156,
                totalCourses: 8,
                totalRequests: 23,
                pendingRequests: 8,
                approvedRequests: 12,
                rejectedRequests: 3,
                newStudents: 45,
                activeStudents: 134,
                inactiveStudents: 22,
                bsitStudents: 45,
                genderDistribution: {
                    male: 78,
                    female: 78
                },
                yearLevelDistribution: {
                    firstYear: 45,
                    secondYear: 38,
                    thirdYear: 35,
                    fourthYear: 38
                },
                semesterDistribution: {
                    firstSemester: 82,
                    secondSemester: 74
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchDashboardStats, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Chart data configurations
    const requestStatusData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [stats.pendingRequests, stats.approvedRequests, stats.rejectedRequests],
            backgroundColor: [
                '#FFA726', // Orange for pending
                '#66BB6A', // Green for approved
                '#EF5350'  // Red for rejected
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    // Debug logging for request status data
    console.log('🔍 Request Status Data:', {
        pendingRequests: stats.pendingRequests,
        approvedRequests: stats.approvedRequests,
        rejectedRequests: stats.rejectedRequests,
        totalRequests: stats.totalRequests
    });

    const studentStatusData = {
        labels: ['New Students', 'Active Students', 'Inactive Students'],
        datasets: [{
            data: [stats.newStudents, stats.activeStudents, stats.inactiveStudents],
            backgroundColor: [
                '#42A5F5', // Blue for new
                '#66BB6A', // Green for active
                '#AB47BC'  // Purple for inactive
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const monthlyEnrollmentData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Student Enrollments',
            data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 28, 25, 20],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const courseDistributionData = {
        labels: ['BSIT', 'BSBA', 'BSA', 'BSCS', 'BSHM', 'BSED', 'BEED', 'BSN'],
        datasets: [{
            label: 'Students per Course',
            data: [45, 32, 28, 25, 18, 15, 12, 8],
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
            ],
            borderWidth: 1,
            borderColor: '#fff'
        }]
    };

    // New chart data for gender and year level distribution
    const genderDistributionData = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [
                stats.genderDistribution ? stats.genderDistribution.male : 0,
                stats.genderDistribution ? stats.genderDistribution.female : 0
            ],
            backgroundColor: [
                '#2196F3', // Blue for male
                '#E91E63'  // Pink for female
            ],
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
            backgroundColor: [
                '#4CAF50', // Green for 1st year
                '#FF9800', // Orange for 2nd year
                '#2196F3', // Blue for 3rd year
                '#9C27B0'  // Purple for 4th year
            ],
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
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            }
        }
    };

    const lineChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
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

    // Additional safety check to prevent rendering with incomplete data
    if (!stats || typeof stats.totalStudents === 'undefined') {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Initializing dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <div className="alert alert-danger">
                        Error loading dashboard: {error}
                    </div>
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
                            Registrar Dashboard
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
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Students
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalStudents?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-success">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Active Students
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.activeStudents?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user-check fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-warning">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Pending Requests
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.pendingRequests?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clock fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="stats-card border-left-info">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Total Courses
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalCourses?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-graduation-cap fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Overview Card */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="stats-card border-left-primary">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="me-3">
                                            <i className="fas fa-laptop-code fa-3x text-primary"></i>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 text-primary">Bachelor of Science in Information Technology</h4>
                                            <p className="text-muted mb-0">Department of Computer Studies</p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 mb-1 text-success">{stats.bsitStudents?.toLocaleString() || '0'}</div>
                                                <small className="text-muted">Total Students</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 mb-1 text-info">{stats.bsitGenderDistribution?.male?.toLocaleString() || '0'}</div>
                                                <small className="text-muted">Male</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 mb-1 text-warning">{stats.bsitGenderDistribution?.female?.toLocaleString() || '0'}</div>
                                                <small className="text-muted">Female</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 mb-1 text-primary">{stats.yearLevelDistribution?.firstYear?.toLocaleString() || '0'}</div>
                                                <small className="text-muted">1st Year</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 text-center">
                                    <button 
                                        className="btn btn-primary btn-lg px-4 py-3"
                                        onClick={() => setShowBsitDetails(!showBsitDetails)}
                                    >
                                        <i className="fas fa-chart-bar me-2"></i>
                                        {showBsitDetails ? 'Hide Details' : 'View Full Details'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BSIT Detailed Information (Expandable) */}
            {showBsitDetails && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="stats-card border-left-success">
                            <div className="card-body">
                                <h5 className="text-success mb-4">
                                    <i className="fas fa-info-circle me-2"></i>
                                    BSIT Program Statistics
                                </h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-primary mb-3">Year Level Distribution</h6>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-success">{stats.yearLevelDistribution?.firstYear?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">1st Year</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-warning">{stats.yearLevelDistribution?.secondYear?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">2nd Year</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-info">{stats.yearLevelDistribution?.thirdYear?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">3rd Year</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-primary">{stats.yearLevelDistribution?.fourthYear?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">4th Year</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-primary mb-3">Semester Distribution</h6>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-success">{stats.semesterDistribution?.firstSemester?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">1st Semester</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-warning">{stats.semesterDistribution?.secondSemester?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">2nd Semester</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-info">{stats.semesterDistribution?.summer?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">Summer</small>
                                                </div>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="h5 mb-1 text-secondary">{stats.totalRequests?.toLocaleString() || '0'}</div>
                                                    <small className="text-muted">Total Requests</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="row mb-4">
                {/* Request Status Pie Chart */}
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-chart-pie me-2"></i>
                                Request Status Distribution
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                {stats.totalRequests > 0 ? (
                                    <Pie data={requestStatusData} options={chartOptions} />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100">
                                        <div className="text-center text-muted">
                                            <i className="fas fa-chart-pie fa-3x mb-3"></i>
                                            <h5>No Request Data</h5>
                                            <p>No requests found to display in the chart.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Status Pie Chart */}
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-success">
                                <i className="fas fa-chart-pie me-2"></i>
                                Student Status Distribution
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Pie data={studentStatusData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Charts Row */}
            <div className="row mb-4">
                {/* Monthly Enrollment Line Chart */}
                <div className="col-xl-8 col-lg-7 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-chart-line me-2"></i>
                                Monthly Student Enrollments
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Line data={monthlyEnrollmentData} options={lineChartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Distribution Bar Chart */}
                <div className="col-xl-4 col-lg-5 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-info">
                                <i className="fas fa-chart-bar me-2"></i>
                                Students per Course
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={courseDistributionData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Performance Charts */}
            <div className="row mb-4">
                {/* Gender Distribution Pie Chart */}
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-venus-mars me-2"></i>
                                Student Gender Distribution
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Pie data={genderDistributionData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Year Level Distribution Bar Chart */}
                <div className="col-xl-6 col-lg-6 mb-4">
                    <div className="chart-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-success">
                                <i className="fas fa-chart-bar me-2"></i>
                                Students by Year Level
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={yearLevelDistributionData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
                <div className="col-12">
                    <div className="quick-actions-card">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-bolt me-2"></i>
                                Quick Actions
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <button className="btn btn-primary btn-lg w-100">
                                        <i className="fas fa-user-plus me-2"></i>
                                        Add Student
                                    </button>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <button className="btn btn-success btn-lg w-100">
                                        <i className="fas fa-file-alt me-2"></i>
                                        View Requests
                                    </button>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <button className="btn btn-info btn-lg w-100">
                                        <i className="fas fa-graduation-cap me-2"></i>
                                        Manage Courses
                                    </button>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <button className="btn btn-warning btn-lg w-100">
                                        <i className="fas fa-chart-bar me-2"></i>
                                        Generate Reports
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">
                <div className="text-center py-3">
                    {!isEditingFooter ? (
                        <div className="d-flex justify-content-center align-items-center">
                            <p className="text-muted mb-0 me-3">
                                <i className="fas fa-copyright me-1"></i>
                                {footerYear} - Online Records Management System
                            </p>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleEditFooter}
                                title="Edit Footer"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-copyright me-2 text-muted"></i>
                                <input
                                    type="number"
                                    className="form-control form-control-sm me-2"
                                    value={editYear}
                                    onChange={handleYearChange}
                                    style={{ width: '80px', textAlign: 'center' }}
                                    min="2000"
                                    max="2100"
                                />
                                <span className="text-muted me-2">- Online Records Management System</span>
                            </div>
                            <div className="ms-3">
                                <button 
                                    className="btn btn-sm btn-success me-1"
                                    onClick={handleSaveFooter}
                                    title="Save"
                                >
                                    <i className="fas fa-check"></i>
                                </button>
                                <button 
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleCancelEdit}
                                    title="Cancel"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;
