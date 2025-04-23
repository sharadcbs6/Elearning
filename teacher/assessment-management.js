import { assessmentService } from '../js/services/assessmentService.js';

class AssessmentManagement {
    constructor() {
        this.initializeUI();
        this.bindEvents();
    }

    initializeUI() {
        this.container = document.querySelector('#assessment-management');
        this.container.innerHTML = '';
        this.renderAssessmentList();
        // Attach event to main Create Assessment button in header
        const createBtn = document.getElementById('createAssessmentBtn');
        if (createBtn) {
            createBtn.onclick = () => this.openAssessmentFormModal();
        }
    }

    openAssessmentFormModal(assessment = null) {
        if (document.querySelector('.assessment-form-modal')) return;
        const modal = document.createElement('div');
        modal.className = 'assessment-form-modal';
        if (assessment && assessment._id) {
            modal.dataset.assessmentId = assessment._id;
        }
        modal.innerHTML = `
            <form id="assessment-form" class="assessment-form">
                <h2>${assessment ? 'Edit' : 'Create New'} Assessment</h2>
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required value="${assessment?.title || ''}">
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description">${assessment?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="timeLimit">Time Limit (minutes)</label>
                    <input type="number" id="timeLimit" name="timeLimit" value="${assessment?.timeLimit || 60}">
                </div>
                <div class="form-group">
                    <label for="passingScore">Passing Score (%)</label>
                    <input type="number" id="passingScore" name="passingScore" value="${assessment?.passingScore || 60}">
                </div>
                <div id="questions-container">
                    <!-- Questions will be added here dynamically -->
                </div>
                <button type="button" id="add-question" class="btn-secondary">Add Question</button>
                <button type="submit" class="btn-primary">${assessment ? 'Update' : 'Create'} Assessment</button>
                <button type="button" class="btn-secondary" id="closeAssessmentModal" style="float:right;margin-left:1em;">Cancel</button>
            </form>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeAssessmentModal').onclick = () => modal.remove();
        // Pre-fill questions if editing
        if (assessment && Array.isArray(assessment.questions)) {
            assessment.questions.forEach(q => this.addQuestionToForm(q));
        }
    }

    addQuestionToForm(question = null) {
        const questionsContainer = document.getElementById('questions-container');
        const questionIndex = questionsContainer.querySelectorAll('.question-item').length;
        const questionHTML = `
            <div class="question-item">
                <input type="text" name="questionText" placeholder="Question Text" required value="${question ? this.escapeHTML(question.questionText) : ''}">
                <select name="questionType">
                    <option value="multiple-choice" ${question?.type === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                    <option value="true-false" ${question?.type === 'true-false' ? 'selected' : ''}>True/False</option>
                    <option value="short-answer" ${question?.type === 'short-answer' ? 'selected' : ''}>Short Answer</option>
                </select>
                <input type="number" name="points" placeholder="Points" value="${question ? question.points : '1'}" required>
                <div class="options-container">
                    ${(question?.options && question.options.length > 0)
                        ? question.options.map(opt => this.renderOptionInput(opt)).join('')
                        : this.renderOptionInput()}
                </div>
                <button type="button" class="add-option">Add Option</button>
                <button type="button" class="remove-question">Remove Question</button>
            </div>
        `;
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
    }

    renderOptionInput(option = null) {
        return `
            <div class="option-item">
                <input type="text" name="optionText" placeholder="Option Text" required value="${option ? this.escapeHTML(option.text) : ''}">
                <input type="checkbox" name="isCorrect" ${option?.isCorrect ? 'checked' : ''}>
                <button type="button" class="remove-option">Remove</button>
            </div>
        `;
    }

    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function(tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return charsToReplace[tag] || tag;
        });
    }

    renderAssessmentList() {
        this.container.innerHTML = '';
        assessmentService.getCourseAssessments(this.getCurrentCourseId()).then(assessments => {
            const listHTML = `
                <div class="assessment-list">
                    <div class="assessment-grid">
                        ${assessments.map(a => this.renderAssessmentCard(a)).join('')}
                    </div>
                </div>
            `;
            this.container.insertAdjacentHTML('beforeend', listHTML);
        });
    }

    renderAssessmentCard(assessment) {
        return `
            <div class="assessment-card" data-id="${assessment._id}">
                <h3><i class='fas fa-file-alt' style='margin-right:0.5em;'></i>${assessment.title}</h3>
                <p>${assessment.description}</p>
                <div class="assessment-meta">
                    <span><i class="fas fa-clock"></i> ${assessment.timeLimit} min</span>
                    <span><i class="fas fa-percentage"></i> Pass: ${assessment.passingScore}%</span>
                </div>
                <div class="assessment-actions">
                    <button class="edit-assessment"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-assessment"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.delete-assessment')) {
                this.handleDeleteAssessment(e);
            } else if (e.target.matches('.edit-assessment')) {
                this.handleEditAssessment(e);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.matches('#assessment-form')) {
                e.preventDefault();
                this.handleAssessmentSubmit(e);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('#add-question')) {
                this.addQuestionToForm();
            } else if (e.target.matches('.add-option')) {
                this.handleAddOption(e);
            } else if (e.target.matches('.remove-question')) {
                this.handleRemoveQuestion(e);
            } else if (e.target.matches('.remove-option')) {
                this.handleRemoveOption(e);
            }
        });
    }

    async handleAssessmentSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const assessmentData = {
                title: formData.get('title'),
                description: formData.get('description'),
                timeLimit: parseInt(formData.get('timeLimit')),
                passingScore: parseInt(formData.get('passingScore')),
                courseId: this.getCurrentCourseId(),
                questions: this.getQuestionsData()
            };
            // Check if editing (modal has data-assessment-id)
            const modal = document.querySelector('.assessment-form-modal');
            const editingId = modal && modal.dataset.assessmentId;
            if (editingId) {
                await assessmentService.updateAssessment(editingId, assessmentData);
            } else {
                await assessmentService.createAssessment(assessmentData);
            }
            this.refreshAssessmentList();
            event.target.reset();
            document.querySelector('.assessment-form-modal').remove();
        } catch (error) {
            console.error('Failed to save assessment:', error);
        }
    }

    async handleDeleteAssessment(event) {
        const card = event.target.closest('.assessment-card');
        const assessmentId = card.dataset.id;
        
        if (confirm('Are you sure you want to delete this assessment?')) {
            try {
                await assessmentService.deleteAssessment(assessmentId);
                card.remove();
            } catch (error) {
                console.error('Failed to delete assessment:', error);
            }
        }
    }

    async handleEditAssessment(event) {
        const card = event.target.closest('.assessment-card');
        const assessmentId = card.dataset.id;
        
        try {
            const assessment = await assessmentService.getAssessment(assessmentId);
            this.openAssessmentFormModal(assessment);
        } catch (error) {
            console.error('Failed to load assessment for editing:', error);
        }
    }

    getCurrentCourseId() {
        // Get the course ID from the URL or state management
        return new URLSearchParams(window.location.search).get('courseId');
    }

    getQuestionsData() {
        // Collect questions data from the form
        const questions = [];
        const questionElements = document.querySelectorAll('.question-item');
        
        questionElements.forEach(element => {
            const question = {
                questionText: element.querySelector('[name="questionText"]').value,
                type: element.querySelector('[name="questionType"]').value,
                points: parseInt(element.querySelector('[name="points"]').value),
                options: []
            };

            const optionElements = element.querySelectorAll('.option-item');
            optionElements.forEach(optionEl => {
                question.options.push({
                    text: optionEl.querySelector('[name="optionText"]').value,
                    isCorrect: optionEl.querySelector('[name="isCorrect"]').checked
                });
            });

            questions.push(question);
        });

        return questions;
    }

    async refreshAssessmentList() {
        const listContainer = this.container.querySelector('.assessment-list');
        if (listContainer) {
            listContainer.remove();
        }
        await this.renderAssessmentList();
    }

    handleAddOption(e) {
        const questionItem = e.target.closest('.question-item');
        const optionsContainer = questionItem.querySelector('.options-container');
        optionsContainer.insertAdjacentHTML('beforeend', this.renderOptionInput());
    }

    handleRemoveQuestion(e) {
        const questionItem = e.target.closest('.question-item');
        questionItem.remove();
    }

    handleRemoveOption(e) {
        const optionItem = e.target.closest('.option-item');
        optionItem.remove();
    }
}

// Initialize the assessment management when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AssessmentManagement();
});
