import React from 'react';

// A helper function to process the student data and generate statistics
const processStudentData = (students) => {
  const departmentMapping = {
    'BSIT': 'College of Computer Studies',
    'BSCS': 'College of Computer Studies',
    'BSBA-HRDM': 'College of Business Registrar',
    'BSED-EN': 'College of Education',
    'BS-ARCH': 'College of Architecture',
  };

  const stats = {};

  students.forEach(student => {
    const department = departmentMapping[student.course] || 'Other';
    const course = student.course;
    // For this demo, we'll assume all are "First Year".
    // This could be enhanced later if you have year level data.
    const yearLevel = 'First Year';

    // Initialize department if it doesn't exist
    if (!stats[department]) {
      stats[department] = {
        total: 0,
        courses: {}
      };
    }

    // Initialize course if it doesn't exist
    if (!stats[department].courses[course]) {
      stats[department].courses[course] = {};
    }

    // Initialize year level if it doesn't exist
    if (!stats[department].courses[course][yearLevel]) {
      stats[department].courses[course][yearLevel] = {
        male: 0,
        female: 0,
        total: 0,
      };
    }

    // Increment counts
    stats[department].total++;
    stats[department].courses[course][yearLevel].total++;
    if (student.gender.toLowerCase() === 'male') {
      stats[department].courses[course][yearLevel].male++;
    } else {
      stats[department].courses[course][yearLevel].female++;
    }
  });

  return stats;
};


function DashboardView({ enrolledStudents }) {
  const statistics = processStudentData(enrolledStudents);

  const departmentColors = {
    'College of Computer Studies': 'bg-primary',
    'College of Business Registrar': 'bg-success',
    'College of Education': 'bg-info',
    'College of Architecture': 'bg-warning text-dark',
    'Other': 'bg-secondary'
  };

  return (
    // FIX: Added a container to manage the dashboard layout and scrolling
    <div className="dashboard-view-container">
      {/* This is the non-scrolling header section */}
      <div className="dashboard-header">
        <h2 className="mb-4">Enrollment Dashboard</h2>

        {/* Overall Statistics Cards */}
        <div className="row mb-4">
          {Object.keys(statistics).length > 0 ? (
            Object.keys(statistics).map(department => (
              <div className="col-md-6 col-xl-3 mb-4" key={department}>
                <div className={`card text-white h-100 ${departmentColors[department] || 'bg-dark'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-0">{department}</h5>
                        <small>Total Enrolled</small>
                      </div>
                      <div className="display-4 fw-bold">
                        {statistics[department].total}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">No students have been enrolled yet to display statistics.</div>
            </div>
          )}
        </div>
        <h4 className="mb-3">Detailed Breakdown by Course</h4>
      </div>

      {/* FIX: This container will hold the scrollable detailed breakdown */}
      <div className="dashboard-details-container">
        <div className="row">
          {Object.keys(statistics).map(department => (
              Object.keys(statistics[department].courses).map(course => (
                <div className="col-md-6 col-lg-4 mb-4" key={course}>
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">{course}</h5>
                      <small className="text-muted">{department}</small>
                    </div>
                    <div className="card-body">
                      {Object.keys(statistics[department].courses[course]).map(yearLevel => (
                        <div key={yearLevel}>
                          <h6 className="card-title">{yearLevel}</h6>
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Total Students
                              <span className="badge bg-primary rounded-pill">{statistics[department].courses[course][yearLevel].total}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Male
                              <span className="badge bg-light text-dark rounded-pill">{statistics[department].courses[course][yearLevel].male}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              Female
                              <span className="badge bg-light text-dark rounded-pill">{statistics[department].courses[course][yearLevel].female}</span>
                            </li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardView;