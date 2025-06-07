import React from 'react';
import { Milestone } from 'lucide-react';

const MilestoneCard = ({ title, goals, tips }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Milestone className="w-5 h-5" />
            {/* {getWeeklyMilestones().title} */}
            {title}
          </h2>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="text-sm text-gray-800 flex-1">{goal}</span>
              </div>
             ))}
          </div>
          <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
            {/* 💡 {getWeeklyMilestones().tips} */}
            {tips}
          </div>
        </div>
    );
};

export default MilestoneCard;
