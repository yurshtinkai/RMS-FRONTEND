import React, { useState } from 'react';
import { createDummySchoolYears } from '../../data/dummyData';

function SchoolYearSemesterView() {
    const [schoolYears] = useState(createDummySchoolYears());

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Current':
                return 'bg-success';
            case 'Open':
                return 'bg-warning text-dark';
            case 'Closed':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">School Year & Semester</h2>
                <span className="text-muted">SCHOOL YEARS / ALL</span>
            </div>

            {/* Main Card */}
            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">School Year & Semester List</h4>
                    <button className="btn btn-primary">
                        <i className="fas fa-plus me-1"></i> Create
                    </button>
                </div>
                <div className="card-body">
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>School Year</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schoolYears.map(sy => (
                                    <tr key={sy.id}>
                                        <td>{sy.schoolYear}</td>
                                        <td>{sy.semester}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sy.status)}`}>{sy.status}</span>
                                        </td>
                                        {/* FIX: Replaced the 'Set as Current' button with View and Edit icon buttons */}
                                        <td>
                                            <button className="btn btn-sm btn-outline-info me-2" title="View">
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-primary" title="Edit">
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchoolYearSemesterView;