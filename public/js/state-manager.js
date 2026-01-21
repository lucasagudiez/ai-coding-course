/**
 * State Management Utility for Adava University Funnel
 * Handles localStorage, cookies, and server-side persistence
 */

const StateManager = {
    // Configuration
    COOKIE_NAME: 'adava_user_email',
    COOKIE_EXPIRY_DAYS: 30,
    LOCAL_STORAGE_PREFIX: 'adava_',
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/session'
        : '/api/session',
    SUPPORT_EMAIL: 'adavauniversity@gmail.com',
    
    /**
     * Get API URL (production uses relative, dev uses absolute)
     * DRY helper to avoid repeating this logic everywhere
     */
    getApiUrl(endpoint) {
        return window.location.hostname === 'adavauniversity.org' 
            ? endpoint 
            : `http://localhost:3001${endpoint}`;
    },
    
    /**
     * Show error message to user (DRY helper)
     */
    showError(message, includeSupport = true) {
        const fullMessage = includeSupport 
            ? `${message} Please email us at ${this.SUPPORT_EMAIL}` 
            : message;
        alert(fullMessage);
    },
    
    /**
     * Set a cookie
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },
    
    /**
     * Get a cookie
     */
    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    /**
     * Save to localStorage
     */
    saveLocal(key, data) {
        try {
            localStorage.setItem(this.LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('localStorage save error:', e);
            return false;
        }
    },
    
    /**
     * Load from localStorage
     */
    loadLocal(key) {
        try {
            const data = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('localStorage load error:', e);
            return null;
        }
    },
    
    /**
     * Save user email to cookie (for cross-device identification)
     */
    saveUserEmail(email) {
        this.setCookie(this.COOKIE_NAME, email, this.COOKIE_EXPIRY_DAYS);
    },
    
    /**
     * Get user email from cookie
     */
    getUserEmail() {
        return this.getCookie(this.COOKIE_NAME);
    },
    
    /**
     * Save state to server
     */
    async saveToServer(email, data) {
        try {
            const response = await fetch(this.API_URL + '/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, data })
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Server save error:', error);
            return false;
        }
    },
    
    /**
     * Load state from server
     */
    async loadFromServer(email) {
        try {
            const response = await fetch(this.API_URL + `/load?email=${encodeURIComponent(email)}`);
            
            if (response.ok) {
                const result = await response.json();
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Server load error:', error);
            return null;
        }
    },
    
    /**
     * Save complete user state (local + server + cookie)
     */
    async saveUserState(email, data) {
        // Save email to cookie
        this.saveUserEmail(email);
        
        // Save to localStorage
        this.saveLocal('user_data', { email, ...data });
        
        // Save to server (async, don't block)
        this.saveToServer(email, data).catch(err => {
            console.error('Failed to save to server:', err);
        });
    },
    
    /**
     * Load complete user state (try server first, fallback to local)
     */
    async loadUserState(email) {
        // If no email provided, try to get from cookie
        if (!email) {
            email = this.getUserEmail();
        }
        
        if (!email) {
            // Try localStorage as last resort
            return this.loadLocal('user_data');
        }
        
        // Try server first
        const serverData = await this.loadFromServer(email);
        if (serverData) {
            // Also update localStorage
            this.saveLocal('user_data', serverData);
            return serverData;
        }
        
        // Fallback to localStorage
        return this.loadLocal('user_data');
    },
    
    /**
     * Auto-save debounced (to avoid too many requests)
     */
    autoSaveTimeout: null,
    autoSave(email, data, delay = 1000) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveUserState(email, data);
        }, delay);
    },
    
    /**
     * Get URL parameters
     */
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    /**
     * Merge state from multiple sources (URL > Server > Local)
     */
    async getMergedState() {
        const urlParams = this.getUrlParams();
        const email = urlParams.email || this.getUserEmail();
        
        let state = {};
        
        // 1. Load from local
        const localState = this.loadLocal('user_data');
        if (localState) {
            state = { ...state, ...localState };
        }
        
        // 2. Load from server (if email available)
        if (email) {
            const serverState = await this.loadFromServer(email);
            if (serverState) {
                state = { ...state, ...serverState };
            }
        }
        
        // 3. Override with URL params
        state = { ...state, ...urlParams };
        
        return state;
    },
    
    /**
     * Initialize state for a page
     */
    async initPage(pageName) {
        const state = await this.getMergedState();
        
        // Save page-specific progress
        this.saveLocal(`${pageName}_progress`, {
            timestamp: new Date().toISOString(),
            state
        });
        
        return state;
    },
    
    /**
     * Track funnel progress
     */
    trackProgress(page, completionPercent) {
        const progress = this.loadLocal('funnel_progress') || {};
        progress[page] = {
            visited: true,
            completionPercent,
            timestamp: new Date().toISOString()
        };
        this.saveLocal('funnel_progress', progress);
    },
    
    /**
     * Get funnel analytics
     */
    getFunnelAnalytics() {
        return this.loadLocal('funnel_progress') || {};
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
