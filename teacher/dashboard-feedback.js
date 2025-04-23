// Fetch and display feedback for the teacher dashboard
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
  if (!teacherId) return;
  const token = user && (user.token || localStorage.getItem('token'));
  if (!token) return;

  const feedbackTable = document.getElementById('feedbackTableBody');
  const feedbackSection = document.getElementById('feedbackSection');
  if (!feedbackTable || !feedbackSection) return;

  feedbackSection.style.display = '';
  feedbackTable.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
  try {
    const res = await fetch(`/api/feedback/teacher/${teacherId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const feedbacks = await res.json();
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      feedbackTable.innerHTML = '<tr><td colspan="6">No feedback yet.</td></tr>';
      return;
    }
    feedbackTable.innerHTML = feedbacks.map(f => `
      <tr>
        <td>${f.studentId?.profile?.name || f.studentId?.email || ''}</td>
        <td>${f.courseId?.title || ''}</td>
        <td>${f.assessmentId?.title || ''}</td>
        <td>${'★'.repeat(Number(f.rating))}${'☆'.repeat(5-Number(f.rating))}</td>
        <td>${f.text ? f.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</td>
        <td>${new Date(f.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    feedbackTable.innerHTML = '<tr><td colspan="6">Error loading feedback.</td></tr>';
  }
});
