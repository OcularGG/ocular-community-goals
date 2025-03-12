// User Authentication Module

// User storage
let users = [];
let currentUser = null;

// Initialize the auth system
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

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('albionUsers', JSON.stringify(users));
}

// Register a new user
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

// Login user
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

// Logout user
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

// Check if user is logged in and is an admin
function isAdmin() {
    return currentUser && currentUser.isAdmin;
}

// Update UI based on authentication state
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

// Show login form
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Show registration form
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}
