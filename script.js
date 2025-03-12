/**
 * Albion Online Goal Tracker - Main Script
 * 
 * This file contains the core functionality for managing goals,
 * including creating, displaying, and organizing goals by section,
 * timeframe, and tags.
 * 
 * @author Your Name
 * @version 1.0.0
 */

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

/**
 * Global variable to store all goals
 * Data structure:
 * - Organized by section (community, ocular, university, vanguard)
 * - Then by timeframe (1month, 3months, 6months, 1year, 2years)
 * - Each goal contains id, description, deadline, and tags
 */
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

// Store available tags for autocomplete
let availableTags = [];

/**
 * Initialize the application
 * This is the main entry point that sets up all functionality
 */
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
    
    // Set up tag filtering
    setupTagFiltering();
}

/**
 * Load goals from localStorage
 * This retrieves stored goals or initializes with empty structure
 */
function loadGoals() {
    const savedGoals = localStorage.getItem('albionGoals');
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    }
    
    // Extract all unique tags from goals
    updateAvailableTags();
    
    renderAllGoals();
}

/**
 * Extract all unique tags from existing goals
 * This builds a list of available tags for autocomplete and filtering
 */
function updateAvailableTags() {
    const tagSet = new Set();
    
    // Loop through all sections and timeframes
    Object.keys(goals).forEach(section => {
        Object.keys(goals[section]).forEach(timeframe => {
            goals[section][timeframe].forEach(goal => {
                // Check if the goal has tags
                if (goal.tags && Array.isArray(goal.tags)) {
                    goal.tags.forEach(tag => {
                        tagSet.add(tag);
                    });
                }
            });
        });
    });
    
    // Convert Set to Array for easier use
    availableTags = Array.from(tagSet);
    
    // Update the datalist in the UI for tag autocomplete
    updateTagAutocomplete();
}

/**
 * Update the datalist for tag autocomplete in forms
 */
function updateTagAutocomplete() {
    const datalists = document.querySelectorAll('.tag-datalist');
    
    datalists.forEach(datalist => {
        datalist.innerHTML = '';
        
        availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            datalist.appendChild(option);
        });
    });
}

/**
 * Save goals to localStorage
 */
function saveGoals() {
    localStorage.setItem('albionGoals', JSON.stringify(goals));
    
    // Update available tags after saving
    updateAvailableTags();
}

/**
 * Set up authentication form listeners
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

/**
 * Setup navigation between sections
 */
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
                // Always add hidden class first to non-target sections
                section.classList.add('hidden');
                section.classList.remove('active');
                
                if (section.id === targetSection) {
                    // For target section, remove hidden class and add active
                    section.classList.remove('hidden');
                    section.classList.add('active');
                }
            });
        });
    });
}

/**
 * Setup tab switching for timeframes
 */
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
                
                // Show corresponding content with a smooth transition
                const contentElements = document.querySelectorAll(`#${section} .timeframe-content`);
                contentElements.forEach(content => {
                    // First add hidden class
                    content.classList.add('hidden');
                    content.classList.remove('active');
                    
                    if (content.id === `${section}-${timeframe}`) {
                        // For the target content, remove hidden and add active
                        content.classList.remove('hidden');
                        content.classList.add('active');
                    }
                });
            });
        });
    });
}

/**
 * Setup form submission handlers
 * This handles creating new goals with tags
 */
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
            const tagsInput = document.getElementById(`${section}-goal-tags`).value;
            
            // Parse tags from comma-separated string
            const tags = tagsInput.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            
            // Create new goal
            const newGoal = {
                id: Date.now(), // Using timestamp as a simple unique ID
                description: description,
                deadline: deadline,
                tags: tags
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
            
            // Handle tag click for filtering
            if (e.target.classList.contains('goal-tag')) {
                const tag = e.target.textContent;
                const section = e.target.closest('.section').id;
                
                // Set this tag as the active filter
                setTagFilter(section, tag);
            }
        });
    });
}

/**
 * Set up tag filtering functionality
 */
