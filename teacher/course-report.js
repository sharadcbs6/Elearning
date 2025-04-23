// Fetch and display student summary for a course
// Usage: course-report.html?courseId=...

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('courseId');
  if (!courseId) return;

  // Robust user/token retrieval
  let user = window.currentUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
      user = null;
    }
  }
  const teacherId = user && user._id;
  if (!teacherId) {
    console.error('No teacherId found for report fetch!');
    return;
  }
  const token = user && (user.token || localStorage.getItem('token'));
  if (!token) {
    window.location.href = '/auth/login.html';
    return;
  }

  const tableBody = document.getElementById('reportTableBody');
  const courseTitle = document.getElementById('courseTitle');
  tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

  async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report entry?')) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errMsg = await res.text();
        alert('Error deleting report: ' + errMsg);
        return;
      }
      // Remove row from table or reload
      loadReports();
    } catch (err) {
      alert('Error deleting report: ' + err.message);
    }
  }

  async function loadReports() {
    tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
    try {
      // Fetch course info (public, no auth needed)
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const course = await courseRes.json();
      if (course && course.title) courseTitle.textContent = `Course Report: ${course.title}`;

      // Fetch reports for this course (protected)
      const res = await fetch(`/api/reports/teacher/${teacherId}?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reports = await res.json();
      if (!Array.isArray(reports) || reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No reports for this course yet.</td></tr>';
        return;
      }
      tableBody.innerHTML = reports.map(r => `
        <tr>
          <td><i class='fas fa-user icon'></i>${r.studentId?.profile?.name || ''}</td>
          <td><i class='fas fa-file-alt icon'></i>${r.assessmentTitle || ''}</td>
          <td>
            <div class="score-bar-bg">
              <div class="score-bar" style="width:${r.percentage != null ? Math.min(100, r.percentage) : 0}%;"></div>
              <span style="position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:0.97em;color:#222;font-weight:500;">${r.score ?? '-'}</span>
            </div>
          </td>
          <td style="font-weight:600;color:${r.percentage >= 50 ? '#388e3c':'#dc3545'};">${r.percentage != null ? r.percentage.toFixed(1) + '%' : '-'}</td>
          <td>${(r.modulesDone||[]).map(m => `<span class='badge badge-done'>${m}</span>`).join('')}</td>
          <td>${(r.modulesLeft||[]).map(m => `<span class='badge badge-left'>${m}</span>`).join('')}</td>
          <td>${new Date(r.submittedAt).toLocaleString()}</td>
          <td><button class="delete-report-btn" onclick="deleteReportHandler('${r._id}')"><i class='fas fa-trash'></i> Delete</button></td>
        </tr>
      `).join('');
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="8">Error loading report.</td></tr>';
    }
  }

  // Expose delete handler globally for inline onclick
  window.deleteReportHandler = deleteReport;

  // Initial load
  loadReports();
});
