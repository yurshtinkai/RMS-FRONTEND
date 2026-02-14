import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import sessionManager from '../utils/sessionManager';

function ManageSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Dropdown Data
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Filters
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [currentSchedule, setCurrentSchedule] = useState({
        subjectId: '',
        schoolYearId: '',
        semesterId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: '',
        maxStudents: 40,
        isActive: true
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (selectedSchoolYear && selectedSemester) {
            fetchSchedules();
        } else {
            setSchedules([]); // Clear schedules if filters are not set
        }
    }, [selectedSchoolYear, selectedSemester]);

    const fetchDropdownData = async () => {
        const sessionToken = sessionManager.getSessionToken();
        const headers = { 'X-Session-Token': sessionToken };

        try {
            const [syRes, semRes, subjRes] = await Promise.all([
                fetch(`${API_BASE_URL}/school-years`, { headers }),
                fetch(`${API_BASE_URL}/semesters`, { headers }),
                fetch(`${API_BASE_URL}/subjects`, { headers })
            ]);

            if (syRes.ok && semRes.ok && subjRes.ok) {
                const syData = await syRes.json();
                const semData = await semRes.json();
                const subjData = await subjRes.json();

                setSchoolYears(syData);
                setSemesters(semData);

                // Map backend fields to frontend expected fields
                const mappedSubjects = subjData.map(subject => ({
                    ...subject,
                    code: subject.courseCode,
                    name: subject.courseDescription
                }));
                setSubjects(mappedSubjects);

                // Set default filters to current/active if available
                const currentSY = syData.find(sy => sy.isCurrent);
                if (currentSY) setSelectedSchoolYear(currentSY.id);

                const activeSem = semData.find(sem => sem.isActive);
                if (activeSem) setSelectedSemester(activeSem.id);

                setLoading(false);
            } else {
                setError('Failed to load initial data');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const sessionToken = sessionManager.getSessionToken();
            // Use existing endpoint that might support filtering or fetch all and filter client side if necessary
            // Ideally passing query params
            const response = await fetch(`${API_BASE_URL}/schedules?schoolYearId=${selectedSchoolYear}&semesterId=${selectedSemester}`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            } else {
                setError('Failed to fetch schedules');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSchedule({
            ...currentSchedule,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const sessionToken = sessionManager.getSessionToken();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/schedules/${currentSchedule.id}`
            : `${API_BASE_URL}/schedules`;

        // Ensure we use the selected filters for new schedules if not explicitly set in form (though form should have them)
        const payload = { ...currentSchedule };
        if (!payload.schoolYearId) payload.schoolYearId = selectedSchoolYear;
        if (!payload.semesterId) payload.semesterId = selectedSemester;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowModal(false);
                fetchSchedules();
                resetForm();
            } else {
                const data = await response.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Error saving schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        setCurrentSchedule(schedule);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;

        const sessionToken = sessionManager.getSessionToken();
        try {
            const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                fetchSchedules();
            } else {
                alert('Failed to delete schedule');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const resetForm = () => {
        setCurrentSchedule({
            subjectId: '',
            schoolYearId: selectedSchoolYear,
            semesterId: selectedSemester,
            dayOfWeek: '',
            startTime: '',
            endTime: '',
            room: '',
            maxStudents: 40,
            isActive: true
        });
        setIsEditing(false);
    };

    // Helper to get names
    const getSubjectCode = (id) => subjects.find(s => s.id === id)?.code || id;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Schedules</h2>
                <div className="d-flex gap-3">
                    <select
                        className="form-select"
                        value={selectedSchoolYear}
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}
                    >
                        <option value="">Select School Year</option>
                        {schoolYears.map(sy => (
                            <option key={sy.id} value={sy.id}>{sy.year}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                            <option key={sem.id} value={sem.id}>{sem.name}</option>
                        ))}
                    </select>

                    <button
                        className="btn btn-primary text-nowrap"
                        onClick={() => { resetForm(); setShowModal(true); }}
                        disabled={!selectedSchoolYear || !selectedSemester}
                    >
                        <i className="fas fa-plus me-2"></i> Add Schedule
                    </button>
                </div>
            </div>

            {loading && <div className="text-center"><div className="spinner-border"></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Slots</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map(sched => (
                                    <tr key={sched.id}>
                                        <td>{getSubjectCode(sched.subjectId)}</td>
                                        <td>{sched.dayOfWeek}</td>
                                        <td>{sched.startTime} - {sched.endTime}</td>
                                        <td>{sched.room}</td>
                                        <td>{sched.currentEnrolled} / {sched.maxStudents}</td>
                                        <td>{sched.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(sched)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(sched.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {schedules.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="7" className="text-center">No schedules found for selected Year/Semester</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Subject</label>
                                            <select
                                                className="form-select"
                                                name="subjectId"
                                                value={currentSchedule.subjectId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(sub => (
                                                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">School Year</label>
                                            <select
                                                className="form-select"
                                                name="schoolYearId"
                                                value={currentSchedule.schoolYearId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select School Year</option>
                                                {schoolYears.map(sy => (
                                                    <option key={sy.id} value={sy.id}>{sy.year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Semester</label>
                                            <select
                                                className="form-select"
                                                name="semesterId"
                                                value={currentSchedule.semesterId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Semester</option>
                                                {semesters.map(sem => (
                                                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Day</label>
                                            <select
                                                className="form-select"
                                                name="dayOfWeek"
                                                value={currentSchedule.dayOfWeek}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Day</option>
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                                <option value="Saturday">Saturday</option>
                                                <option value="Sunday">Sunday</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Start Time</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="startTime"
                                                value={currentSchedule.startTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">End Time</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="endTime"
                                                value={currentSchedule.endTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Room</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="room"
                                                value={currentSchedule.room}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Max Students</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="maxStudents"
                                                value={currentSchedule.maxStudents}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="isActive"
                                            id="isActive"
                                            checked={currentSchedule.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Schedule'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSchedules;
