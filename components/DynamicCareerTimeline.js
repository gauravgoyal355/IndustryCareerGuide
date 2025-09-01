import React, { useState } from 'react';
import careerData from '../data/careerTimelineData_PhDOptimized.json';

const DynamicCareerTimeline = ({ careerKey, interactive = true, showPivots = true }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const career = careerData.career_timelines[careerKey];
  
  // Function to create better abbreviations for bubble labels
  const getBubbleLabel = (shortTitle, title) => {
    // Common abbreviations for better fit
    const abbreviations = {
      'Data Scientist': 'DS',
      'Software Engineer': 'SWE', 
      'Product Manager': 'PM',
      'Research Scientist': 'RS',
      'Senior Consultant': 'Sr Con',
      'Principal Consultant': 'Principal',
      'ML Engineer': 'ML Eng',
      'DevOps Engineer': 'DevOps',
      'Security Analyst': 'Sec',
      'Business Development': 'BizDev'
    };
    
    return abbreviations[title] || shortTitle;
  };
  
  if (!career || !career.main_path) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Career Timeline</h3>
          <p className="text-gray-600">Career data not found...</p>
        </div>
      </div>
    );
  }

  // Color scheme for career levels
  const levelColors = {
    'entry': '#10B981',     // Green
    'mid': '#3B82F6',       // Blue  
    'senior': '#8B5CF6',    // Purple
    'lead': '#F59E0B',      // Gold
    'exec': '#1F2937'       // Dark Gray for Executive
  };

  // Colors for pivot path lines (different from bubble colors)
  const pivotLineColors = {
    0: '#E11D48',   // Rose
    1: '#7C2D12',   // Brown
    2: '#0F766E',   // Teal
    3: '#C2410C'    // Orange
  };

  // SVG dimensions - compact height for efficient space usage
  const svgWidth = 1200;
  const svgHeight = 500;
  const timelineY = 250;

  const mainPath = career.main_path;
  const pivotOpportunities = career.pivot_opportunities || [];

  const maxYears = Math.max(
    ...mainPath.map(p => p.cumulativeYears),
    ...pivotOpportunities.flatMap(pivot => pivot.stages.map(s => s.cumulativeYears))
  ) + 2;

  // Calculate X position with better spacing
  const getXPosition = (years) => {
    return 100 + (years / maxYears) * (svgWidth - 200);
  };

  // Calculate X position for main path with extra spacing to compensate for larger bubbles
  const getMainPathXPosition = (years) => {
    const basePosition = getXPosition(years);
    // Add proportional spacing: 19px extra per bubble (57-38=19px difference in radius)
    const extraSpacing = years * 15; // 15px per year to compensate for larger bubbles
    return basePosition + extraSpacing * 0.3; // Scale factor to prevent over-extension
  };

  // Calculate dynamic tooltip width based on text length
  const getTooltipWidth = (title, salary) => {
    const titleLength = title.length;
    const salaryLength = salary.length;
    const maxLength = Math.max(titleLength, salaryLength);
    // More generous sizing: 9px per character + 60px padding, minimum 200px
    return Math.max(200, maxLength * 9 + 60);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {career.name} Career Timeline
        </h3>
        <p className="text-sm text-gray-500 italic">
          *Salary ranges based on US market averages (major tech hubs: SF Bay Area, Seattle, NYC)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          💡 Hover over any position to see details
        </p>
      </div>

      <div className="flex justify-center relative">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible" style={{ zIndex: 1 }}>
          {/* Main timeline line */}
          <line
            x1="100"
            y1={timelineY}
            x2={svgWidth - 100}
            y2={timelineY}
            stroke="#D1D5DB"
            strokeWidth="8"
          />

          {/* Main path connections */}
          {mainPath.slice(0, -1).map((stage, index) => {
            const x1 = getMainPathXPosition(stage.cumulativeYears);
            const x2 = getMainPathXPosition(mainPath[index + 1].cumulativeYears);
            
            return (
              <line
                key={`connection-${index}`}
                x1={x1}
                y1={timelineY}
                x2={x2}
                y2={timelineY}
                stroke="#6B7280"
                strokeWidth="8"
              />
            );
          })}

          {/* PhD Entry Point Arrow - simple arrow pointing to first bubble */}
          {mainPath.length > 0 && (
            <g>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                </marker>
              </defs>
              <line
                x1={getMainPathXPosition(mainPath[0].cumulativeYears) - 20}
                y1={timelineY - 100}
                x2={getMainPathXPosition(mainPath[0].cumulativeYears) - 20}
                y2={timelineY - 70}
                stroke="#6B7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={getMainPathXPosition(mainPath[0].cumulativeYears) - 20}
                y={timelineY - 110}
                textAnchor="middle"
                className="text-sm font-semibold fill-gray-700"
              >
                PhD Entry Point
              </text>
            </g>
          )}

          {/* Main path bubbles */}
          {mainPath.map((stage, index) => {
            const x = getMainPathXPosition(stage.cumulativeYears);
            const isHovered = hoveredPoint === `main-${index}`;

            return (
              <g key={`main-${index}`}>
                {/* Time duration label */}
                {stage.timeToNext && (
                  <text
                    x={x + (getMainPathXPosition(mainPath[index + 1].cumulativeYears) - x) / 2}
                    y={timelineY - 25}
                    textAnchor="middle"
                    className="text-sm fill-gray-600 font-medium"
                  >
                    {stage.timeToNext}y
                  </text>
                )}

                {/* Position circle - larger for main path */}
                <circle
                  cx={x}
                  cy={timelineY}
                  r={isHovered ? "63" : "57"}
                  fill={levelColors[stage.level]}
                  stroke="white"
                  strokeWidth="4"
                  className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                  onMouseEnter={() => interactive && setHoveredPoint(`main-${index}`)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Position title in bubble */}
                <text
                  x={x}
                  y={timelineY + 3}
                  textAnchor="middle"
                  className="text-sm font-bold fill-white pointer-events-none"
                >
                  {getBubbleLabel(stage.shortTitle, stage.title)}
                </text>

              </g>
            );
          })}

          {/* Pivot Branches - positioned using A and 2A distance logic */}
          {showPivots && (() => {
            const A = 140; // Base distance from main path
            const positionedPivots = [];
            
            // Separate pivots into above and below groups
            const abovePivots = [];
            const belowPivots = [];
            
            // Distribute pivots alternately to above/below
            pivotOpportunities.forEach((pivot, originalIndex) => {
              const targetGroup = originalIndex % 2 === 0 ? abovePivots : belowPivots;
              targetGroup.push({ ...pivot, originalIndex });
            });
            
            // Sort each group by branchFromIndex (REVERSE order: higher index = closer to main path)
            abovePivots.sort((a, b) => b.branchFromIndex - a.branchFromIndex);
            belowPivots.sort((a, b) => b.branchFromIndex - a.branchFromIndex);
            
            // Position above pivots
            abovePivots.forEach((pivot, index) => {
              // First pivot (highest branchFromIndex) = 0.75A, second = 1.5A
              const distance = index === 0 ? A * 0.75 : A * 1.5;
              const pivotY = timelineY - distance;
              
              positionedPivots.push({
                ...pivot,
                pivotY,
                isAbove: true,
                renderIndex: positionedPivots.length
              });
            });
            
            // Position below pivots
            belowPivots.forEach((pivot, index) => {
              // First pivot (highest branchFromIndex) = 0.75A, second = 1.5A
              const distance = index === 0 ? A * 0.75 : A * 1.5;
              const pivotY = timelineY + distance;
              
              positionedPivots.push({
                ...pivot,
                pivotY,
                isAbove: false,
                renderIndex: positionedPivots.length
              });
            });
            
            return positionedPivots;
          })().map((pivot) => {
            const branchFromX = getMainPathXPosition(mainPath[pivot.branchFromIndex].cumulativeYears);
            const firstPivotX = branchFromX + 100; // Position first pivot bubble 100px right of main bubble center
            
            return (
              <g key={`pivot-branch-${pivot.originalIndex}`}>
                {/* Smooth curved branch */}
                <path
                  d={pivot.isAbove ? 
                    `M ${branchFromX},${timelineY - 57} 
                     Q ${(branchFromX + firstPivotX - 38) / 2},${(timelineY - 57 + pivot.pivotY) / 2 - 30} 
                     ${firstPivotX - 38},${pivot.pivotY}` :
                    `M ${branchFromX},${timelineY + 57} 
                     Q ${(branchFromX + firstPivotX - 38) / 2},${(timelineY + 57 + pivot.pivotY) / 2 + 30} 
                     ${firstPivotX - 38},${pivot.pivotY}`
                  }
                  fill="none"
                  stroke={pivotLineColors[pivot.originalIndex] || pivot.color}
                  strokeWidth="4"
                  className="drop-shadow-sm"
                />

                {/* Pivot timeline line */}
                <line
                  x1={firstPivotX}
                  y1={pivot.pivotY}
                  x2={firstPivotX + ((pivot.stages[pivot.stages.length - 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200)}
                  y2={pivot.pivotY}
                  stroke={pivotLineColors[pivot.originalIndex] || pivot.color}
                  strokeWidth="4"
                  opacity="0.8"
                />

                {/* Pivot path label - positioned dynamically based on text length */}
                <text
                  x={firstPivotX - Math.max(180, pivot.branchName.length * 8 + 50)}
                  y={pivot.pivotY + 4}
                  className="text-sm font-medium"
                  style={{ fill: pivotLineColors[pivot.originalIndex] || pivot.color }}
                >
                  {pivot.branchName}
                </text>

                {/* Pivot stage bubbles */}
                {pivot.stages.map((pivotStage, stageIndex) => {
                  // First bubble at fixed position, subsequent bubbles based on timeline
                  const pivotX = stageIndex === 0 ? firstPivotX : 
                    firstPivotX + ((pivotStage.cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200);
                  const isHovered = hoveredPoint === `pivot-${pivot.originalIndex}-${stageIndex}`;

                  return (
                    <g key={`pivot-${pivot.originalIndex}-${stageIndex}`}>
                      {/* Time duration label */}
                      {pivotStage.timeToNext && stageIndex < pivot.stages.length - 1 && (
                        <text
                          x={pivotX + (stageIndex === 0 ? 
                            (firstPivotX + ((pivot.stages[1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200) - pivotX) / 2 :
                            (firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200) - pivotX) / 2)}
                          y={pivot.isAbove ? pivot.pivotY + 25 : pivot.pivotY - 25}
                          textAnchor="middle"
                          className="text-sm font-medium"
                          style={{ fill: pivotLineColors[pivot.originalIndex] || pivot.color }}
                        >
                          {pivotStage.timeToNext}y
                        </text>
                      )}

                      {/* Pivot circle */}
                      <circle
                        cx={pivotX}
                        cy={pivot.pivotY}
                        r={isHovered ? "42" : "38"}
                        fill={levelColors[pivotStage.level]}
                        stroke="white"
                        strokeWidth="4"
                        className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                        onMouseEnter={() => interactive && setHoveredPoint(`pivot-${pivot.originalIndex}-${stageIndex}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />

                      {/* Pivot title in bubble */}
                      <text
                        x={pivotX}
                        y={pivot.pivotY + 2}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white pointer-events-none"
                      >
                        {getBubbleLabel(pivotStage.shortTitle, pivotStage.title)}
                      </text>


                      {/* Smooth connections between pivot bubbles */}
                      {stageIndex < pivot.stages.length - 1 && (
                        <line
                          x1={pivotX + 38}
                          y1={pivot.pivotY}
                          x2={(stageIndex === pivot.stages.length - 2 ? 
                            firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200) :
                            firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * (svgWidth - 200)) - 38}
                          y2={pivot.pivotY}
                          stroke={pivotLineColors[pivot.originalIndex] || pivot.color}
                          strokeWidth="4"
                          opacity="0.8"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}


        </svg>
        
        {/* HTML-based tooltip overlay - always on top */}
        {hoveredPoint && (() => {
          let stage, x, y, tooltipWidth;
          
          if (hoveredPoint.startsWith('main-')) {
            const stageIndex = parseInt(hoveredPoint.replace('main-', ''));
            stage = mainPath[stageIndex];
            x = getMainPathXPosition(stage.cumulativeYears);
            y = timelineY + 55;
            tooltipWidth = getTooltipWidth(stage.title, stage.salary);
          } else if (hoveredPoint.startsWith('pivot-')) {
            const [_, originalIndex, stageIndex] = hoveredPoint.split('-').map(Number);
            const pivot = pivotOpportunities[originalIndex];
            if (pivot) {
              stage = pivot.stages[stageIndex];
              x = getXPosition(stage.cumulativeYears);
              
              // Calculate positioning using same logic as rendering
              const A = 140;
              const abovePivots = [];
              const belowPivots = [];
              
              // Distribute pivots alternately to above/below
              pivotOpportunities.forEach((p, idx) => {
                const targetGroup = idx % 2 === 0 ? abovePivots : belowPivots;
                targetGroup.push({ ...p, originalIndex: idx });
              });
              
              // Sort each group by branchFromIndex (REVERSE: higher index = closer)
              abovePivots.sort((a, b) => b.branchFromIndex - a.branchFromIndex);
              belowPivots.sort((a, b) => b.branchFromIndex - a.branchFromIndex);
              
              // Find which group and position our pivot is in
              const aboveIndex = abovePivots.findIndex(p => p.originalIndex === originalIndex);
              const belowIndex = belowPivots.findIndex(p => p.originalIndex === originalIndex);
              
              if (aboveIndex !== -1) {
                const distance = aboveIndex === 0 ? A * 0.75 : A * 1.5;
                const pivotY = timelineY - distance;
                y = pivotY - 100;
                tooltipWidth = getTooltipWidth(stage.title, stage.salary);
              } else if (belowIndex !== -1) {
                const distance = belowIndex === 0 ? A * 0.75 : A * 1.5;
                const pivotY = timelineY + distance;
                y = pivotY + 45;
                tooltipWidth = getTooltipWidth(stage.title, stage.salary);
              }
            }
          }
          
          if (stage) {
            return (
              <div 
                className="absolute bg-white bg-opacity-95 border border-gray-300 rounded-lg p-3 shadow-xl pointer-events-none"
                style={{
                  left: x - tooltipWidth/2,
                  top: y,
                  width: tooltipWidth,
                  zIndex: 1000
                }}
              >
                <div className="text-base font-bold text-gray-900 mb-1">
                  {stage.title}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  {stage.salary}
                </div>
                {stage.remoteFriendly && (
                  <div className="text-sm text-green-600 font-medium">
                    🏠 Remote OK
                  </div>
                )}
              </div>
            );
          }
        })()}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-lg">
          <div className="text-sm font-medium text-gray-700 mb-4 text-center">Career Levels & Remote Work</div>
          <div className="flex justify-center gap-6">
            {Object.entries(levelColors).filter(([level]) => level !== 'entry').map(([level, color]) => (
              <div key={level} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, borderRadius: '50%' }}
                ></div>
                <span className="text-sm text-gray-600">
                  {level === 'mid' ? 'PhD Entry' : 
                   level === 'senior' ? 'Senior' : 
                   level === 'lead' ? 'Leadership' : 'Executive'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <span className="text-xs text-gray-500">
              🏠 Remote OK indicates remote-friendly positions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicCareerTimeline;