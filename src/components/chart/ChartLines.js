import React from 'react';
import { Line } from 'recharts';

/**
 * Chart line configuration
 */
const LINE_CONFIGS = {
  pees: {
    stroke: '#3B82F6',
    strokeWidth: 3,
    dot: { fill: '#3B82F6', r: 4 },
    name: 'Pees'
  },
  poops: {
    stroke: '#10B981',
    strokeWidth: 3,
    dot: { fill: '#10B981', r: 4 },
    name: 'Poops'
  },
  feeding: {
    stroke: '#F59E0B',
    strokeWidth: 2,
    dot: { fill: '#F59E0B', r: 3 },
    strokeDasharray: '5 5',
    name: 'Feeding Sessions'
  },
  crate: {
    stroke: '#8B5CF6',
    strokeWidth: 2,
    dot: { fill: '#8B5CF6', r: 3 },
    strokeDasharray: '5 5',
    name: 'Crate Sessions'
  },
  play: {
    stroke: '#FBBF24',
    strokeWidth: 2,
    dot: { fill: '#FBBF24', r: 3 },
    strokeDasharray: '5 5',
    name: 'Play Sessions'
  },
  training: {
    stroke: '#6366F1',
    strokeWidth: 2,
    dot: { fill: '#6366F1', r: 3 },
    strokeDasharray: '5 5',
    name: 'Training Sessions'
  }
};

/**
 * Individual chart line component
 */
const ChartLine = ({ dataKey, hiddenLines, config }) => {
  const isHidden = hiddenLines.has(dataKey);
  
  return (
    <Line
      type="monotone"
      dataKey={dataKey}
      stroke={config.stroke}
      strokeWidth={config.strokeWidth}
      dot={config.dot}
      strokeDasharray={config.strokeDasharray}
      name={config.name}
      strokeOpacity={isHidden ? 0 : 1}
      fillOpacity={isHidden ? 0 : 1}
    />
  );
};

/**
 * Main chart lines component that renders all lines
 */
const ChartLines = ({ hiddenLines }) => {
  return (
    <>
      {/* Main lines for pees and poops */}
      <ChartLine 
        dataKey="pees" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.pees} 
      />
      <ChartLine 
        dataKey="poops" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.poops} 
      />

      {/* Activity frequency lines */}
      <ChartLine 
        dataKey="feeding" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.feeding} 
      />
      <ChartLine 
        dataKey="crate" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.crate} 
      />
      <ChartLine 
        dataKey="play" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.play} 
      />
      <ChartLine 
        dataKey="training" 
        hiddenLines={hiddenLines} 
        config={LINE_CONFIGS.training} 
      />
    </>
  );
};

export default ChartLines;