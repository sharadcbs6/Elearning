async function fetchCourses() {
    try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        const courses = await response.json();
        displayCourses(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        // Show error message to user
        const coursesSection = document.querySelector('.course-cards');
        coursesSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load courses. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display courses in the UI
function displayCourses(courses) {
    const coursesContainer = document.querySelector('.course-cards');
    coursesContainer.innerHTML = ''; // Clear existing content

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card fade-up';
        
        // Calculate progress percentage if user is enrolled
        const progress = course.progress ? Math.round((course.completedModules / course.totalModules) * 100) : 0;
        
        courseElement.innerHTML = `
            <div class="course-3d-element"></div>
            <div class="course-content">
                ${course.isBestseller ? '<span class="course-tag">Bestseller</span>' : ''}
                ${course.isNew ? '<span class="course-tag new">New</span>' : ''}
                <h3>${escapeHtml(course.title)}</h3>
                <p>${escapeHtml(course.description)}</p>
                <div class="course-meta">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-user-graduate"></i> ${formatStudentCount(course.enrolledStudents.length)}</span>
                    ${course.rating ? `
                        <span class="course-rating">
                            <i class="fas fa-star"></i> 
                            ${course.rating.toFixed(1)}
                        </span>
                    ` : ''}
                </div>
                ${progress > 0 ? `
                    <div class="course-progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                        <span>${progress}% Complete</span>
                    </div>
                ` : ''}
                <button class="course-cta" onclick="viewCourse('${course._id}')">
                    ${progress > 0 ? 'Continue Learning' : 'Learn More'}
                </button>
            </div>
        `;
        
        coursesContainer.appendChild(courseElement);
    });

    // If no courses found
    if (courses.length === 0) {
        coursesContainer.innerHTML = `
            <div class="no-courses-message">
                <i class="fas fa-books"></i>
                <p>No courses available at the moment.</p>
            </div>
        `;
    }
}

// Helper function to format student count
function formatStudentCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K+ students';
    }
    return count + ' students';
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to handle course view/enrollment
function viewCourse(courseId) {
    window.location.href = `/student/module-viewer.html?courseId=${courseId}`;
}

// Fetch courses when the page loads
document.addEventListener('DOMContentLoaded', fetchCourses);
