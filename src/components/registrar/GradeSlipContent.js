import React from 'react';
import { getDummyGradesForSemester } from '../../data/dummyData';
import './PrintGradeSlip.css'; // We'll reuse the same CSS

// Use React.forwardRef to allow the parent to get a ref to the component's DOM node
const GradeSlipContent = React.forwardRef(({ request, student }, ref) => {
    if (!request || !student) return null;

    const grades = getDummyGradesForSemester();
    const totalUnits = grades.reduce((sum, subject) => sum + subject.units, 0);

    return (
        <div ref={ref} id="grade-slip-printable-area" className="grade-slip-container">
            <div className="header">
                <h4>BENEDICTO COLLEGE</h4>
                <p>A.S. Fortuna St, Mandaue City, Cebu</p>
                <h5>FINAL GRADE</h5>
            </div>
            <div className="student-info">
                <div><strong>Student Name:</strong> {student.studentDetails?.fullName || 'N/A'}</div>
                <div><strong>Student ID:</strong> {student.idNumber}</div>
                <div><strong>Course:</strong> {student.studentDetails?.course?.name || 'N/A'}</div>
                <div><strong>S.Y. / Semester:</strong> {request.schoolYear} / {request.semester}</div>
            </div>
            <table className="grades-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Description</th>
                        <th>Units</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map((subject, index) => (
                        <tr key={index}>
                            <td>{subject.code}</td>
                            <td>{subject.description}</td>
                            <td>{subject.units}</td>
                            <td>{subject.grade}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2" className="text-right"><strong>Total Units:</strong></td>
                        <td colSpan="2"><strong>{totalUnits}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div className="footer">
                <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                <div className="signature">
                    <p>_________________________</p>
                    <p>Registrar's Signature</p>
                </div>
            </div>
        </div>
    );
});

export default GradeSlipContent;