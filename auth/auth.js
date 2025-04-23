// Authentication module for e-learning platform
class Auth {
    constructor() {
        this.token = localStorage.getItem('token') || null;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            this.token = data.token;
            this.currentUser = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.token = data.token;
            this.currentUser = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    isAuthenticated() {
        return !!this.token;
    }

    isTeacher() {
        return this.currentUser && this.currentUser.role === 'teacher';
    }

    isStudent() {
        return this.currentUser && this.currentUser.role === 'student';
    }
}

export const auth = new Auth();
