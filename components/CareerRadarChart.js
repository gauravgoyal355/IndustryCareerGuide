import React from 'react';

const CareerRadarChart = ({ scores, skillCategories = [], shareText = '', categoryBreakdown = null }) => {
  // 9 radar dimensions organized with same-category dimensions adjacent for proper polygons
  const radarDimensions = [
    { name: 'Technical Skills', category: 'skills' },
    { name: 'Leadership', category: 'skills' },
    { name: 'Communication', category: 'skills' },
    { name: 'Independence', category: 'values' },
    { name: 'Collaboration', category: 'values' },
    { name: 'Impact Focus', category: 'values' },
    { name: 'Creativity', category: 'temperament' },
    { name: 'Risk Tolerance', category: 'temperament' },
    { name: 'Analytical Thinking', category: 'temperament' }
  ];

  // Always use the predefined radar dimensions for consistent layout
  const categories = radarDimensions.map(d => d.name);
  
  // Map incoming scores to the expected dimension order
  const normalizedScores = radarDimensions.map((dimension, index) => {
    // If we have skillCategories and scores from API, try to match them
    if (skillCategories.length > 0 && scores && scores.length > 0) {
      const apiCategoryIndex = skillCategories.indexOf(dimension.name);
      if (apiCategoryIndex >= 0 && apiCategoryIndex < scores.length) {
        return scores[apiCategoryIndex];
      }
    }
    
    // Default scores for demo/fallback (9 dimensions)
    const defaultScores = [0.7, 0.8, 0.9, 0.6, 0.7, 0.8, 0.9, 0.5, 0.8];
    return defaultScores[index] || 0;
  });

  // Create separate layer data for skills, values, temperament
  const createCategoryLayers = () => {
    if (!categoryBreakdown) {
      // If no breakdown available, show the overall radar data once
      return {
        overall: normalizedScores,
        skills: [],
        values: [],
        temperament: []
      };
    }

    // Create layers where each dimension shows the actual score for its category only
    // Each layer only shows values for dimensions belonging to that category
    const skillsLayer = radarDimensions.map((dim, index) => 
      dim.category === 'skills' ? (normalizedScores[index] || 0) : 0
    );
    
    const valuesLayer = radarDimensions.map((dim, index) => 
      dim.category === 'values' ? (normalizedScores[index] || 0) : 0
    );
    
    const temperamentLayer = radarDimensions.map((dim, index) => 
      dim.category === 'temperament' ? (normalizedScores[index] || 0) : 0
    );

    return {
      overall: normalizedScores,
      skills: skillsLayer,
      values: valuesLayer,
      temperament: temperamentLayer
    };
  };

  const categoryLayers = createCategoryLayers();

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

  // Generate grid lines with improved styling
  const generateGridLines = () => {
    const lines = [];
    const angleStep = (2 * Math.PI) / categories.length;
    
    // Radial lines with gradient effect
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
          stroke="#d1d5db"
          strokeWidth="1.5"
          strokeDasharray="2,3"
          opacity="0.6"
        />
      );
    });

    // Concentric polygons with better styling
    for (let level = 1; level <= numLevels; level++) {
      const radius = (maxRadius / numLevels) * level;
      const points = generatePolygonPoints(
        new Array(categories.length).fill(1),
        radius
      );
      const opacity = 0.3 + (level * 0.1); // Increasing opacity toward center
      lines.push(
        <polygon
          key={`grid-${level}`}
          points={points}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={level === numLevels ? "2" : "1"}
          opacity={opacity}
        />
      );
    }

    return lines;
  };

  // Generate labels with better spacing and styling
  const generateLabels = () => {
    const angleStep = (2 * Math.PI) / categories.length;
    return categories.map((category, index) => {
      const angle = (index * angleStep) - (Math.PI / 2);
      const labelRadius = maxRadius + 35; // Increased distance for better readability
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      // Get category color based on dimension category
      const dimension = radarDimensions[index];
      let textColor = '#374151'; // Default gray
      if (dimension.category === 'skills') textColor = skillsColor;
      else if (dimension.category === 'values') textColor = valuesColor;
      else if (dimension.category === 'temperament') textColor = temperamentColor;
      
      return (
        <text
          key={`label-${index}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-semibold"
          fill={textColor}
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
        >
          {category.toUpperCase()}
        </text>
      );
    });
  };

  // Generate polygon points for each layer
  const overallPoints = generatePolygonPoints(categoryLayers.overall, maxRadius);
  const skillsPoints = categoryLayers.skills.length > 0 ? generatePolygonPoints(categoryLayers.skills, maxRadius) : '';
  const valuesPoints = categoryLayers.values.length > 0 ? generatePolygonPoints(categoryLayers.values, maxRadius) : '';
  const temperamentPoints = categoryLayers.temperament.length > 0 ? generatePolygonPoints(categoryLayers.temperament, maxRadius) : '';

  // Colors for different layers
  const skillsColor = '#3B82F6'; // Blue
  const valuesColor = '#F59E0B'; // Orange
  const temperamentColor = '#8B5CF6'; // Purple

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">CAREER RADAR</h3>
        <p className="text-gray-600 font-medium">PhD Skills, Values, and Temperament Results</p>
      </div>
      
      <div className="flex justify-center">
        <svg width="450" height="450" className="overflow-visible drop-shadow-sm">
          {/* Gradient Definitions */}
          <defs>
            <radialGradient id="skillsGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={skillsColor} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={skillsColor} stopOpacity="0.3"/>
            </radialGradient>
            <radialGradient id="valuesGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={valuesColor} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={valuesColor} stopOpacity="0.3"/>
            </radialGradient>
            <radialGradient id="temperamentGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={temperamentColor} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={temperamentColor} stopOpacity="0.3"/>
            </radialGradient>
          </defs>
          {/* Grid */}
          {generateGridLines()}
          
          {/* Overall radar data - baseline gray */}
          <polygon
            points={overallPoints}
            fill="#9CA3AF"
            fillOpacity="0.1"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          
          {/* Category layers - only render if breakdown is available */}
          {categoryBreakdown && (
            <>
              {/* Skills layer (blue) */}
              {skillsPoints && (
                <polygon
                  points={skillsPoints}
                  fill="url(#skillsGradient)"
                  stroke={skillsColor}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"
                />
              )}
              
              {/* Values layer (orange) */}
              {valuesPoints && (
                <polygon
                  points={valuesPoints}
                  fill="url(#valuesGradient)"
                  stroke={valuesColor}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))"
                />
              )}
              
              {/* Temperament layer (purple) */}
              {temperamentPoints && (
                <polygon
                  points={temperamentPoints}
                  fill="url(#temperamentGradient)"
                  stroke={temperamentColor}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
                />
              )}
            </>
          )}
          
          {/* Overall data points */}
          {normalizedScores.map((score, index) => {
            const angleStep = (2 * Math.PI) / categories.length;
            const angle = (index * angleStep) - (Math.PI / 2);
            const radius = maxRadius * score;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Determine point color based on dominant category for this dimension
            let pointColor = '#9CA3AF'; // Default gray
            if (categoryBreakdown) {
              const dim = radarDimensions[index];
              if (dim?.category === 'skills') pointColor = skillsColor;
              else if (dim?.category === 'values') pointColor = valuesColor;
              else if (dim?.category === 'temperament') pointColor = temperamentColor;
            }
            
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="5"
                fill={pointColor}
                stroke="white"
                strokeWidth="3"
                filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
                className="hover:r-6 transition-all duration-200"
              />
            );
          })}
          
          {/* Labels */}
          {generateLabels()}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4">
        {categoryBreakdown ? (
          <>
            <div className="flex justify-center space-x-6 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: skillsColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Skills & Capabilities
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: valuesColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Work Preferences
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: temperamentColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Thinking Style
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Colored areas show your strengths across different dimensions of career fit
            </p>
          </>
        ) : (
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-400"></div>
              <span className="text-sm font-medium text-gray-700">Overall Profile</span>
            </div>
          </div>
        )}
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