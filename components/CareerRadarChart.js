import React from 'react';

const CareerRadarChart = ({ scores, skillCategories = [], shareText = '', categoryBreakdown = null }) => {
  // The 8 radar dimensions and their mapping to categories
  const radarDimensions = [
    { name: 'Technical Skills', category: 'skills' },
    { name: 'Communication', category: 'skills' },
    { name: 'Leadership', category: 'skills' },
    { name: 'Creativity', category: 'values' },
    { name: 'Independence', category: 'values' },
    { name: 'Collaboration', category: 'values' },
    { name: 'Impact Focus', category: 'values' },
    { name: 'Stability', category: 'temperament' }
  ];

  const categories = skillCategories.length > 0 ? skillCategories : radarDimensions.map(d => d.name);
  
  // Default scores if none provided (for demo purposes)
  const defaultScores = [0.7, 0.8, 0.9, 0.8, 0.6, 0.7, 0.9, 0.7];
  const finalScores = scores && scores.length > 0 ? scores : defaultScores;

  // Ensure we have the same number of scores as categories
  const normalizedScores = categories.map((_, index) => 
    finalScores[index] || 0
  );

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

    // Create layers where each dimension shows the intensity for its category
    // This creates overlapping areas that represent the different category strengths
    const skillsLayer = radarDimensions.map((dim, index) => 
      dim.category === 'skills' ? 
        Math.min(normalizedScores[index] || 0, categoryBreakdown.skills || 0) : 0
    );
    
    const valuesLayer = radarDimensions.map((dim, index) => 
      dim.category === 'values' ? 
        Math.min(normalizedScores[index] || 0, categoryBreakdown.values || 0) : 0
    );
    
    const temperamentLayer = radarDimensions.map((dim, index) => 
      dim.category === 'temperament' ? 
        Math.min(normalizedScores[index] || 0, categoryBreakdown.temperament || 0) : 0
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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">CAREER RADAR</h3>
        <p className="text-gray-600">PhD Skills, Values, and Temperament Results</p>
      </div>
      
      <div className="flex justify-center">
        <svg width="400" height="400" className="overflow-visible">
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
              {/* Temperament layer (back) */}
              {temperamentPoints && (
                <polygon
                  points={temperamentPoints}
                  fill={temperamentColor}
                  fillOpacity="0.3"
                  stroke={temperamentColor}
                  strokeWidth="2"
                />
              )}
              
              {/* Values layer (middle) */}
              {valuesPoints && (
                <polygon
                  points={valuesPoints}
                  fill={valuesColor}
                  fillOpacity="0.3"
                  stroke={valuesColor}
                  strokeWidth="2"
                />
              )}
              
              {/* Skills layer (front) */}
              {skillsPoints && (
                <polygon
                  points={skillsPoints}
                  fill={skillsColor}
                  fillOpacity="0.3"
                  stroke={skillsColor}
                  strokeWidth="2"
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
                r="4"
                fill={pointColor}
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
      <div className="mt-4">
        {categoryBreakdown ? (
          <>
            <div className="flex justify-center space-x-6 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: skillsColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Skills ({Math.round((categoryBreakdown.skills || 0) * 100)}%)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: valuesColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Values ({Math.round((categoryBreakdown.values || 0) * 100)}%)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: temperamentColor }}></div>
                <span className="text-sm font-medium text-gray-700">
                  Temperament ({Math.round((categoryBreakdown.temperament || 0) * 100)}%)
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Overlapping colored areas show your match strength in each category
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