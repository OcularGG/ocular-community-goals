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
 * @version 1.0.1
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
    try {
        // Load any existing users from localStorage
        const savedUsers = localStorage.getItem('albionUsers');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
            console.log(`Loaded ${users.length} users from localStorage`);
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
            console.log('Created default admin account');
        }
        
        // Check if user is already logged in (from previous session)
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            try {
                currentUser = JSON.parse(loggedInUser);
                console.log(`User ${currentUser.username} logged in from previous session`);
                updateUIForLoggedInUser();
            } catch (e) {
                console.error('Failed to parse current user data:', e);
                localStorage.removeItem('currentUser');
                showLoginForm();
            }
        } else {
            showLoginForm();
        }
    } catch (err) {
        console.error('Error initializing authentication system:', err);
        // Fallback to a clean state
        users = [
            {
                username: 'admin',
                password: 'admin123',
                isAdmin: true
            }
        ];
        showLoginForm();
    }
}

/**
 * Save users array to localStorage
 * @returns {boolean} Success status of the save operation
 */
function saveUsers() {
    try {
        localStorage.setItem('albionUsers', JSON.stringify(users));
        return true;
    } catch (err) {
        console.error('Error saving users to localStorage:', err);
        return false;
    }
}

/**
 * Simple password hashing for demo purposes
 * NOTE: This is NOT secure for production! Use a proper hashing library like bcrypt in production
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
    // This is a simple hash for demonstration only
    // DO NOT use this in production!
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36) + Date.now().toString(36);
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
    // Input validation
    if (!username || username.trim() === '') {
        return { success: false, message: 'Username cannot be empty' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }
    
    // Check if username already exists
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists' };
    }
    
    try {
        // Create new user with hashed password
        const newUser = { 
            username: username.trim(), 
            password: hashPassword(password),
            isAdmin: isAdmin,
            dateCreated: new Date().toISOString()
        };
        users.push(newUser);
        
        if (saveUsers()) {
            console.log(`User registered successfully: ${username}`);
            return { success: true, message: 'Registration successful!' };
        } else {
            return { success: false, message: 'Failed to save user data. Please try again.' };
        }
    } catch (err) {
        console.error('Error during user registration:', err);
        return { success: false, message: 'An error occurred during registration. Please try again.' };
    }
}

/**
 * Login a user with the provided credentials
 * 
 * @param {string} username - The username to check
 * @param {string} password - The password to verify
 * @returns {Object} Object containing success flag and user data or error message
 */
function loginUser(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Username and password are required' };
    }
    
    try {
        // For the demo version with hashed passwords
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (user) {
            // For backward compatibility with existing accounts
            // This allows login with plain text passwords for existing accounts
            const isLegacyMatch = user.password === password;
            const isHashMatch = user.password === hashPassword(password);
            
            if (isLegacyMatch || isHashMatch) {
                currentUser = user;
                try {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    console.log(`User logged in: ${username}`);
                    return { success: true, user };
                } catch (err) {
                    console.error('Error saving current user to localStorage:', err);
                    return { success: false, message: 'Failed to save login session. Please try again.' };
                }
            }
        }
        
        return { success: false, message: 'Invalid username or password' };
    } catch (err) {
        console.error('Error during login:', err);
        return { success: false, message: 'An error occurred during login. Please try again.' };
    }
}

/**
 * Log out the current user
 * Clears user data from memory and localStorage
 */
function logoutUser() {
    try {
        const username = currentUser?.username;
        currentUser = null;
        localStorage.removeItem('currentUser');
        console.log(`User logged out: ${username}`);
        return true;
    } catch (err) {
        console.error('Error during logout:', err);
        return false;
    }
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
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        console.error('Login/register forms not found in the DOM');
    }
}

/**
 * Show registration form
 * Hides login form and displays registration form
 */
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        console.error('Login/register forms not found in the DOM');
    }
}

/**
 * Setup authentication form listeners
 * Handles form submissions and switching between login/register views
 */
function setupAuthListeners() {
    // Login form submission
    document.getElementById('form-login').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = loginUser(username, password);
        
        if (result.success) {
            updateUIForLoggedInUser();
        } else {
            const errorElement = document.getElementById('login-error');
            errorElement.textContent = result.message;
            errorElement.classList.remove('hidden');
        }
    });
    
    // Registration form submission
    document.getElementById('form-register').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        const errorElement = document.getElementById('register-error');
        
        if (password !== confirmPassword) {
            errorElement.textContent = "Passwords don't match";
            errorElement.classList.remove('hidden');
            return;
        }
        
        const result = registerUser(username, password);
        
        if (result.success) {
            // Show success message and switch to login
            showNotification('Registration successful! You can now log in.', 'success');
            showLoginForm();
        } else {
            errorElement.textContent = result.message;
            errorElement.classList.remove('hidden');
        }
    });
    
    // Switch between login and register forms
    const showRegisterLink = document.getElementById('show-register-link');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    const showLoginLink = document.getElementById('show-login-link');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
}
