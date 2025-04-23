const API_URL = '/api/assessments';

function getAuthHeaders() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response) {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = { message: 'Unexpected server response.' };
    }
    if (!response.ok) {
        const errorMsg = data && data.message ? data.message : 'Unknown error';
        throw new Error(errorMsg);
    }
    return data;
}

export const assessmentService = {
    // Get all assessments for a course
    getCourseAssessments: async (courseId) => {
        const response = await fetch(`${API_URL}/course/${courseId}`, {
            headers: {
                ...getAuthHeaders()
            }
        });
        return handleResponse(response);
    },

    // Get a specific assessment
    getAssessment: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                ...getAuthHeaders()
            }
        });
        return handleResponse(response);
    },

    // Create a new assessment (teacher only)
    createAssessment: async (assessmentData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(assessmentData)
        });
        return handleResponse(response);
    },

    // Submit an assessment (student only)
    submitAssessment: async (id, answers) => {
        const response = await fetch(`${API_URL}/${id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ answers })
        });
        return handleResponse(response);
    },

    // Get student's submissions for an assessment
    getSubmissions: async (id) => {
        const response = await fetch(`${API_URL}/${id}/submissions`, {
            headers: {
                ...getAuthHeaders()
            }
        });
        return handleResponse(response);
    },

    // Update an assessment (teacher only)
    updateAssessment: async (id, assessmentData) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(assessmentData)
        });
        return handleResponse(response);
    },

    // Delete an assessment (teacher only)
    deleteAssessment: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });
        return handleResponse(response);
    }
};
