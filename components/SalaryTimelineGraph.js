import React, { useState } from 'react';

const SalaryTimelineGraph = ({ trajectory, interactive = true, showPivots = true }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trajectory || !trajectory.stages) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Career Timeline</h3>
          <p className="text-gray-600">Career trajectory data is being loaded...</p>
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

  // SVG dimensions - use vertical space better
  const svgWidth = 1200;
  const svgHeight = 600;
  const timelineY = 280;

  // Streamlined main Product Manager path (fewer positions)
  const mainPath = [
    { 
      title: 'Associate PM', 
      shortTitle: 'APM',
      level: 'entry', 
      cumulativeYears: 0, 
      salary: '$120k-$150k',
      timeToNext: 2
    },
    { 
      title: 'Product Manager', 
      shortTitle: 'PM',
      level: 'mid', 
      cumulativeYears: 2, 
      salary: '$150k-$190k',
      timeToNext: 4
    },
    { 
      title: 'Senior PM', 
      shortTitle: 'Sr PM',
      level: 'senior', 
      cumulativeYears: 6, 
      salary: '$190k-$250k',
      timeToNext: 5
    },
    { 
      title: 'Principal PM', 
      shortTitle: 'Principal',
      level: 'lead', 
      cumulativeYears: 11, 
      salary: '$250k-$350k',
      timeToNext: null
    }
  ];

  // Streamlined pivot opportunities (fewer branches, cleaner paths)
  const pivotOpportunities = [
    {
      branchFromIndex: 1, // From PM position (2 years)
      branchName: 'Consulting Path',
      color: '#DC2626', // Red
      stages: [
        {
          title: 'Principal Consultant',
          shortTitle: 'Principal',
          level: 'senior',
          cumulativeYears: 3.5, // 1.5 years after pivot
          salary: '$180k-$250k',
          timeToNext: 4
        },
        {
          title: 'Partner',
          shortTitle: 'Partner',
          level: 'lead',
          cumulativeYears: 7.5,
          salary: '$300k-$500k',
          timeToNext: null
        }
      ]
    },
    {
      branchFromIndex: 2, // From Senior PM position (6 years)
      branchName: 'Startup Path',
      color: '#F59E0B', // Gold
      stages: [
        {
          title: 'Startup Founder',
          shortTitle: 'Founder',
          level: 'lead',
          cumulativeYears: 7, // 1 year after pivot
          salary: '$0-$200k*',
          timeToNext: 4
        },
        {
          title: 'CEO (Growth)',
          shortTitle: 'CEO',
          level: 'lead',
          cumulativeYears: 11,
          salary: '$200k-$500k+',
          timeToNext: null
        }
      ]
    }
  ];

  const maxYears = Math.max(
    ...mainPath.map(p => p.cumulativeYears),
    ...pivotOpportunities.flatMap(pivot => pivot.stages.map(s => s.cumulativeYears))
  ) + 2;

  // Calculate X position with better spacing
  const getXPosition = (years) => {
    return 100 + (years / maxYears) * (svgWidth - 200);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Product Manager Career Timeline
        </h3>
        <p className="text-sm text-gray-500 italic">
          *Salary ranges based on US market averages (major tech hubs: SF Bay Area, Seattle, NYC)
        </p>
      </div>

      <div className="flex justify-center">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
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
            const x1 = getXPosition(stage.cumulativeYears);
            const x2 = getXPosition(mainPath[index + 1].cumulativeYears);
            
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

          {/* Main path bubbles */}
          {mainPath.map((stage, index) => {
            const x = getXPosition(stage.cumulativeYears);
            const isHovered = hoveredPoint === `main-${index}`;

            return (
              <g key={`main-${index}`}>
                {/* Time duration label */}
                {stage.timeToNext && (
                  <text
                    x={x + (getXPosition(mainPath[index + 1].cumulativeYears) - x) / 2}
                    y={timelineY - 25}
                    textAnchor="middle"
                    className="text-sm fill-gray-600 font-medium"
                  >
                    {stage.timeToNext}y
                  </text>
                )}

                {/* Position circle */}
                <circle
                  cx={x}
                  cy={timelineY}
                  r={isHovered ? "42" : "38"}
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
                  y={timelineY + 2}
                  textAnchor="middle"
                  className="text-sm font-bold fill-white pointer-events-none"
                >
                  {stage.shortTitle}
                </text>

                {/* Position details below */}
                <text
                  x={x}
                  y={timelineY + 70}
                  textAnchor="middle"
                  className="text-base font-semibold fill-gray-900"
                >
                  {stage.title}
                </text>

                <text
                  x={x}
                  y={timelineY + 90}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  {stage.salary}
                </text>
              </g>
            );
          })}

          {/* Symmetrical Pivot Branches - alternating above and below */}
          {showPivots && pivotOpportunities.map((pivot, pivotIndex) => {
            const branchFromX = getXPosition(mainPath[pivot.branchFromIndex].cumulativeYears);
            const isAbove = pivotIndex % 2 === 0; // Alternate: even indices above, odd below
            const pivotY = isAbove ? 
              timelineY - 180 - (Math.floor(pivotIndex / 2) * 120) : // Above main timeline
              timelineY + 180 + (Math.floor(pivotIndex / 2) * 120);   // Below main timeline
            const firstPivotX = getXPosition(pivot.stages[0].cumulativeYears);
            
            return (
              <g key={`pivot-branch-${pivotIndex}`}>
                {/* Smooth curved branch - direction depends on above/below */}
                <path
                  d={isAbove ? 
                    `M ${branchFromX},${timelineY - 38} 
                     Q ${branchFromX},${timelineY - 80} 
                     ${firstPivotX - 38},${pivotY}` :
                    `M ${branchFromX},${timelineY + 38} 
                     Q ${branchFromX},${timelineY + 80} 
                     ${firstPivotX - 38},${pivotY}`
                  }
                  fill="none"
                  stroke={pivot.color}
                  strokeWidth="4"
                  className="drop-shadow-sm"
                />

                {/* Pivot timeline line */}
                <line
                  x1={getXPosition(pivot.stages[0].cumulativeYears)}
                  y1={pivotY}
                  x2={getXPosition(pivot.stages[pivot.stages.length - 1].cumulativeYears)}
                  y2={pivotY}
                  stroke={pivot.color}
                  strokeWidth="4"
                  opacity="0.8"
                />

                {/* Pivot path label */}
                <text
                  x={firstPivotX - 180}
                  y={pivotY + 6}
                  className="text-base font-semibold"
                  style={{ fill: pivot.color }}
                >
                  {pivot.branchName}
                </text>

                {/* Pivot stage bubbles */}
                {pivot.stages.map((pivotStage, stageIndex) => {
                  const pivotX = getXPosition(pivotStage.cumulativeYears);
                  const isHovered = hoveredPoint === `pivot-${pivotIndex}-${stageIndex}`;

                  return (
                    <g key={`pivot-${pivotIndex}-${stageIndex}`}>
                      {/* Time duration label */}
                      {pivotStage.timeToNext && stageIndex < pivot.stages.length - 1 && (
                        <text
                          x={pivotX + (getXPosition(pivot.stages[stageIndex + 1].cumulativeYears) - pivotX) / 2}
                          y={isAbove ? pivotY + 25 : pivotY - 25}
                          textAnchor="middle"
                          className="text-sm font-medium"
                          style={{ fill: pivot.color }}
                        >
                          {pivotStage.timeToNext}y
                        </text>
                      )}

                      {/* Pivot circle */}
                      <circle
                        cx={pivotX}
                        cy={pivotY}
                        r={isHovered ? "42" : "38"}
                        fill={levelColors[pivotStage.level]}
                        stroke="white"
                        strokeWidth="4"
                        className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                        onMouseEnter={() => interactive && setHoveredPoint(`pivot-${pivotIndex}-${stageIndex}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />

                      {/* Pivot title in bubble */}
                      <text
                        x={pivotX}
                        y={pivotY + 2}
                        textAnchor="middle"
                        className="text-sm font-bold fill-white pointer-events-none"
                      >
                        {pivotStage.shortTitle}
                      </text>

                      {/* Pivot details - position based on above/below */}
                      <text
                        x={pivotX}
                        y={isAbove ? pivotY - 80 : pivotY + 80}
                        textAnchor="middle"
                        className="text-base font-semibold fill-gray-900"
                      >
                        {pivotStage.title}
                      </text>

                      <text
                        x={pivotX}
                        y={isAbove ? pivotY - 60 : pivotY + 100}
                        textAnchor="middle"
                        className="text-sm font-medium fill-gray-700"
                      >
                        {pivotStage.salary}
                      </text>

                      {/* Smooth connections between pivot bubbles */}
                      {stageIndex < pivot.stages.length - 1 && (
                        <line
                          x1={pivotX + 38}
                          y1={pivotY}
                          x2={getXPosition(pivot.stages[stageIndex + 1].cumulativeYears) - 38}
                          y2={pivotY}
                          stroke={pivot.color}
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
      </div>

      {/* Interactive Tooltip */}
      {hoveredPoint && (
        <div className="fixed bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50 pointer-events-none transform -translate-x-1/2 max-w-xs"
             style={{
               left: '50%',
               bottom: '20px'
             }}>
          {(() => {
            if (hoveredPoint.startsWith('main-')) {
              const stageIndex = parseInt(hoveredPoint.replace('main-', ''));
              const stage = mainPath[stageIndex];
              return (
                <>
                  <div className="text-sm font-bold mb-1">{stage.title}</div>
                  <div className="text-xs mb-1">Salary: {stage.salary}</div>
                  <div className="text-xs mb-1">Experience: {stage.cumulativeYears} years</div>
                  <div className="text-xs text-gray-300">
                    {stage.timeToNext ? `${stage.timeToNext} years to next level` : 'Senior career level'}
                  </div>
                </>
              );
            } else if (hoveredPoint.startsWith('pivot-')) {
              const [_, pivotIndex, stageIndex] = hoveredPoint.split('-').map(Number);
              const stage = pivotOpportunities[pivotIndex].stages[stageIndex];
              return (
                <>
                  <div className="text-sm font-bold mb-1">{stage.title}</div>
                  <div className="text-xs mb-1">Salary: {stage.salary}</div>
                  <div className="text-xs mb-1">Total experience: {stage.cumulativeYears} years</div>
                  <div className="text-xs text-gray-300">
                    {stage.timeToNext ? `${stage.timeToNext} years to next stage` : 'Senior career level'}
                  </div>
                </>
              );
            }
          })()}
        </div>
      )}

      {/* Clean Legend */}
      <div className="mt-8 flex justify-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-lg">
          <div className="text-sm font-medium text-gray-700 mb-4 text-center">Career Levels & Pivot Paths</div>
          <div className="flex justify-center gap-6">
            {Object.entries(levelColors).map(([level, color]) => (
              <div key={level} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {level === 'entry' ? 'Entry' : 
                   level === 'mid' ? 'Mid Level' : 
                   level === 'senior' ? 'Senior' : 
                   level === 'lead' ? 'Leadership' : 'Executive'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <span className="text-xs text-gray-500">
              *Founder compensation varies with equity and funding stage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryTimelineGraph;