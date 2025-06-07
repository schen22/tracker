export class MilestoneService {
  constructor() {
    this.milestones = {
      8: {
        title: "Week 8-9: Foundation Building",
        goals: [
          "Successfully go potty outside 50% of the time",
          "Comfortable in crate for 1-2 hours during day",
          "Basic socialization with household sounds",
          "Eating solid food 3x daily",
          "Sleep through most of the night (5-6 hours)"
        ],
        tips:
          "Focus on routine and positive reinforcement. Accidents are normal!"
      },
      10: {
        title: "Week 10-11: Building Confidence",
        goals: [
          "Potty success rate 60-70%",
          "Walk on leash for short distances indoors",
          "Respond to name consistently",
          "Comfortable being alone in crate for 2-3 hours",
          "Basic 'sit' command with treats"
        ],
        tips: "Start basic commands and extend crate time gradually."
      },
      12: {
        title: "Week 12-13: Expanding Skills",
        goals: [
          "Potty success rate 70-80%",
          "Walk outdoors on leash (after vaccinations)",
          "Come when called in secure area",
          "Sleep in crate all night without whining",
          "Basic 'stay' for 5-10 seconds"
        ],
        tips: "Begin controlled outdoor exposure and socialization."
      },
      14: {
        title: "Week 14-15: Socialization Focus",
        goals: [
          "Potty success rate 80-85%",
          "Meet new people calmly",
          "Basic leash walking without excessive pulling",
          "Comfortable with grooming (brushing, nail touching)",
          "Down command with treats"
        ],
        tips:
          "Critical socialization period - expose to new experiences positively."
      },
      16: {
        title: "Week 16+: Advanced Training",
        goals: [
          "Potty success rate 85-95%",
          "Reliable recall in fenced areas",
          "Wait politely for food",
          "Basic impulse control exercises",
          "Comfortable with car rides"
        ],
        tips: "Focus on consistency and building advanced skills."
      }
    };
  }

  getMilestoneForWeek(week) {
    const milestoneWeek = Math.floor(week / 2) * 2;
    const weekKey = milestoneWeek >= 16 ? 16 : Math.max(8, milestoneWeek);
    return this.milestones[weekKey] || this.milestones[8];
  }

  getAllMilestones() {
    return this.milestones;
  }

  getNextMilestone(currentWeek) {
    const nextWeek = currentWeek + 2;
    return this.getMilestoneForWeek(nextWeek);
  }
}
