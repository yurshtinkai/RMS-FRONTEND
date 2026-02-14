import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

// The generateDocumentContent function remains the same and is omitted for brevity...
const generateDocumentContent = async (request) => {
    if (!request) return '';

    // Initialize with default data
    let personalInfo = { 
        civilStatus: 'Single', 
        dateOfBirth: 'January 23, 2006', 
        placeOfBirth: 'Mandaue City, Cebu', 
        parentGuardian: 'Maria Dela Cruz', 
        permanentAddress: 'Sangi, Cal-oocan, Mandaue City', 
        previousSchool: 'Mandaue City Science High School' 
    };
    
    let educationalData = { 
        elementary: { name: 'Mabolo Elementary School', year: '2018' }, 
        secondary: { name: 'Cebu Eastern College', year: '2022' }, 
        shs: { name: 'Cabancalan National High School', year: '2022' }, 
        tertiary: { name: 'Cebu Eastern College', year: '2025' } 
    };
    
    // Default grades data with empty grades for manual input
    let gradesData = [
        { semester: 'First Year, First Semester', year: '2024-2025', subjects: [ { code: 'IT 111', desc: 'Introduction to Computing', grade: '', units: 3 }, { code: 'GE 1', desc: 'Understanding the Self', grade: '', units: 3 }, { code: 'FIL 1', desc: 'Komunikasyon sa Akademikong Filipino', grade: '', units: 3 }, { code: 'NSTP 1', desc: 'National Service Training Program 1', grade: '', units: 3 } ]},
        { semester: 'First Year, Second Semester', year: '2024-2025', subjects: [ { code: 'IT 121', desc: 'Computer Programming 1', grade: '', units: 3 }, { code: 'IT 122', desc: 'Data Structures and Algorithms', grade: '', units: 3 }, { code: 'GE 5', desc: 'Purposive Communication', grade: '', units: 3 }, { code: 'NSTP 2', desc: 'National Service Training Program 2', grade: '', units: 3 } ]}
    ];
    
    // Variables to store fetched student data
    let studentData = null;
    let enrolledSubjectsData = null;
    
    // Fetch real student data if studentId is available
    if (request.studentId) {
        try {
            console.log('🔍 Fetching real student data for studentId:', request.studentId);
            
            // Fetch basic student data
            const studentResponse = await fetch(`${API_BASE_URL}/students/${request.studentId}`, {
                headers: { 'X-Session-Token': getSessionToken() }
            });
            
            if (studentResponse.ok) {
                studentData = await studentResponse.json();
                console.log('👤 Student data:', studentData);
            }
            
            // Fetch student registration data
            const registrationResponse = await fetch(`${API_BASE_URL}/students/registration/${request.studentId}`, {
                headers: { 'X-Session-Token': getSessionToken() }
            });
            
            if (registrationResponse.ok) {
                const registrationData = await registrationResponse.json();
                console.log('📋 Registration data:', registrationData);
                
                // Update personal info with real data
                personalInfo = {
                    civilStatus: registrationData.civilStatus || 'Single',
                    dateOfBirth: registrationData.dateOfBirth || 'N/A',
                    placeOfBirth: registrationData.placeOfBirth || 'N/A',
                    parentGuardian: registrationData.parentGuardian || 'N/A',
                    permanentAddress: registrationData.permanentAddress || 'N/A',
                    previousSchool: registrationData.previousSchool || 'N/A'
                };
                
                // Update educational data with real data
                educationalData = {
                    elementary: { 
                        name: registrationData.elementarySchool || 'N/A', 
                        year: registrationData.elementaryYear || 'N/A' 
                    },
                    secondary: { 
                        name: registrationData.secondarySchool || 'N/A', 
                        year: registrationData.secondaryYear || 'N/A' 
                    },
                    shs: { 
                        name: registrationData.shsSchool || 'N/A', 
                        year: registrationData.shsYear || 'N/A' 
                    },
                    tertiary: { 
                        name: 'Benedicto College - Mandaue City', 
                        year: registrationData.schoolYear || '2024-2025' 
                    }
                };
                
                // For GRADE SLIP and TOR requests, fetch enrolled subjects with empty grades
                if (request.documentType === 'GRADE SLIP' || request.documentType === 'TOR') {
                    const subjectsResponse = await fetch(`${API_BASE_URL}/students/enrolled-subjects/${request.studentId}`, {
                        headers: { 'X-Session-Token': getSessionToken() }
                    });
                    
                    if (subjectsResponse.ok) {
                        enrolledSubjectsData = await subjectsResponse.json();
                        console.log('📚 Subjects data:', enrolledSubjectsData);
                        
                        // Transform the data to match the expected format with empty grades for manual input
                        gradesData = [{
                            semester: `${registrationData.yearLevel || 'N/A'}, ${registrationData.semester || 'N/A'}`,
                            year: registrationData.schoolYear || '2024-2025',
                            subjects: enrolledSubjectsData.subjects ? enrolledSubjectsData.subjects.map(subject => ({
                                code: subject.courseCode || 'N/A',
                                desc: subject.courseTitle || 'N/A', 
                                grade: '', // Empty grade for manual input by registrar
                                units: subject.units || 0
                            })) : []
                        }];
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching real student data:', error);
            // Fall back to dummy data if API call fails
        }
    }
    const diplomaDetails = { dean: "JAYPEE Y. ZOILO, DBA", schoolDirector: "RANULFO L. VISAYA JR., DevEdD.", registrar: "WENELITO M. LAYSON", president: "LILIAN BENEDICTO-HUAN", graduationDate: "this 26th day of May 2022", specialOrder: "No. 30-346201-0196, s. 2022 dated December 15, 2022" };

    // Helper variables - use real data if available
    let studentName = 'Juan Dela Cruz';
    let studentIdNumber = 'N/A';
    let studentCourse = 'Bachelor of Science in Information Technology';
    let studentGender = '';
    let studentCivilStatus = 'Single';
    let studentDateOfBirth = 'N/A';
    let studentPlaceOfBirth = 'N/A';
    let studentCitizenship = 'Filipino';
    let studentParentGuardian = 'N/A';
    let studentPermanentAddress = 'N/A';
    let studentEntranceData = 'N/A';
    
    // Helper function to format name with middle initial for diploma
    const formatNameForDiploma = (name) => {
        if (!name) return '';
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 3) {
            // Format: FirstName MiddleInitial. LastName
            const firstName = nameParts.slice(0, -2).join(' ');
            const middleInitial = nameParts[nameParts.length - 2] ? nameParts[nameParts.length - 2].charAt(0) + '.' : '';
            const lastName = nameParts[nameParts.length - 1];
            return `${firstName} ${middleInitial} ${lastName}`.trim();
        }
        return name;
    };
    
    // Use request.student data if available, otherwise use registration data
    if (request.student) {
        studentName = `${request.student.firstName} ${request.student.middleName || ''} ${request.student.lastName}`.trim();
        studentIdNumber = request.student.idNumber || 'N/A';
        studentCourse = request.student.studentDetails?.course?.name || 'Bachelor of Science in Information Technology';
    }
    
    // If we have registration data, use it to override with more complete information
    if (request.studentId) {
        try {
            const registrationResponse = await fetch(`${API_BASE_URL}/students/registration/${request.studentId}`, {
                headers: { 'X-Session-Token': getSessionToken() }
            });
            
            if (registrationResponse.ok) {
                const registrationData = await registrationResponse.json();
                
                // Override with registration data for more complete information
                studentName = `${registrationData.firstName || ''} ${registrationData.middleName || ''} ${registrationData.lastName || ''}`.trim() || studentName;
                studentIdNumber = registrationData.idNumber || studentIdNumber;
                studentCourse = registrationData.course || studentCourse;
                studentGender = registrationData.gender || '';
                studentCivilStatus = registrationData.civilStatus || 'Single';
                studentDateOfBirth = registrationData.dateOfBirth || 'N/A';
                studentPlaceOfBirth = registrationData.placeOfBirth || 'N/A';
                studentCitizenship = registrationData.citizenship || 'Filipino';
                studentParentGuardian = registrationData.parentGuardian || 'N/A';
                studentPermanentAddress = registrationData.permanentAddress || 'N/A';
                studentEntranceData = registrationData.entranceData || 'N/A';
            }
        } catch (error) {
            console.error('Error fetching additional student data:', error);
        }
    }
    
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const academicYear = '2024-2025';

    switch (request.documentType.toUpperCase()) {
        
        case 'GOOD MORAL FOR GRADUATES':
            return `
                <style>
                    .good-moral-preview, .good-moral-preview * { font-family: Arial, sans-serif !important; }
                    .good-moral-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .good-moral-preview .footer-row {
                        display: flex;
                        align-items: center;
                        margin-top: 8%;
                    }
                    .good-moral-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 5px; box-sizing: border-box; }
                    .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                    }
                    .good-moral-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 10px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 30px 8px 80px 8px;
                    }
                    .good-moral-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .good-moral-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .good-moral-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 10px; font-size: 12pt; text-align: justify; }
                    .good-moral-preview .signature-block { margin-top: 80px; text-align: center; padding: 85px; }
                    .good-moral-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 85px; }
                </style>
                <div class="good-moral-preview">
                    <div class="header-row">
                        <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title">CERTIFICATE OF GOOD MORAL CHARACTER</div>
                            <p class="date">${today}</p>
                            <p class="body-text">This is to certify that <b>${studentName}</b>, was graduate of the degree of <b>${studentCourse}</b> on "Date Here" with Special
                            Order No. 50-5140101-0135 s. 2025 issued by the Commission on Higher Education on ${today}</p>

                            <p class="body-text1">During his/her stay in Benedicto College, he/she did not commit any infraction against the school's
                            rules and regulations nor was he/she involved in any immoral illegal activity that would mar his/her reputation as a person.</p>

                            <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>
                            <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                        </div>
                        <div class="footer-note">Not valid without School Dry Seal</div>
                    </div>
                    <div class="footer-row">
                            <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                </div>
            `;
    case 'GOOD MORAL FOR NON-GRADUATES':
            return `
                <style>
                    .good-moral-preview, .good-moral-preview * { font-family: Arial, sans-serif !important; }
                    .good-moral-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .good-moral-preview .footer-row {
                        display: flex;
                        align-items: center;
                        margin-top: 13%;
                    }
                    .good-moral-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 5px; box-sizing: border-box; }
                    .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                    }
                    .good-moral-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 20px 20px 80px 20px;
                    }
                    .good-moral-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .good-moral-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .good-moral-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .good-moral-preview .signature-block {margin-top: 28%; text-align: center; width: 350px; margin-left: auto; margin-right: 0; padding: 0;}
                    .good-moral-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 25%; }
                </style>
                <div class="good-moral-preview">
                    <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title">CERTIFICATE OF GOOD MORAL CHARACTER</div>
                            <p class="date">${today}</p>
                            <p class="body-text">This is to certify that <b>${studentName}</b>, was enrolled in the <b>${studentCourse}</b> during the
                            first semester of School Year Here</p>

                            <p class="body-text1">During his/her stay in Benedicto College, he/she did not commit any infraction against the school's
                            rules and regulations nor was he/she involved in any immoral illegal activity that would mar his/her reputation as a person.</p>

                            <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>
                            <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                            <div class="footer-note">***Not valid Without <br>
                            School Dry Seal***</div>
                        </div>
                    </div>
                    <div class="footer-row">
                        <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                </div>
            `;

        case 'GRADE SLIP':
            const currentSemesterGrades = gradesData[0];
            let totalUnits = 0;
            const rowsHtml = currentSemesterGrades.subjects.map(sub => {
                const units = Number(sub.units) || 0;
                totalUnits += units;
                const lec = units >= 4 ? 3 : units; // simple split similar to many curricula
                const lab = units >= 4 ? units - 3 : 0;
                return `<tr>
                            <td class="text-center">${sub.code}</td>
                            <td>${sub.desc}</td>
                            <td class="text-center">${lec}</td>
                            <td class="text-center">${lab}</td>
                            <td class="text-center">${sub.grade}</td>
                        </tr>`;
            }).join('');
            
            // Use real student data if available (already fetched above)
            let displayStudentName = studentName;
            let displayStudentId = studentIdNumber;
            let displayCourse = studentCourse;
            let displaySchoolYearSemester = `${currentSemesterGrades.year} / ${currentSemesterGrades.semester}`;
            
            // If we have real student data from the fetch above, use it
            if (request.studentId && studentData) {
                displayStudentName = `${studentData.firstName} ${studentData.middleName || ''} ${studentData.lastName}`.trim();
                displayStudentId = studentData.idNumber || 'N/A';
                displayCourse = studentData.course || 'Bachelor of Science in Information Technology';
                displaySchoolYearSemester = `${studentData.schoolYear || '2024-2025'} / ${studentData.yearLevel || 'First'} Year, ${studentData.semester || 'First'} Semester`;
            }
            return `
                <style>
                    /* Force Arial across the entire grade slip content */
                    .gradeslip-cert, .gradeslip-cert * { font-family: Arial, sans-serif !important; }
                    /* Add generous page margins for both screen and print */
                    .gradeslip-cert .print-container { 
                        width: 8.5in;
                        margin: 0 auto; 
                        padding: 0.5in;
                        box-sizing: border-box;
                    }
                    .gradeslip-cert .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 12px; box-sizing: border-box; }
                    @media print {
                        @page { margin: 0.5in; }
                        .gradeslip-cert .print-container { padding: 0.5in; }
                    }
                    .gradeslip-cert .header-row { display: flex; align-items: center; margin-bottom: 0; }
                    .gradeslip-cert .headerlogo img { width: 100%; height: 100%; }
                    .gradeslip-cert .footer-row { display: flex; align-items: center; margin-top: 13%; }
                    .gradeslip-cert .footerlogo img { width: 100%; height: 100%; }
                    .gradeslip-cert .cert-title { text-align: center; font-size: 20pt; font-weight: bold; margin: 18px 0 10px 0; letter-spacing: 2px; padding: 80px 20px 40px 20px; }
                    .gradeslip-cert .program-title { text-align: center; font-weight: bold; margin: 10px 0 15px 0; }
                    .gradeslip-cert .info { margin: 0 0 10px 0; }
                    .gradeslip-cert .grades-table { width: 100%; border-collapse: collapse; font-size: 12pt; }
                    .gradeslip-cert .grades-table th, .gradeslip-cert .grades-table td { border: 1px solid #000; padding: 6px 8px; }
                    .gradeslip-cert .grades-table th { text-align: center; }
                    .gradeslip-cert .text-center { text-align: center; }
                    .gradeslip-cert .totals-left { margin-top: 10px; font-size: 12pt; }
                    .gradeslip-cert .footer-note { margin-top: 15px; }
                    .gradeslip-cert .signature-block { margin-top: 40px; text-align: center; padding: 60px 85px 55px 85px; }
                    .gradeslip-cert .footer-note1 { font-size: 9pt; font-style: italic; margin-top: 25%; }
                </style>
                <div class="gradeslip-cert">
                    <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title">CERTIFICATION</div>
                            <p class="info"><strong>Student Name:</strong> ${displayStudentName}</p>
                            <p class="info"><strong>Student ID:</strong> ${displayStudentId}</p>
                            <p class="info"><strong>Course:</strong> ${displayCourse}</p>
                            <p class="info"><strong>School Year / Semester:</strong> ${displaySchoolYearSemester}</p>
                            <div class="program-title">BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY</div>
                            <table class="grades-table">
                                <thead>
                                    <tr>
                                        <th>Subject Code</th>
                                        <th>Descriptive Title</th>
                                        <th>Lec</th>
                                        <th>Lab</th>
                                        <th>Grades</th>
                                    </tr>
                                </thead>
                                <tbody>${rowsHtml}</tbody>
                            </table>
                            <div class="totals-left"><strong>Total Units:</strong> ${totalUnits}</div>
                            <p class="footer-note">This certification is issued upon the request of the above-mentioned student for <b>${request.purpose || 'scholarship/application'}</b> purposes only.</p>
                            <p class="footer-note">Issued this ${today} at Mandaue City, Cebu, Philippines.</p>
                            <div class="signature-block">
                                <div style="display:inline-block;text-align:center;">
                                    <p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p>
                                    <p style="margin:0;text-align:center;">School Registrar</p>
                                </div>
                            </div>
                        <div class="footer-note1">***Not valid Without <br>
                            School Dry Seal***</div>
                        </div>
                    </div>
                    <div class="footer-row">
                            <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                </div>
            `;
        case 'GWA CERTIFICATE':
            return `
                <style>
                    .gwaCert-preview, .gwaCert-preview * { font-family: Arial, sans-serif !important; }
                    .gwaCert-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .gwaCert-preview .footer-row {
                        display: flex;
                        align-items: center;
                        margin-top: 13%;
                    }
                    .gwaCert-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
                    .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                    }
                    .gwaCert-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 20px 20px 80px 20px;
                    }
                    .gwaCert-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .gwaCert-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .gwaCert-preview .signature-block { margin-top: 80px; text-align: center; padding: 85px; }
                    .gwaCert-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 25%; }
                </style>
                <div class="gwaCert-preview">
                    <div class="header-row">
                        <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title"><u>CERTIFICATION</u></div>
                            
                            <p class="body-text">This is to certify that according to the records available in this office, <b>${studentName}</b>, was conferred the degree <b>${studentCourse}</b> 
                            during the graduation ceremony help on "INSERT DATE HERE" with Special Order No. 50-5140101-0135 s. 2025 issued by the Commission on Higher Education on ${today}
                            at the Benedicto College, Inc., Mandaue City, Cebu. This is to certify further that she received a <b>General Weighted Average</b> of <b>"Insert Grade Here"</b></p>

                            <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>

                            <p class="body-text1">Issued on the "INSERT DATE HERE", at Mandaue City,Cebu.</p>
                            <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                            <div class="footer-note">***Not valid Without <br>
                            School Dry Seal***</div>
                            </div>
                        </div>
                        <div class="footer-row">
                        <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                    </div>
                </div>
            `;
        
        case 'TOR':
            const torCSS = `
        /* --- DEFAULT STYLES FOR ON-SCREEN PREVIEW --- */
        .tor-preview, .tor-preview * { font-family: Arial, sans-serif !important; box-sizing: border-box; }
        .tor-preview .print-container { 
            width: 8.5in; 
            margin: 0 auto; 
            padding: 0.5in; 
        }
        .tor-preview .header-row, .tor-preview .footer-row {
            width: 100%;
        }
        .tor-preview .headerlogo img, .tor-preview .footerlogo img { 
            width: 100%; 
            height: auto; 
        }
        .tor-preview .footer-row {
            margin-top: 50px; /* A reasonable margin for the screen view */
        }
        
        /* --- STYLES THAT ONLY APPLY WHEN PRINTING --- */
        @media print {
            .tor-preview .print-container {
                height: 12in; /* Usable area on 13in paper with 0.5in margins */
                display: flex;
                flex-direction: column;
            }
            .tor-preview .tor-content {
                flex-grow: 1; /* Makes content fill space between header and footer */
            }
            .tor-preview .footer-row {
                margin-top: 120px; /* Pushes footer to the bottom of the page */
            }
        }

        /* --- ALL OTHER DOCUMENT STYLES (UNCHANGED) --- */
        .tor-preview .title { text-align: center; font-weight: 800; font-size: 16pt; margin: 6px 0 10px 0; letter-spacing: 1px; text-transform: uppercase; }
        .tor-preview .meta-row { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 6px; }
        .tor-preview .section-title { text-align: center; font-weight: bold; font-size: 13pt; margin: 12px 0; color: #000; }
        .tor-preview table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .tor-preview th, .tor-preview td { border: 1px solid #000; padding: 4px 6px; }
        .tor-preview th { text-align: center; }
        .tor-preview .name-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 4px; padding-bottom: 2px; }
        .tor-preview .name-block { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .tor-preview .name-block .label { font-weight: bold; font-size: 9pt; }
        .tor-preview .name-block .value { font-weight: 800; font-size: 10pt; margin-top: 2px; }
        .tor-preview .pi-container { display: flex; gap: 12px; align-items: flex-start; }
        .tor-preview .pi-fields { flex: 1; }
        .tor-preview .pi-field { display: flex; gap: 6px; font-size: 10pt; margin: 2px 0; }
        .tor-preview .pi-field .label { width: 200px; }
        .tor-preview .separator { border-top: 2px solid #000; margin: 10px 0; }
        .tor-preview .grades-section { page-break-inside: avoid; margin-top: 8px; }
        .tor-preview .grading { display: flex; gap: 16px; }
        .tor-preview .grading .col { flex: 1; display: grid; grid-template-columns: 80px 120px 1fr; column-gap: 8px; row-gap: 2px; }
        .tor-preview .grading .cell { padding: 2px 0; font-size: 10pt; }
        .tor-preview .grading .head { font-weight: bold; }
        .tor-preview .notes { font-size: 9pt; margin-top: 8px; font-style: italic; }
        .tor-preview .remarks-flex { display: flex; justify-content: space-between; margin-top: 25px; font-size: 10pt; }
        .tor-preview .signatures { display: flex; justify-content: space-between; margin-top: 35px; }
        .tor-preview .signatures .block { width: 45%; text-align: center; }
        .tor-preview .signatures .label { text-align: left; font-size: 10pt; margin-bottom: 16px; }
        .tor-preview .signatures .name { font-weight: bold; margin-top: 65px; }
        .tor-preview .signatures .title { font-size: 8pt; margin-top: 2px; }
        .tor-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 25px; }
    `;
    // Helper to build TOR pages
    const buildTorPage = (pageNumber = 1) => {
        if (pageNumber === 2) {
            const torPage2HTML = `
                <div class="tor-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo"></div>
                        </div>

                        <div class="tor-content">
                            <div class="title">OFFICIAL TRANSCRIPT OF RECORDS</div>
                            <div class="meta-row"><div>Page 2</div><div>SCHOOL CODE: 7119</div></div>

                            <div style="display:flex; justify-content: space-between; font-size:10pt; margin:6px 0 10px 0;">
                                <div><strong>Name:</strong> ${studentName.toUpperCase()}</div>
                                <div><strong>I.D. No:</strong> ${studentIdNumber}</div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th style="text-align:left" colspan="4">Taken at Benedicto College - Mandaue City<br> Bachelor of Science in Information Technology</th>
                                    </tr>
                                    <tr>
                                        <th style="width:90px">Subject Code</th>
                                        <th>Description</th>
                                        <th style="width:80px">Grade</th>
                                        <th style="width:80px">Credit/s</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">2nd Semester 2022-2023</td></tr>
                                    <tr><td>IT 121</td><td>Computer Programming II</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 220</td><td>Object-Oriented Programming</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 221</td><td>Networking</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 222</td><td>Database Management</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>ACCTG</td><td>Fundamentals of Accounting</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">Summer 2022-2023</td></tr>
                                    <tr><td>IT 223</td><td>Information Management</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>ITEL 1</td><td>IT Track Elective</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>FILIT</td><td>The Philippine Society in the IT Era</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">1st Semester 2023-2024</td></tr>
                                    <tr><td>IT 211</td><td>Web Design & Development</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 310</td><td>Applications Development and Emerging Technologies</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 311</td><td>Operating Systems</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT ELEC 1</td><td>IT Elective I</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>ITTEL 2</td><td>IT Track Elective II</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>TECHNO</td><td>Technopreneurship</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>STAT</td><td>Statistics & Probability</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">2nd Semester 2023-2024</td></tr>
                                    <tr><td>IT 320</td><td>Systems Analysis & Design</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 321</td><td>Information Assurance & Security</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 322</td><td>Systems Integration & Architecture</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>MMG</td><td>Marketing Media Gamification</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT ELEC 2</td><td>IT Elective II</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">Summer 2023-2024</td></tr>
                                    <tr><td>IT 323</td><td>Capstone Project I</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 324</td><td>Social Issues and Professional Practices</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 325</td><td>Quantitative Methods</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">1st Semester 2024-2025</td></tr>
                                    <tr><td>IT 212</td><td>Digital Logic Design</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 213</td><td>PC Assembly & Troubleshooting</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 410</td><td>Capstone Project II</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT 411</td><td>Integrative Programming & Technologies</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>IT ELEC 3</td><td>IT Elective III</td><td class="text-center"></td><td class="text-center">3</td></tr>

                                    <tr><td colspan="4" style="font-weight:bold; text-align:center">2nd Semester 2024-2025</td></tr>
                                    <tr><td>IT 420</td><td>IT Seminars & Tours</td><td class="text-center"></td><td class="text-center">3</td></tr>
                                    <tr><td>OJT</td><td>On the Job Training (500 Hours)</td><td class="text-center"></td><td class="text-center">6</td></tr>

                                    <tr><td colspan="4" style="text-align:center; font-weight:bold;">GRADUATED: BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT) ON MAY 16, 2025.</td></tr>
                                </tbody>
                            </table>

                            <div class="notes" style="margin-top:10px;">This transcript is not valid if there is/are erasure(s) in the grades.</div>
                            <div class="remarks-flex">
                                <div><strong>REMARKS:</strong> FOR EVALUATION PURPOSES ONLY</div>
                                <div><strong>DATE ISSUED:</strong> ${today}</div>
                            </div>
                            <div class="signatures">
                                <div class="block">
                                    <div class="label">Prepared by:</div>
                                    <div class="name"><u>JUSTINE M. SUCGANG</u></div>
                                    <div class="title">Records-in-Charge</div>
                                </div>
                                <div class="block">
                                    <div class="label">Approved by:</div>
                                    <div class="name"><u>MARIA PERPETUA C. SAURA</u></div>
                                    <div class="title">School Registrar</div>
                                </div>
                            </div>
                            <div class="footer-note">Not valid without School Dry Seal &nbsp;&nbsp; OR NO.: 0158402</div>
                        </div>

                        <div class="footer-row">
                            <div class="footerlogo"><img src="/bcfooter.png" alt="Logo"></div>
                        </div>
                    </div>
                </div>
            `;
            return `<style>${torCSS}</style>${torPage2HTML}`;
        }

        // Page 1 (default)
        const torHTML = `
        <div class="tor-preview">
            <div class="print-container">
                <div class="header-row">
                    <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo"></div>
                </div>
                
                <div class="tor-content">
                    <div class="title">OFFICIAL TRANSCRIPT OF RECORDS</div>
                    <div class="meta-row"><div>Page 1</div><div>SCHOOL CODE: 7119</div></div>
                    <div class="name-row">
                        <div class="name-block"><div class="label">Last Name</div><div class="value">${studentName.split(' ').pop()?.toUpperCase() || 'LASTNAME'}</div></div>
                        <div class="name-block"><div class="label">First Name</div><div class="value">${studentName.split(' ').slice(0, -2).join(' ').toUpperCase() || 'FIRSTNAME'}</div></div>
                        <div class="name-block"><div class="label">Middle Name</div><div class="value">${studentName.split(' ').slice(-2, -1).join(' ').toUpperCase() || ''}</div></div>
                    </div>
                    <div class="separator"></div>
                    <div class="section-title">PERSONAL INFORMATION</div>
                    <div class="pi-container">
                        <div class="pi-fields">
                            <div class="pi-field"><div class="label">ID Number</div><div>: ${studentIdNumber}</div></div>
                            <div class="pi-field"><div class="label">Gender</div><div>: ${studentGender}</div></div>
                            <div class="pi-field"><div class="label">Civil Status</div><div>: ${studentCivilStatus}</div></div>
                            <div class="pi-field"><div class="label">Date of Birth</div><div>: ${studentDateOfBirth}</div></div>
                            <div class="pi-field"><div class="label">Place of Birth</div><div>: ${studentPlaceOfBirth}</div></div>
                            <div class="pi-field"><div class="label">Citizenship</div><div>: ${studentCitizenship}</div></div>
                            <div class="pi-field"><div class="label">Parent/ Spouse/ Guardian</div><div>: ${studentParentGuardian}</div></div>
                            <div class="pi-field"><div class="label">Permanent Address</div><div>: ${studentPermanentAddress}</div></div>
                            <div class="pi-field"><div class="label">Entrance Data to College</div><div>: ${studentEntranceData}</div></div>
                            <div class="pi-field"><div class="label">Course</div><div>: ${studentCourse}</div></div>
                        </div>
                    </div>
                    <div class="separator"></div>
                    <div class="section-title">EDUCATIONAL DATA</div>
                    <table>
                        <thead><tr><th>COURSE</th><th>NAME & ADDRESS OF SCHOOL</th><th>DATE GRADUATED</th></tr></thead>
                        <tbody>
                            <tr><td>Elementary</td><td>${educationalData.elementary.name}</td><td>${educationalData.elementary.year}</td></tr>
                            <tr><td>Secondary</td><td>${educationalData.secondary.name}</td><td>${educationalData.secondary.year}</td></tr>
                            <tr><td>SHS</td><td>${educationalData.shs.name}</td><td>${educationalData.shs.year}</td></tr>
                            <tr><td>Tertiary</td><td>${educationalData.tertiary.name}</td><td>${educationalData.tertiary.year}</td></tr>
                            <tr><td>School Last Attended</td><td>${educationalData.tertiary.name}</td><td>${educationalData.tertiary.year}</td></tr>
                        </tbody>
                    </table>
                    <div class="separator"></div>
                    <div class="section-title">GRADING SYSTEM</div>
                    <div class="grading">
                        <div class="col">
                            <div class="cell head">GRADE</div><div class="cell head">EQUIVALENT</div><div class="cell head">REMARKS</div>
                            <div class="cell">1.0</div><div class="cell">95-100%</div><div class="cell">Excellent</div>
                            <div class="cell">1.1-1.5</div><div class="cell">90-94%</div><div class="cell">Superior</div>
                            <div class="cell">1.6-2.0</div><div class="cell">85-89%</div><div class="cell">Very Good</div>
                            <div class="cell">2.1-2.5</div><div class="cell">80-84%</div><div class="cell">Good</div>
                            <div class="cell">2.6-2.9</div><div class="cell">76-79%</div><div class="cell">Fair</div>
                            <div class="cell">3.0</div><div class="cell">75%</div><div class="cell">Passed</div>
                        </div>
                        <div class="col">
                            <div class="cell head">GRADE</div><div class="cell head">EQUIVALENT</div><div class="cell head">REMARKS</div>
                            <div class="cell">5.0</div><div class="cell">74% below</div><div class="cell">Failed</div>
                            <div class="cell">W</div><div></div><div class="cell">Withdrawn</div>
                            <div class="cell">Dr</div><div></div><div class="cell">Dropped</div>
                            <div class="cell">NC</div><div></div><div class="cell">No Credit</div>
                        </div>
                    </div>
                    <div class="separator"></div>
                    <div class="notes"><em><u>One unit of lecture is equivalent to one contact hour and one unit laboratory is equivalent to three contact hours.</u></em></div>
                    <div class="notes"><strong>Note:</strong> This transcript is not valid if there is/are erasure(s) in the grades.</div>
                    <div class="remarks-flex">
                        <div><strong>REMARKS:</strong> FOR EVALUATION PURPOSES ONLY</div>
                        <div><strong>DATE ISSUED:</strong> ${today}</div>
                    </div>
                    <div class="signatures">
                        <div class="block">
                            <div class="label">Prepared by:</div>
                            <div class="name"><u>JUSTINE M. SUCGANG</u></div>
                            <div class="title">Records-in-Charge</div>
                        </div>
                        <div class="block">
                            <div class="label">Approved by:</div>
                            <div class="name"><u>MARIA PERPETUA C. SAURA</u></div>
                            <div class="title">School Registrar</div>
                        </div>
                    </div>
                    <div class="footer-note">***Not Valid Without School Dry Seal***</div>
                </div>

                <div class="footer-row">
                    <div class="footerlogo"><img src="/bcfooter.png" alt="Logo"></div>
                </div>
            </div>
        </div>
    `;
        return `<style>${torCSS}</style>${torHTML}`;
    };
    // return page based on special flag (set by UI)
    return buildTorPage(request.__torPage || 1);

        case 'DIPLOMA':
            return `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Old+Standard+TT:wght@400;700&family=Roboto:wght@400;500&display=swap');
                    .diploma-preview { 
                        font-family: 'Times New Roman', serif; 
                        color: #333;
                    }
                    .diploma-container {
                        width: 8.5in;
                        margin: auto;
                        padding: 0.5in;
                        text-align: center;
                        border: 10px double #666;
                        background-color: #fcfcfc;
                    }
                    .diploma-header { margin-bottom: 30px; }
                    .diploma-logo { width: 700px; margin-bottom: 1px; }
                    .diploma-header h1 { 
                        font-family: 'Playfair Display', serif;
                        font-size: 28pt;
                        letter-spacing: 2px;
                        margin: 0;
                    }
                    .diploma-header .motto { font-style: italic; margin: 5px 0; }
                    .diploma-header .address { font-size: 10pt; }
                    
                    .diploma-body p { margin: 15px 0; }
                    .salutation { font-family: 'Old Standard TT', serif; font-size: 16pt; }
                    .body-text { font-size: 12pt; line-height: 1.6; text-align: justify; }
                    .last-paragraph { margin-top: 30px; }
                    
                    .student-name {
                        font-family: 'Playfair Display', serif;
                        font-size: 26pt;
                        font-weight: 700;
                        margin: 20px 0 !important;
                    }
                    .degree-intro { font-size: 14pt; }
                    .degree-name {
                        font-family: 'Old Standard TT', serif;
                        font-size: 20pt;
                        font-weight: 700;
                        margin: 20px 0 !important;
                    }
                    .given-at { font-size: 11pt; margin-top: 30px; }

                    .signature-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px 50px;
                        margin-top: 50px;
                        text-align: center;
                    }
                    .signature-box { padding-top: 10px; }
                    .signature-name {
                        font-family: 'Roboto', sans-serif;
                        font-weight: 500;
                        font-size: 11pt;
                        margin-bottom: 2px !important;
                    }
                    .signature-title {
                        font-size: 10pt;
                        border-top: 1px solid #333;
                        padding-top: 5px;
                        margin-top: 0 !important;
                    }
                </style>
                <div class="diploma-preview">
                    <div class="diploma-container">
                        <div class="diploma-header">
                            <img src="/bcletterhead.png" alt="Logo" class="diploma-logo">
                        </div>
                        <div class="diploma-body">
                            <p class="salutation">To All Persons Who May Behold These Present</p>
                            <p class="body-text">
                                Be it known that the Board of Directors of the Benedicto College, by authority of the Republic of the Philippines and upon the recommendation of the Academic Council, confers upon
                            </p>
                            <p class="student-name">${formatNameForDiploma(studentName).toUpperCase()}</p>
                            <p class="degree-intro">the Degree of</p>
                            <p class="degree-name">${studentCourse}</p>
                            <p class="body-text">
                                with all the rights, honors, privileges, as well as the obligations and responsibilities thereunto appertaining.
                            </p>
                            <p class="body-text last-paragraph">
                                In witness whereof, the seal of Benedicto College and the signatures of the President, School Director, Department Dean and the Registrar are hereunto affixed.
                            </p>
                            <p class="given-at">
                                Given in Mandaue City, Philippines, ${diplomaDetails.graduationDate}.<br>
                                Special Order (B)(R-VII) ${diplomaDetails.specialOrder}.
                            </p>
                        </div>
                        <div class="signature-grid">
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.dean}</p>
                                <p class="signature-title">Dean, College of Business and Management</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.registrar}</p>
                                <p class="signature-title">Registrar</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.schoolDirector}</p>
                                <p class="signature-title">School Director</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.president}</p>
                                <p class="signature-title">President</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
        case 'CERTIFICATE OF ENROLLMENT':
            return `
            <style>
                    .certificateofEnrollment-preview, .certificateofEnrollment-preview * { font-family: Arial, sans-serif !important; }
                    .certificateofEnrollment-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .certificateofEnrollment-preview .footer-row {
                        display: flex;
                        align-items: center;
                        margin-top: 13%;
                    }
                    .certificateofEnrollment-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
                    .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                    }
                    .certificateofEnrollment-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 20px 20px 80px 20px;
                    }
                    .certificateofEnrollment-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .certificateofEnrollment-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .certificateofEnrollment-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .certificateofEnrollment-preview .signature-block {margin-top: 28%; text-align: center; width: 350px; margin-left: auto; margin-right: 0; padding: 0;}
                    .certificateofEnrollment-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 25%; }
                </style>
                <div class="certificateofEnrollment-preview">
                    <div class="header-row">
                        <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title">CERTIFICATION</div>
                            
                            <p class="body-text">This is to certify that according to our records <b>${studentName}</b>, is officially enrolled as a "Year lvl here" in the <b>${studentCourse}</b> 
                            program of Benedicto College Inc. this 1st Semester of School Year 2025-2026.</p>


                            <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>

                            <p class="body-text1">Issued this 3rd day of September, 2025 at Mandaue City, Cebu, Philippines.</p>
                            <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                            <div class="footer-note">***Not valid Without <br>
                            School Dry Seal***</div>
                        </div>
                    </div>
                     <div class="footer-row">
                            <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                </div>`

        case 'CERTIFICATE OF GRADUATION':
            return `
            <style>
                .certificateofGraduation-preview, .certificateofGraduation-preview * { font-family: Arial, sans-serif !important; }
                .certificateofGraduation-preview .header-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0px;
                }
                .certificateofGraduation-preview .footer-row {
                    display: flex;
                    align-items: center;
                    margin-top: 13%;
                }
                .certificateofGraduation-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
                .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                .certificateofGraduation-preview .cert-title {
                    text-align: center;
                    font-size: 20pt;
                    font-weight: bold;
                    margin: 18px 0 10px 0;
                    letter-spacing: 8px;
                    padding: 80px 20px 80px 20px;
                }
                .certificateofGraduation-preview .body-text2 { text-align: justify; margin-top: 10px; padding-bottom: 25px; font-size: 12pt;}
                .certificateofGraduation-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                .certificateofGraduation-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                
                /* --- MODIFIED STYLES FOR STABLE SPACING --- */
                .certificateofGraduation-preview .signature-block {
                    margin-top: 100px; /* Changed from 28% to a fixed value */
                    text-align: center; 
                    width: 350px; 
                    margin-left: auto; 
                    margin-right: 0; 
                    padding: 0;
                }
                .certificateofGraduation-preview .footer-note { 
                    font-size: 9pt; 
                    font-style: italic; 
                    margin-top: 120px; /* Changed from 25% to a fixed value */
                }
            </style>

            <div class="certificateofGraduation-preview">
                <div class="header-row">
                    <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                </div>
                <div class="print-container">
                    <div class="content-wrapper">
                        <div class="cert-title">CERTIFICATION</div>
                        <p class="body-text2">To Whom it May Concern:</p>

                        <p class="body-text">This is to certify that <b>${studentName}</b> satisfactorily completed the four-year course
                        in College of Computer Studies at Benedicto College, Inc. leading to the degree of <b>${studentCourse}</b> in accordance 
                        with the policies and standards of the <b>Commission on Higher Education (CHED)</b>, and the requirements prescribed by
                        the institution. The degree was conferred on him/her on "Date of Graduation here".</p>

                        <p class="body-text1">This certification is issued upon the request for <b>${request.purpose}</b> purposes only.</p>

                        <p class="body-text1">Given this 3rd day of September, 2025 at the Benedicto College, Inc. Mandaue City, Cebu.</p>
                        
                        <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                        
                        <div class="footer-note">***Not valid Without <br>
                        School Dry Seal***</div>
                    </div>
                </div>
                
                <div class="footer-row">
                    <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                </div>

