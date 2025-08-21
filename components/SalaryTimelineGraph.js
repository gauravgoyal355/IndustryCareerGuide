import React, { useState, useRef, useEffect } from 'react';

const SalaryTimelineGraph = ({ trajectory, interactive = true, showPivots = true }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredPivot, setHoveredPivot] = useState(null);
  const svgRef = useRef(null);

  // Graph dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 100, bottom: 60, left: 80 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // Generate realistic salary progression with non-linear growth
  const generateRealisticSalaryProgression = (stages) => {
    const progressionData = [];
    
    stages.forEach((stage, stageIndex) => {
      // Parse years experience range
      const yearsMatch = stage.years_experience.match(/(\d+)-?(\d+)?/);
      const minYears = yearsMatch ? parseInt(yearsMatch[1]) : stageIndex * 2;
      const maxYears = yearsMatch ? parseInt(yearsMatch[2] || yearsMatch[1]) : (stageIndex + 1) * 2;
      
      // Parse salary range
      const salaryMatch = stage.salary_range.match(/\$(\d+)K?\s*-\s*\$(\d+)K/);
      const minSalary = salaryMatch ? parseInt(salaryMatch[1]) : 50 + stageIndex * 30;
      const maxSalary = salaryMatch ? parseInt(salaryMatch[2]) : 80 + stageIndex * 50;
      
      // Generate multiple data points within each stage for realistic progression
      const stageYearRange = maxYears - minYears;
      const stageSalaryRange = maxSalary - minSalary;
      
      // Add 3-5 points per stage to show gradual growth within stage
      const pointsInStage = Math.max(3, Math.min(5, stageYearRange + 1));
      
      for (let i = 0; i < pointsInStage; i++) {
        const yearProgress = i / (pointsInStage - 1);
        const currentYear = minYears + (stageYearRange * yearProgress);
        
        // Non-linear salary growth within stage (slower at start, faster towards promotion)
        let salaryProgress;
        if (i === pointsInStage - 1) {
          // Big jump at promotion/stage change
          salaryProgress = 1.0;
        } else {
          // Exponential growth curve within stage
          salaryProgress = Math.pow(yearProgress, 0.7);
        }
        
        const currentSalary = minSalary + (stageSalaryRange * salaryProgress);
        
        progressionData.push({
          ...stage,
          yearsExp: currentYear,
          salary: currentSalary,
          stageIndex,
          pointIndex: i,
          isPromotion: i === pointsInStage - 1 && stageIndex < stages.length - 1,
          stageProgress: yearProgress,
          originalStage: stage
        });
      }
    });
    
    return progressionData;
  };

  // Parse salary data
  const parseCareerData = () => {
    if (!trajectory || !trajectory.stages) return null;

    // Generate realistic progression points
    const progressionPoints = generateRealisticSalaryProgression(trajectory.stages);
    
    // Keep original stages for display purposes
    const stages = trajectory.stages.map((stage, index) => {
      const yearsMatch = stage.years_experience.match(/(\d+)-?(\d+)?/);
      const yearsExp = yearsMatch ? parseInt(yearsMatch[2] || yearsMatch[1]) : index + 1;
      const salaryMatch = stage.salary_range.match(/\$(\d+)K?\s*-\s*\$(\d+)K/);
      const salary = salaryMatch ? parseInt(salaryMatch[2]) : 0;

      return {
        ...stage,
        yearsExp,
        salary,
        index
      };
    });

    // Add pivot opportunities
    const pivots = trajectory.pivot_opportunities?.map(pivot => {
      const fromStage = stages.find(stage => stage.level === pivot.from_level);
      return {
        ...pivot,
        yearsExp: fromStage?.yearsExp || 0,
        salary: fromStage?.salary || 0,
        fromStage
      };
    }) || [];

    return { stages, pivots, progressionPoints };
  };

  const data = parseCareerData();
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Career Timeline</h3>
          <p className="text-gray-600">Career trajectory data is being loaded...</p>
        </div>
      </div>
    );
  }

  const { stages, pivots, progressionPoints } = data;

  // Calculate scales using progression points for more accurate scaling
  const maxYears = Math.max(...progressionPoints.map(p => p.yearsExp)) + 1;
  const maxSalary = Math.max(...progressionPoints.map(p => p.salary)) * 1.1;
  const minSalary = Math.min(...progressionPoints.map(p => p.salary)) * 0.9;

  const xScale = (years) => (years / maxYears) * graphWidth;
  const yScale = (salary) => graphHeight - ((salary - minSalary) / (maxSalary - minSalary)) * graphHeight;

  // Generate path for salary progression line using realistic progression points
  const generatePath = () => {
    const points = progressionPoints.map(point => ({
      x: xScale(point.yearsExp),
      y: yScale(point.salary),
      isPromotion: point.isPromotion
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create smooth curves between points, with steeper curves at promotions
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      if (currentPoint.isPromotion) {
        // Sharper curve for promotion jumps
        const midX = (prevPoint.x + currentPoint.x) / 2;
        path += ` Q ${midX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
      } else {
        // Smoother progression within stage
        path += ` L ${currentPoint.x} ${currentPoint.y}`;
      }
    }
    
    return path;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    
    // Horizontal grid lines (salary levels)
    for (let i = 0; i <= 5; i++) {
      const salary = minSalary + (maxSalary - minSalary) * (i / 5);
      const y = yScale(salary);
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={graphWidth}
          y2={y}
          stroke="#f3f4f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      );
    }

    // Vertical grid lines (years)
    for (let i = 0; i <= maxYears; i++) {
      const x = xScale(i);
      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={graphHeight}
          stroke="#f3f4f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      );
    }

    return lines;
  };

  // Generate axis labels
  const generateYAxisLabels = () => {
    const labels = [];
    const numLabels = 6; // 0 to 5 inclusive
    
    for (let i = 0; i < numLabels; i++) {
      const salary = minSalary + (maxSalary - minSalary) * (i / (numLabels - 1));
      const y = yScale(salary);
      
      // Only skip if labels would be extremely close (reduced threshold)
      const prevY = i > 0 ? yScale(minSalary + (maxSalary - minSalary) * ((i - 1) / (numLabels - 1))) : null;
      if (prevY && Math.abs(y - prevY) < 15) continue;
      
      labels.push(
        <text
          key={`y-${i}`}
          x={-15}
          y={y + 4}
          textAnchor="end"
          className="text-xs fill-gray-600"
        >
          ${Math.round(salary)}K
        </text>
      );
    }
    return labels;
  };

  const generateXAxisLabels = () => {
    const labels = [];
    for (let i = 0; i <= maxYears; i++) {
      const x = xScale(i);
      labels.push(
        <text
          key={`x-${i}`}
          x={x}
          y={graphHeight + 20}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {i}
        </text>
      );
    }
    return labels;
  };

  const colors = {
    'entry': '#10B981',
    'mid': '#3B82F6', 
    'senior': '#8B5CF6',
    'lead': '#F59E0B'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {trajectory.name} - Salary Progression Timeline
        </h3>
        <p className="text-gray-600">
          Career growth trajectory over {maxYears} years with pivot opportunities
        </p>
      </div>

      <div className="flex justify-center">
        <svg 
          ref={svgRef}
          width={width} 
          height={height} 
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid */}
            {generateGridLines()}
            
            {/* Main progression line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              className="drop-shadow-sm"
            />

            {/* Progression points showing gradual increases and promotion jumps */}
            {progressionPoints.map((point, index) => {
              const x = xScale(point.yearsExp);
              const y = yScale(point.salary);
              const isHovered = hoveredPoint === index;
              const isPromotion = point.isPromotion;
              const isStageStart = point.pointIndex === 0;
              
              // Only show major points (stage starts and promotions)
              if (!isStageStart && !isPromotion) return null;
              
              return (
                <g key={`progression-${index}`}>
                  {/* Point glow effect when hovered */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={colors[point.level]}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Promotion jump indicator */}
                  {isPromotion && (
                    <g>
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        className="animate-pulse"
                      />
                      <text
                        x={x + 15}
                        y={y - 10}
                        className="text-xs font-bold fill-orange-600"
                      >
                        ↗ Promotion
                      </text>
                    </g>
                  )}
                  
                  {/* Main point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "8" : (isPromotion ? "7" : "6")}
                    fill={colors[point.level]}
                    stroke={isPromotion ? "#F59E0B" : "white"}
                    strokeWidth={isPromotion ? "3" : "2"}
                    className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}
                    onMouseEnter={() => interactive && setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  
                  {/* Stage label (only for stage starts) */}
                  {isStageStart && (
                    <text
                      x={x}
                      y={y - 25}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {point.title}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Career stage points for major milestones - Only render if not already rendered as progression points */}

            {/* Pivot opportunity points */}
            {showPivots && pivots.map((pivot, index) => {
              const x = xScale(pivot.yearsExp);
              const y = yScale(pivot.salary);
              const isHovered = hoveredPivot === index;
              
              return (
                <g key={`pivot-${index}`}>
                  {/* Pivot point with different styling */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "10" : "8"}
                    fill="#F59E0B"
                    stroke="#FCD34D"
                    strokeWidth="3"
                    strokeDasharray="4,2"
                    className={`cursor-pointer transition-all duration-200 ${isHovered ? 'animate-pulse' : ''}`}
                    onMouseEnter={() => interactive && setHoveredPivot(index)}
                    onMouseLeave={() => setHoveredPivot(null)}
                  />
                  
                  {/* Pivot arrow indicator */}
                  <path
                    d={`M ${x + 12} ${y - 8} L ${x + 20} ${y - 12} L ${x + 18} ${y - 6} Z`}
                    fill="#F59E0B"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Pivot label */}
                  <text
                    x={x + 25}
                    y={y + 15}
                    className="text-xs font-medium fill-orange-600"
                  >
                    Pivot to {pivot.to_career.replace('_', ' ')}
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            {generateYAxisLabels()}
            {generateXAxisLabels()}
            
            {/* Axis titles */}
            <text
              x={graphWidth / 2}
              y={graphHeight + 45}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700"
            >
              Years of Experience
            </text>
            
            <text
              x={-40}
              y={graphHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, -40, ${graphHeight / 2})`}
              className="text-sm font-medium fill-gray-700"
            >
              Salary (in thousands)
            </text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium text-gray-700">Career Progression</span>
        </div>
        {showPivots && pivots.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-yellow-300" style={{borderStyle: 'dashed'}}></div>
            <span className="text-sm font-medium text-gray-700">Pivot Opportunities</span>
          </div>
        )}
      </div>

      {/* Interactive tooltips */}
      {hoveredPoint !== null && (
        <div className="fixed bg-black text-white px-4 py-3 rounded-lg shadow-lg z-50 pointer-events-none transform -translate-x-1/2"
             style={{
               left: '50%',
               bottom: '120px'
             }}>
          {typeof hoveredPoint === 'string' && hoveredPoint.startsWith('stage-') ? (
            // Stage tooltip
            (() => {
              const stageIndex = parseInt(hoveredPoint.replace('stage-', ''));
              const stage = stages[stageIndex];
              return (
                <>
                  <div className="text-sm font-bold">{stage.title}</div>
                  <div className="text-xs">{stage.salary_range}</div>
                  <div className="text-xs opacity-75">{stage.years_experience} years experience</div>
                  <div className="text-xs opacity-75">{stage.typical_duration}</div>
                </>
              );
            })()
          ) : (
            // Progression point tooltip
            (() => {
              const point = progressionPoints[hoveredPoint];
              if (!point) return null;
              return (
                <>
                  <div className="text-sm font-bold">
                    {point.title} {point.isPromotion ? '(Promotion Point)' : ''}
                  </div>
                  <div className="text-xs">${Math.round(point.salary)}K salary</div>
                  <div className="text-xs opacity-75">{point.yearsExp.toFixed(1)} years experience</div>
                  {point.isPromotion && (
                    <div className="text-xs text-orange-300">🎉 Salary jump at promotion!</div>
                  )}
                </>
              );
            })()
          )}
        </div>
      )}

      {hoveredPivot !== null && (
        <div className="fixed bg-orange-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 pointer-events-none transform -translate-x-1/2"
             style={{
               left: '50%',
               bottom: '140px'
             }}>
          <div className="text-sm font-bold">Pivot to {pivots[hoveredPivot].to_career.replace('_', ' ')}</div>
          <div className="text-xs">Timeline: {pivots[hoveredPivot].timeline}</div>
          <div className="text-xs opacity-75">Transition skills needed:</div>
          <div className="text-xs opacity-75">
            {pivots[hoveredPivot].transition_skills.join(', ')}
          </div>
        </div>
      )}

      {/* Stage color legend */}
      <div className="mt-4 flex justify-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Career Levels</div>
          <div className="flex space-x-4">
            {Object.entries(colors).map(([level, color]) => (
              <div key={level} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs capitalize text-gray-600">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryTimelineGraph;