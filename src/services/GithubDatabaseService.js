class GithubDataService {
    constructor() {
        this.token = import.meta.env.VITE_GITHUB_TOKEN;
        this.repo = import.meta.env.VITE_GITHUB_REPO;
        this.owner = import.meta.env.VITE_GITHUB_OWNER;
        
        if (!this.token || !this.repo || !this.owner) {
            throw new Error('Missing required environment variables');
        }
        
        this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/data`;
        this.cache = new Map(); // Simple in-memory cache
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get data from GitHub
    async getData() {
        try {
            const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 404) {
                // File doesn't exist yet, return empty data structure
                return {
                    pottyLogs: [],
                    activities: [],
                    lastUpdated: new Date().toISOString()
                };
            }

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const fileData = await response.json();
            const content = JSON.parse(atob(fileData.content));
            return content;
        } catch (error) {
            console.error('Error fetching data from GitHub:', error);
            // Return empty data structure on error
            return {
                pottyLogs: [],
                activities: [],
                lastUpdated: new Date().toISOString()
            };
        }
    }

    // Save data to GitHub
    async saveData(data, message = 'Update puppy data') {
        try {
            const content = btoa(JSON.stringify(data, null, 2));
            
            // First, try to get the current file to get its SHA
            let sha = null;
            try {
                const currentFile = await fetch(`${this.baseUrl}/puppy-data.json`, {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (currentFile.ok) {
                    const fileData = await currentFile.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // File might not exist yet, which is fine
            }

            const payload = {
                message,
                content,
                ...(sha && { sha }) // Include SHA if file exists
            };

            const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to save data: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error saving data to GitHub:', error);
            return false;
        }
    }

    // Add caching for better performance
    async getCachedData() {
        const cacheKey = 'puppy-data';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const freshData = await this.getData();
        this.cache.set(cacheKey, {
            data: freshData,
            timestamp: Date.now()
        });
        
        return freshData;
    }

    // Invalidate cache on save
    async saveCachedData(data, message) {
        const success = await this.saveData(data, message);
        if (success) {
            this.cache.clear(); // Clear cache after successful save
        }
        return success;
    }

    // Add connection status checking
    async checkConnection() {
        try {
            const response = await fetch('https://api.github.com/rate_limit', {
                headers: { 'Authorization': `token ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    connected: true,
                    remaining: data.core.remaining,
                    resetTime: new Date(data.core.reset * 1000)
                };
            }
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    // Helper methods for puppy data
    async addPottyLog(type, location, notes = '') {
        const data = await this.getCachedData();
        const newLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type, // 'pee', 'poop', 'accident'
            location, // 'outside', 'inside', 'crate'
            notes
        };
        
        data.pottyLogs.push(newLog);
        data.lastUpdated = new Date().toISOString();
        
        return await this.saveCachedData(data, `Add potty log: ${type} ${location}`);
    }

    async addActivity(activity, duration = null) {
        const data = await this.getCachedData();
        const newActivity = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            activity, // 'walk', 'play', 'training', 'sleep', 'meal'
            duration // in minutes
        };
        
        data.activities.push(newActivity);
        data.lastUpdated = new Date().toISOString();
        
        return await this.saveCachedData(data, `Add activity: ${activity}`);
    }

    async getPottyLogsByDate(dateString) {
        const data = await this.getCachedData();
        return data.pottyLogs.filter(log => 
            log.timestamp.startsWith(dateString)
        );
    }

    async getActivitiesByDate(dateString) {
        const data = await this.getCachedData();
        return data.activities.filter(activity => 
            activity.timestamp.startsWith(dateString)
        );
    }

    // Calculate age in weeks from birth date
    calculateAgeWeeks(birthDateString) {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        const diffTime = Math.abs(today - birthDate);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    }
}

export default GithubDataService;