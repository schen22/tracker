import DateTimeUtils from '../utils/DateTimeUtils.js';

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

    // Simple operation serialization to prevent concurrent SHA conflicts
    this.saveInProgress = false;
    this.pendingSaveOperations = [];

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

      if (response.ok) {
        this.setConnectionStatus({
          connected: true,
          checking: false,
          error: null
        });
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
    } catch (error) {
      this.setError(`Failed to load data: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async fetchDataFromGitHub() {
    try {
      // Use only standard headers to avoid CORS issues
      const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": `"${this.repo}/1.0"`
        }
      });

      if (response.status === 404) {
        console.log("fetchData - 404, returning empty data");
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
      console.log("fetchData from github:", content);

      return content;
    } catch (error) {
      console.error("Error fetching data from GitHub:", error);
      throw error;
    }
  }

  async saveDataToGitHub(newData, message = "Update puppy data") {
    if (!this.connectionStatus.connected) {
      throw new Error("Not connected to GitHub");
    }

    // Queue the operation to prevent concurrent saves
    return new Promise((resolve, reject) => {
      this.pendingSaveOperations.push({ newData, message, resolve, reject });
      this.processSaveQueue();
    });
  }

  async processSaveQueue() {
    if (this.saveInProgress || this.pendingSaveOperations.length === 0) {
      return;
    }

    this.saveInProgress = true;

    while (this.pendingSaveOperations.length > 0) {
      const {
        newData,
        message,
        resolve,
        reject
      } = this.pendingSaveOperations.shift();

      try {
        const result = await this.performSave(newData, message);
        resolve(result);
        // Small delay between operations to avoid rapid-fire requests
        if (this.pendingSaveOperations.length > 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (error) {
        reject(error);
      }
    }

    this.saveInProgress = false;
  }

  async performSave(newData, message, retryCount = 0) {
    // Prevent infinite retries
    if (retryCount > 3) {
      throw new Error("Too many retry attempts, operation failed");
    }

    try {
      console.log(
        `Save attempt ${retryCount + 1}: Getting latest file info for SHA...`
      );

      let currentSHA = null;
      let latestData = null;

      try {
        // Use only standard headers to avoid CORS issues
        const fileResponse = await fetch(`${this.baseUrl}/puppy-data.json`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": `"${this.repo}/1.0"`
          }
        });

        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          currentSHA = fileData.sha;
          latestData = JSON.parse(atob(fileData.content));
          console.log("Got current SHA:", currentSHA);
        } else if (fileResponse.status !== 404) {
          throw new Error(`Failed to get file info: ${fileResponse.status}`);
        }
        // If 404, file doesn't exist yet, SHA will be null (which is correct for new files)
      } catch (error) {
        console.error("Error getting current SHA:", error);
        throw error;
      }

      // If we have latest data from GitHub, merge our changes with it
      let finalData = newData;
      if (latestData && retryCount > 0) {
        console.log("Merging with latest remote data due to conflict...");
        finalData = this.mergeData(newData, latestData);
      }

      const payload = {
        message,
        content: btoa(JSON.stringify(finalData, null, 2))
      };

      // Only include SHA if file exists
      if (currentSHA) {
        payload.sha = currentSHA;
      }

      console.log("Saving data with SHA:", currentSHA);

      const response = await fetch(`${this.baseUrl}/puppy-data.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": `"${this.repo}/1.0"`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle SHA conflicts with retry
        if (response.status === 409 && retryCount < 3) {
          console.log(
            `SHA conflict detected (attempt ${retryCount + 1}), retrying...`
          );
          // Longer delay to allow any caches to clear
          const delay = 1000 + retryCount * 1000; // 2s, 3s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.performSave(newData, message, retryCount + 1);
        }

        throw new Error(
          `Failed to save data: ${response.status} - ${errorData.message ||
            response.statusText}`
        );
      }

      console.log("Data saved successfully");

      // Update local state to match what was actually saved
      this.setData(finalData);

      return true;
    } catch (error) {
      console.error("Error saving data to GitHub:", error);
      throw error;
    }
  }

  // Smart data merging to handle concurrent updates
  mergeData(localData, remoteData) {
    // Simple merge strategy: combine arrays and deduplicate by ID
    const mergedPottyLogs = this.mergeArraysById(
      localData.pottyLogs || [],
      remoteData.pottyLogs || []
    );

    const mergedActivities = this.mergeArraysById(
      localData.activities || [],
      remoteData.activities || []
    );

    return {
      pottyLogs: mergedPottyLogs,
      activities: mergedActivities,
      lastUpdated: new Date().toISOString()
    };
  }

  mergeArraysById(localArray, remoteArray) {
    const merged = [...remoteArray];

    localArray.forEach(localItem => {
      const existsInRemote = remoteArray.find(
        remoteItem => remoteItem.id === localItem.id
      );
      if (!existsInRemote) {
        merged.push(localItem);
      }
    });

    // Sort by timestamp
    return merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
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
      } else {
        this.setData(updatedData);
      }
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
      } else {
        this.setData(updatedData);
      }
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
      } else {
        this.setData(updatedData);
      }
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
      } else {
        this.setData(updatedData);
      }
      return true;
    } catch (error) {
      this.setError(`Failed to delete activity: ${error.message}`);
      return false;
    }
  }

  // Filter methods - handle missing data gracefully
  getPottyLogsByDate(dateString) {
    if (!this.data.pottyLogs) return [];
    return this.data.pottyLogs.filter(log => {
      // Handle both date field and timestamp-based filtering
      if (log.date) {
        return log.date === dateString;
      } else if (log.timestamp) {
        return DateTimeUtils.toLocalDateString(log.timestamp) === dateString;
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
        return DateTimeUtils.toLocalDateString(activity.timestamp) === dateString;
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

  // Calculate success rate for a given date
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
    this.pendingSaveOperations = [];
  }
}

export default DataService;
