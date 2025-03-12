// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Global variable to store goals
let goals = {
    community: {
        '1month': [],
        '3months': [],
        '6months': [],
        '1year': [],
        '2years': []
    },
    ocular: {
        '1month': [],
        '3months': [],
        '6months': [],
        '1year': [],
        '2years': []
    },
    university: {
        '1month': [],
        '3months': [],
        '6months': [],
        '1year': [],
        '2years': []
    },
    vanguard: {
        '1month': [],
        '3months': [],
        '6months': [],
        '1year': [],
        '2years': []
    }
};

// Initialize the application
function init() {
    // Initialize authentication system
    initAuth();
    
    // Load goals from localStorage
    loadGoals();
    
    // Set up event listeners for auth forms
    setupAuthListeners();
    
    // Set up navigation between sections
    setupNavigation();
    
    // Set up tab switching
    setupTabSwitching();
    
    // Set up form submission handlers
    setupFormHandlers();
}

// Load goals from localStorage
function loadGoals() {
    const savedGoals = localStorage.getItem('albionGoals');
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    }
    renderAllGoals();
}

// Save goals to localStorage
function saveGoals() {
    localStorage.setItem('albionGoals', JSON.stringify(goals));
}

// Set up authentication form listeners
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
            alert('Registration successful! You can now log in.');
            showLoginForm();
        } else {
            errorElement.textContent = result.message;
            errorElement.classList.remove('hidden');
        }
    });
    
    // Switch between login and register forms
    document.getElementById('show-register-link').addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('show-login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

// Setup navigation between sections
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active navigation link
            navLinks.forEach(nav => {
                nav.classList.remove('active');
                nav.setAttribute('data-active', 'false');
            });
            link.classList.add('active');
            link.setAttribute('data-active', 'true');
            
            // Show target section, hide others
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Setup tab switching for timeframes
function setupTabSwitching() {
    document.querySelectorAll('.timeframe-tabs').forEach(tabContainer => {
        const tabButtons = tabContainer.querySelectorAll('.tab-btn');
        const section = tabContainer.closest('.section').id;
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const timeframe = button.getAttribute('data-timeframe');
                
                // Update active tab
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('data-active', 'false');
                });
                button.classList.add('active');
                button.setAttribute('data-active', 'true');
                
                // Show corresponding content
                const contentElements = document.querySelectorAll(`#${section} .timeframe-content`);
                contentElements.forEach(content => {
                    content.classList.remove('active');
                    content.classList.add('hidden');
                    if (content.id === `${section}-${timeframe}`) {
                        content.classList.add('active');
                        content.classList.remove('hidden');
                    }
                });
            });
        });
    });
}

// Setup form submission handlers
function setupFormHandlers() {
    document.querySelectorAll('form[id$="-goal-form"]').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Only allow admins to add goals
            if (!isAdmin()) {
                alert("You don't have permission to add goals.");
                return;
            }
            
            const section = form.id.split('-')[0]; // Extract section name
            const description = document.getElementById(`${section}-goal-desc`).value;
            const deadline = document.getElementById(`${section}-goal-deadline`).value;
            const timeframe = document.getElementById(`${section}-goal-timeframe`).value;
            
            // Create new goal
            const newGoal = {
                id: Date.now(), // Using timestamp as a simple unique ID
                description: description,
                deadline: deadline
            };
            
            // Add goal to data structure
            goals[section][timeframe].push(newGoal);
            
            // Save to localStorage
            saveGoals();
            
            // Render updated goals
            renderGoals(section, timeframe);
            
            // Reset form
            form.reset();
        });
    });
    
    // Setup event delegation for delete buttons
    document.querySelectorAll('.goal-tables').forEach(tablesContainer => {
        tablesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                // Only allow admins to delete goals
                if (!isAdmin()) {
                    alert("You don't have permission to delete goals.");
                    return;
                }
                
                const goalId = parseInt(e.target.getAttribute('data-id'));
                const section = e.target.getAttribute('data-section');
                const timeframe = e.target.getAttribute('data-timeframe');
                
                // Filter out the deleted goal
                goals[section][timeframe] = goals[section][timeframe].filter(goal => goal.id !== goalId);
                
                // Save to localStorage
                saveGoals();
                
                // Re-render the goals
                renderGoals(section, timeframe);
            }
        });
    });
}

// Render all goals for all sections and timeframes
function renderAllGoals() {
    const sections = ['community', 'ocular', 'university', 'vanguard'];
    const timeframes = ['1month', '3months', '6months', '1year', '2years'];
    
    sections.forEach(section => {
        timeframes.forEach(timeframe => {
            renderGoals(section, timeframe);
        });
    });
}

// Render goals for a specific section and timeframe
function renderGoals(section, timeframe) {
    const tableBody = document.querySelector(`#${section}-${timeframe} table tbody`);
    tableBody.innerHTML = '';
    
    if (goals[section][timeframe].length === 0) {
        // Show a message if no goals exist
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="3" style="text-align: center;">No goals added yet</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Sort goals by deadline (ascending)
    const sortedGoals = [...goals[section][timeframe]].sort((a, b) => 
        new Date(a.deadline) - new Date(b.deadline)
    );
    
    // Create table rows for each goal
    sortedGoals.forEach(goal => {
        const row = document.createElement('tr');
        
        // Format the date nicely
        const deadlineDate = new Date(goal.deadline);
        const formattedDate = deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${goal.description}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="action-btn delete-btn ${!isAdmin() ? 'hidden' : ''}" 
                        data-id="${goal.id}" 
                        data-section="${section}" 
                        data-timeframe="${timeframe}">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);