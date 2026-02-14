import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './BsitProspectusModal.css';

function BsitProspectusModal({ isOpen, onClose, studentName }) {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCurriculum();
    }
  }, [isOpen]);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bsit-curriculum`, {
        headers: {
          'X-Session-Token': sessionManager.getSessionToken()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurriculum(data);
      } else {
        setError('Failed to fetch curriculum data');
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      setError('Error fetching curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const groupCurriculumByYear = () => {
    const grouped = {};
    curriculum.forEach(course => {
      const year = course.yearLevel;
      const sem = course.semester;
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][sem]) {
        grouped[year][sem] = [];
      }
      
      grouped[year][sem].push(course);
    });
    return grouped;
  };

  const getYearLevelDisplay = (year) => {
    const yearMap = {
      '1st': 'First Year',
      '2nd': 'Second Year',
      '3rd': 'Third Year',
      '4th': 'Fourth Year'
    };
    return yearMap[year] || year;
  };

  const getSemesterDisplay = (sem) => {
    const semMap = {
      '1st': 'First Semester',
      '2nd': 'Second Semester',
      'summer': 'Summer Term'
    };
    return semMap[sem] || sem;
  };

  const calculateTotalUnits = (courses) => {
    return courses.reduce((sum, course) => sum + course.units, 0);
  };

  if (!isOpen) return null;

  const groupedCurriculum = groupCurriculumByYear();

  return (
    <div className="prospectus-modal-overlay">
      <div className="prospectus-modal">
        <div className="prospectus-modal-header">
          <div className="prospectus-title">
            <h2>Bachelor of Science in Information Technology</h2>
            <h3>Curriculum Prospectus</h3>
            {studentName && <p className="student-name">Student: {studentName}</p>}
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="prospectus-modal-body">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading curriculum data...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle text-danger"></i>
              <p>{error}</p>
            </div>
          ) : (
            <div className="curriculum-content">
              {/* Program Overview */}
              <div className="program-overview">
                <h4>Program Overview</h4>
                <div className="overview-grid">
                  <div className="overview-item">
                    <strong>Program:</strong> Bachelor of Science in Information Technology
                  </div>
                  <div className="overview-item">
                    <strong>Duration:</strong> 4 Years (8 Semesters)
                  </div>
                  <div className="overview-item">
                    <strong>Total Units:</strong> {curriculum.reduce((sum, course) => sum + course.units, 0)} Units
                  </div>
                  <div className="overview-item">
                    <strong>Degree:</strong> Bachelor's Degree
                  </div>
                </div>
              </div>

              {/* Curriculum by Year Level */}
              {Object.keys(groupedCurriculum).sort().map(yearLevel => (
                <div key={yearLevel} className="year-level-section">
                  <h4 className="year-level-title">
                    {getYearLevelDisplay(yearLevel)}
                  </h4>
                  
                  {Object.keys(groupedCurriculum[yearLevel]).sort().map(semester => {
                    const courses = groupedCurriculum[yearLevel][semester];
                    const totalUnits = calculateTotalUnits(courses);
                    
                    return (
                      <div key={semester} className="semester-section">
                        <h5 className="semester-title">
                          {getSemesterDisplay(semester)} ({totalUnits} Units)
                        </h5>
                        
                        <div className="courses-table">
                          <table className="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Units</th>
                                <th>Type</th>
                                <th>Prerequisites</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courses.map(course => (
                                <tr key={course.id}>
                                  <td className="course-code">{course.courseCode}</td>
                                  <td className="course-title">{course.courseDescription}</td>
                                  <td className="course-units">{course.units}</td>
                                  <td className="course-type">
                                    <span className={`badge ${getTypeBadgeClass(course.courseType)}`}>
                                      {course.courseType}
                                    </span>
                                  </td>
                                  <td className="course-prerequisites">
                                    {course.prerequisites || 'None'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="table-info">
                                <td colSpan="2"><strong>Total Units</strong></td>
                                <td><strong>{totalUnits}</strong></td>
                                <td colSpan="2"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Program Outcomes */}
              <div className="program-outcomes">
                <h4>Program Learning Outcomes</h4>
                <div className="outcomes-grid">
                  <div className="outcome-item">
                    <i className="fas fa-code text-primary"></i>
                    <h6>Technical Skills</h6>
                    <p>Develop and implement software solutions using modern programming languages and technologies</p>
                  </div>
                  <div className="outcome-item">
                    <i className="fas fa-database text-success"></i>
                    <h6>Database Management</h6>
                    <p>Design and manage database systems for efficient data storage and retrieval</p>
                  </div>
                  <div className="outcome-item">
                    <i className="fas fa-network-wired text-info"></i>
                    <h6>Network Registrar</h6>
                    <p>Configure and maintain computer networks and infrastructure</p>
                  </div>
                  <div className="outcome-item">
                    <i className="fas fa-shield-alt text-warning"></i>
                    <h6>Cybersecurity</h6>
                    <p>Implement security measures to protect information systems and data</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="prospectus-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getTypeBadgeClass(type) {
  switch (type) {
    case 'Lecture':
      return 'bg-primary';
    case 'Laboratory':
      return 'bg-success';
    case 'Both':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
}

export default BsitProspectusModal;
