import React from 'react';

const CareerRadarChart = ({ scores, skillCategories = [], shareText = '' }) => {
  // Default skill categories if none provided
  const defaultCategories = [
    'Leadership',
    'Communication', 
    'Research',
    'Problem Solving',
    'Independence',
    'Collaboration',
    'Intellectuality',
    'Autonomy'
  ];

  const categories = skillCategories.length > 0 ? skillCategories : defaultCategories;
  
  // Default scores if none provided (for demo purposes)
  const defaultScores = [0.7, 0.8, 0.9, 0.8, 0.6, 0.7, 0.9, 0.7];
  const finalScores = scores && scores.length > 0 ? scores : defaultScores;

  // Ensure we have the same number of scores as categories
  const normalizedScores = categories.map((_, index) => 
    finalScores[index] || 0
  );

  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const numLevels = 5;

  // Generate points for the polygon
  const generatePolygonPoints = (values, radius) => {
    const angleStep = (2 * Math.PI) / values.length;
    return values.map((value, index) => {
      const angle = (index * angleStep) - (Math.PI / 2); // Start from top
      const r = radius * value;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const angleStep = (2 * Math.PI) / categories.length;
    
    // Radial lines
    categories.forEach((_, index) => {
      const angle = (index * angleStep) - (Math.PI / 2);
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      lines.push(
        <line
          key={`radial-${index}`}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    });

    // Concentric polygons
    for (let level = 1; level <= numLevels; level++) {
      const radius = (maxRadius / numLevels) * level;
      const points = generatePolygonPoints(
        new Array(categories.length).fill(1),
        radius
      );
      lines.push(
        <polygon
          key={`grid-${level}`}
          points={points}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }

    return lines;
  };

  // Generate labels
  const generateLabels = () => {
    const angleStep = (2 * Math.PI) / categories.length;
    return categories.map((category, index) => {
      const angle = (index * angleStep) - (Math.PI / 2);
      const labelRadius = maxRadius + 25;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      return (
        <text
          key={`label-${index}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-gray-700"
        >
          {category.toUpperCase()}
        </text>
      );
    });
  };

  // Skills polygon points
  const skillsPoints = generatePolygonPoints(normalizedScores, maxRadius);

  // Colors for different layers
  const skillsColor = '#3B82F6'; // Blue
  const valuesColor = '#F59E0B'; // Orange
  const temperamentColor = '#8B5CF6'; // Purple

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">CAREER RADAR</h3>
        <p className="text-gray-600">PhD Skills, Values, and Temperament Results</p>
      </div>
      
      <div className="flex justify-center">
        <svg width="400" height="400" className="overflow-visible">
          {/* Grid */}
          {generateGridLines()}
          
          {/* Data polygons */}
          <polygon
            points={skillsPoints}
            fill={skillsColor}
            fillOpacity="0.3"
            stroke={skillsColor}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {normalizedScores.map((score, index) => {
            const angleStep = (2 * Math.PI) / categories.length;
            const angle = (index * angleStep) - (Math.PI / 2);
            const radius = maxRadius * score;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill={skillsColor}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {generateLabels()}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: skillsColor }}></div>
          <span className="text-sm font-medium text-gray-700">Skills</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: valuesColor }}></div>
          <span className="text-sm font-medium text-gray-700">Values</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: temperamentColor }}></div>
          <span className="text-sm font-medium text-gray-700">Temperament</span>
        </div>
      </div>
      
      {/* Social Share Buttons */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Share your career radar:</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => {
              const text = shareText || 'Check out my career assessment results from IndustryCareerGuide!';
              const url = window.location.origin;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📱 Share on Twitter
          </button>
          <button
            onClick={() => {
              const text = shareText || 'Check out my career assessment results from IndustryCareerGuide!';
              const url = window.location.origin;
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            💼 Share on LinkedIn
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Career Assessment Results',
                  text: shareText || 'Check out my career assessment results!',
                  url: window.location.href
                });
              } else {
                // Fallback - copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔗 Share Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerRadarChart;