import React, { useState } from 'react';
import { createDummySchoolYears, getLegacySubjects, getLegacyStudents } from '../../data/dummyData';

// This is a custom hook for simulating a searchable dropdown
const useSearchableDropdown = (items) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = items.filter(item =>
        `${item.code} ${item.description}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return { searchTerm, setSearchTerm, isOpen, setIsOpen, filteredItems };
};

function EncodeEnrollmentView({ onEncodeStudent }) {
    const [schoolYears] = useState(createDummySchoolYears());
    const [allSubjects] = useState(getLegacySubjects());
    const [legacyStudents] = useState(getLegacyStudents());

    const [selectedSchoolYear, setSelectedSchoolYear] = useState('2024 - 2025 1st Semester');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [encodedStudents, setEncodedStudents] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStudentId, setModalStudentId] = useState('');
    const [modalGrade, setModalGrade] = useState('');
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';

    const subjectDropdown = useSearchableDropdown(allSubjects);

    const handleSelectSubject = (subject) => {
        setSelectedSubject(subject);
        subjectDropdown.setIsOpen(false);
        subjectDropdown.setSearchTerm(`${subject.code} ${subject.description}`);
        setEncodedStudents([]);
    };

    const handleAddStudent = () => {
        if (!modalStudentId || !modalGrade) {
            alert('Please provide a Student ID and a Grade.');
            return;
        }

        if (encodedStudents.some(s => s.id === modalStudentId)) {
            alert('This student has already been encoded for this subject.');
            return;
        }

        const studentToAdd = legacyStudents.find(s => s.id === modalStudentId);
        if (!studentToAdd) {
            alert('Student ID not found in legacy records.');
            return;
        }

        const newEncodedStudent = {
            ...studentToAdd,
            grade: modalGrade,
        };

        setEncodedStudents(prev => [...prev, newEncodedStudent]);
        
        onEncodeStudent(newEncodedStudent);

        setIsModalOpen(false);
        setModalStudentId('');
        setModalGrade('');
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Encode Enrollment</h2>
                <span className="text-muted fw-bold">ENROLLMENTS / ENCODE ENROLLMENTS</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label">School Year & Semester</label>
                            <select className="form-select" value={selectedSchoolYear} onChange={e => setSelectedSchoolYear(e.target.value)} disabled = {!isRegistrar}>
                                {schoolYears.map(sy => (
                                    <option key={sy.id} value={`${sy.schoolYear} ${sy.semester}`}>{sy.schoolYear} {sy.semester}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Subjects</label>
                            <div className="dropdown">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Subjects..."
                                    disabled = {!isRegistrar}
                                    value={subjectDropdown.searchTerm}
                                    onChange={e => subjectDropdown.setSearchTerm(e.target.value)}
                                    onFocus={() => subjectDropdown.setIsOpen(true)}
                                    onBlur={() => setTimeout(() => subjectDropdown.setIsOpen(false), 200)}
                                />
                                {subjectDropdown.isOpen && (
                                    <div className="dropdown-menu show w-100" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                        {subjectDropdown.filteredItems.map(subject => (
                                            <button key={subject.id} className="dropdown-item" type="button" onClick={() => handleSelectSubject(subject)}>
                                                {subject.code} - {subject.description}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Students</h5>
                        <button 
                            className="btn btn-primary rounded-circle" 
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedSubject}
                            title="Add Student"
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div className="table-responsive" style={{ minHeight: '300px' }}>
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Grade</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {encodedStudents.length > 0 ? encodedStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.grade}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-danger" title="Remove">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-5">No students added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Student to {selectedSubject?.code}</h5>
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Student ID/Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={modalStudentId}
                                        onChange={e => setModalStudentId(e.target.value)}
                                        placeholder="Search by ID..."
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Grade</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={modalGrade}
                                        onChange={e => setModalGrade(e.target.value)}
                                        placeholder="Enter final grade..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddStudent}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EncodeEnrollmentView;