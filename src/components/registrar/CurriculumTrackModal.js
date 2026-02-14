import React from 'react';
import './CurriculumTrackModal.css';

function CurriculumTrackModal({ studentName, curriculum, takenSubjects, onClose }) {
  const isSubjectTaken = (subjectCode) => {
    return takenSubjects.find(s => s.code === subjectCode);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content curriculum-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">Curriculum Track: {studentName}</h4>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body curriculum-body">
          {Object.keys(curriculum).length > 0 ? (
            Object.entries(curriculum).map(([semester, subjects]) => (
              <div key={semester} className="card semester-card">
                <div className="card-header semester-header">
                  {semester}
                </div>
                <div className="card-body">
                  <table className="table table-sm table-borderless curriculum-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th className="text-center">Units</th>
                        <th className="text-center">Grade</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(subject => {
                        const takenInfo = isSubjectTaken(subject.code);
                        return (
                          <tr key={subject.code}>
                            <td>{subject.code}</td>
                            <td>{subject.description}</td>
                            <td className="text-center">{subject.units}</td>
                            <td className="text-center">{takenInfo ? takenInfo.finalGrade : '--'}</td>
                            <td className="text-center">
                              {takenInfo ? (
                                <span className="badge bg-success">TAKEN</span>
                              ) : (
                                <span className="badge bg-secondary">PENDING</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No curriculum information available for this course.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurriculumTrackModal;