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

// Navigation between sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active navigation link
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section, hide others
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// Tab switching for timeframes
document.querySelectorAll('.timeframe-tabs').forEach(tabContainer => {
    const tabButtons = tabContainer.querySelectorAll('.tab-btn');
    const section = tabContainer.closest('.section').id;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const timeframe = button.getAttribute('data-timeframe');
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding content
            const contentElements = document.querySelectorAll(`#${section} .timeframe-content`);
            contentElements.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${section}-${timeframe}`) {
                    content.classList.add('active');
                }
            });
        });
    });
});

// Form submission handlers
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
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
                <button class="action-btn delete-btn" data-id="${goal.id}" data-section="${section}" data-timeframe="${timeframe}">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners for delete buttons