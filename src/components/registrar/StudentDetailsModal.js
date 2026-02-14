import React from 'react';
import './StudentDetailsModal.css';

function StudentDetailsModal({ student, onClose }) {
    if (!student) return null;

    return (
        <div className="student-details-modal-overlay" onClick={onClose}>
            <div className="student-details-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>STUDENT PERMANENT RECORDS (SPR)</h2>
                    <h3>BENEDICTO COLLEGE</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="student-info-section">
                        <h4>Student Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Student Number:</label>
                                <span>{student.studentNumber}</span>
                            </div>
                            <div className="info-item">
                                <label>Full Name:</label>
                                <span>{student.fullName}</span>
                            </div>
                            <div className="info-item">
                                <label>Gender:</label>
                                <span>{student.gender}</span>
                            </div>
                            <div className="info-item">
                                <label>Marital Status:</label>
                                <span>{student.maritalStatus}</span>
                            </div>
                            <div className="info-item">
                                <label>Date of Birth:</label>
                                <span>{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                                <label>Place of Birth:</label>
                                <span>{student.placeOfBirth}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{student.email}</span>
                            </div>
                            <div className="info-item">
                                <label>Contact Number:</label>
                                <span>{student.contactNumber}</span>
                            </div>
                            <div className="info-item">
                                <label>Religion:</label>
                                <span>{student.religion}</span>
                            </div>
                            <div className="info-item">
                                <label>Citizenship:</label>
                                <span>{student.citizenship}</span>
                            </div>
                            <div className="info-item">
                                <label>Country:</label>
                                <span>{student.country}</span>
                            </div>
                            {student.acrNumber && (
                                <div className="info-item">
                                    <label>ACR Number:</label>
                                    <span>{student.acrNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="address-section">
                        <h4>Address Information</h4>
                        <div className="info-grid">
                            <div className="info-item full-width">
                                <label>City Address:</label>
                                <span>{student.cityAddress}</span>
                            </div>
                            {student.cityTelNumber && (
                                <div className="info-item">
                                    <label>City Tel Number:</label>
                                    <span>{student.cityTelNumber}</span>
                                </div>
                            )}
                            <div className="info-item full-width">
                                <label>Provincial Address:</label>
                                <span>{student.provincialAddress}</span>
                            </div>
                            {student.provincialTelNumber && (
                                <div className="info-item">
                                    <label>Provincial Tel Number:</label>
                                    <span>{student.provincialTelNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="family-section">
                        <h4>Family Background</h4>
                        
                        <div className="family-member">
                            <h5>Father's Information</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Name:</label>
                                    <span>{student.fatherName}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.fatherAddress}</span>
                                </div>
                                <div className="info-item">
                                    <label>Occupation:</label>
                                    <span>{student.fatherOccupation}</span>
                                </div>
                                {student.fatherCompany && (
                                    <div className="info-item">
                                        <label>Company:</label>
                                        <span>{student.fatherCompany}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Contact Number:</label>
                                    <span>{student.fatherContactNumber}</span>
                                </div>
                                {student.fatherIncome && (
                                    <div className="info-item">
                                        <label>Income:</label>
                                        <span>{student.fatherIncome}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="family-member">
                            <h5>Mother's Information</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Name:</label>
                                    <span>{student.motherName}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.motherAddress}</span>
                                </div>
                                <div className="info-item">
                                    <label>Occupation:</label>
                                    <span>{student.motherOccupation}</span>
                                </div>
                                {student.motherCompany && (
                                    <div className="info-item">
                                        <label>Company:</label>
                                        <span>{student.motherCompany}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Contact Number:</label>
                                    <span>{student.motherContactNumber}</span>
                                </div>
                                {student.motherIncome && (
                                    <div className="info-item">
                                        <label>Income:</label>
                                        <span>{student.motherIncome}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="family-member">
                            <h5>Guardian's Information</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Name:</label>
                                    <span>{student.guardianName}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.guardianAddress}</span>
                                </div>
                                <div className="info-item">
                                    <label>Occupation:</label>
                                    <span>{student.guardianOccupation}</span>
                                </div>
                                {student.guardianCompany && (
                                    <div className="info-item">
                                        <label>Company:</label>
                                        <span>{student.guardianCompany}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Contact Number:</label>
                                    <span>{student.guardianContactNumber}</span>
                                </div>
                                {student.guardianIncome && (
                                    <div className="info-item">
                                        <label>Income:</label>
                                        <span>{student.guardianIncome}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="academic-section">
                        <h4>Current Academic Background</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Course:</label>
                                <span>{student.course?.name || 'Not specified'}</span>
                            </div>
                            {student.major && (
                                <div className="info-item">
                                    <label>Major:</label>
                                    <span>{student.major}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <label>Student Type:</label>
                                <span>{student.studentType}</span>
                            </div>
                            <div className="info-item">
                                <label>Semester Entry:</label>
                                <span>{student.semesterEntry}</span>
                            </div>
                            <div className="info-item">
                                <label>Year of Entry:</label>
                                <span>{student.yearOfEntry}</span>
                            </div>
                            {student.estimatedYearOfGraduation && (
                                <div className="info-item">
                                    <label>Estimated Year of Graduation:</label>
                                    <span>{student.estimatedYearOfGraduation}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <label>Application Type:</label>
                                <span>{student.applicationType}</span>
                            </div>
                            <div className="info-item">
                                <label>Academic Status:</label>
                                <span className={`status-${student.academicStatus.toLowerCase()}`}>
                                    {student.academicStatus}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Current Year Level:</label>
                                <span>{student.currentYearLevel}</span>
                            </div>
                            <div className="info-item">
                                <label>Current Semester:</label>
                                <span>{student.currentSemester}</span>
                            </div>
                            <div className="info-item">
                                <label>Total Units Earned:</label>
                                <span>{student.totalUnitsEarned}</span>
                            </div>
                            <div className="info-item">
                                <label>Cumulative GPA:</label>
                                <span>{student.cumulativeGPA}</span>
                            </div>
                        </div>
                    </div>

                    <div className="academic-history-section">
                        <h4>Academic History</h4>
                        
                        <div className="education-level">
                            <h5>Elementary</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>School:</label>
                                    <span>{student.elementarySchool}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.elementaryAddress}</span>
                                </div>
                                {student.elementaryHonor && (
                                    <div className="info-item">
                                        <label>Honor Received:</label>
                                        <span>{student.elementaryHonor}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Year Graduated:</label>
                                    <span>{student.elementaryYearGraduated}</span>
                                </div>
                            </div>
                        </div>

                        <div className="education-level">
                            <h5>Junior High School (JHS)</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>School:</label>
                                    <span>{student.juniorHighSchool}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.juniorHighAddress}</span>
                                </div>
                                {student.juniorHighHonor && (
                                    <div className="info-item">
                                        <label>Honor Received:</label>
                                        <span>{student.juniorHighHonor}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Year Graduated:</label>
                                    <span>{student.juniorHighYearGraduated}</span>
                                </div>
                            </div>
                        </div>

                        <div className="education-level">
                            <h5>Senior High School (SHS)</h5>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>School:</label>
                                    <span>{student.seniorHighSchool}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address:</label>
                                    <span>{student.seniorHighAddress}</span>
                                </div>
                                {student.seniorHighStrand && (
                                    <div className="info-item">
                                        <label>Strand:</label>
                                        <span>{student.seniorHighStrand}</span>
                                    </div>
                                )}
                                {student.seniorHighHonor && (
                                    <div className="info-item">
                                        <label>Honor Received:</label>
                                        <span>{student.seniorHighHonor}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Year Graduated:</label>
                                    <span>{student.seniorHighYearGraduated}</span>
                                </div>
                            </div>
                        </div>

                        {(student.ncaeGrade || student.specialization || student.lastCollegeAttended) && (
                            <div className="additional-academic">
                                <h5>Additional Academic Information</h5>
                                <div className="info-grid">
                                    {student.ncaeGrade && (
                                        <div className="info-item">
                                            <label>NCAE Grade:</label>
                                            <span>{student.ncaeGrade}</span>
                                        </div>
                                    )}
                                    {student.specialization && (
                                        <div className="info-item">
                                            <label>Specialization:</label>
                                            <span>{student.specialization}</span>
                                        </div>
                                    )}
                                    {student.lastCollegeAttended && (
                                        <div className="info-item">
                                            <label>Last College Attended:</label>
                                            <span>{student.lastCollegeAttended}</span>
                                        </div>
                                    )}
                                    {student.lastCollegeYearTaken && (
                                        <div className="info-item">
                                            <label>Year Taken:</label>
                                            <span>{student.lastCollegeYearTaken}</span>
                                        </div>
                                    )}
                                    {student.lastCollegeCourse && (
                                        <div className="info-item">
                                            <label>Course:</label>
                                            <span>{student.lastCollegeCourse}</span>
                                        </div>
                                    )}
                                    {student.lastCollegeMajor && (
                                        <div className="info-item">
                                            <label>Major:</label>
                                            <span>{student.lastCollegeMajor}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        Print Record
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentDetailsModal; 