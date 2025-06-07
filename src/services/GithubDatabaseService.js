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
    async saveData(data, message) {
        const success = await super.saveData(data, message);
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
}