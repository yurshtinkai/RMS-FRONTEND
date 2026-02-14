import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function EditStudentDetailView({ onStudentUpdated }) {
    const { idNo } = useParams();
    const navigate = useNavigate();
    
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]); // State for the course dropdown
    const [semesters, setSemesters] = useState([]); // State for the semester dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch the list of available courses for the dropdown
                const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
                    headers: { 'X-Session-Token': sessionManager.getSessionToken() }
                });
                if (coursesResponse.ok) {
                    setCourses(await coursesResponse.json());
                } else {
                    console.error("Failed to fetch courses.");
                }

                // Fetch the list of available semesters for the dropdown
                const semestersResponse = await fetch(`${API_BASE_URL}/semesters`, {
                    headers: { 'X-Session-Token': getSessionToken() }
                });
                if (semestersResponse.ok) {
                    const semestersData = await semestersResponse.json();
                    setSemesters(semestersData);
                } else {
                    console.error("Failed to fetch semesters.");
                    // Fallback to hardcoded semesters if API fails
                    setSemesters([
                        { id: 1, name: 'First Semester', code: '1ST' },
                        { id: 2, name: 'Second Semester', code: '2ND' },
                        { id: 3, name: 'Summer', code: 'SUM' }
                    ]);
                }

                // First, get the user ID from the student's ID number
                const userResponse = await fetch(`${API_BASE_URL}/students/search/${idNo}`, {
                    headers: { 'X-Session-Token': sessionManager.getSessionToken() }
                });
                
                if (!userResponse.ok) {
                    throw new Error('Could not find user with this ID number.');
                }
                
                const userData = await userResponse.json();
                const userId = userData.id;

                // Now fetch the student registration data using the user ID
                const registrationResponse = await fetch(`${API_BASE_URL}/students/registration/${userId}`, {
                    headers: { 'X-Session-Token': sessionManager.getSessionToken() }
                });

                if (!registrationResponse.ok) {
                    throw new Error('This student is not registered. Please complete the student registration process first before editing student details.');
                }

                const registrationData = await registrationResponse.json();
                
                // Combine user data with registration data
                // Ensure user ID is preserved and not overwritten by registration data
                const combinedData = {
                    ...registrationData,
                    ...userData,  // userData should override registrationData to preserve user.id
                    userId: userId  // Explicitly set userId to ensure it's available
                };
                
                console.log('🔍 Combined data:', {
                    userId: userId,
                    userDataId: userData.id,
                    registrationDataId: registrationData.id,
                    finalId: combinedData.id
                });
                
                setStudent(combinedData);

            } catch (err) {
                console.error('Error fetching student data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [idNo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔍 Submitting with student data:', {
                id: student.id,
                userId: student.userId,
                idNumber: student.idNumber,
                firstName: student.firstName,
                lastName: student.lastName
            });
            
            // Use the student registration update endpoint
            const response = await fetch(`${API_BASE_URL}/students/registration/${student.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionManager.getSessionToken()
                },
                body: JSON.stringify(student)
            });

            if (response.ok) {
                setShowSuccessModal(true);
                // Don't navigate immediately, let user close modal first
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update student.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        // Notify parent (App) with the latest edited data so lists can update immediately
        if (onStudentUpdated) {
            onStudentUpdated(student);
        }
        // Go back to list; user can re-enter detail if needed
        navigate(`/registrar/students/${idNo}`);
    };

    if (loading) return <div className="text-center p-5">Loading student data...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!student) return <div className="alert alert-warning m-4">Student data could not be loaded.</div>;

    return (
        <div className="container-fluid py-4">
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">
                        <i className="fas fa-edit text-primary me-2"></i>
                        Edit Student: {student.lastName}, {student.firstName}
                    </h2>
                    <div>
                        <Link to={`/registrar/all-students`} className="btn btn-outline-secondary me-2">
                            Cancel
                        </Link>
                         <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                                                  {/* --- Personal Information Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-info text-white">
                         <h5 className="mb-0"><i className="fas fa-user me-2"></i>Personal Information</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                                                           <div className="col-md-4 mb-3">
                                  <label className="form-label">First Name *</label>
                                  <input type="text" className="form-control" name="firstName" value={student.firstName || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Middle Name</label>
                                  <input type="text" className="form-control" name="middleName" value={student.middleName || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Last Name *</label>
                                  <input type="text" className="form-control" name="lastName" value={student.lastName || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Student ID Number *</label>
                                  <input type="text" className="form-control" name="idNumber" value={student.idNumber || ''} onChange={handleInputChange} readOnly />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Gender *</label>
                                  <select className="form-select" name="gender" value={student.gender || ''} onChange={handleInputChange}>
                                      <option value="">Select Gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Marital Status</label>
                                  <select className="form-select" name="maritalStatus" value={student.maritalStatus || ''} onChange={handleInputChange}>
                                      <option value="">Select Status</option>
                                      <option value="Single">Single</option>
                                      <option value="Married">Married</option>
                                      <option value="Widowed">Widowed</option>
                                      <option value="Divorced">Divorced</option>
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Date of Birth *</label>
                                  <input type="date" className="form-control" name="dateOfBirth" value={student.dateOfBirth ? student.dateOfBirth.split('T')[0] : ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Place of Birth</label>
                                  <input type="text" className="form-control" name="placeOfBirth" value={student.placeOfBirth || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Religion</label>
                                  <input type="text" className="form-control" name="religion" value={student.religion || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Citizenship *</label>
                                  <input type="text" className="form-control" name="citizenship" value={student.citizenship || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Email *</label>
                                  <input type="email" className="form-control" name="email" value={student.email || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Contact Number *</label>
                                  <input type="text" className="form-control" name="contactNumber" value={student.contactNumber || ''} onChange={handleInputChange} />
                              </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">City Address</label>
                                 <input type="text" className="form-control" name="cityAddress" value={student.cityAddress || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Provincial Address</label>
                                 <input type="text" className="form-control" name="provincialAddress" value={student.provincialAddress || ''} onChange={handleInputChange} />
                             </div>
                         </div>
                     </div>
                 </div>
                
                                 {/* --- Family Background Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-warning text-dark">
                         <h5 className="mb-0"><i className="fas fa-users me-2"></i>Family Background</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                             <div className="col-md-4">
                                 <h6 className="text-primary">Father's Information</h6><hr/>
                                 <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="fatherName" value={student.fatherName || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="fatherOccupation" value={student.fatherOccupation || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Company</label><input type="text" className="form-control" name="fatherCompany" value={student.fatherCompany || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Contact Number</label><input type="text" className="form-control" name="fatherContactNumber" value={student.fatherContactNumber || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Address</label><input type="text" className="form-control" name="fatherAddress" value={student.fatherAddress || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Monthly Income</label><input type="text" className="form-control" name="fatherIncome" value={student.fatherIncome || ''} onChange={handleInputChange}/></div>
                             </div>
                             <div className="col-md-4">
                                 <h6 className="text-success">Mother's Information</h6><hr/>
                                 <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="motherName" value={student.motherName || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="motherOccupation" value={student.motherOccupation || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Company</label><input type="text" className="form-control" name="motherCompany" value={student.motherCompany || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Contact Number</label><input type="text" className="form-control" name="motherContactNumber" value={student.motherContactNumber || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Address</label><input type="text" className="form-control" name="motherAddress" value={student.motherAddress || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Monthly Income</label><input type="text" className="form-control" name="motherIncome" value={student.motherIncome || ''} onChange={handleInputChange}/></div>
                             </div>
                             <div className="col-md-4">
                                 <h6 className="text-info">Guardian's Information</h6><hr/>
                                 <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="guardianName" value={student.guardianName || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="guardianOccupation" value={student.guardianOccupation || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Company</label><input type="text" className="form-control" name="guardianCompany" value={student.guardianCompany || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Contact Number</label><input type="text" className="form-control" name="guardianContactNumber" value={student.guardianContactNumber || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Address</label><input type="text" className="form-control" name="guardianAddress" value={student.guardianAddress || ''} onChange={handleInputChange}/></div>
                                 <div className="mb-3"><label className="form-label">Monthly Income</label><input type="text" className="form-control" name="guardianIncome" value={student.guardianIncome || ''} onChange={handleInputChange}/></div>
                             </div>
                         </div>
                     </div>
                 </div>

                                 {/* --- Academic Background Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-success text-white">
                         <h5 className="mb-0"><i className="fas fa-graduation-cap me-2"></i>Academic Background</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                                                           <div className="col-md-4 mb-3">
                                  <label className="form-label">Course *</label>
                                  <select className="form-select" name="course" value={student.course || ''} onChange={handleInputChange}>
                                      <option value="">Select Course</option>
                                      {courses.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Major *</label>
                                  <input type="text" className="form-control" name="major" value={student.major || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Student Type *</label>
                                  <select className="form-select" name="studentType" value={student.studentType || ''} onChange={handleInputChange}>
                                      <option value="">Select Type</option>
                                      <option value="First">First</option>
                                      <option value="Second">Second</option>
                                      <option value="Summer">Summer</option>
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Semester/Entry *</label>
                                  <select className="form-select" name="semester" value={student.semester || ''} onChange={handleInputChange}>
                                      <option value="">Select Semester</option>
                                      {semesters.map(semester => (
                                          <option key={semester.id} value={semester.name}>
                                              {semester.name}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Year of Entry *</label>
                                  <input type="number" className="form-control" name="yearOfEntry" value={student.yearOfEntry || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Estimated Year of Graduation</label>
                                  <input type="text" className="form-control" name="estimatedYearOfGraduation" value={student.estimatedYearOfGraduation || ''} onChange={handleInputChange} />
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Type of Application *</label>
                                  <select className="form-select" name="applicationType" value={student.applicationType || ''} onChange={handleInputChange}>
                                      <option value="">Select Application Type</option>
                                      <option value="Freshmen">Freshmen</option>
                                      <option value="Transferee">Transferee</option>
                                      <option value="Cross Enrollee">Cross Enrollee</option>
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">Current Year Level *</label>
                                  <select className="form-select" name="yearLevel" value={student.yearLevel || ''} onChange={handleInputChange}>
                                      <option value="">Select Year Level</option>
                                      <option value="1st Year">1st Year</option>
                                      <option value="2nd Year">2nd Year</option>
                                      <option value="3rd Year">3rd Year</option>
                                      <option value="4th Year">4th Year</option>
                                  </select>
                              </div>
                              <div className="col-md-4 mb-3">
                                  <label className="form-label">School Year *</label>
                                  <input type="text" className="form-control" name="schoolYear" value={student.schoolYear || ''} onChange={handleInputChange} />
                              </div>
                             <div className="col-md-4 mb-3">
                                 <label className="form-label">Academic Status</label>
                                 <input type="text" className="form-control" name="academicStatus" value={student.academicStatus || ''} onChange={handleInputChange} />
                             </div>
                         </div>
                     </div>
                 </div>

                                 {/* --- Academic History Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-secondary text-white">
                         <h5 className="mb-0"><i className="fas fa-history me-2"></i>Academic History</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                             <div className="col-md-4">
                                 <h6 className="text-primary">Elementary</h6><hr/>
                                 <div className="mb-3">
                                     <label className="form-label">School</label>
                                     <input type="text" className="form-control" name="elementarySchool" value={student.elementarySchool || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">School Address</label>
                                     <input type="text" className="form-control" name="elementarySchoolAddress" value={student.elementarySchoolAddress || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Honor Received</label>
                                     <input type="text" className="form-control" name="elementaryHonor" value={student.elementaryHonor || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Year Graduated</label>
                                     <input type="number" className="form-control" name="elementaryYearGraduated" value={student.elementaryYearGraduated || ''} onChange={handleInputChange}/>
                                 </div>
                             </div>
                             <div className="col-md-4">
                                 <h6 className="text-success">Junior High School</h6><hr/>
                                 <div className="mb-3">
                                     <label className="form-label">School</label>
                                     <input type="text" className="form-control" name="juniorHighSchool" value={student.juniorHighSchool || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">School Address</label>
                                     <input type="text" className="form-control" name="juniorHighSchoolAddress" value={student.juniorHighSchoolAddress || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Honor Received</label>
                                     <input type="text" className="form-control" name="juniorHighHonor" value={student.juniorHighHonor || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Year Graduated</label>
                                     <input type="number" className="form-control" name="juniorHighYearGraduated" value={student.juniorHighYearGraduated || ''} onChange={handleInputChange}/>
                                 </div>
                             </div>
                             <div className="col-md-4">
                                 <h6 className="text-info">Senior High School</h6><hr/>
                                 <div className="mb-3">
                                     <label className="form-label">School</label>
                                     <input type="text" className="form-control" name="seniorHighSchool" value={student.seniorHighSchool || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">School Address</label>
                                     <input type="text" className="form-control" name="seniorHighSchoolAddress" value={student.seniorHighSchoolAddress || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Strand</label>
                                     <input type="text" className="form-control" name="seniorHighStrand" value={student.seniorHighStrand || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Honor Received</label>
                                     <input type="text" className="form-control" name="seniorHighHonor" value={student.seniorHighHonor || ''} onChange={handleInputChange}/>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Year Graduated</label>
                                     <input type="number" className="form-control" name="seniorHighYearGraduated" value={student.seniorHighYearGraduated || ''} onChange={handleInputChange}/>
                                 </div>
                             </div>
                         </div>
                         
                         {/* College/University Information */}
                         <div className="row mt-4">
                             <div className="col-12">
                                 <h6 className="text-warning">College/University Information (if applicable)</h6><hr/>
                                 <div className="row">
                                     <div className="col-md-6 mb-3">
                                         <label className="form-label">Last College School Attended</label>
                                         <input type="text" className="form-control" name="lastCollegeSchool" value={student.lastCollegeSchool || ''} onChange={handleInputChange}/>
                                     </div>
                                     <div className="col-md-6 mb-3">
                                         <label className="form-label">School Address</label>
                                         <input type="text" className="form-control" name="lastCollegeSchoolAddress" value={student.lastCollegeSchoolAddress || ''} onChange={handleInputChange}/>
                                     </div>
                                     <div className="col-md-4 mb-3">
                                         <label className="form-label">Course</label>
                                         <input type="text" className="form-control" name="lastCollegeCourse" value={student.lastCollegeCourse || ''} onChange={handleInputChange}/>
                                     </div>
                                     <div className="col-md-4 mb-3">
                                         <label className="form-label">Major</label>
                                         <input type="text" className="form-control" name="lastCollegeMajor" value={student.lastCollegeMajor || ''} onChange={handleInputChange}/>
                                     </div>
                                     <div className="col-md-4 mb-3">
                                         <label className="form-label">Year Taken</label>
                                         <input type="number" className="form-control" name="lastCollegeYearTaken" value={student.lastCollegeYearTaken || ''} onChange={handleInputChange}/>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                                  </div>

                 {/* --- Additional Information Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-dark text-white">
                         <h5 className="mb-0"><i className="fas fa-info-circle me-2"></i>Additional Information</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                                                           <div className="col-md-4 mb-3">
                                  <label className="form-label">Nationality *</label>
                                  <input type="text" className="form-control" name="nationality" value={student.nationality || ''} onChange={handleInputChange} />
                              </div>
                             <div className="col-md-4 mb-3">
                                 <label className="form-label">Country</label>
                                 <input type="text" className="form-control" name="country" value={student.country || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-4 mb-3">
                                 <label className="form-label">ACR (for foreign students)</label>
                                 <input type="text" className="form-control" name="acrNumber" value={student.acrNumber || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">City Telephone Number</label>
                                 <input type="text" className="form-control" name="cityTelephoneNumber" value={student.cityTelephoneNumber || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Provincial Telephone Number</label>
                                 <input type="text" className="form-control" name="provincialTelephoneNumber" value={student.provincialTelephoneNumber || ''} onChange={handleInputChange} />
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* --- Emergency Contact Section --- */}
                 <div className="card shadow-sm mb-4">
                     <div className="card-header bg-danger text-white">
                         <h5 className="mb-0"><i className="fas fa-phone-alt me-2"></i>Emergency Contact</h5>
                     </div>
                     <div className="card-body">
                         <div className="row">
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Emergency Contact Name</label>
                                 <input type="text" className="form-control" name="emergencyContactName" value={student.emergencyContactName || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Emergency Contact Relationship</label>
                                 <input type="text" className="form-control" name="emergencyContactRelationship" value={student.emergencyContactRelationship || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Emergency Contact Number</label>
                                 <input type="text" className="form-control" name="emergencyContactNumber" value={student.emergencyContactNumber || ''} onChange={handleInputChange} />
                             </div>
                             <div className="col-md-6 mb-3">
                                 <label className="form-label">Emergency Contact Address</label>
                                 <input type="text" className="form-control" name="emergencyContactAddress" value={student.emergencyContactAddress || ''} onChange={handleInputChange} />
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="text-end">
                     <button type="submit" className="btn btn-primary" disabled={loading}>
                         {loading ? 'Saving...' : 'Save Changes'}
                     </button>
                 </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-success text-white border-0">
                                <h5 className="modal-title">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Success!
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={handleSuccessModalClose}
                                ></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <div className="mb-3">
                                    <i className="fas fa-user-check text-success" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h4 className="text-success mb-3">Student Details Updated Successfully!</h4>
                                <p className="text-muted mb-0">
                                    The student information for <strong>{student?.firstName} {student?.lastName}</strong> 
                                    has been successfully updated in the system.
                                </p>
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                <button 
                                    type="button" 
                                    className="btn btn-success px-4" 
                                    onClick={handleSuccessModalClose}
                                >
                                    <i className="fas fa-check me-2"></i>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditStudentDetailView;