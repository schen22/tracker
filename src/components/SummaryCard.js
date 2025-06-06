import React from 'react';

const SummaryCard = ({ value, subtitle, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-3 rounded-lg text-center`}>
      <div className={`text-2xl font-bold ${textColor}`}>
        {value}
      </div>
      <div className={`text-sm ${textColor.replace('600', '800')}`}>
        {subtitle}
      </div>
    </div>
  );
};

export default SummaryCard;