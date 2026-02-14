import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDummyCurriculum } from '../../data/dummyData';
import BsitProspectusModal from './BsitProspectusModal';
import './StudentDetailView.css';
import NewRequestModal from './NewRequestModal';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import { getStudentAvatar } from '../../utils/avatarUtils';
import GradeSlipContent from './GradeSlipContent'; // Make sure this file exists and is exported
import CustomAlert from '../../CustomAlert';
import ActivityLogs from './ActivityLogs';

function StudentDetailView({ enrolledStudents }) {
  const { idNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [studentRegistration, setStudentRegistration] = useState(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);
  const [studentProfilePic, setStudentProfilePic] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const [requestToPrint, setRequestToPrint] = useState(null);
  const componentRef = useRef();

  const [balance, setBalance] = useState(0);
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelWarning, setCancelWarning] = useState('');
  
  // Requirements state
  const [requirements, setRequirements] = useState({
    psa: false,
    validId: false,
    form137: false,
    idPicture: false
  });
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementSuccessMessage, setAnnouncementSuccessMessage] = useState('');
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [subjectDetailsModalOpen, setSubjectDetailsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledSubjectsExpanded, setEnrolledSubjectsExpanded] = useState(false);
  
  // Login history state
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);
  const [loginHistoryError, setLoginHistoryError] = useState('');

  // Fetch student login history
  const fetchLoginHistory = async (studentId) => {
    try {
      setLoadingLoginHistory(true);
      setLoginHistoryError('');
      
      const sessionToken = getSessionToken();
      if (!sessionToken) {
        setLoginHistoryError('No session token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/sessions/student/${studentId}/history?limit=20`, {
        headers: {
          'X-Session-Token': sessionToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoginHistory(data.history || []);
      } else {
        const errorData = await response.json();
        setLoginHistoryError(errorData.message || 'Failed to fetch login history');
      }
    } catch (err) {
      console.error('Error fetching login history:', err);
      setLoginHistoryError('Network error. Please check your connection and try again.');
    } finally {
      setLoadingLoginHistory(false);
    }
  };

  // Fetch requirements status
  const fetchRequirementsStatus = async (studentId) => {
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) {
        console.error('No session token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/requirements/status/${studentId}`, {
        headers: {
          'X-Session-Token': sessionToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequirements(data.requirements || {
          psa: false,
          validId: false,
          form137: false,
          idPicture: false
        });
      } else {
        console.error('Failed to fetch requirements status');
      }
    } catch (err) {
      console.error('Error fetching requirements status:', err);
    }
  };

  // Fetch student details from backend
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to find student in enrolledStudents prop
        let enrolledStudent = null;
        if (enrolledStudents && enrolledStudents.length > 0) {
          enrolledStudent = enrolledStudents.find(s => s.idNumber === idNo);
        } else {
        }
        
        // If not found in prop, fetch directly from backend
        if (!enrolledStudent) {
          
          const sessionToken = getSessionToken();
          if (!sessionToken) {
            setError('No session token found');
            setLoading(false);
            return;
          }

          // Fetch student by ID number from backend
          const response = await fetch(`${API_BASE_URL}/students/search/${idNo}`, {
            headers: {
              'X-Session-Token': sessionToken,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const studentData = await response.json();
            
            // Transform the data to match expected format
            enrolledStudent = {
              id: studentData.id,
              idNumber: studentData.idNumber,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              middleName: studentData.middleName,
              gender: studentData.gender || 'N/A',
              course: 'Bachelor of Science in Information Technology',
              registrationStatus: 'Enrolled',
              registrationDate: studentData.createdAt ? new Date(studentData.createdAt).toISOString().split('T')[0] : 'N/A'
            };
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('🔍 Backend fetch failed:', response.status, errorData);
            setError(`Student not found: ${errorData.message || 'Unknown error'}`);
            setLoading(false);
            return;
          }
        }

        // Use the student data (either from prop or backend)
        setStudent(enrolledStudent);

        // Fetch login history for this student
        fetchLoginHistory(enrolledStudent.id);

        // Fetch requirements status for this student
        fetchRequirementsStatus(enrolledStudent.id);

        // Always fetch user data with profile photo to ensure it persists
        try {
          const userResponse = await fetch(`${API_BASE_URL}/students/${enrolledStudent.id}`, {
            headers: { 'X-Session-Token': getSessionToken() }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            if (userData.profilePhoto) {
              // Construct full URL if needed
              let fullPhotoUrl;
              if (userData.profilePhoto.startsWith('http')) {
                fullPhotoUrl = userData.profilePhoto;
              } else if (userData.profilePhoto.startsWith('/api/')) {
                // If the photo URL already starts with /api/, just prepend the base URL without /api
                const baseUrl = API_BASE_URL.replace('/api', '');
                fullPhotoUrl = `${baseUrl}${userData.profilePhoto}`;
              } else {
                // If it doesn't start with /api/, prepend the full API_BASE_URL
                fullPhotoUrl = `${API_BASE_URL}${userData.profilePhoto}`;
              }
              
              
              // Always update student with fresh server data (overwrites enrolledStudents data)
              setStudent(prev => ({
                ...prev,
                profilePhoto: fullPhotoUrl
              }));
              
              // Also save to localStorage for persistence
              localStorage.setItem(`studentProfilePic_${enrolledStudent.idNumber}`, fullPhotoUrl);
              setStudentProfilePic(fullPhotoUrl);
              
            } else {
              // Clear any existing photo data if server says there's no photo
              setStudent(prev => ({
                ...prev,
                profilePhoto: null
              }));
              localStorage.removeItem(`studentProfilePic_${enrolledStudent.idNumber}`);
              setStudentProfilePic(null);
            }
          } else {
            console.error('📸 Failed to fetch user data:', userResponse.status, userResponse.statusText);
          }
        } catch (error) {
          console.error("Error fetching user photo:", error);
        }

        // --- START: Fetch student registration data for personal details ---
        try {
          
          const registrationResponse = await fetch(`${API_BASE_URL}/students/registration/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          
          
          if (registrationResponse.ok) {
              const registrationData = await registrationResponse.json();
              setStudentRegistration(registrationData);
          } else {
              const errorText = await registrationResponse.text();
              console.error("Failed to fetch student registration data. Status:", registrationResponse.status);
              console.error("Error response:", errorText);
          }
        } catch (error) {
          console.error("Error fetching student registration:", error);
        }
        // --- END: Fetch registration data ---

        // --- START: Fetch enrolled subjects for this student ---
        try {
          const subjectsResponse = await fetch(`${API_BASE_URL}/students/enrolled-subjects/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          
          if (subjectsResponse.ok) {
              const subjectsData = await subjectsResponse.json();
              // Set the entire subjects data (includes yearLevel, semester, totalUnits, subjects array)
              setEnrolledSubjects(subjectsData);
              // Automatically set the current semester when data loads
              if (subjectsData && subjectsData.yearLevel && subjectsData.semester) {
                  setCurrentSemester('current');
              }
          } else {
              console.error("Failed to fetch enrolled subjects. Status:", subjectsResponse.status);
          }
        } catch (error) {
          console.error("Error fetching enrolled subjects:", error);
        }
        // --- END: Fetch enrolled subjects ---

        // --- START: Fetch thes for this student ---
        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests/student/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          if (requestsResponse.ok) {
              const requestsData = await requestsResponse.json();
              setDocumentRequests(requestsData);
          } else {
              console.error("Failed to fetch student's document requests.");
          }
        } catch (error) {
          console.error("Error fetching document requests:", error);
        }
        // --- END: Fetch requests ---

        // --- START: Fetch announcement history for this student ---
        try {
          setLoadingHistory(true);
          const historyResponse = await fetch(`${API_BASE_URL}/notifications/student/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              // Filter for requirements announcements only
              const requirementsAnnouncements = historyData.filter(notif => 
                notif.type === 'requirements_reminder'
              );
              setAnnouncementHistory(requirementsAnnouncements);
          } else {
              console.error("Failed to fetch announcement history.");
          }
        } catch (error) {
          console.error("Error fetching announcement history:", error);
        } finally {
          setLoadingHistory(false);
        }

        if (enrolledStudent) {
          try {
            const balanceResponse = await fetch(`${API_BASE_URL}/accounting/${enrolledStudent.id}/balance`, {
                headers: { 'X-Session-Token': getSessionToken() }
            });
            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                setBalance(balanceData.tuitionBalance);
                setNewBalance(balanceData.tuitionBalance.toString()); // Pre-fill modal input
            }
          } catch (err) {
            console.error("Could not fetch student balance:", err);
          }
        }
        // --- END: Fetch announcement history ---
      } catch (error) {
        console.error('Error fetching student details:', error);
        setError('Error fetching student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [idNo, enrolledStudents]);

  // Load student profile picture from localStorage (fallback only)
  useEffect(() => {
    if (student && student.idNumber && !student.profilePhoto) {
      const savedPic = localStorage.getItem(`studentProfilePic_${student.idNumber}`);
      if (savedPic) {
        setStudentProfilePic(savedPic);
      }
    }
  }, [student?.idNumber, student?.profilePhoto]);

  // Debug: Monitor student state changes
  useEffect(() => {
    setForceRerender(prev => prev + 1);
  }, [student?.profilePhoto, studentProfilePic]);

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num) => {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Requirements summary calculations
  const submittedCount = Object.values(requirements).filter(Boolean).length;
  const pendingCount = 4 - submittedCount; // Total requirements (4) minus submitted

  const studentDetails = useMemo(() => {
    if (!student) return null;
    
    return {
      documentRequests: [],
      enrolledSubjects: {},
      allTakenSubjects: [],
      curriculum: getDummyCurriculum(student.course || 'Bachelor of Science in Information Technology'),
      academicInfo: {
        status: studentRegistration?.registrationStatus || student.registrationStatus || 'Not registered',
        semester: studentRegistration?.semester || `${student.currentSemester || 1}${getOrdinalSuffix(student.currentSemester || 1)} Semester`,
        yearOfEntry: student.createdAt || 'N/A',
        yearOfGraduation: 'N/A'
      }
    };
  }, [student, studentRegistration]);

  const [currentSemester, setCurrentSemester] = useState('');
  const [isCurriculumModalOpen, setCurriculumModalOpen] = useState(false);

  // Only show requests after registrar takes action for online submissions
  // Also hide rejected requests from registrar view
  const visibleDocumentRequests = useMemo(() => {
    return (documentRequests || []).filter(r => {
      // Always show registrar-initiated (walk-in) requests
      if (r.initiatedBy === 'registrar') return true;
      // Hide online requests while still pending; show once registrar acts
      if (r.status && r.status.toLowerCase() === 'pending') return false;
      // Hide rejected requests from registrar view
      if (r.status && r.status.toLowerCase() === 'rejected') return false;
      return true;
    });
  }, [documentRequests]);

  if (loading) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading student details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <Link to="/registrar/all-students" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Student Not Found</h4>
          <p>The student with ID No. {idNo} could not be found.</p>
          <hr />
          <Link to="/registrar/all-students" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'payment_approved':
      case 'ready for pick-up':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getDisplayStatus = (status) => {
    if (!status) return '';
    const s = String(status).toLowerCase();
    if (s === 'payment_required') return 'pending';
    if (s === 'approved' || s === 'payment_approved' || s === 'ready for pick-up') return 'payment approved';
    return String(status).replace('_', ' ');
  };

  const handleUpdateBalance = async () => {
    if (!student || newBalance === '') return;
    setUpdatingBalance(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/${student.id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken(),
        },
        body: JSON.stringify({ newBalance: parseFloat(newBalance) })
      });

      if (response.ok) {
        const result = await response.json();
        setBalance(result.updatedBalance);
        alert('Balance updated successfully!');
        setBalanceModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Failed to update balance: ${error.message}`);
      }
    } catch (err) {
      alert('An error occurred while updating the balance.');
      console.error(err);
    } finally {
      setUpdatingBalance(false);
    }
  };

  // Photo upload functions
  const handlePhotoSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedPhoto(file);
      
      // Automatically upload the photo
      try {
        setUploadingPhoto(true);
        
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_BASE_URL}/photos/upload/${student.idNumber}`, {
          method: 'POST',
          headers: { 'X-Session-Token': getSessionToken() },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          
          
          // Construct full URL if needed
          let fullPhotoUrl;
          if (result.photoUrl.startsWith('http')) {
            fullPhotoUrl = result.photoUrl;
          } else {
            fullPhotoUrl = `${API_BASE_URL}${result.photoUrl}`;
          }
          
          // Add cache busting parameter to ensure fresh image
          const cacheBuster = `?t=${Date.now()}`;
          fullPhotoUrl = fullPhotoUrl + cacheBuster;
          
          // Update student profile picture
          setStudentProfilePic(fullPhotoUrl);
          
          // Also update the student object's profilePhoto property
          setStudent(prev => ({
            ...prev,
            profilePhoto: fullPhotoUrl
          }));
          
          // Save to localStorage for persistence
          localStorage.setItem(`studentProfilePic_${student.idNumber}`, fullPhotoUrl);
          
          // Force re-render to show new photo
          setForceRerender(prev => prev + 1);
          
          // Update the enrolledStudents array in the parent component
          if (window.updateEnrolledStudents) {
            window.updateEnrolledStudents(prev => 
              prev.map(s => 
                s.idNumber === student.idNumber 
                  ? { ...s, profilePhoto: fullPhotoUrl }
                  : s
              )
            );
          }
          
        } else {
          const errorData = await response.json();
          console.error('❌ Photo upload failed:', errorData);
          alert(`Photo upload failed: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Photo upload error:', error);
        alert('Photo upload failed. Please try again.');
      } finally {
        setUploadingPhoto(false);
        // Clear the file input
        event.target.value = '';
      }
    }
  };


  const handleDeletePhoto = async () => {
    if (!student.profilePhoto) return;

    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos/${student.idNumber}`, {
          method: 'DELETE',
          headers: { 'X-Session-Token': getSessionToken() }
        });

        if (response.ok) {
          // Update the user object to remove photo
          setStudent(prev => ({
            ...prev,
            profilePhoto: null
          }));
          
          alert('Photo deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Delete failed: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Delete failed. Please try again.');
      }
    }
  };

  // Function to handle photo preview
  const handlePhotoPreview = () => {
    if (student.profilePhoto) {
      setPhotoPreviewModalOpen(true);
    }
  };

  // Requirements handling functions
  const handleRequirementToggle = (requirementType) => {
    setRequirements(prev => ({
      ...prev,
      [requirementType]: !prev[requirementType]
    }));
  };

  // Subject details handling
  const handleViewSubjectDetails = (subject) => {
    setSelectedSubject(subject);
    setSubjectDetailsModalOpen(true);
  };

  // Toggle enrolled subjects card
  const toggleEnrolledSubjects = () => {
    setEnrolledSubjectsExpanded(!enrolledSubjectsExpanded);
  };



  const refreshAnnouncementHistory = async () => {
    if (!student?.id) return;
    
    try {
      setLoadingHistory(true);
      const historyResponse = await fetch(`${API_BASE_URL}/notifications/student/${student.id}`, {
          headers: { 'X-Session-Token': getSessionToken() }
      });
      if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const requirementsAnnouncements = historyData.filter(notif => 
            notif.type === 'requirements_reminder'
          );
          setAnnouncementHistory(requirementsAnnouncements);
      }
    } catch (error) {
      console.error("Error refreshing announcement history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      alert('Please enter an announcement message.');
      return;
    }

    // Clear any existing success message
    setAnnouncementSuccessMessage('');


    try {
      setSendingAnnouncement(true);
      const response = await fetch(`${API_BASE_URL}/requirements/announcement`, {
        method: 'POST',
        headers: { 
          'X-Session-Token': getSessionToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.id,
          message: announcementText,
          type: 'requirements_reminder'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAnnouncementSuccessMessage('Announcement sent successfully to the student!');
        setAnnouncementText('');
        
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setAnnouncementModalOpen(false);
          setAnnouncementSuccessMessage('');
        }, 2000);
        
        // Refresh announcement history
        await refreshAnnouncementHistory();
      } else {
        const error = await response.json();
        alert(`Failed to send announcement: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Failed to send announcement. Please try again.');
    } finally {
      setSendingAnnouncement(false);
    }
  };
  

  
  const handlePrintRequest = (request) => {
    if (!student) {
      alert('Student details are still loading. Please wait a moment and try again.');
      return;
    }

    // Check if request can be printed (handle multiple status variations)
    const status = request.status?.toLowerCase();
    const displayStatus = getDisplayStatus(request.status)?.toLowerCase();
    
    // Allow printing for various approved statuses
    const canPrint = status === 'payment_approved' || 
                    status === 'payment approved' ||
                    status === 'approved' ||
                    displayStatus === 'payment approved' ||
                    displayStatus === 'approved';

    if (!canPrint) {
      setCancelWarning('⚠️ This request cannot be printed yet. Wait for the payment approval by accounting');
      // Clear warning after 5 seconds
      setTimeout(() => {
        setCancelWarning('');
      }, 5000);
      return;
    }

    // Go to the approval/edit view for any document type
    navigate(`/registrar/requests/approve-document/${request.id}`);
  };

  const handleCancelRequest = (request) => {
    
    // Check if request is already payment approved (multiple variations)
    const status = request.status?.toLowerCase();
    const displayStatus = getDisplayStatus(request.status)?.toLowerCase();
    const badgeClass = getStatusBadge(request.status);
    
    if (status === 'payment_approved' || 
        status === 'payment approved' || 
        displayStatus === 'payment approved' ||
        status === 'approved' ||
        displayStatus === 'approved' ||
        badgeClass === 'bg-success') {
      // Clear any existing modal state
      setShowCancelModal(false);
      setRequestToCancel(null);
      setCancelWarning(`The ${request.documentType} request is already payment approved and cannot be cancelled.`);
      // Clear warning after 5 seconds
      setTimeout(() => {
        setCancelWarning('');
      }, 5000);
      return;
    }

    // For other statuses, proceed with normal cancellation
    setRequestToCancel(request);
    setShowCancelModal(true);
  };

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;

    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken()
        }
      });

      if (response.ok) {
        setCancelWarning('✅ Request cancelled successfully!');
        // Refresh the document requests
        if (student) {
          await refreshStudentRequests(student.id);
        }
        setShowCancelModal(false);
        setRequestToCancel(null);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setCancelWarning('');
        }, 3000);
      } else {
        const error = await response.json();
        setCancelWarning(`❌ Failed to cancel request: ${error.message}`);
        // Clear error message after 5 seconds
        setTimeout(() => {
          setCancelWarning('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      setCancelWarning('❌ Error cancelling request. Please try again.');
      // Clear error message after 5 seconds
      setTimeout(() => {
        setCancelWarning('');
      }, 5000);
    }
  };

  // Refresh requests from server so UI updates immediately after registrar action
  const refreshStudentRequests = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/student/${studentId}`, {
        headers: { 'X-Session-Token': getSessionToken() }
      });
      if (res.ok) {
        const data = await res.json();
        setDocumentRequests(data);
      }
    } catch (err) {
      console.error('Failed to refresh student requests:', err);
    }
  };

  const handleConfirmRequest = async (requestData) => {
    try {
      
      // Get the requestId from URL parameters
      const params = new URLSearchParams(window.location.search);
      let existingRequestId = params.get('requestId');
      
      
      // If there's no existing request (e.g., registrar initiates directly), create one first
      if (!existingRequestId) {
        if (!student?.id) {
          throw new Error('Missing student information');
        }

        // Use FormData because the backend route is wired with multer
        const formData = new FormData();
        formData.append('documentType', requestData.documentType);
        formData.append('purpose', 'Registrar-initiated request');
        formData.append('studentId', String(student.id));

        const createResponse = await fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers: {
            'X-Session-Token': getSessionToken(),
          },
          body: formData,
        });

        if (!createResponse.ok) {
          const err = await createResponse.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create request');
        }

        const created = await createResponse.json();
        existingRequestId = String(created?.id || created?.request?.id);

        // Optimistically add to local list as pending
        if (existingRequestId) {
          setDocumentRequests(prev => [
            ...prev,
            {
              id: Number(existingRequestId),
              documentType: requestData.documentType,
              schoolYear: requestData.schoolYear,
              semester: requestData.semester,
              amount: requestData.amount,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }

      // Find the specific request by ID to get its document type
      const specificRequest = documentRequests.find(r => r.id === Number(existingRequestId));
      
      if (specificRequest && specificRequest.documentType !== requestData.documentType) {
        alert(`Your request is incorrect because student requested ${specificRequest.documentType} not ${requestData.documentType}.`);
        return;
      }
      

      // Request the document from accounting for the existing student request

      const accountingResponse = await fetch(`${API_BASE_URL}/requests/${existingRequestId}/request-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken(),
        },
        body: JSON.stringify({
          amount: requestData.amount,
        }),
      });

      if (accountingResponse.ok) {
        // Update the local state to reflect payment_required after forwarding to accounting
        const updatedRequest = {
          id: Number(existingRequestId),
          documentType: requestData.documentType,
          schoolYear: requestData.schoolYear,
          semester: requestData.semester,
          amount: requestData.amount,
          status: 'payment_required',
          createdAt: new Date().toISOString(),
        };
        
        setDocumentRequests(prev => {
          const others = prev.filter(r => r.id !== Number(existingRequestId));
          return [...others, updatedRequest];
        });
        // Immediately re-fetch from server to reflect authoritative status
        if (student?.id) {
          refreshStudentRequests(student.id);
        }
      } else {
        throw new Error('Failed to request document from accounting');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Error processing request: ' + error.message);
    }
  };

  // Extract student details for easier access
  const details = student || {};
  const user = student;

  return (
    <div className="student-detail-view container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-user-graduate text-primary me-2"></i>
                Student Information
              </h2>
              <p className="text-muted mb-0">Complete student profile and academic records</p>
            </div>
            <Link to="/registrar/all-students" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>Back to List
            </Link>
          </div>
        </div>
      </div>

      {(userRole === 'accounting') && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0"><i className="fas fa-money-bill-wave me-2"></i>Accounting Details</h5>
          </div>
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="card-title mb-1">Current Balance:</h6>
              <p className="card-text fs-4 fw-bold mb-0">₱ {parseFloat(balance).toFixed(2)}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setBalanceModalOpen(true)}>
              <i className="fas fa-edit me-2"></i>Update Balance
            </button>
          </div>
        </div>
      )}

      {isBalanceModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Student Balance</h5>
                  <button type="button" className="btn-close" onClick={() => setBalanceModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Enter the new outstanding balance for {student.firstName} {student.lastName}.</p>
                  <div className="mb-3">
                    <label htmlFor="newBalanceAmount" className="form-label">New Balance Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      id="newBalanceAmount"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setBalanceModalOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateBalance}
                    disabled={updatingBalance}
                  >
                    {updatingBalance ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {(userRole === 'registrar') && (
      <div className="row">
        {/* Student Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Student Profile
              </h5>
            </div>
            <div className="card-body text-center">
                             <div className="profile-pic-wrapper mb-3">
                                   <div 
                    className="profile-avatar clickable-photo"
                    title="Click photo to view, click camera to upload"
                  >
                                       {(() => {
                                         
                                         // Show uploaded photo if exists (prioritize student.profilePhoto)
                                         const photoToShow = student?.profilePhoto || studentProfilePic;
                                         
                                         if (photoToShow) {
                                           return (
                                             <img 
                                               key={`photo-${student.id}-${forceRerender}`}
                                               src={photoToShow} 
                                               alt="Student Photo" 
                                               className="profile-photo"
                                               onClick={handlePhotoPreview}
                                               title="Click to view photo in full screen"
                                               style={{
                                                 width: '300px',
                                                 height: '300px',
                                                 borderRadius: '50%',
                                                 objectFit: 'cover',
                                                 cursor: 'pointer'
                                               }}
                                               onLoad={() => {
                                               }}
                                               onError={(e) => {
                                                 // If photo fails to load, show generic avatar
                                                 e.target.style.display = 'none';
                                                 const fallbackAvatar = document.createElement('div');
                                                 fallbackAvatar.className = 'fallback-avatar';
                                                 fallbackAvatar.style.cssText = `
                                                   width: 300px;
                                                   height: 300px;
                                                   border-radius: 50%;
                                                   background-color: #6c757d;
                                                   display: flex;
                                                   align-items: center;
                                                   justify-content: center;
                                                   cursor: pointer;
                                                   position: relative;
                                                 `;
                                                 
                                                 // Add person silhouette icon
                                                 const personIcon = document.createElement('i');
                                                 personIcon.className = 'fas fa-user';
                                                 personIcon.style.cssText = `
                                                   font-size: 80px;
                                                   color: white;
                                                   opacity: 0.7;
                                                 `;
                                                 fallbackAvatar.appendChild(personIcon);
                                                 
                                                 fallbackAvatar.onclick = handlePhotoPreview;
                                                 e.target.parentNode.appendChild(fallbackAvatar);
                                               }}
                                             />
                                           );
                                         }
                                         
                                         // Show generic grey avatar with person silhouette
                                         return (
                                           <div 
                                             key={`avatar-${student?.id}-${forceRerender}`}
                                             className="fallback-avatar"
                                             style={{
                                               width: '300px',
                                               height: '300px',
                                               borderRadius: '50%',
                                               backgroundColor: '#6c757d',
                                               display: 'flex',
                                               alignItems: 'center',
                                               justifyContent: 'center',
                                               cursor: 'pointer',
                                               position: 'relative'
                                             }}
                                             onClick={handlePhotoPreview}
                                             title="Click to view avatar in full screen"
                                           >
                                             <i className="fas fa-user" style={{
                                               fontSize: '80px',
                                               color: 'white',
                                               opacity: 0.7
                                             }}></i>
                                           </div>
                                         );
                                       })()}
                    <div 
                      className="photo-upload-overlay"
                      onClick={() => document.getElementById('photoInput').click()}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      title="Click to upload/change photo"
                    >
                      <i className="fas fa-camera fa-2x"></i>
                      <span>Upload Photo</span>
                    </div>
                    <input
                      id="photoInput"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      style={{ display: 'none' }}
                    />
                 </div>
               </div>
              <h4 className="mb-1">{`${user.lastName}, ${user.firstName} ${user.middleName || ''}`.trim()}</h4>
              <p className="text-muted mb-2">Student No. {user.idNumber}</p>
              <p className="text-muted mb-3">{user.course || 'Bachelor of Science in Information Technology'}</p>
              
              {/* Academic Status Badge */}
              <div className="mb-3">
                <span className={`badge ${(studentRegistration?.registrationStatus || user.registrationStatus) === 'Approved' ? 'bg-success' : 'bg-warning'} fs-6`}>
                    {(studentRegistration?.registrationStatus || user.registrationStatus) === 'Approved' ? 'Enrolled' : (studentRegistration?.registrationStatus || user.registrationStatus || 'Not registered')}
                </span>
              </div>

              {/* Quick Info */}
              <div className="row text-start">
                <div className="col-6">
                  <small className="text-muted">Gender</small>
                  <p className="mb-2">{studentRegistration?.gender || user.gender || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Registration Date</small>
                  <p className="mb-2">{studentRegistration?.createdAt ? new Date(studentRegistration.createdAt).toISOString().split('T')[0] : 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Year Level</small>
                  <p className="mb-2">{studentRegistration?.yearLevel || user.currentYearLevel || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Semester</small>
                  <p className="mb-2">{studentRegistration?.semester || user.currentSemester || 'N/A'}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Email</small>
                  <p className="mb-0">{studentRegistration?.email || user.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">

          <div className="card shadow-sm mb-4">
    <div className="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">Document Requests</h5>
      <button className="btn btn-sm btn-outline-primary" onClick={() => setIsRequestModalOpen(true)}>
                <i className="fas fa-plus me-1"></i> New Request
              </button>
      </div>
      <div className="card-body">
        {/* Warning message for payment approved requests */}
        {cancelWarning && (
          <div className={`alert alert-dismissible fade show mb-3 ${
            cancelWarning.includes('✅') ? 'alert-success' : 
            cancelWarning.includes('❌') ? 'alert-danger' : 
            'alert-warning'
          }`} role="alert">
            <i className={`fas me-2 ${
              cancelWarning.includes('✅') ? 'fa-check-circle' : 
              cancelWarning.includes('❌') ? 'fa-times-circle' : 
              'fa-exclamation-triangle'
            }`}></i>
            {cancelWarning}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setCancelWarning('')}
              aria-label="Close"
            ></button>
          </div>
        )}
        <div className="table-responsive">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
                      {visibleDocumentRequests.length > 0 ? (
                        visibleDocumentRequests.map((req) => (
                          <tr key={req.id}>
                              <td>
                                  <div>{req.documentType}</div>
                                  {req.schoolYear && <small className="text-muted">{req.schoolYear} / {req.semester}</small>}
                              </td>
                              <td><span className={`badge ${getStatusBadge(req.status)}`}>
                                  {getDisplayStatus(req.status)}
                                </span>
                              </td>
                              <td>₱ {Number(req.amount || 0).toFixed(2)}</td>
                              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                              <td>
                                {/* --- START: NEW ACTIONS DROPDOWN --- */}
                                <div className="dropdown">
                                    <button className="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="fas fa-ellipsis-h"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <button className="dropdown-item" onClick={() => handlePrintRequest(req)}>
                                                <i className="fas fa-print fa-fw me-2"></i>Print
                                            </button>
                                        </li>
                                        {/* <li>
                                            <button className="dropdown-item" onClick={() => alert('Marking as complete!')}>
                                                <i className="fas fa-check fa-fw me-2"></i>Mark as Complete
                                            </button>
                                        </li> */}
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={() => handleCancelRequest(req)}>
                                                <i className="fas fa-times fa-fw me-2"></i>Cancel Request
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                              </td>
                          </tr>
                        ))
                        ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No document requests found.</td>
                        </tr>
                        )}
                  </tbody>
        </table>
      </div>
    </div>
  </div>

  {/* ENROLLMENT REQUIREMENTS Section */}
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <i className="fas fa-clipboard-check me-2"></i>
        ENROLLMENT REQUIREMENTS
      </h5>
      <Link 
        to={`/registrar/students/${idNo}/upload-documents`}
        className="btn btn-sm btn-light"
      >
        <i className="fas fa-plus me-1"></i>
        Manage Requirements
      </Link>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-8">
          <h6 className="text-primary mb-3">Required Documents</h6>
          <div className="requirements-grid">
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-id-card text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>PSA Birth Certificate</strong>
                <small className="text-muted d-block">Philippine Statistics Authority</small>
                <span className={`badge ${requirements.psa ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.psa ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-credit-card text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>Valid ID</strong>
                <small className="text-muted d-block">Government-issued ID</small>
                <span className={`badge ${requirements.validId ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.validId ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-file-alt text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>Form 137</strong>
                <small className="text-muted d-block">High School Records</small>
                <span className={`badge ${requirements.form137 ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.form137 ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-image text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>2x2 ID Picture</strong>
                <small className="text-muted d-block">Recent photo</small>
                <span className={`badge ${requirements.idPicture ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.idPicture ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <h6 className="text-primary mb-3">Requirements Status</h6>
          <div className="requirements-summary">
            <div className="summary-item">
              <span className="summary-label">Submitted:</span>
              <span className="summary-value text-success">{submittedCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pending:</span>
              <span className="summary-value text-warning">{pendingCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total:</span>
              <span className="summary-value text-primary">4</span>
            </div>
          </div>
          
          <div className="mt-3">
            <button 
              className="btn btn-warning btn-sm w-100 mb-2"
              onClick={() => setAnnouncementModalOpen(true)}
            >
              <i className="fas fa-bell me-1"></i>
              Send Announcement
            </button>
            <Link 
              to={`/registrar/students/${idNo}/upload-documents`}
              className="btn btn-info btn-sm w-100"
            >
              <i className="fas fa-upload me-1"></i>
              Upload Documents
            </Link>
          </div>

          {/* Message Tracker */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-primary mb-0">Message Tracker</h6>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={refreshAnnouncementHistory}
                disabled={loadingHistory}
                title="Refresh message history"
              >
                <i className={`fas ${loadingHistory ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              </button>
            </div>
            {loadingHistory ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : announcementHistory.length > 0 ? (
              <div className="message-history">
                {announcementHistory.map((announcement, index) => (
                  <div key={announcement.id || index} className="message-item">
                    <div className="message-header">
                      <i className="fas fa-bell text-warning me-2"></i>
                      <small className="text-muted">
                        {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </small>
                    </div>
                    <div className="message-content">
                      <small className="text-dark">{announcement.message}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted">
                <small>No announcements sent yet</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>


  <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <h5 className="mb-0 me-3">Enrolled Subjects</h5>
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={toggleEnrolledSubjects}
                        title={enrolledSubjectsExpanded ? "Collapse" : "Expand"}
                    >
                        <i className={`fas fa-chevron-${enrolledSubjectsExpanded ? 'up' : 'down'}`}></i>
                    </button>
                </div>
                <div className="d-flex align-items-center">
                                         <select 
                         className="form-select form-select-sm me-2" 
                         style={{width: '200px'}}
                         value={currentSemester}
                         onChange={(e) => setCurrentSemester(e.target.value)}
                     >
                         {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 ? (
                             <option value="current">{enrolledSubjects.yearLevel} Year - {enrolledSubjects.semester} Semester</option>
                         ) : (
                             <option value="no-subjects">No subjects available</option>
                         )}
                     </select>
                                         <button onClick={() => setCurriculumModalOpen(true)} className="btn btn-sm btn-info">View BSIT Prospectus</button>
                </div>
            </div>
            {enrolledSubjectsExpanded ? (
            <div className="card-body collapse show">
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                                     <thead>
                     <tr>
                       <th>Subjects</th>
                       <th className="text-center">Units</th>
                       <th className="text-center">Final Grade</th>
                       <th className="text-center">Status</th>
                       <th>Action</th>
                     </tr>
                   </thead>
                  <tbody>
                                         {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 ? (
                       enrolledSubjects.subjects.map((subject, index) => (
                         <tr key={subject.id}>
                           <td>
                             <div>
                               <strong>{subject.courseCode}</strong>
                               <br />
                               <small className="text-muted">{subject.courseTitle}</small>
                             </div>
                           </td>
                           <td className="text-center">{subject.units}</td>
                           <td className="text-center">{subject.finalGrade}</td>
                           <td className="text-center">
                             <span className="badge bg-primary">
                               {String(subject.status).toLowerCase() === 'taken' ? 'Enrolled' : subject.status}
                             </span>
                           </td>
                           <td>
                             <button 
                               className="btn btn-sm btn-outline-info" 
                               title="View More Info"
                               onClick={() => handleViewSubjectDetails(subject)}
                             >
                               <i className="fas fa-info-circle me-1"></i>
                               More Info
                             </button>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan="5" className="text-center text-muted">
                           {enrolledSubjects ? 'No subjects available for current semester' : 'Loading subjects...'}
                         </td>
                       </tr>
                     )}
                  </tbody>
                                     {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 && (
                     <tfoot>
                       <tr className="table-light">
                         <td colSpan="2" className="text-end fw-bold">
                           Total Units: <span className="fw-normal">{enrolledSubjects.totalUnits}</span>
                         </td>
                         <td colSpan="3" className="text-end fw-bold">
                           Semester: <span className="fw-normal">{enrolledSubjects.yearLevel} Year - {enrolledSubjects.semester} Semester</span>
                         </td>
                       </tr>
                     </tfoot>
                   )}
                </table>
              </div>
            </div>
            ) : (
            <div className="card-body text-center text-muted py-3">
              <i className="fas fa-chevron-down me-2"></i>
              Click the arrow above to view enrolled subjects
            </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white text-dark">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Personal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Personal Data</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Full Name:</strong></div>
                     <div className="col-8">{studentRegistration ? `${studentRegistration.firstName} ${studentRegistration.middleName || ''} ${studentRegistration.lastName}`.trim() : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Gender:</strong></div>
                     <div className="col-8">{studentRegistration?.gender || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Marital Status:</strong></div>
                     <div className="col-8">{studentRegistration?.maritalStatus || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Birth Date:</strong></div>
                     <div className="col-8">{studentRegistration?.dateOfBirth ? new Date(studentRegistration.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Place of Birth:</strong></div>
                     <div className="col-8">{studentRegistration?.placeOfBirth || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Religion:</strong></div>
                     <div className="col-8">{studentRegistration?.religion || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Citizenship:</strong></div>
                     <div className="col-8">{studentRegistration?.nationality || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Country:</strong></div>
                     <div className="col-8">{studentRegistration?.country || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Contact Information</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Email:</strong></div>
                     <div className="col-8">{studentRegistration?.email || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Contact:</strong></div>
                     <div className="col-8">{studentRegistration?.contactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>City Address:</strong></div>
                     <div className="col-8">{studentRegistration?.cityAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Provincial Address:</strong></div>
                     <div className="col-8">{studentRegistration?.provincialAddress || 'N/A'}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Background */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white text-dark">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Family Background
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Father's Information</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>Name:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherIncome || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Mother's Information</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>Name:</strong></div>
                     <div className="col-7">{studentRegistration?.motherName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.motherOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.motherCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.motherContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.motherIncome || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Guardian's Information</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>Name:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianIncome || 'N/A'}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white text-dark">
              <h5 className="mb-0">
                <i className="fas fa-graduation-cap me-2"></i>
                Academic Background
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success mb-3">Current Academic Information</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Course:</strong></div>
                     <div className="col-8">{studentRegistration?.course || 'Bachelor of Science in Information Technology'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Major:</strong></div>
                     <div className="col-8">{studentRegistration?.major || 'Information Technology'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Student Type:</strong></div>
                     <div className="col-8">{studentRegistration?.studentType || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Semester Entry:</strong></div>
                     <div className="col-8">{studentRegistration?.semesterEntry || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Year of Entry:</strong></div>
                     <div className="col-8">{studentRegistration?.yearOfEntry || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Application Type:</strong></div>
                     <div className="col-8">{studentRegistration?.applicationType || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-success mb-3">Academic Status</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Status:</strong></div>
                     <div className="col-8">
                       <span className={`badge ${studentRegistration?.registrationStatus === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                         {studentRegistration?.registrationStatus === 'Approved' ? 'Enrolled' : (studentRegistration?.registrationStatus || 'Not registered')}
                       </span>
                     </div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Current Semester:</strong></div>
                     <div className="col-8">{studentRegistration?.semester ? `${studentRegistration.semester}${getOrdinalSuffix(studentRegistration.semester)} Semester` : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Year Level:</strong></div>
                     <div className="col-8">{studentRegistration?.yearLevel || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>School Year:</strong></div>
                     <div className="col-8">{studentRegistration?.schoolYear || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Registration Date:</strong></div>
                     <div className="col-8">{studentRegistration?.createdAt ? new Date(studentRegistration.createdAt).toLocaleDateString() : 'N/A'}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic History */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white text-dark">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Academic History
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Elementary Education</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>School:</strong></div>
                     <div className="col-7">{studentRegistration?.elementarySchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryHonor || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Junior High School</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>School:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighSchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighHonor || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Senior High School</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>School:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighSchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Strand:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighStrand || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighHonor || 'N/A'}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Section */}
          {student && (
            <div className="mb-4">
              <ActivityLogs 
                userId={student.id} 
                studentName={`${details.firstName} ${details.lastName}`} 
              />
            </div>
          )}

          {/* Additional Academic Information */}
          {(details.ncaeGrade || details.specialization || details.lastCollegeAttended) && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Additional Academic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <h6 className="text-dark mb-3">NCAE & Specialization</h6>
                                       <div className="row mb-2">
                     <div className="col-5"><strong>NCAE Grade:</strong></div>
                     <div className="col-7">{studentRegistration?.ncaeGrade || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Specialization:</strong></div>
                     <div className="col-7">{studentRegistration?.specialization || 'N/A'}</div>
                   </div>
                  </div>
                  <div className="col-md-8">
                    <h6 className="text-dark mb-3">Previous College (if any)</h6>
                                       <div className="row mb-2">
                     <div className="col-3"><strong>College:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeAttended || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Year Taken:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeYearTaken || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Course:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeCourse || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Major:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeMajor || 'N/A'}</div>
                   </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

             {/* BSIT Prospectus Modal */}
       {isCurriculumModalOpen && (
         <BsitProspectusModal
           isOpen={isCurriculumModalOpen}
           onClose={() => setCurriculumModalOpen(false)}
           studentName={`${student.firstName} ${student.lastName}`}
         />
       )}



        {/* Photo Preview Modal */}
        {photoPreviewModalOpen && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-image me-2"></i>
                    Student Photo
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setPhotoPreviewModalOpen(false)}
                  ></button>
                </div>
                                 <div className="modal-body text-center p-0">
                   {(() => {
                     // Show uploaded photo if exists, otherwise show generic avatar
                     if (student && student.profilePhoto) {
                       return (
                         <img 
                           src={student.profilePhoto} 
                           alt="Student Photo" 
                           className="img-fluid"
                           style={{ 
                             maxHeight: '80vh', 
                             maxWidth: '100%',
                             objectFit: 'contain'
                           }}
                         />
                       );
                     }
                     
                     // Show generic grey avatar with person silhouette
                     return (
                       <div 
                         className="fallback-avatar mx-auto"
                         style={{
                           width: '300px',
                           height: '300px',
                           borderRadius: '50%',
                           backgroundColor: '#6c757d',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           margin: '20px auto'
                         }}
                       >
                         <i className="fas fa-user" style={{
                           fontSize: '120px',
                           color: 'white',
                           opacity: 0.7
                         }}></i>
                       </div>
                     );
                   })()}
                 </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setPhotoPreviewModalOpen(false)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => {
                      setPhotoPreviewModalOpen(false);
                      document.getElementById('photoInput').click();
                    }}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Photo Preview Modal Backdrop */}
         {photoPreviewModalOpen && (
           <div className="modal-backdrop fade show"></div>
         )}

         {/* Announcement Modal */}
        {announcementModalOpen && (
          <div 
            className="announcement-modal-overlay"
            onClick={() => {
              setAnnouncementModalOpen(false);
              setAnnouncementSuccessMessage('');
            }}
          >
            <div 
              className="announcement-modal-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="announcement-modal-content">
                <div className="announcement-modal-header">
                  <h5 className="announcement-modal-title">
                    <i className="fas fa-bell"></i>
                    Send Announcement to Student
                  </h5>
                  <button 
                    type="button" 
                    className="announcement-modal-close" 
                    onClick={() => {
                      setAnnouncementModalOpen(false);
                      setAnnouncementSuccessMessage('');
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="announcement-modal-body">
                  <div className="announcement-form-group">
                    <label className="announcement-form-label">Student Name</label>
                    <input
                      type="text"
                      className="announcement-form-control"
                      value={`${student.firstName} ${student.lastName}`}
                      readOnly
                    />
                  </div>
                  
                  <div className="announcement-form-group">
                    <label className="announcement-form-label">Announcement Message *</label>
                    <textarea
                      className="announcement-form-control"
                      rows="4"
                      placeholder="Enter your announcement message here..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                    ></textarea>
                    <small className="announcement-form-text">
                      This message will be sent to the student about their enrollment requirements.
                    </small>
                  </div>
                  
                  <div className="announcement-alert-info">
                    <i className="fas fa-info-circle"></i>
                    <strong>Tip:</strong> Be specific about which documents are missing and when they should be submitted.
                  </div>
                  
                  {announcementSuccessMessage && (
                    <div className="announcement-success-message">
                      <i className="fas fa-check-circle"></i>
                      {announcementSuccessMessage}
                    </div>
                  )}
                </div>
                <div className="announcement-modal-footer">
                  <button 
                    type="button" 
                    className="announcement-btn-secondary" 
                    onClick={() => {
                      setAnnouncementModalOpen(false);
                      setAnnouncementSuccessMessage('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="announcement-btn-primary" 
                    onClick={handleSendAnnouncement}
                    disabled={!announcementText.trim() || sendingAnnouncement}
                  >
                    {sendingAnnouncement ? (
                      <>
                        <span className="announcement-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      <NewRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onConfirm={handleConfirmRequest}
        expectedDocumentType={(() => {
          const params = new URLSearchParams(window.location.search);
          const requestId = params.get('requestId');
          
          if (requestId) {
            const specificRequest = documentRequests.find(r => r.id === Number(requestId));
            const expectedType = specificRequest ? specificRequest.documentType : null;
            return expectedType;
          }
          return null;
        })()}
      />

       <div style={{ display: 'none' }}>
        <GradeSlipContent ref={componentRef} request={requestToPrint} student={student} />
      </div>

      {/* Subject Details Modal */}
      {subjectDetailsModalOpen && selectedSubject && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-book me-2"></i>
                  Subject Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSubjectDetailsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Course Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Course Code:</strong></td>
                          <td>{selectedSubject.courseCode}</td>
                        </tr>
                        <tr>
                          <td><strong>Course Title:</strong></td>
                          <td>{selectedSubject.courseTitle}</td>
                        </tr>
                        <tr>
                          <td><strong>Units:</strong></td>
                          <td>{selectedSubject.units}</td>
                        </tr>
                        <tr>
                          <td><strong>Type:</strong></td>
                          <td>{selectedSubject.courseType}</td>
                        </tr>
                        <tr>
                          <td><strong>Year Level:</strong></td>
                          <td>{selectedSubject.yearLevel}</td>
                        </tr>
                        <tr>
                          <td><strong>Semester:</strong></td>
                          <td>{selectedSubject.semester}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Enrollment Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Status:</strong></td>
                          <td>
                            <span className="badge bg-primary">{selectedSubject.status}</span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Final Grade:</strong></td>
                          <td>{selectedSubject.finalGrade}</td>
                        </tr>
                        <tr>
                          <td><strong>Enrollment Date:</strong></td>
                          <td>
                            {selectedSubject.enrollmentDate ? 
                              new Date(selectedSubject.enrollmentDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {selectedSubject.schedule && (
                  <div className="mt-3">
                    <h6 className="text-primary">Schedule Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Day:</strong></td>
                          <td>{selectedSubject.schedule.day}</td>
                        </tr>
                        <tr>
                          <td><strong>Time:</strong></td>
                          <td>{selectedSubject.schedule.startTime} - {selectedSubject.schedule.endTime}</td>
                        </tr>
                        <tr>
                          <td><strong>Room:</strong></td>
                          <td>{selectedSubject.schedule.room}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSubjectDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Confirmation Modal */}
      <CustomAlert
        isOpen={showCancelModal && !cancelWarning}
        onClose={() => {
          setShowCancelModal(false);
          setRequestToCancel(null);
        }}
        title="Cancel Document Request?"
        hideDefaultButton={true}
        actions={
          <div className="d-flex gap-2">
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setShowCancelModal(false);
                setRequestToCancel(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={confirmCancelRequest}
            >
              Yes, Cancel Request
            </button>
          </div>
        }
      >
        {requestToCancel && (
          <div className="text-start">
            <div className="mb-3">
              <strong>Student:</strong> {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
            </div>
            <div className="mb-3">
              <strong>Document:</strong> {requestToCancel.documentType}
            </div>
            <div className="mb-3">
              <strong>Amount:</strong> ₱{requestToCancel.amount?.toFixed(2) || '0.00'}
            </div>
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              This action cannot be undone. The request will be permanently cancelled.
            </div>
          </div>
        )}
      </CustomAlert>
     </div>
   );
 }

export default StudentDetailView;