</div> `
        case 'CERTIFICATE OF GRADUATION WITH HONORS':
            return `
            <style>
                    .certificateofGraduation-preview, .certificateofGraduation-preview * { font-family: Arial, sans-serif !important; }
                    .certificateofGraduation-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .certificateofGraduation-preview .footer-row {
                        display: flex;
                        align-items: center;
                        margin-top: 13%;
                    }
                    .certificateofGraduation-preview .content-wrapper { max-width: 8.5in; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
                    .print-container {
                    width: 8.5in;
                    padding: 0.5in;
                    margin: 0 auto;
                    box-sizing: border-box;
                    }
                    .certificateofGraduation-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 20px 20px 80px 20px;
                    }
                    .certificateofGraduation-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .certificateofGraduation-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 12pt; text-align: justify; }
                    .certificateofGraduation-preview .signature-block {margin-top: 28%; text-align: center; width: 350px; margin-left: auto; margin-right: 0; padding: 0;}
                    .certificateofGraduation-preview .footer-note { font-size: 9pt; font-style: italic; margin-top: 25%; }
                </style>
                <div class="certificateofGraduation-preview">
                    <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="print-container">
                        <div class="content-wrapper">
                            <div class="cert-title">CERTIFICATION</div>

                            <p class="body-text">This is to certify that according to the records available in this office,<b>${studentName}</b> was conferred
                            the degree of <b>${studentCourse}</b> on "INSERT DATE HERE" at the Benedicto College A.S Fortuna St. Mandaue City.</p>


                            <p class="body-text1">This is to certify further that she received an academic award for being a "INSERT LATIN HONORS HERE".</p>

                            <p class="body-text1">This certification is issued upon the request of the above mentioned student for whatever legal purposes it may
                            serve him/her.</p>

                             <p class="body-text1">Issued on the "INSERT DATE HERE", at Mandaue City, Cebu.</p>
                           <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>MARIA PERPETUA C. SAURA</b></p><p>School Registrar</p></div>
                            <div class="footer-note">***Not valid Without <br>
                            School Dry Seal***</div>
                        </div>
                    </div>
                    <div class="footer-row">
                            <div class="footerlogo"><img src="/bcfooter.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                </div>`
        case 'CERTIFICATE OF TRANSFER CREDENTIALS':
            return `
                <style>
                    .transferCRED-preview { 
                        font-family: Arial, sans-serif; 
                        width: 8.5in;
                        margin: 0 auto;
                        padding: 0.5in;
                        box-sizing: border-box;
                    }
                    .transferCRED-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .transferCRED-preview .logo {
                        width: 80px;
                        height: 80px;
                        margin-right: 20px;
                    }
                    .transferCRED-preview .college-info {
                        flex: 1;
                    }
                    .transferCRED-preview .college-name {
                        font-size: 24pt;
                        font-weight: bold;
                        color: #1e40af;
                        margin: 0;
                        letter-spacing: 1px;
                    }
                    .transferCRED-preview .motto {
                        font-size: 12pt;
                        font-style: italic;
                        color: #1e40af;
                        margin: 2px 0;
                    }
                    .transferCRED-preview .website {
                        font-size: 10pt;
                        color: #dc2626;
                        margin: 0;
                    }
                    .transferCRED-preview .office-header {
                        text-align: center;
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 20px 0;
                        text-transform: uppercase;
                    }
                    .transferCRED-preview .date-right {
                        text-align: right;
                        font-size: 12pt;
                        margin: 10px 0 20px 0;
                    }
                    .transferCRED-preview .cert-title {
                        text-align: center;
                        font-size: 15pt;
                        font-weight: bold;
                        margin: 20px 0 5px 0;
                        text-transform: uppercase;
                    }
                    .transferCRED-preview .cert-subtitle {
                        text-align: center;
                        font-size: 15pt;
                        font-weight: bold;
                        margin: 0 0 20px 0;
                        text-transform: uppercase;
                    }
                    .transferCRED-preview .salutation {
                        font-size: 13pt;
                        font-weight: bold;
                        margin: 20px 0 10px 0;
                        text-transform: uppercase;
                    }
                    .transferCRED-preview .body-text {
                        font-size: 12pt;
                        line-height: 1.6;
                        text-indent: 40px;
                        margin: 15px 0;
                    }
                    .transferCRED-preview .signature-block {
                        margin-top: 50px;
                        text-align: left;
                    }
                    .transferCRED-preview .signature-block1 {
                        margin-top: 40px;
                        text-align: right;
                    }
                    .transferCRED-preview .signature-name {
                        font-weight: bold;
                        font-size: 10pt;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .transferCRED-preview .signature-title {
                        font-size: 12pt;
                        margin: 0;
                    }
                    .transferCRED-preview .separator {
                        border-top: 2px solid #000;
                        margin: 40px 0;
                    }
                    .transferCRED-preview .return-slip-title {
                        text-align: center;
                        font-size: 18pt;
                        font-weight: bold;
                        margin: 20px 0;
                        text-transform: uppercase;
                    }
                    .transferCRED-preview .return-date {
                        text-align: right;
                        margin: 10px 0 20px 0;
                    }
                    .transferCRED-preview .return-date input {
                        border: none;
                        border-bottom: 1px solid #000;
                        width: 150px;
                        text-align: center;
                    }
                    .transferCRED-preview .return-address {
                        font-size: 12pt;
                        margin: 20px 0;
                    }
                    .transferCRED-preview .return-address .title {
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .transferCRED-preview .return-address .address {
                        margin: 0;
                    }
                    .transferCRED-preview .return-salutation {
                        font-size: 14pt;
                        margin: 20px 0 10px 0;
                    }
                    .transferCRED-preview .return-body {
                        font-size: 12pt;
                        line-height: 1.6;
                        text-indent: 40px;
                        margin: 15px 0;
                    }
                    .transferCRED-preview .return-body1 {
                        font-size: 12pt;
                        line-height: 1.6;
                        text-indent: 40px;
                        margin: 15px 0;
                    }
                    .transferCRED-preview .input-field input {
                        border: none;
                        border-bottom: 1px solid #000;
                        width: 300px;
                        margin-left: 10px;
                    }
                    .transferCRED-preview .return-signature {
                        text-align: right;
                        margin-top: 40px;
                    }
                    .transferCRED-preview .return-date-line {
                        display: flex;
                        justify-content: flex-end; /* Pushes content to the right */
                        margin: 5% 0 20px 0; /* Adjusts vertical spacing, moving it up a bit */
                    }
                        .transferCRED-preview .date-container {
                        text-align: center;
                        font-size: 10pt;
                    }
                        .transferCRED-preview .date-line {
                        border-bottom: 1px solid #000;
                        width: 150px;
                        margin-bottom: 2px;
                    }
                </style>
                <div class="transferCRED-preview">
                    <!-- Certificate Section -->
                    <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="content-wrapper">
                        <div class="office-header">OFFICE OF THE SCHOOL REGISTRAR</div>
                        <div class="date-right">Date: ${today}</div>
                        
                        <div class="cert-title">CERTIFICATE OF TRANSFER CREDENTIAL</div>
                        <div class="cert-subtitle">(HONORABLE DISMISSAL)</div>
                        
                        <div class="salutation">TO WHOM THIS MAY CONCERN:</div>
                        
                        <p class="body-text">This is to certify that <b>${studentName}</b> is granted transfer credential effective today.</p>
                        <p class="body-text">His/Her Official Transcript of Records (TOR) will be issued upon the receipt of the attached request duly accomplished by the school where he/she will transfer.</p>
                        <div class="signature-block">
                            <p class="signature-name">MARIA PERPETUA C. SAURA</p>
                            <p class="signature-title">School Registrar</p>
                        </div>
                    </div>
                    <!-- Separator Line -->
                    <div class="separator"></div>
                    <!-- Return Slip Section -->
                    <div class="header-row">
                            <div class="headerlogo"><img src="/bcletterhead.png" alt="Logo" style="width:100%;height:100%"></div>
                    </div>
                    <div class="content-wrapper">
                        <div class="office-header">OFFICE OF THE SCHOOL REGISTRAR</div>
                        <div class="return-slip-title">RETURN SLIP</div>
                        <div class="return-date-line">
                        <div class="date-container">
                            <div class="date-line"></div>
                            <div style="font-style: italic;">(Date)</div>
                        </div>
                        </div>
                        <div class="return-address">
                            <div class="title">THE REGISTRAR</div>
                            <p class="address">BENEDICTO COLLEGE</p>
                            <p class="address">A.S. Fortuna St., Bakilid,</p>
                            <p class="address">Mandaue City, Cebu</p>
                        </div>
                        
                        <div class="return-salutation">Sir/Madam:</div>
                        
                        <p class="return-body">Please send us at your convenience, the Transcript of Records of <b>${studentName}</b> student of <b>${studentCourse}</b> program in your school who is temporarily enrolled with us in the College of __________________.</p>
                        <p class="return-body1">Thank you for your cooperation.</p>
                        
                        <div class="input-fields">
                            <div class="input-field">
                                <label>Name of School:_______________________</label>
                            </div>
                            <div class="input-field">
                                <label>Address:__________________________</label>
                            </div>
                        </div>
                        
                         <div class="signature-block1">
                                <div style="display:inline-block;text-align:center;">
                                    <label>__________________________</label>
                                    <p style="margin:0;text-align:center;">School Registrar</p>
                                </div>
                            </div>
                    </div>
                </div>
            `;

        default:
            return `<div style="font-family: sans-serif; padding: 20px;"><h1 style="color: #dc3545;">Template Not Available</h1><p>A template for "<strong>${request.documentType}</strong>" has not been created.</p></div>`;
    }

};

