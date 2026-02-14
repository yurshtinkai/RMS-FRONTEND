import React, { } from 'react';


function ViewAssessment ({assessment}) {
    const assessedStudents = assessment ? assessment.filter(reg => reg.status === 'assessed') : [];
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Assessed Students</h2>
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Assessment List</h4>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Search..." disabled = {!isRegistrar}/>
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3 ms-auto">
                            <select className="form-select" disabled = {!isRegistrar}>
                                <option>2024-2025 Summer</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID No.</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Course</th>
                                    <th>Enrollment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assessedStudents.length > 0 ? assessedStudents.map(reg => (
                                    <tr key={reg.id}>
                                        <td>{reg.regNo}</td>
                                        <td>{reg.name}</td>
                                        <td>{reg.gender}</td>
                                        <td>{reg.course}</td>
                                        <td>{reg.enrollmentdate}</td>
                                        <td>
                                            <button className="btn btn-sm btn-info">
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No assessed students found.</td>
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

export default ViewAssessment;