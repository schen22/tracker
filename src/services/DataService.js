import { PuppyActivity, PottyLog } from '../models/PuppyData.js';

export class DataService {
  constructor() {
    this.activities = [];
    this.pottyLogs = [];
  }

  // Activity methods
  addActivity(activity, time = null) {
    const newActivity = new PuppyActivity(
      Date.now(),
      activity,
      time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date().toISOString().split('T')[0]
    );
    this.activities.unshift(newActivity);
    return newActivity;
  }

  deleteActivity(id) {
    this.activities = this.activities.filter(activity => activity.id !== id);
  }

  getActivitiesByDate(date) {
    return this.activities.filter(activity => activity.date === date);
  }

  // Potty log methods
  addPottyLog(type, location = 'outside', notes = '') {
    const newLog = new PottyLog(
      Date.now(),
      type,
      location,
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date().toISOString().split('T')[0],
      notes
    );
    this.pottyLogs.unshift(newLog);
    return newLog;
  }

  deletePottyLog(id) {
    this.pottyLogs = this.pottyLogs.filter(log => log.id !== id);
  }

  getPottyLogsByDate(date) {
    return this.pottyLogs.filter(log => log.date === date);
  }

  // Bulk operations
  getAllData() {
    return {
      activities: this.activities,
      pottyLogs: this.pottyLogs
    };
  }

  loadData(data) {
    this.activities = data.activities || [];
    this.pottyLogs = data.pottyLogs || [];
  }

  calculateAgeWeeks(birthDate) {
    // Convert to Date object if string is passed
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Validate the birth date
    if (isNaN(birth.getTime())) {
        throw new Error('Invalid birth date provided');
    }
    
    // Calculate difference in milliseconds
    const diffInMs = today.getTime() - birth.getTime();
    
    // Convert to weeks (1000ms * 60s * 60m * 24h * 7d = 604800000ms per week)
    const ageInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);
    
    // Round to nearest week
    return Math.round(ageInWeeks);
}
}