function DocumentApprovalForm() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [torPage, setTorPage] = useState(1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [editedContent, setEditedContent] = useState({});
    
    const previewRef = useRef(null);
    const selectionRef = useRef(null);

    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (!requestId) return;
            setLoading(true);
            try {
                // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
                const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, { headers: { 'X-Session-Token': getSessionToken() } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch');
                setRequest(data);
                // reset to page 1 for TOR on load
                const initial = data.documentType && data.documentType.toUpperCase() === 'TOR' ? { ...data, __torPage: 1 } : data;
                setTorPage(1);
                const generatedContent = await generateDocumentContent(initial);
                setContent(generatedContent);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchRequestDetails();
    }, [requestId]);
    
    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.contentEditable = isEditing;
            if (isEditing) {
                previewRef.current.focus();
            }
        }
    }, [isEditing]);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectionRef.current = selection.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (selection && selectionRef.current) {
            selection.removeAllRanges();
            selection.addRange(selectionRef.current);
        }
    };

    const exec = (command, value = null) => {
        restoreSelection();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        saveSelection();
        // Mark that there are unsaved changes without updating state immediately
        setHasUnsavedChanges(true);
    };

    // Removed font/size apply helpers per request

    const handleFinalizeAndPrint = async () => {
        if (!request) return;
        try {
            // Only update status and trigger notifications if not already ready for pick-up
            const currentStatus = (request.status || '').toLowerCase();
            if (currentStatus !== 'ready for pick-up') {
                await fetch(`${API_BASE_URL}/requests/${request.id}`, { 
                    method: 'PATCH', 
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-Session-Token': getSessionToken() 
                    }, 
                    body: JSON.stringify({ status: 'ready for pick-up', notes: 'Document is ready.' }) 
                });
            }
            const printWindow = window.open('', '_blank');
            // Get the current origin to ensure images load properly in print window
            const baseUrl = window.location.origin;

            // If TOR, use edited content if available, otherwise compile page 1 and page 2
            const isTor = (request.documentType || '').toUpperCase() === 'TOR';
            let htmlToPrint = content;
            
            if (isTor) {
                // Check if we have edited content for both pages
                const page1Content = editedContent['tor_page_1'] || await generateDocumentContent({ ...request, __torPage: 1 });
                const page2Content = editedContent['tor_page_2'] || await generateDocumentContent({ ...request, __torPage: 2 });
                htmlToPrint = `${page1Content}<div class="print-break"></div>${page2Content}`;
            } else {
                // For non-TOR documents, use current content (which may be edited)
                htmlToPrint = content;
            }

            // Replace relative image paths with absolute URLs
            const printContent = htmlToPrint
                .replace(/src="\/bcletterhead\.png"/g, `src="${baseUrl}/bcletterhead.png"`)
                .replace(/src="\/bcfooter\.png"/g, `src="${baseUrl}/bcfooter.png"`)
                .replace(/src="\/bc\.png"/g, `src="${baseUrl}/bc.png"`)
                .replace(/src="\/bccover\.jpg"/g, `src="${baseUrl}/bccover.jpg"`)
                .replace(/src="\/bcformat\.png"/g, `src="${baseUrl}/bcformat.png"`)
                .replace(/src="\/bcleads\.png"/g, `src="${baseUrl}/bcleads.png"`)
                .replace(/src="\/bclogin\.png"/g, `src="${baseUrl}/bclogin.png"`)
                .replace(/src="\/benedicto2\.png"/g, `src="${baseUrl}/benedicto2.png"`)
                .replace(/src="\/student\.png"/g, `src="${baseUrl}/student.png"`)
                .replace(/src="\/pic\.jpg"/g, `src="${baseUrl}/pic.jpg"`);
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print</title>
                        <style>
                            @media print {
                                @page { 
                                    size: 8.5in 13in; /* long bond paper */
                                    margin: 0.5in; /* uniform margins */
                                }
                                html, body { 
                                    -webkit-print-color-adjust: exact; 
                                    color-adjust: exact; 
                                    margin: 0;
                                    padding: 0;
                                    width: 100%;
                                    height: 100%;
                                }
                                img { max-width: 100%; height: auto; }
                                /* Ensure any container does not add huge padding that pushes content off-page */
                                .print-container, .content-wrapper { margin: 0 !important; padding: 0 !important; }
                                .print-break { page-break-after: always; }
                                
                                /* Center table data for Grade and Credit/s columns */
                                table { 
                                    border-collapse: collapse; 
                                    width: 100%; 
                                    margin: 0 auto;
                                }
                                table td, table th { 
                                    border: 1px solid black; 
                                    padding: 4px; 
                                    vertical-align: middle;
                                }
                                /* Center all table cells by default */
                                table td { text-align: center; }
                                table th { text-align: center; }
                                /* Specifically ensure Grade and Credit/s columns are centered */
                                table td:nth-child(3), table td:nth-child(4) { 
                                    text-align: center !important; 
                                }
                                table th:nth-child(3), table th:nth-child(4) { 
                                    text-align: center !important; 
                                }
                                /* Additional specificity for transcript tables */
                                table tr td:nth-child(3), table tr td:nth-child(4) {
                                    text-align: center !important;
                                }
                            }
                        </style>
                    </head>
                    <body>${printContent}</body>
                    <script>
                        setTimeout(() => { 
                            window.print(); 
                            window.close(); 
                        }, 500);
                    </script>
                </html>
            `);
            printWindow.document.close();
            navigate('/registrar/requests');
        } catch (err) { alert(`Failed to print: ${err.message}`); }
    };
    
    const handleToggleEdit = () => {
        if (isEditing && previewRef.current) {
            // Save the edited content for the current page/document
            const currentContent = previewRef.current.innerHTML;
            setContent(currentContent);
            
            // Store edited content with a key based on document type and page
            const contentKey = request?.documentType?.toUpperCase() === 'TOR' ? `tor_page_${torPage}` : 'default';
            setEditedContent(prev => ({
                ...prev,
                [contentKey]: currentContent
            }));
            setHasUnsavedChanges(true);
        }
        setIsEditing(!isEditing);
    };

    const handleShowTorPage = async (pageNum) => {
        if (!request) return;
        
        // Check if we have edited content for this page
        const contentKey = `tor_page_${pageNum}`;
        if (editedContent[contentKey]) {
            // Use the edited content instead of regenerating
            setContent(editedContent[contentKey]);
            setTorPage(pageNum);
            return;
        }
        
        // Otherwise, generate fresh content
        const next = { ...request, __torPage: pageNum };
        setTorPage(pageNum);
        const generatedContent = await generateDocumentContent(next);
        setContent(generatedContent);
    };
    
    if (loading) return <p className="text-center mt-5">Loading document...</p>;
    if (error) return <div className="alert alert-danger mx-3">Error: {error}</div>;

    return (
        <div className="container-fluid my-4">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Approve and Preview: {request?.documentType}</h5>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        &larr; Back to Requests
                    </button>
                </div>
                <div className="card-body">
                    {request?.documentType?.toUpperCase() === 'TOR' && (
                        <div className="d-flex justify-content-end mb-3 gap-2">
                            <div className="btn-group" role="group" aria-label="TOR pages">
                                <button type="button" className={`btn btn-sm ${torPage === 1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleShowTorPage(1)}>Page 1</button>
                                <button type="button" className={`btn btn-sm ${torPage === 2 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleShowTorPage(2)}>Page 2</button>
                            </div>
                        </div>
                    )}
                    {isEditing && (
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
                            <button type="button" className="btn btn-sm btn-outline-dark me-1 fw-bold" title="Bold" onClick={() => exec('bold')}>B</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-1 fst-italic" title="Italic" onClick={() => exec('italic')}>I</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-2 text-decoration-underline" title="Underline" onClick={() => exec('underline')}>U</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-2" title="Strikethrough" onClick={() => exec('strikeThrough')}>ab</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-1" title="Subscript" onClick={() => exec('subscript')}>x<sub>2</sub></button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-3" title="Superscript" onClick={() => exec('superscript')}>x<sup>2</sup></button>

                            {/* Alignment controls */}
                            <button type="button" className="btn btn-sm btn-outline-dark" title="Align Left" onClick={() => exec('justifyLeft')}>
                                <i className="fas fa-align-left"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-dark" title="Align Center" onClick={() => exec('justifyCenter')}>
                                <i className="fas fa-align-center"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-dark" title="Align Right" onClick={() => exec('justifyRight')}>
                                <i className="fas fa-align-right"></i>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-dark" title="Justify" onClick={() => exec('justifyFull')}>
                                <i className="fas fa-align-justify"></i>
                            </button>
                        </div>
                    )}
                    <div 
                        ref={previewRef}
                        className="border p-4" 
                        style={{ 
                            minHeight: '60vh', 
                            backgroundColor: '#f8f9fa', 
                            overflow: 'auto',
                            outline: isEditing ? '2px solid #0d6efd' : 'none',
                            cursor: isEditing ? 'text' : 'default'
                        }}
                        onInput={(e) => {
                            // Only mark as having unsaved changes, don't update state immediately
                            if (isEditing) {
                                setHasUnsavedChanges(true);
                            }
                        }}
                        onKeyUp={saveSelection}
                        onMouseUp={saveSelection}
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </div>
                <div className="card-footer text-end">
                    <button className={`btn me-2 ${isEditing ? 'btn-success' : 'btn-secondary'}`} onClick={handleToggleEdit}>
                        {isEditing ? 'Save Changes' : 'Edit Document'}
                    </button>
                    
                    {!isEditing && (
                        <button className="btn btn-primary" onClick={handleFinalizeAndPrint}>
                            Finalize and Print
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DocumentApprovalForm;