function setupTagFiltering() {
    // Setup filter input events
    document.querySelectorAll('.tag-filter-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const section = input.getAttribute('data-section');
            const filter = input.value.trim();
            
            if (filter) {
                filterGoalsByTag(section, filter);
            } else {
                // Clear filter when input is empty
                clearTagFilter(section);
            }
        });
        
        // Clear button for filter
        input.nextElementSibling.addEventListener('click', () => {
            input.value = '';
            const section = input.getAttribute('data-section');
            clearTagFilter(section);
        });
    });
}

/**
 * Filter goals by tag in a specific section
 * @param {string} section - The section ID to filter
 * @param {string} tag - The tag to filter by
 */
function filterGoalsByTag(section, tag) {
    // Update filter UI
    const filterInput = document.getElementById(`${section}-tag-filter`);
    filterInput.value = tag;
    
    // Store active filter
    document.getElementById(section).setAttribute('data-filter', tag);
    
    // Add filtered class to the section
    document.getElementById(section).classList.add('filtered');
    
    // Show only goals with matching tag
    const allGoalRows = document.querySelectorAll(`#${section} .goal-row`);
    
    allGoalRows.forEach(row => {
        const goalTags = row.getAttribute('data-tags')?.split(',') || [];
        
        if (goalTags.some(goalTag => goalTag.toLowerCase() === tag.toLowerCase())) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
    
    // Update filter indicator
    const filterIndicator = document.getElementById(`${section}-filter-indicator`);
    filterIndicator.textContent = `Filtered by: ${tag}`;
    filterIndicator.classList.remove('hidden');
}

/**
 * Set a tag as the active filter
 * @param {string} section - The section ID
 * @param {string} tag - The tag to filter by
 */
function setTagFilter(section, tag) {
    filterGoalsByTag(section, tag);
}

/**
 * Clear tag filters for a section
 * @param {string} section - The section ID to clear filters for
 */
function clearTagFilter(section) {
    // Clear filter UI
    const filterInput = document.getElementById(`${section}-tag-filter`);
    filterInput.value = '';
    
    // Remove filtered class
    document.getElementById(section).classList.remove('filtered');
    document.getElementById(section).removeAttribute('data-filter');
    
    // Show all goals
    const allGoalRows = document.querySelectorAll(`#${section} .goal-row`);
    allGoalRows.forEach(row => {
        row.classList.remove('hidden');
    });
    
    // Hide filter indicator
    const filterIndicator = document.getElementById(`${section}-filter-indicator`);
    filterIndicator.classList.add('hidden');
}

/**
 * Render all goals for all sections and timeframes
 */
function renderAllGoals() {
    const sections = ['community', 'ocular', 'university', 'vanguard'];
    const timeframes = ['1month', '3months', '6months', '1year', '2years'];
    
    sections.forEach(section => {
        timeframes.forEach(timeframe => {
            renderGoals(section, timeframe);
        });
    });
}

/**
 * Render goals for a specific section and timeframe
 * @param {string} section - The section to render goals for
 * @param {string} timeframe - The timeframe to render goals for
 */
function renderGoals(section, timeframe) {
    const tableBody = document.querySelector(`#${section}-${timeframe} table tbody`);
    tableBody.innerHTML = '';
    
    if (goals[section][timeframe].length === 0) {
        // Show a message if no goals exist
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" style="text-align: center;">No goals added yet</td>
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
        row.classList.add('goal-row');
        
        // Add data attributes for filtering
        if (goal.tags && goal.tags.length > 0) {
            row.setAttribute('data-tags', goal.tags.join(','));
        }
        
        // Format the date nicely
        const deadlineDate = new Date(goal.deadline);
        const formattedDate = deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create tags HTML
        const tagsHtml = goal.tags && goal.tags.length > 0 
            ? `<div class="goal-tags">${goal.tags.map(tag => 
                `<span class="goal-tag" title="Click to filter by this tag">${tag}</span>`).join('')}</div>` 
            : '';
        
        row.innerHTML = `
            <td>
                ${goal.description}
                ${tagsHtml}
            </td>
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
        
        // Apply filter if active
        const activeFilter = document.getElementById(section).getAttribute('data-filter');
        if (activeFilter && row.getAttribute('data-tags')) {
            const goalTags = row.getAttribute('data-tags').split(',');
            if (!goalTags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase())) {
                row.classList.add('hidden');
            }
        }
        
        tableBody.appendChild(row);
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);