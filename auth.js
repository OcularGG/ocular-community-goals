/**
 * User Authentication Module
 * 
 * This module handles user authentication for the Albion Online Goal Tracker.
 * It provides functionality for user registration, login, and access control.
 * 
 * Note: This uses localStorage for persistence, which is acceptable for a simple
 * application but would not be secure for a production environment.
 * 
 * @author Your Name
 * @version 1.0.0
 */

// User storage - holds all registered users
let users = [];

// Current logged-in user
let currentUser = null;

/**
 * Initialize the authentication system
 * This loads existing users or creates a default admin account
 */
function initAuth() {
    // Load any existing users from localStorage
    const savedUsers = localStorage.getItem('albionUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        // Create a default admin account if no users exist
        users = [
            {
                username: 'admin',
                password: 'admin123', // In a real app, use hashed passwords
                isAdmin: true
            }
        ];
        saveUsers();
    }
    
    // Check if user is already logged in (from previous session)
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        updateUIForLoggedInUser();
    } else {
        showLoginForm();
    }
}

/**
 * Save users array to localStorage
 */
function saveUsers() {
    localStorage.setItem('albionUsers', JSON.stringify(users));
}

/**
 * Register a new user
 * 
 * @param {string} username - The desired username
 * @param {string} password - The user's password
 * @param {boolean} isAdmin - Whether the user should have admin privileges
 * @returns {Object} Object with success flag and message
 */
function registerUser(username, password, isAdmin = false) {
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Create new user
    const newUser = { username, password, isAdmin };
    users.push(newUser);
    saveUsers();
    
    return { success: true, message: 'Registration successful!' };
}

/**
 * Login a user with the provided credentials
 * 
 * @param {string} username - The username to check
 * @param {string} password - The password to verify
 * @returns {Object} Object containing success flag and user data or error message
 */
function loginUser(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    } else {
        return { success: false, message: 'Invalid username or password' };
    }
}

/**
 * Log out the current user
 * Clears user data from memory and localStorage
 */
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

/**
 * Check if the current user has admin privileges
 * 
 * @returns {boolean} True if the current user is an admin
 */
function isAdmin() {
    return currentUser && currentUser.isAdmin;
}

/**
 * Update UI based on authentication state
 * Shows/hides elements based on login status and permissions
 */
function updateUIForLoggedInUser() {
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');
    const userInfo = document.getElementById('user-info');
    
    if (currentUser) {
        // Hide auth forms
        authContainer.style.display = 'none';
        
        // Show main content
        mainContent.style.display = 'block';
        
        // Update user info
        userInfo.innerHTML = `
            <span>Logged in as: <strong>${currentUser.username}</strong></span>
            <button id="logout-btn" class="btn-logout">Logout</button>
        `;
        userInfo.style.display = 'flex';
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', function() {
            logoutUser();
            location.reload(); // Refresh the page
        });
        
        // Show/hide admin features
        document.querySelectorAll('.admin-only').forEach(element => {
            element.style.display = isAdmin() ? 'block' : 'none';
        });
    } else {
        // Show auth forms
        authContainer.style.display = 'block';
        
        // Hide main content
        mainContent.style.display = 'none';
        
        // Hide user info
        userInfo.style.display = 'none';
    }
}

/**
 * Show login form
 * Hides registration form and displays login form
 */
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

/**
 * Show registration form
 * Hides login form and displays registration form
 */
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}
