export class PuppyActivity {
    constructor(id, activity, time, date, completed = true) {
      this.id = id;
      this.activity = activity;
      this.time = time;
      this.date = date;
      this.completed = completed;
    }
  }
  
  export class PottyLog {
    constructor(id, type, location, time, date, notes = '') {
      this.id = id;
      this.type = type; // 'pee' | 'poop'
      this.location = location; // 'inside' | 'outside'
      this.time = time;
      this.date = date;
      this.notes = notes;
    }
  
    get isSuccessful() {
      return this.location === 'outside';
    }
  
    get isAccident() {
      return this.location === 'inside';
    }
  }
  
  export class PuppyProfile {
    constructor(name, ageWeeks, breed = '') {
      this.name = name;
      this.ageWeeks = ageWeeks;
      this.breed = breed;
    }
  
    get currentMilestoneWeek() {
      const currentWeek = Math.floor(this.ageWeeks / 2) * 2;
      return currentWeek >= 16 ? 16 : Math.max(8, currentWeek);
    }
  }