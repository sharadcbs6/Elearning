// assessment-taking.js
// This script renders questions/answers into #assessment-taking with a modern UI

const params = new URLSearchParams(window.location.search);
const assessmentId = params.get('id');
const takingContainer = document.getElementById('assessment-taking');

if (assessmentId && takingContainer) {
    fetch(`/api/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject('Failed to load assessment'))
    .then(assessment => {
        console.debug('[DEBUG] Assessment fetched:', assessment);
        if (!assessment.questions || assessment.questions.length === 0) {
            takingContainer.innerHTML = '<div class="error">No questions found in this assessment.</div>';
            return;
        }
        // TIMER UI
        let timerInterval = null;
        let timerDiv = document.createElement('div');
        timerDiv.id = 'assessment-timer';
        timerDiv.style = 'text-align:right;font-size:1.2em;font-weight:600;color:#dc3545;margin-bottom:1em;letter-spacing:1px;';
        takingContainer.parentNode.insertBefore(timerDiv, takingContainer);
        let timeLimit = assessment.timeLimit || assessment.duration || 0; // in minutes
        let timeLeft = timeLimit > 0 ? timeLimit * 60 : 0; // seconds
        function formatTime(secs) {
            const m = Math.floor(secs/60).toString().padStart(2,'0');
            const s = (secs%60).toString().padStart(2,'0');
            return `${m}:${s}`;
        }
        function startTimer() {
            if (timeLeft > 0) {
                timerDiv.textContent = `Time Left: ${formatTime(timeLeft)}`;
                timerInterval = setInterval(() => {
                    timeLeft--;
                    timerDiv.textContent = `Time Left: ${formatTime(timeLeft)}`;
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        timerDiv.textContent = 'Time is up! Submitting...';
                        document.getElementById('assessment-form').dispatchEvent(new Event('submit'));
                    }
                }, 1000);
            } else {
                timerDiv.style.display = 'none';
            }
        }
        takingContainer.innerHTML = `
            <form id="assessment-form">
                ${assessment.questions.map((q, idx) => renderQuestion(q, idx)).join('')}
                <button type="submit" class="submit-btn">Submit Assessment</button>
            </form>
        `;
        if (timeLeft > 0) startTimer();
        document.getElementById('assessment-form').addEventListener('submit', async function(e) {
            if (timerInterval) clearInterval(timerInterval);
            e.preventDefault();
            takingContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Submitting...</div>';
            // Collect answers in the format expected by backend
            const form = e.target;
            const answers = assessment.questions.map((q, idx) => {
                const type = (q.type || q.questionType || '').toLowerCase();
                let answerObj = { questionId: q._id };
                if (type === 'mcq' || type === 'multiple-choice' || type === 'true-false') {
                    const input = form.querySelector(`[name="q${idx}"]:checked`);
                    answerObj.selectedOptions = input ? [input.value] : [];
                } else if (type === 'checkbox' || type === 'multi-select') {
                    answerObj.selectedOptions = Array.from(form.querySelectorAll(`[name="q${idx}"]:checked`)).map(i => i.value);
                } else {
                    const input = form.querySelector(`[name="q${idx}"]`);
                    answerObj.textAnswer = input ? input.value : '';
                }
                return answerObj;
            });
            try {
                // Submit answers to backend
                const res = await fetch(`/api/assessments/${assessmentId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ answers })
                });
                if (!res.ok) throw new Error('Submission failed');
                const result = await res.json();
                console.debug('[DEBUG] Submission result object:', result);
                // Debug: Log result object for troubleshooting
                console.debug('[DEBUG] Submission result object:', result);
                setTimeout(() => {
                    if (window.Chart && result.totalScore !== undefined && result.percentageScore !== undefined) {
                        const ctx = document.getElementById('resultChart').getContext('2d');
                        const correct = result.totalScore;
                        const total = result.totalPossiblePoints ?? 1;
                        const incorrect = total - correct;
                        new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: ['Correct', 'Incorrect'],
                                datasets: [{
                                    data: [correct, incorrect],
                                    backgroundColor: ['#388e3c', '#dc3545'],
                                }]
                            },
                            options: {
                                plugins: {
                                    legend: { position: 'bottom' }
                                }
                            }
                        });
                    }
                    // Accuracy line chart per question
                    const lineCanvas = document.getElementById('accuracyLineChart');
                    if (!lineCanvas) {
                        console.warn('[WARN] accuracyLineChart canvas not found');
                        return;
                    }
                    if (window.Chart && Array.isArray(result.questionResults) && result.questionResults.length > 0) {
                        const lineCtx = lineCanvas.getContext('2d');
                        const labels = result.questionResults.map((q, i) => `Q${i + 1}`);
                        const data = result.questionResults.map(q => q.correct ? 1 : 0);
                        new Chart(lineCtx, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Accuracy',
                                    data: data,
                                    borderColor: '#4f46e5',
                                    backgroundColor: 'rgba(79,70,229,0.12)',
                                    fill: true,
                                    tension: 0.3,
                                    pointBackgroundColor: data.map(v => v ? '#388e3c' : '#dc3545'),
                                    pointRadius: 6,
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 1,
                                        title: { display: true, text: 'Accuracy' },
                                        ticks: {
                                            callback: v => v === 1 ? 'Correct' : 'Incorrect',
                                            stepSize: 1
                                        }
                                    }
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: ctx => ctx.parsed.y === 1 ? 'Correct' : 'Incorrect'
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        // Show fallback if data missing
                        lineCanvas.parentNode.innerHTML += '<div style="color:#dc3545;text-align:center;margin-top:1em;">No per-question accuracy data available.</div>';
                        console.warn('[WARN] result.questionResults is missing or empty:', result.questionResults);
                    }
                }, 200);
                // Show score and feedback with chart
                let wrongQuestionsHtml = '';
                if (result.wrongQuestions && Array.isArray(result.wrongQuestions) && result.wrongQuestions.length > 0) {
                    wrongQuestionsHtml = `<div class="wrong-questions-section">
                        <h3 style="color:#dc3545;margin-top:2em;">Incorrectly Answered Questions</h3>
                        <ul class="wrong-questions-list">
                            ${result.wrongQuestions.map(wq => `
                                <li class="wrong-question-item">
                                    <div class="wrong-q-text"><strong>Q:</strong> ${wq.questionText || wq.text || ''}</div>
                                    <div class="wrong-q-your"><span style='color:#dc3545'><strong>Your Answer:</strong></span> ${Array.isArray(wq.yourAnswer) ? wq.yourAnswer.join(', ') : (wq.yourAnswer || '')}</div>
                                    <div class="wrong-q-correct"><span style='color:#388e3c'><strong>Correct Answer:</strong></span> ${Array.isArray(wq.correctAnswer) ? wq.correctAnswer.join(', ') : (wq.correctAnswer || '')}</div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>`;
                }
                takingContainer.innerHTML = `
                    <div class="success-message">
                        <i class='fas fa-check-circle' style='color:#388e3c;font-size:2em;'></i><br>
                        <strong>Assessment Submitted!</strong><br><br>
                        <div>Your Score: <span style="color:#8e44ad;font-size:1.3em;">${result.totalScore ?? 'N/A'}</span> / <span>${result.percentageScore ? result.percentageScore + '%' : ''}</span></div>
                        <div style="margin-top:0.7em;">${result.passed !== undefined ? (result.passed ? '<span style=\"color:#388e3c\">Passed</span>' : '<span style=\"color:#dc3545\">Failed</span>') : ''}</div>
                        <div style="margin:1.5em auto;max-width:320px;">
                            <canvas id="resultChart" width="320" height="220"></canvas>
                        </div>
                        <div style="margin:1.5em auto;max-width:520px;">
                            <canvas id="accuracyLineChart" width="480" height="220"></canvas>
                        </div>
                        ${wrongQuestionsHtml}
                        <div id="feedback-section" style="margin-top:2em;padding:1.5em 1em;background:#f9f8fd;border-radius:12px;box-shadow:0 2px 8px rgba(142,68,173,0.04);">
                          <h3 style="color:#8e44ad;">We value your feedback!</h3>
                          <form id="feedback-form">
                            <label for="feedback-rating">How would you rate this course/test?</label><br>
                            <select id="feedback-rating" name="rating" required style="margin:0.5em 0 1em 0;padding:0.3em 1em;font-size:1em;">
                              <option value="">Select rating</option>
                              <option value="5">Excellent</option>
                              <option value="4">Good</option>
                              <option value="3">Average</option>
                              <option value="2">Poor</option>
                              <option value="1">Very Poor</option>
                            </select><br>
                            <label for="feedback-text">Your feedback about the course/test:</label><br>
                            <textarea id="feedback-text" name="text" rows="3" style="width:98%;padding:0.5em;border-radius:8px;margin-top:0.5em;resize:vertical;" required></textarea><br>
                            <button type="submit" class="submit-btn" style="margin-top:1em;">Submit Feedback</button>
                          </form>
                          <div id="feedback-message" style="margin-top:1em;"></div>
                        </div>
                        <button onclick="window.location.href='/student/dashboard.html'" class="submit-btn" style="margin-top:1.5em;">Return to Dashboard</button>
                    </div>
                `;
                // Feedback form handler
                const feedbackForm = document.getElementById('feedback-form');
                if (feedbackForm) {
                  feedbackForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const rating = feedbackForm.rating.value;
                    const text = feedbackForm.text.value;
                    const user = JSON.parse(localStorage.getItem('currentUser'));
                    const token = localStorage.getItem('token');
                    const courseId = result.courseId || assessment.courseId || params.get('courseId');
                    const feedbackMsg = document.getElementById('feedback-message');
                    feedbackMsg.textContent = '';
                    try {
                      const res = await fetch('/api/feedback', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          courseId,
                          assessmentId,
                          rating,
                          text
                        })
                      });
                      if (!res.ok) throw new Error(await res.text());
                      feedbackForm.reset();
                      feedbackMsg.textContent = 'Thank you for your feedback!';
                      feedbackMsg.style.color = '#388e3c';
                    } catch (err) {
                      feedbackMsg.textContent = 'Error submitting feedback: ' + err.message;
                      feedbackMsg.style.color = '#dc3545';
                    }
                  });
                }
            } catch (err) {
                takingContainer.innerHTML = `<div class='error'>Submission failed. Please try again.</div>`;
            }
        });
    })
    .catch(err => {
        takingContainer.innerHTML = `<div class='error'>${err}</div>`;
    });
}

function renderQuestion(q, idx) {
    // Use robust property access for text, options, and type
    const text = q.text || q.questionText || '';
    const type = (q.type || q.questionType || '').toLowerCase();
    const options = q.options || [];

    let inputHtml = '';
    if ((type === 'mcq' || type === 'multiple-choice') && Array.isArray(options) && options.length > 0) {
        inputHtml = options.map((opt, oidx) => {
            // Use option._id as value for backend compatibility
            const label = typeof opt === 'string' ? opt : (opt.text || opt.optionText || '');
            const value = typeof opt === 'string' ? opt : (opt._id || label);
            return `
                <label class="option-label">
                    <input type="radio" name="q${idx}" value="${value}" required>
                    <span class="custom-radio"></span>
                    ${label}
                </label>
            `;
        }).join('');
    } else if ((type === 'checkbox' || type === 'multi-select') && Array.isArray(options) && options.length > 0) {
        inputHtml = options.map((opt, oidx) => {
            const label = typeof opt === 'string' ? opt : (opt.text || opt.optionText || '');
            const value = typeof opt === 'string' ? opt : (opt._id || label);
            return `
                <label class="option-label">
                    <input type="checkbox" name="q${idx}" value="${value}">
                    <span class="custom-checkbox"></span>
                    ${label}
                </label>
            `;
        }).join('');
    } else if (type === 'true-false') {
        inputHtml = [
            { val: 'true', label: 'True' },
            { val: 'false', label: 'False' }
        ].map(opt => `
            <label class="option-label">
                <input type="radio" name="q${idx}" value="${opt.val}" required>
                <span class="custom-radio"></span>
                ${opt.label}
            </label>
        `).join('');
    } else {
        // Default to short answer
        inputHtml = `<input type="text" name="q${idx}" class="short-answer" placeholder="Your answer..." required autocomplete="off">`;
    }
    return `
        <div class="question-card">
            <div class="question-title">Q${idx+1}. ${text}</div>
            <div class="question-body">${inputHtml}</div>
        </div>
    `;
}
