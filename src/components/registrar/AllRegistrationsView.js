import React, { useState } from 'react';

function AllRegistrationsView({ registrations, setRegistrations }) {
    const [activeTab, setActiveTab] = useState('pending');
    const userRole = localStorage.getItem('userRole');
    const isRegistrar = userRole === 'registrar';

    const handleUpdateStatus = (id, newStatus) => {
    if (userRole !== 'accounting') {
        
        return;
    }
    setRegistrations(regs =>
        regs.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)
    );
};

    const filteredRegistrations = registrations.filter(reg => reg.status === activeTab);
    return (
        <div className="container-fluid"><h2 className="mb-2">All Registrations</h2><div className="card shadow-sm"><div className="card-header bg-white"><div className="d-flex flex-wrap align-items-center"><h4 className="card-title mb-0 me-3">Registration List</h4><ul className="nav nav-pills">
            <li className="nav-item">
                <button
                    className={`button-link pending-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}>
                    Pending ({registrations.filter(r => r.status === 'pending').length})
                </button>
            </li>
            <li className="nav-item">
                <button
                    className={`button-link approved-btn ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approved')}>
                    Approved ({registrations.filter(r => r.status === 'approved').length})
                </button>
            </li>
            <li className="nav-item">
                <button
                    className={`button-link rejected-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}>
                    Rejected ({registrations.filter(r => r.status === 'rejected').length})
                </button>
            </li>
        </ul></div></div><div className="card-body">
            <div className="row mb-3"><div className="col-md-6"><div className="input-group"><input type="text" className="form-control" placeholder="Search..." disabled={isRegistrar}/><button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div><div className="col-md-3 ms-auto"><select className="form-select" disabled={isRegistrar}><option>2024-2025 Summer</option></select></div></div>
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}><table className="table table-hover">
                <thead className="table-light sticky-top"><tr><th>Reg. No.</th><th>Name</th><th>Date of Registration</th><th>Actions</th></tr></thead>
                <tbody>{filteredRegistrations.length > 0 ? filteredRegistrations.map(reg => (<tr key={reg.id}><td>{reg.regNo}</td><td>{reg.name}</td><td>{reg.date}</td><td>
                    {activeTab === 'pending' && (<><button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(reg.id, 'approved')}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(reg.id, 'rejected')}>Reject</button></>)}
                    {activeTab === 'approved' && <span className="text-success">Approved</span>}
                    {activeTab === 'rejected' && <span className="text-danger">Rejected</span>}
                </td></tr>)) : (<tr><td colSpan="4" className="text-center text-muted">No matching records found.</td></tr>)}</tbody>
            </table></div>
        </div></div></div>
    );
}
export default AllRegistrationsView;
