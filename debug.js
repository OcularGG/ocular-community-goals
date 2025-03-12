/**
 * Debug and Troubleshooting Utilities
 * 
 * This file provides debugging tools for the Goal Tracker application.
 * It helps diagnose issues with data storage, authentication, and app state.
 * 
 * @author Your Name
 * @version 1.0.0
 */

// Enable/disable debug mode
const DEBUG = true;

/**
 * Enhanced console logger with app context
 * @param {string} message - The message to log
 * @param {any} data - Optional data to include in the log
 * @param {string} level - Log level (log, warn, error, info)
 */
function appLog(message, data = null, level = 'log') {
    if (!DEBUG) return;
    
    const styles = {
        app: 'color: #0d8be8; font-weight: bold;',
        message: 'color: #111827;',
        time: 'color: #6b7280; font-style: italic;'
    };
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    
    if (data) {
        console[level](
            `%c[Goal Tracker]%c ${message} %c(${timestamp})`, 
            styles.app, styles.message, styles.time, 
            data
        );
    } else {
        console[level](
            `%c[Goal Tracker]%c ${message} %c(${timestamp})`, 
            styles.app, styles.message, styles.time
        );
    }
}

/**
 * Check the health of localStorage
 * @returns {Object} Status of localStorage
 */
function checkStorageHealth() {
    try {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
            return { 
                available: false, 
                error: 'localStorage not supported in this browser'
            };
        }
        
        // Try writing and reading from localStorage
        const testKey = '_storage_test_';
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testValue !== 'test') {
            return { 
                available: false, 
                error: 'localStorage read/write test failed'
            };
        }
        
        // Check space usage
        let totalSize = 0;
        let items = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = (key.length + value.length) * 2; // UTF-16 characters × 2 bytes
            
            totalSize += size;
            items[key] = {
                size: `${(size / 1024).toFixed(2)} KB`,
                bytes: size
            };
        }
        
        // Check if close to quota (typically 5-10MB)
        const limit = 5 * 1024 * 1024; // 5MB is a common limit
        const usage = (totalSize / limit) * 100;
        
        return {
            available: true,
            usage: `${(totalSize / 1024).toFixed(2)} KB / ~5MB`,
            percentUsed: `${usage.toFixed(1)}%`,
            items: items,
            warning: usage > 80 ? 'Storage usage is high, consider clearing old data' : null
        };
    } catch (e) {
        return {
            available: false,
            error: e.message
        };
    }
}

/**
 * Export application data for backup
 * @returns {Object} Application data export
 */
function exportAppData() {
    try {
        const userData = localStorage.getItem('albionUsers');
        const goalData = localStorage.getItem('albionGoals');
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0.1',
            data: {
                users: userData ? JSON.parse(userData) : null,
                goals: goalData ? JSON.parse(goalData) : null
            }
        };
        
        // Anonymize user data for security
        if (exportData.data.users) {
            exportData.data.users = exportData.data.users.map(user => ({
                username: user.username,
                isAdmin: user.isAdmin,
                // Remove passwords
                hasPassword: Boolean(user.password)
            }));
        }
        
        return {
            success: true,
            data: exportData
        };
    } catch (e) {
        return {
            success: false,
            error: e.message
        };
    }
}

// Initialize debug tools when in debug mode
if (DEBUG) {
    // Listen for app load
    window.addEventListener('DOMContentLoaded', () => {
        appLog('Debug tools initialized', null, 'info');
        
        // Add debug commands to window for console access
        window._debug = {
            checkStorage: checkStorageHealth,
            exportData: exportAppData,
            clearStorage: () => {
                if (confirm('This will clear ALL app data. Are you sure?')) {
                    localStorage.clear();
                    location.reload();
                    return true;
                }
                return false;
            },
            resetToDefaults: () => {
                if (confirm('Reset to default settings? This will preserve user accounts.')) {
                    const users = localStorage.getItem('albionUsers');
                    localStorage.clear();
                    if (users) localStorage.setItem('albionUsers', users);
                    location.reload();
                    return true;
                }
                return false;
            }
        };
        
        // Check storage health on startup
        const storageStatus = checkStorageHealth();
        if (!storageStatus.available || storageStatus.warning) {
            appLog('Storage health check warning', storageStatus, 'warn');
        }
    });
}
