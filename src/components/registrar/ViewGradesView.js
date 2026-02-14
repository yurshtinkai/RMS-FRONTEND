import React, { useState, useEffect } from 'react';
import { createDummyGradingData } from '../../data/dummyData';

function ViewGradesView() {
    // State for the entire data structure, selected teacher, and subject
    const [gradingData] = useState(createDummyGradingData());
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // State derived from selections
    const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [students, setStudents] = useState([]);
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';

    // Effect to update subjects when a teacher is selected
    useEffect(() => {
        if (selectedTeacherId) {
            const teacher = gradingData.find(t => t.id.toString() === selectedTeacherId);
            setSubjectsForTeacher(teacher ? teacher.subjects : []);
            // Reset subject and student list when teacher changes
            setSelectedSubjectId('');
            setSchedule('');
            setStudents([]);
        } else {
            // Clear everything if no teacher is selected
            setSubjectsForTeacher([]);
            setSelectedSubjectId('');
            setSchedule('');
            setStudents([]);
        }
    }, [selectedTeacherId, gradingData]);

    // Effect to update schedule and students when a subject is selected
    useEffect(() => {
        if (selectedSubjectId) {
            const subject = subjectsForTeacher.find(s => s.id.toString() === selectedSubjectId);
            if (subject) {
                setSchedule(subject.schedule);
                setStudents(subject.students);
            }
        } else {
            setSchedule('');
            setStudents([]);
        }
    }, [selectedSubjectId, subjectsForTeacher]);


    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">View Grades</h2>
                <span className="text-muted fw-bold">REGISTRAR / GRADES</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    {/* Filter Dropdowns */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label">Select a Teacher</label>
                            <select 
                                className="form-select" 
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                // disabled={!selectedTeacherId}
                                disabled = {!isRegistrar}
                            >
                                <option value="">-- Select Teacher --</option>
                                {gradingData.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Select a Subject</label>
                            <select 
                                className="form-select"
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                // disabled={!selectedTeacherId}
                                disabled = {!isRegistrar}
                            >
                                <option value="">--- Select Subject ---</option>
                                {subjectsForTeacher.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Select a Schedule</label>
                            <select className="form-select" value={schedule} disabled = {!isRegistrar}>
                                <option>{schedule || '-- Select Subject First --'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                        <p className="text-muted">{students.length} of {students.length}</p>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Prelims</th>
                                    <th>Midterms</th>
                                    <th>Final Midterm Grade</th>
                                    <th>Finals</th>
                                    <th>Final Grade</th>
                                    {/* FIX: Removed Action header */}
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        {/* FIX: Changed inputs to be read-only for viewing purposes */}
                                        <td><input type="text" className="form-control-plaintext form-control-sm text-center" value={student.grades.prelims || '--'} readOnly /></td>
                                        <td><input type="text" className="form-control-plaintext form-control-sm text-center" value={student.grades.midterms || '--'} readOnly /></td>
                                        <td><input type="text" className="form-control-plaintext form-control-sm text-center" value={student.grades.finalMidterm || '--'} readOnly /></td>
                                        <td><input type="text" className="form-control-plaintext form-control-sm text-center" value={student.grades.finals || '--'} readOnly /></td>
                                        <td><input type="text" className="form-control-plaintext form-control-sm text-center" value={student.grades.final || '--'} readOnly /></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        {/* FIX: Adjusted colSpan since Action column was removed */}
                                        <td colSpan="7" className="text-center text-muted py-5">Please select a teacher and subject to view students.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewGradesView;