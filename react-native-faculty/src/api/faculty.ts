import { API_BASE_URL } from "./config";
import { fetchWithTokenRefresh } from "./authService";
import { fetchWithCache } from "../utils/offline";
import { jsonFetch } from "./client";

export interface FacultyAssignment { subject_name: string; subject_code: string; subject_id: number; section: string; section_id: number; semester: number; semester_id: number; branch: string; branch_id: number; has_timetable: boolean; }
export interface ProctorStudent { name: string; usn: string; attendance: number; branch?: string | null; semester?: number | null; section?: string | null; }
export interface ClassStudent { id: number; name: string; usn: string; }
export interface InternalMarkStudent { id: number; name: string; usn: string; mark: number | ''; max_mark?: number; }
export interface LeaveRequest { id: string; branch: string; start_date: string; end_date: string; reason: string; status: string; applied_on?: string; }

// Assignment / Exams / Reports domain types
export interface AssignmentTask { id: number; title: string; description?: string; due_date?: string; subject?: string; total_submissions?: number; }
export interface AssignmentSubmission { id: number; student: string; student_usn?: string; submitted_at: string; file_url?: string; grade?: string | null; remarks?: string | null; }
export interface Exam { id: number; name: string; subject?: string; date?: string; total_students?: number; results_recorded?: number; }
export interface ExamResult { id: number; student: string; student_usn?: string; mark: number; max_mark: number; }

export async function getAssignments() { return fetchWithCache('assignments', () => jsonFetch<{ success: boolean; data: FacultyAssignment[] }>('/faculty/assignments/', { auth: true })); }
export async function getDashboard() { return fetchWithCache('dashboard', () => jsonFetch<{ success: boolean; data: any }>('/faculty/dashboard/', { auth: true })); }
export async function getProctorStudents() { return fetchWithCache('proctor-students', () => jsonFetch<{ success: boolean; data: ProctorStudent[] }>('/faculty/proctor-students/', { auth: true })); }
export async function getNotifications() { return fetchWithCache('notifications', () => jsonFetch<{ success: boolean; data: any[] }>('/faculty/notifications/', { auth: true })); }
export async function createAnnouncement(payload: { branch_id: string; semester_id: string; section_id: string; title: string; content: string; target: string; }) { return jsonFetch<{ success: boolean; message?: string }>('/faculty/announcements/', { auth: true, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
// Targeted announcement variant allowing subset of students (student_usns)
export async function createTargetedAnnouncement(payload: { branch_id: string; semester_id: string; section_id: string; title: string; content: string; target: string; student_usns?: string[] }) { return jsonFetch<{ success: boolean; message?: string }>('/faculty/announcements/', { auth: true, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
export async function getSentNotifications() { return fetchWithCache('sent-notifications', () => jsonFetch<{ success: boolean; data: any[] }>('/faculty/notifications/sent/', { auth: true })); }

// Class / attendance
export async function getStudentsForClass(params: { branch_id: number; semester_id: number; section_id: number; subject_id: number; }) {
  const q = new URLSearchParams({ branch_id: String(params.branch_id), semester_id: String(params.semester_id), section_id: String(params.section_id), subject_id: String(params.subject_id) }).toString();
  return jsonFetch<{ success: boolean; data: ClassStudent[] }>(`/faculty/students/?${q}`, { auth: true });
}
export async function takeAttendance(payload: { 
  branch_id: string; 
  semester_id: string; 
  section_id: string; 
  subject_id: string; 
  method?: 'manual' | 'ai';
  attendance?: { student_id: string; status: boolean }[];
  class_images?: any[];
}) {
  const body = new FormData();
  body.append('branch_id', payload.branch_id);
  body.append('semester_id', payload.semester_id);
  body.append('section_id', payload.section_id);
  body.append('subject_id', payload.subject_id);
  body.append('method', payload.method || 'manual');
  
  if (payload.method === 'ai' && payload.class_images) {
    payload.class_images.forEach((file, index) => {
      body.append(`class_images[${index}]`, file);
    });
  }
  
  if (payload.method === 'manual' && payload.attendance) {
    body.append('attendance', JSON.stringify(payload.attendance));
  }
  
  return jsonFetch<{ success: boolean; message?: string }>('/faculty/take-attendance/', { auth: true, method: 'POST', body });
}
export async function getAttendanceRecordsList() { return fetchWithCache('attendance-records', () => jsonFetch<{ success: boolean; data: any[] }>('/faculty/attendance-records/list/', { auth: true })); }
export async function getAttendanceRecordDetails(id: number) { return jsonFetch<{ success: boolean; data: { present: any[]; absent: any[] } }>(`/faculty/attendance-records/${id}/details/`, { auth: true }); }

// Marks
export async function getInternalMarks(params: { branch_id: number; semester_id: number; section_id: number; subject_id: number; test_number: number; }) {
  const q = new URLSearchParams(Object.entries(params).reduce((a,[k,v])=>{a[k]=String(v);return a;}, {} as Record<string,string>)).toString();
  return jsonFetch<{ success: boolean; data: InternalMarkStudent[] }>(`/faculty/internal-marks/?${q}`, { auth: true });
}
export async function uploadInternalMarks(payload: { 
  branch_id: string; 
  semester_id: string; 
  section_id: string; 
  subject_id: string; 
  test_number: number; 
  marks?: { student_id: string; mark: number }[];
  file?: any;
}) {
  const body = new FormData();
  body.append('branch_id', payload.branch_id);
  body.append('semester_id', payload.semester_id);
  body.append('section_id', payload.section_id);
  body.append('subject_id', payload.subject_id);
  body.append('test_number', payload.test_number.toString());
  
  if (payload.marks) {
    body.append('marks', JSON.stringify(payload.marks));
  }
  
  if (payload.file) {
    body.append('file', payload.file);
  }
  
  return jsonFetch<{ success: boolean; message?: string }>('/faculty/upload-marks/', { auth: true, method: 'POST', body });
}

// Leave
export async function applyLeave(payload: { branch_ids: string[]; start_date: string; end_date: string; reason: string; }) { return jsonFetch<{ success: boolean; message?: string }>(`/faculty/apply-leave/`, { auth: true, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
export async function getLeaveRequests() { return jsonFetch<{ success: boolean; data: LeaveRequest[] }>('/faculty/leave-requests/', { auth: true }); }

// Timetable & profile
export async function getTimetable() { return jsonFetch<{ success: boolean; data: any[] }>('/faculty/timetable/', { auth: true }); }
export async function getProfile() { return jsonFetch<{ success: boolean; data: any }>(`/faculty/profile/`, { auth: true }); }
export async function manageProfile(payload: { first_name?: string; last_name?: string; email?: string; }) {
  const fd = new FormData();
  if (payload.first_name) fd.append('first_name', payload.first_name);
  if (payload.last_name) fd.append('last_name', payload.last_name);
  if (payload.email) fd.append('email', payload.email);
  return jsonFetch<{ success: boolean; message?: string }>(`/faculty/profile/`, { auth: true, method: 'POST', body: fd });
}
// Manage student leave (approve / reject single endpoint variant) if backend supports bulk management
export async function manageStudentLeave(payload: { leave_id: string; action: 'APPROVE'|'REJECT' }) { return jsonFetch<{ success: boolean; message?: string }>('/faculty/manage-student-leave/', { auth: true, method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) }); }

// Statistics / reports
export async function generateStatistics(params: { file_id: string }) {
  const q = new URLSearchParams({ file_id: params.file_id }).toString();
  return jsonFetch<{ success: boolean; data?: { pdf_url: string; stats: any[] } }>(`/faculty/generate-statistics/?${q}`, { auth: true });
}
export async function downloadPdf(filename: string) {
  // Returns a blob URL (requires custom handling). For now just fetch JSON fallback if error.
  return fetch(`https://placeholder.invalid`);
}

// Mentoring schedule
export async function scheduleMentoring(payload: { student_id: string; date: string; purpose: string }) {
  return jsonFetch<{ success: boolean; message?: string }>('/faculty/schedule-mentoring/', { auth: true, method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}

// Separate helper to refetch both received & sent notifications
export async function getFacultyNotifications() { return jsonFetch<{ success: boolean; data: any[] }>('/faculty/notifications/', { auth: true }); }

// ---------------- Assignments ----------------
export async function getAssignmentTasks() { return jsonFetch<{ success: boolean; data: AssignmentTask[] }>('/faculty/assignments/manage/', { auth: true }); }
export async function getAssignmentDetail(id: number) { return jsonFetch<{ success: boolean; data: AssignmentTask }>(`/faculty/assignments/${id}/`, { auth: true }); }
export async function getAssignmentSubmissions(id: number) { return jsonFetch<{ success: boolean; data: AssignmentSubmission[] }>(`/faculty/assignments/${id}/submissions/`, { auth: true }); }
export async function gradeAssignment(submissionId: number, payload: { grade: string; remarks?: string }) {
  return jsonFetch<{ success: boolean; message?: string }>(`/faculty/assignments/submissions/${submissionId}/grade/`, { auth: true, method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}

// ---------------- Exams ----------------
export async function getExams() { return jsonFetch<{ success: boolean; data: Exam[] }>('/faculty/exams/', { auth: true }); }
export async function getExamDetail(id: number) { return jsonFetch<{ success: boolean; data: Exam }>(`/faculty/exams/${id}/`, { auth: true }); }
export async function getExamResults(id: number) { return jsonFetch<{ success: boolean; data: ExamResult[] }>(`/faculty/exams/${id}/results/`, { auth: true }); }
export async function recordExamResult(id: number, payload: { student_id: string; mark: number; max_mark: number }) {
  return jsonFetch<{ success: boolean; message?: string }>(`/faculty/exams/${id}/record-result/`, { auth: true, method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}
export async function bulkRecordExamResults(id: number, payload: { results: { student_id: string; mark: number; max_mark: number }[] }) {
  return jsonFetch<{ success: boolean; message?: string }>(`/faculty/exams/${id}/bulk-record-results/`, { auth: true, method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}

// ---------------- Reports ----------------
export async function getAttendanceReport(params: { branch_id?: string; semester_id?: string; section_id?: string; subject_id?: string }) {
  const q = new URLSearchParams(Object.entries(params).filter(([,v])=> v != null && v !== '').map(([k,v])=> [k,String(v)])).toString();
  return jsonFetch<{ success: boolean; data: any }>(`/faculty/reports/attendance/${q?`?${q}`:''}`, { auth: true });
}
export async function getMarksReport(params: { branch_id?: string; semester_id?: string; section_id?: string; subject_id?: string }) {
  const q = new URLSearchParams(Object.entries(params).filter(([,v])=> v != null && v !== '').map(([k,v])=> [k,String(v)])).toString();
  return jsonFetch<{ success: boolean; data: any }>(`/faculty/reports/marks/${q?`?${q}`:''}`, { auth: true });
}

// Additional API functions for enhanced functionality
export const viewAttendanceRecords = async (params: any) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/faculty/attendance-records/?${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("View Attendance Records Error:", error);
    return { success: false, message: "Network error" };
  }
};

export const downloadPDF = async (filename: string) => {
  try {
    const response = await fetchWithTokenRefresh(`${API_BASE_URL}/faculty/download-pdf/${filename}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      return { success: true, file_url: url };
    }
    return await response.json();
  } catch (error) {
    console.error("Download PDF Error:", error);
    return { success: false, message: "Network error" };
  }
};

// Legacy compatibility functions for screens
export const getFacultyAssignments = getAssignments;
export const getFacultySentNotifications = getSentNotifications;
export const getFacultyLeaveRequests = getLeaveRequests;
export const getFacultyProfile = getProfile;
export const getDashboardOverview = getDashboard;
export const getInternalMarksForClass = getInternalMarks;


