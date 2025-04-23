// Fetch and display student reports for the teacher dashboard
// Assumes teacherId is available (from login/session)

document.addEventListener('DOMContentLoaded', async () => {
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
    console.error('No teacherId found for dashboard report fetch!');
    return;
  }
  const token = user && (user.token || localStorage.getItem('token'));
  if (!token) return;

  const reportsTable = document.getElementById('reportsTableBody');
  const reportsSection = document.getElementById('reportsSection');
  if (!reportsTable || !reportsSection) return;

  reportsTable.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  try {
    const res = await fetch(`/api/reports/teacher/${teacherId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const reports = await res.json();
    if (!Array.isArray(reports) || reports.length === 0) {
      reportsTable.innerHTML = '<tr><td colspan="7">No reports yet.</td></tr>';
      return;
    }
    reportsTable.innerHTML = reports.map(r => `
      <tr>
        <td>${r.studentId?.name || ''}</td>
        <td>${r.courseId?.title || ''}</td>
        <td>${r.assessmentTitle || ''}</td>
        <td>${r.score ?? '-'}</td>
        <td>${r.percentage != null ? r.percentage.toFixed(1) + '%' : '-'}</td>
        <td><span style="color:#388e3c">${(r.modulesDone||[]).join(', ')}</span></td>
        <td><span style="color:#dc3545">${(r.modulesLeft||[]).join(', ')}</span></td>
        <td>${new Date(r.submittedAt).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    reportsTable.innerHTML = '<tr><td colspan="7">Error loading reports.</td></tr>';
  }
});
