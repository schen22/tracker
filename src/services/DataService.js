import { scaleLog } from "d3-scale";

class DataService {
  constructor() {
    // GitHub API configuration
    this.token = process.env.REACT_APP_GITHUB_TOKEN;
    this.repo = process.env.REACT_APP_GITHUB_REPO;
    this.owner = process.env.REACT_APP_GITHUB_OWNER;

    if (!this.token || !this.repo || !this.owner) {
      console.warn(
        "Missing GitHub environment variables - running in offline mode"
      );
    }

    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/data`;

    console.log("GitHub Config:", {
      owner: this.owner,
      repo: this.repo,
      token: this.token ? `${this.token.substring(0, 4)}...` : "missing",
      baseUrl: this.baseUrl
    });

    // Event system for reactive updates
    this.listeners = new Map();

    // Internal state
    this.data = {
      pottyLogs: [],
      activities: [],
      lastUpdated: new Date().toISOString()
    };

    this.connectionStatus = {
      connected: false,
      checking: false,
      remaining: null,
      error: null
    };

    this.isLoading = false;
    this.error = null;
    this.lastRefresh = null;

    // Cache for performance
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    console.log("initializing connection check");
    // Initialize connection check
    this.checkConnection();
  }

  // Event system methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // State getters
  getData() {
    return this.data;
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  getLoadingState() {
    return this.isLoading;
  }

  getError() {
    return this.error;
  }

  getLastRefresh() {
    return this.lastRefresh;
  }

  // Set loading state and emit event
  setLoading(loading) {
    this.isLoading = loading;
    this.emit("loadingChange", loading);
  }

  // Set error state and emit event
  setError(error) {
    this.error = error;
    this.emit("errorChange", error);
  }

  // Clear error
  clearError() {
    this.setError(null);
  }

  // Set connection status and emit event
  setConnectionStatus(status) {
    this.connectionStatus = { ...this.connectionStatus, ...status };
    this.emit("connectionChange", this.connectionStatus);
  }

  // Set data and emit event
  setData(data) {
    this.data = data;
    this.emit("dataChange", data);
  }

  // Check GitHub API connection
  async checkConnection() {
    if (!this.token) {
      this.setConnectionStatus({
        connected: false,
        checking: false,
        error: "No GitHub token"
      });
      return;
    }

    this.setConnectionStatus({ checking: true });

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "User-Agent": "PuppyTracker/1.0"
          }
        }
      );

      console.log("reached 150");
      if (response.ok) {
        this.setConnectionStatus({
          connected: true,
          checking: false,
          error: null
        });
        console.log("reached 157");
        await this.loadData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cannot access repository: ${response.status} - ${errorData.message ||
            response.statusText}`
        );
      }
    } catch (error) {
      this.setConnectionStatus({
        connected: false,
        checking: false,
        error: error.message
      });
    }
  }

  // Load data from GitHub
  async loadData() {
    if (!this.connectionStatus.connected) {
      return;
    }

    this.setLoading(true);
    this.clearError();

    try {
      const data = await this.fetchDataFromGitHub();
      this.setData(data);
      this.lastRefresh = new Date();

      // Cache the data
      this.cache.set("puppy-data", {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      this.setError(`Failed to load data: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async fetchDataFromGitHub() {
    try {
      const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": `"${this.repo}/1.0"`
        }
      });

      if (response.status === 404) {
        console.log("fetchData  - 404 ");
        // File doesn't exist yet, return empty data structure
        return {
          pottyLogs: [],
          activities: [],
          lastUpdated: new Date().toISOString()
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `GitHub API error: ${response.status} ${
            response.statusText
          } - ${errorData.message || ""}`
        );
      }

      const fileData = await response.json();
      const content = JSON.parse(atob(fileData.content));
      console.log("fetchData from github = ", fileData);
      return content;
    } catch (error) {
      console.error("Error fetching data from GitHub:", error);
      throw error;
    }
  }

  async saveDataToGitHub(data, message = "Update puppy data") {
    if (!this.connectionStatus.connected) {
      throw new Error("Not connected to GitHub");
    }

    try {
      const content = btoa(JSON.stringify(data, null, 2));

      // Get current file SHA if it exists
      let sha = null;
      try {
        console.log("saving data to github");
        const currentFile = await fetch(`${this.baseUrl}/puppy-data.json`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": `"${this.repo}/1.0"`
          }
        });

        if (currentFile.ok) {
          const fileData = await currentFile.json();
          sha = fileData.sha;
          console.log("sha = ", sha);
        }
      } catch (error) {
        // File might not exist yet, which is fine
      }

      const payload = {
        message,
        content,
        ...(sha && { sha })
      };

      const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`, // Changed to Bearer
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": `"${this.repo}/1.0"`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save data: ${response.status} - ${errorData.message ||
            response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error saving data to GitHub:", error);
      throw error;
    }
  }

  async addPottyLog(type, location, notes = "") {
    try {
      const now = new Date();
      const newLog = {
        id: Date.now().toString(),
        timestamp: now.toISOString(),
        type, // 'pee', 'poop', 'accident'
        location, // 'outside', 'inside', 'crate'
        notes,
        // Add computed fields for consistency
        isSuccessful: type !== "accident" && location === "outside",
        isAccident:
          type === "accident" || location === "inside" || location === "crate"
      };

      const updatedData = {
        ...this.data,
        pottyLogs: [...this.data.pottyLogs, newLog],
        lastUpdated: new Date().toISOString()
      };

      // Save to GitHub if connected, otherwise just update local state
      if (this.connectionStatus.connected) {
        await this.saveDataToGitHub(
          updatedData,
          `Add potty log: ${type} ${location}`
        );
      }

      this.setData(updatedData);
      return true;
    } catch (error) {
      this.setError(`Failed to add potty log: ${error.message}`);
      return false;
    }
  }

  async addActivity(activity, duration = null) {
    try {
      const now = new Date();
      const newActivity = {
        id: Date.now().toString(),
        timestamp: now.toISOString(),
        activity, // 'walk', 'play', 'training', 'sleep', 'meal'
        duration // in minutes
      };

      const updatedData = {
        ...this.data,
        activities: [...this.data.activities, newActivity],
        lastUpdated: new Date().toISOString()
      };

      // Save to GitHub if connected, otherwise just update local state
      if (this.connectionStatus.connected) {
        await this.saveDataToGitHub(updatedData, `Add activity: ${activity}`);
      }

      this.setData(updatedData);
      return true;
    } catch (error) {
      this.setError(`Failed to add activity: ${error.message}`);
      return false;
    }
  }

  // Delete potty log
  async deletePottyLog(logId) {
    console.log("delete potty log w id: ", logId);
    try {
      const updatedData = {
        ...this.data,
        pottyLogs: this.data.pottyLogs.filter(log => log.id !== logId),
        lastUpdated: new Date().toISOString()
      };

      if (this.connectionStatus.connected) {
        await this.saveDataToGitHub(updatedData, `Delete potty log: ${logId}`);
      }

      this.setData(updatedData);
      return true;
    } catch (error) {
      this.setError(`Failed to delete potty log: ${error.message}`);
      return false;
    }
  }

  // Delete activity
  async deleteActivity(activityId) {
    try {
      const updatedData = {
        ...this.data,
        activities: this.data.activities.filter(
          activity => activity.id !== activityId
        ),
        lastUpdated: new Date().toISOString()
      };

      if (this.connectionStatus.connected) {
        await this.saveDataToGitHub(
          updatedData,
          `Delete activity: ${activityId}`
        );
      }

      this.setData(updatedData);
      return true;
    } catch (error) {
      this.setError(`Failed to delete activity: ${error.message}`);
      return false;
    }
  }

  // Filter methods - FIXED: handle missing data gracefully
  getPottyLogsByDate(dateString) {
    if (!this.data.pottyLogs) return [];
    return this.data.pottyLogs.filter(log => {
      // Handle both date field and timestamp-based filtering
      if (log.date) {
        return log.date === dateString;
      } else if (log.timestamp) {
        return log.timestamp.startsWith(dateString);
      }
      return false;
    });
  }

  getActivitiesByDate(dateString) {
    if (!this.data.activities) return [];
    return this.data.activities.filter(activity => {
      // Handle both date field and timestamp-based filtering
      if (activity.date) {
        return activity.date === dateString;
      } else if (activity.timestamp) {
        return activity.timestamp.startsWith(dateString);
      }
      return false;
    });
  }

  getAllData() {
    return {
      activities: this.data.activities || [],
      pottyLogs: this.data.pottyLogs || []
    };
  }

  // Calculate success rate for a given date - FIXED: use consistent logic
  calculateSuccessRateForDate(dateString) {
    const logs = this.getPottyLogsByDate(dateString);
    if (logs.length === 0) return 0;

    const successfulLogs = logs.filter(log => {
      // Use isSuccessful field if available, otherwise fall back to computed logic
      if (log.hasOwnProperty("isSuccessful")) {
        return log.isSuccessful;
      }
      return log.type !== "accident" && log.location === "outside";
    });

    return Math.round((successfulLogs.length / logs.length) * 100);
  }

  // Calculate age in weeks from birth date
  calculateAgeWeeks(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    const diffTime = Math.abs(today - birthDate);
    const diffWeeks =
      Math.ceil((diffTime / (1000 * 60 * 60 * 24 * 7)) * 100) / 100;
    return diffWeeks;
  }

  // Cleanup method
  destroy() {
    this.listeners.clear();
  }
}

export default DataService;
