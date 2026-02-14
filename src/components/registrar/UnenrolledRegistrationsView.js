import React from 'react';
import { useNavigate } from 'react-router-dom';

function UnenrolledRegistrationsView({ registrations, onEnrollStudent }) {
    const navigate = useNavigate();
    const unenrolledStudents = registrations.filter(reg => reg.status === 'approved');
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';
    const handleEnrollClick = (student) => {
  if (userRole !== 'registrar') {
    // onClick={() => handleEnrollClick(reg)}
    return;
  }
  onEnrollStudent(student);
  navigate('/registrar/enrollment/new');
};

    return (
        <div className="container-fluid"><h2 className="mb-2">Unenrolled Registrations</h2><div className="card shadow-sm"><div className="card-header bg-white"><h4 className="card-title mb-0">Registration List</h4></div><div className="card-body">
            <div className="row mb-3"><div className="col-md-6"><div className="input-group"><input type="text" className="form-control" placeholder="Search..." disabled={!isRegistrar}/><button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div><div className="col-md-3 ms-auto"><select className="form-select"><option>2024-2025 Summer</option></select></div></div>
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                <table className="table table-hover">
                    <thead className="table-light sticky-top"><tr><th>Reg. No.</th><th>Name</th><th>Date of Registration</th><th>Actions</th></tr></thead>
                    <tbody>{unenrolledStudents.length > 0 ? unenrolledStudents.map(reg => (<tr key={reg.id}><td>{reg.regNo}</td><td>{reg.name}</td><td>{reg.date}</td>
                        <td><button className="btn btn-sm btn-primary" onClick={() => handleEnrollClick(reg)}><i className="fas fa-pencil-alt"></i></button></td>
                    </tr>)) : (<tr><td colSpan="4" className="text-center text-muted">No unenrolled students found.</td></tr>)}</tbody>
                </table>
            </div>
        </div></div></div>
    );
}
export default UnenrolledRegistrationsView;

