import React, { useState, useEffect } from 'react';
import careerData from '../data/careerTimelineData_PhDOptimized.json';

const DynamicCareerTimeline = ({ careerKey, interactive = true, showPivots = true }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const career = careerData.career_timelines[careerKey];
  
  // Function to create better abbreviations for bubble labels with dynamic sizing
  const getBubbleLabel = (shortTitle, title, bubbleRadius = 36) => {
    // Enhanced abbreviations for better fit
    const abbreviations = {
      'Data Scientist': 'DS',
      'Senior Data Scientist': 'Sr DS', 
      'Staff Data Scientist': 'Staff DS',
      'Principal Data Scientist': 'Principal',
      'VP of Data': 'VP Data',
      'Chief Data Officer': 'CDO',
      'Chief Technology Officer': 'CTO',
      
      // Analytics roles
      'Quantitative Analyst': 'QA',
      'Quantitative Researcher': 'QR', 
      'Quant Researcher': 'QR',
      'Senior Quantitative Analyst': 'Sr QA',
      'Portfolio Manager': 'Portfolio',
      'Risk Analyst': 'RA',
      'Risk Manager': 'RM',
      'Risk': 'Risk',
      'Senior Risk Manager': 'Sr RM',
      
      // Engineering roles
      'Software Engineer': 'SWE', 
      'Product Manager': 'PM',
      'Data Product Manager': 'Data PM',
      'VP Product': 'VP Product',
      'Chief Product Officer': 'CPO',
      'Research Scientist': 'Research',
      'Industry Research': 'Industry R',
      'Research Director': 'Research D',
      'Chief Science Officer': 'CSO',
      'Senior Consultant': 'Sr Con',
      'Principal Consultant': 'Principal',
      'ML Engineer': 'ML Eng',
      'Senior ML Engineer': 'Sr ML',
      'Principal ML Engineer': 'Principal',
      'DevOps Engineer': 'DevOps',
      'Security Analyst': 'Security',
      'Business Development': 'BizDev'
    };
    
    const label = abbreviations[title] || shortTitle || title;
    
    // For very small bubbles (pivot paths), use even shorter labels
    if (bubbleRadius <= 30) {
      const ultraShort = {
        'QA': 'QA',
        'QR': 'QR', 
        'RA': 'RA',
        'RM': 'RM',
        'Sr RM': 'SRM',
        'Risk': 'Risk',
        'DS': 'DS',
        'Sr DS': 'SrDS', 
        'Staff DS': 'Staff',
        'Principal': 'Prin',
        'VP Data': 'VP',
        'CDO': 'CDO',
        'CTO': 'CTO',
        'Research': 'R&D',
        'Security': 'Sec',
        'PM': 'PM',
        'Sr PM': 'SPM',
        'ML Eng': 'MLE',
        'Sr ML': 'SML'
      };
      return ultraShort[label] || label.substring(0, 5);
    }
    
    return label;
  };

  // Function to get appropriate font size based on text length and bubble size
  const getFontSize = (text, bubbleRadius, isMobile) => {
    const textLength = text.length;
    const baseFontSize = isMobile ? 10 : 12;
    
    if (bubbleRadius <= 30) { // Small pivot bubbles
      return textLength > 6 ? '9px' : '10px';
    } else if (bubbleRadius <= 36) { // Main path bubbles
      return textLength > 8 ? '11px' : textLength > 6 ? '12px' : '13px';
    } else { // Large/hovered bubbles
      return textLength > 10 ? '12px' : '14px';
    }
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

  // Responsive SVG dimensions
  const svgWidth = isMobile ? 350 : 768; // Further reduced from 960 to 768 (additional 20% smaller)
  const svgHeight = isMobile ? 800 : 360; // Increased from 320 to 360 to add top padding
  const timelineY = isMobile ? (svgWidth - 280) : 180; // Increased from 160 to 180 to add top whitespace
  const pivotBubbleRadius = isMobile ? 30 : 30; // Pivot path bubble size
  const mainBubbleRadius = isMobile ? 45 : 36; // Main path bubbles 20% larger than pivot bubbles
  const hoveredPivotRadius = isMobile ? 34 : 34; // Pivot hover size
  const hoveredMainRadius = isMobile ? 50 : 40; // Main path hover size

  const mainPath = career.main_path;
  const pivotOpportunities = career.pivot_opportunities || [];

  // Use only main path for maxYears to ensure consistent main timeline spacing
  const maxYears = Math.max(...mainPath.map(p => p.cumulativeYears)) + 2;

  // Calculate X position with responsive spacing - ensure everything fits in canvas
  const getXPosition = (years) => {
    // Reserve space for pivot labels on the right
    const reservedSpace = 120; // Space for pivot path labels
    const timelineWidth = svgWidth - reservedSpace - 160; // Available width minus margins and label space
    const margin = isMobile ? 50 : 80; // Left margin
    return margin + (years / maxYears) * timelineWidth;
  };

  // Calculate X position for main path with pure proportional spacing
  const getMainPathXPosition = (years) => {
    return getXPosition(years);
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
    <div className={isMobile ? "bg-white rounded-lg shadow-lg p-4" : "bg-white rounded-lg shadow-lg p-8"}>

      {/* Mobile Vertical Layout */}
      {isMobile ? (
        <div className="space-y-4">
          {/* PhD Entry Point Label */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center bg-blue-50 rounded-full px-3 py-1">
              <span className="text-sm font-medium text-blue-700">👨‍🎓 PhD Entry Point</span>
            </div>
          </div>
          
          {/* Vertical Career Steps */}
          {mainPath.map((stage, index) => (
            <div key={`mobile-${index}`} className="relative">
              {/* Connector line */}
              {index < mainPath.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 h-4 top-full z-0"></div>
              )}
              
              {/* Career Step Card */}
              <div 
                className="bg-white border-2 rounded-xl p-4 shadow-md relative z-10"
                style={{ borderColor: levelColors[stage.level] }}
                onTouchStart={() => interactive && setHoveredPoint(`main-${index}`)}
                onTouchEnd={() => setHoveredPoint(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: levelColors[stage.level] }}
                  ></div>
                  {stage.timeToNext && (
                    <span className="text-xs bg-gray-100 rounded-full px-2 py-1 text-gray-600">
                      {stage.timeToNext}y to next
                    </span>
                  )}
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-1">{stage.title}</h4>
                <p className="text-sm font-semibold text-gray-700 mb-1">{stage.salary}</p>
                <p className="text-xs text-gray-500">
                  {stage.cumulativeYears} years total experience
                </p>
                
                {stage.remoteFriendly && (
                  <div className="mt-2 inline-flex items-center text-xs text-green-600">
                    🏠 Remote OK
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Horizontal Timeline */
        <div className="flex justify-center relative">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible" style={{ zIndex: 1 }}>
          {/* Main timeline line */}
          <line
            x1={isMobile ? "50" : "80"}
            y1={timelineY}
            x2={svgWidth - (isMobile ? 50 : 80)}
            y2={timelineY}
            stroke="#D1D5DB"
            strokeWidth={isMobile ? "6" : "6"}
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
                x1={getMainPathXPosition(mainPath[0].cumulativeYears)}
                y1={timelineY - 90}
                x2={getMainPathXPosition(mainPath[0].cumulativeYears)}
                y2={timelineY - 60}
                stroke="#6B7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={getMainPathXPosition(mainPath[0].cumulativeYears)}
                y={timelineY - 100}
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
                    y={timelineY - (isMobile ? 20 : 25)}
                    textAnchor="middle"
                    className={isMobile ? "text-xs fill-gray-600 font-medium" : "text-sm fill-gray-600 font-medium"}
                  >
                    {stage.timeToNext}y
                  </text>
                )}

                {/* Position circle - larger for main path */}
                <circle
                  cx={x}
                  cy={timelineY}
                  r={isHovered ? hoveredMainRadius : mainBubbleRadius}
                  fill={levelColors[stage.level]}
                  stroke="white"
                  strokeWidth={isMobile ? "3" : "4"}
                  className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                  onMouseEnter={() => interactive && setHoveredPoint(`main-${index}`)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Position title in bubble */}
                <text
                  x={x}
                  y={timelineY + 3}
                  textAnchor="middle"
                  className="font-bold fill-white pointer-events-none"
                  style={{ fontSize: getFontSize(getBubbleLabel(stage.shortTitle, stage.title, mainBubbleRadius), mainBubbleRadius, isMobile) }}
                >
                  {getBubbleLabel(stage.shortTitle, stage.title, mainBubbleRadius)}
                </text>

              </g>
            );
          })}

          {/* Pivot Branches - hide on mobile for cleaner display */}
          {showPivots && !isMobile && (() => {
            const A = 112; // Base distance from main path (20% smaller)
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
            const firstPivotX = branchFromX + 50; // Reduced to fit in canvas
            
            return (
              <g key={`pivot-branch-${pivot.originalIndex}`}>
                {/* Smooth curved branch */}
                <path
                  d={pivot.isAbove ? 
                    `M ${branchFromX},${timelineY - mainBubbleRadius} 
                     Q ${(branchFromX + firstPivotX - pivotBubbleRadius) / 2},${(timelineY - mainBubbleRadius + pivot.pivotY) / 2 - 24} 
                     ${firstPivotX - pivotBubbleRadius},${pivot.pivotY}` :
                    `M ${branchFromX},${timelineY + mainBubbleRadius} 
                     Q ${(branchFromX + firstPivotX - pivotBubbleRadius) / 2},${(timelineY + mainBubbleRadius + pivot.pivotY) / 2 + 24} 
                     ${firstPivotX - pivotBubbleRadius},${pivot.pivotY}`
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
                  x2={firstPivotX + ((pivot.stages[pivot.stages.length - 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280))}
                  y2={pivot.pivotY}
                  stroke={pivotLineColors[pivot.originalIndex] || pivot.color}
                  strokeWidth="4"
                  opacity="0.8"
                />

                {/* Pivot path label - centered above last bubble */}
                <text
                  x={firstPivotX + ((pivot.stages[pivot.stages.length - 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280))}
                  y={pivot.pivotY - 35}
                  className="text-sm font-bold"
                  textAnchor="middle"
                  style={{ fill: pivotLineColors[pivot.originalIndex] || pivot.color }}
                >
                  {pivot.branchName} Path
                </text>

                {/* Pivot stage bubbles */}
                {pivot.stages.map((pivotStage, stageIndex) => {
                  // First bubble at fixed position, subsequent bubbles based on timeline
                  const pivotX = stageIndex === 0 ? firstPivotX : 
                    firstPivotX + ((pivotStage.cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280));
                  const isHovered = hoveredPoint === `pivot-${pivot.originalIndex}-${stageIndex}`;

                  return (
                    <g key={`pivot-${pivot.originalIndex}-${stageIndex}`}>
                      {/* Time duration label */}
                      {pivotStage.timeToNext && stageIndex < pivot.stages.length - 1 && (
                        <text
                          x={pivotX + (stageIndex === 0 ? 
                            (firstPivotX + ((pivot.stages[1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280)) - pivotX) / 2 :
                            (firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280)) - pivotX) / 2)}
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
                        r={isHovered ? hoveredPivotRadius : pivotBubbleRadius}
                        fill={levelColors[pivotStage.level]}
                        stroke="white"
                        strokeWidth={isMobile ? "3" : "4"}
                        className={`cursor-pointer transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                        onMouseEnter={() => interactive && setHoveredPoint(`pivot-${pivot.originalIndex}-${stageIndex}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />

                      {/* Pivot title in bubble */}
                      <text
                        x={pivotX}
                        y={pivot.pivotY + 2}
                        textAnchor="middle"
                        className="font-bold fill-white pointer-events-none"
                        style={{ fontSize: getFontSize(getBubbleLabel(pivotStage.shortTitle, pivotStage.title, pivotBubbleRadius), pivotBubbleRadius, isMobile) }}
                      >
                        {getBubbleLabel(pivotStage.shortTitle, pivotStage.title, pivotBubbleRadius)}
                      </text>


                      {/* Smooth connections between pivot bubbles */}
                      {stageIndex < pivot.stages.length - 1 && (
                        <line
                          x1={pivotX + 38}
                          y1={pivot.pivotY}
                          x2={(stageIndex === pivot.stages.length - 2 ? 
                            firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280)) :
                            firstPivotX + ((pivot.stages[stageIndex + 1].cumulativeYears - pivot.stages[0].cumulativeYears) / maxYears) * ((svgWidth - 280))) - 38}
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
          
          // Calculate SVG container left offset (centered container)
          const containerWidth = 768; // SVG width
          const svgLeftOffset = (typeof window !== 'undefined' ? (window.innerWidth - containerWidth) / 2 : 0);
          
          if (hoveredPoint.startsWith('main-')) {
            const stageIndex = parseInt(hoveredPoint.replace('main-', ''));
            stage = mainPath[stageIndex];
            x = svgLeftOffset + getMainPathXPosition(stage.cumulativeYears);
            y = 120; // Fixed position relative to component
            tooltipWidth = getTooltipWidth(stage.title, stage.salary);
          } else if (hoveredPoint.startsWith('pivot-')) {
            const [_, originalIndex, stageIndex] = hoveredPoint.split('-').map(Number);
            const pivot = pivotOpportunities[originalIndex];
            if (pivot) {
              stage = pivot.stages[stageIndex];
              
              // Use main path positioning approach for consistency
              x = svgLeftOffset + getMainPathXPosition(stage.cumulativeYears);
              
              // Calculate positioning using same logic as rendering
              const A = 112; // Base distance from main path (20% smaller)
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
                y = 180 - distance - 70; // Fixed position relative to component
                tooltipWidth = getTooltipWidth(stage.title, stage.salary);
              } else if (belowIndex !== -1) {
                const distance = belowIndex === 0 ? A * 0.75 : A * 1.5;
                y = 180 + distance + 40; // Fixed position relative to component
                tooltipWidth = getTooltipWidth(stage.title, stage.salary);
              }
            }
          }
          
          if (stage) {
            return (
              <div 
                className="absolute bg-white border border-gray-300 rounded-lg p-4 shadow-xl pointer-events-none"
                style={{
                  left: Math.max(10, Math.min(x - 140, svgWidth + 200)),
                  top: y - 20,
                  width: '280px',
                  zIndex: 1000
                }}
              >
                {/* Header */}
                <div className="border-b pb-2 mb-3">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {stage.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-green-600">
                      {stage.salary}
                    </div>
                    {stage.remoteFriendly && (
                      <div className="text-sm text-green-600 font-medium">
                        🏠 Remote OK
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stage.cumulativeYears} years experience • {stage.timeToNext ? `${stage.timeToNext}y to next level` : 'Final level'}
                  </div>
                </div>

                {/* Typical Positions */}
                {stage.positions && stage.positions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Typical Positions</div>
                    <div className="space-y-1">
                      {stage.positions.slice(0, 3).map((position, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {position}
                        </div>
                      ))}
                      {stage.positions.length > 3 && (
                        <div className="text-xs text-gray-500">+{stage.positions.length - 3} more roles</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Skills */}
                {stage.core_skills && stage.core_skills.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Key Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {stage.core_skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {stage.core_skills.length > 4 && (
                        <span className="text-xs text-gray-500">+{stage.core_skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Progressive Skills Needed */}
                {(() => {
                  // Define progressive skills for each career level
                  const progressiveSkills = {
                    'data_scientist': {
                      0: ['Python/R Programming', 'Statistical Analysis', 'Business Communication', 'SQL Databases'],
                      1: ['Machine Learning', 'Product Analytics', 'Stakeholder Management', 'Cloud Platforms'],
                      2: ['Team Leadership', 'Strategic Planning', 'Advanced ML/AI', 'Executive Communication'],
                      3: ['Organizational Strategy', 'P&L Management', 'Innovation Leadership', 'Board Reporting']
                    },
                    'research_scientist': {
                      0: ['Research Design', 'Data Analysis', 'Scientific Communication', 'Project Management'],
                      1: ['Grant Writing', 'Team Leadership', 'Regulatory Knowledge', 'Technology Transfer'],
                      2: ['Strategic Planning', 'Budget Management', 'Partnership Development', 'Innovation Strategy'],
                      3: ['Executive Leadership', 'P&L Responsibility', 'Board Relations', 'Corporate Strategy']
                    },
                    'r_and_d_scientist': {
                      0: ['Research Methodology', 'Technical Writing', 'Laboratory Management', 'Data Analysis'],
                      1: ['Project Leadership', 'Innovation Strategy', 'Cross-functional Collaboration', 'Technology Development'],
                      2: ['Strategic Planning', 'Budget Management', 'Team Leadership', 'Portfolio Management'],
                      3: ['Executive Leadership', 'P&L Management', 'Board Reporting', 'Innovation Strategy']
                    },
                    'product_manager': {
                      0: ['Product Strategy', 'Market Research', 'User Experience', 'Technical Communication'],
                      1: ['Strategic Planning', 'Cross-functional Leadership', 'Data-driven Decision Making', 'Stakeholder Management'],
                      2: ['Portfolio Management', 'P&L Ownership', 'Executive Communication', 'Innovation Leadership'],
                      3: ['Organizational Strategy', 'Board Relations', 'Market Strategy', 'Corporate Development']
                    },
                    'management_consultant': {
                      0: ['Business Analysis', 'Financial Modeling', 'Client Communication', 'Problem Solving'],
                      1: ['Strategic Thinking', 'Project Leadership', 'Executive Presentation', 'Industry Expertise'],
                      2: ['Business Development', 'Team Management', 'Thought Leadership', 'Client Relationship Management'],
                      3: ['Partnership Development', 'P&L Management', 'Organizational Strategy', 'Board Advisory']
                    },
                    'software_engineering': {
                      0: ['Programming Languages', 'System Design', 'Code Quality', 'Debugging'],
                      1: ['Architecture Design', 'Technical Leadership', 'Mentoring', 'Project Management'],
                      2: ['Strategic Planning', 'Engineering Management', 'Technology Strategy', 'Cross-functional Leadership'],
                      3: ['Organizational Leadership', 'Technology Vision', 'Executive Communication', 'Innovation Strategy']
                    },
                    // Pivot-specific skills for R&D Scientist paths
                    'biotech_leadership': {
                      0: ['Business Development', 'Regulatory Knowledge', 'Strategic Planning', 'Team Management'],
                      1: ['Scientific Strategy', 'P&L Management', 'Partnership Development', 'Board Communication'],
                      2: ['Executive Leadership', 'Corporate Strategy', 'Innovation Vision', 'Stakeholder Management']
                    },
                    'entrepreneurship': {
                      0: ['Business Planning', 'Fundraising', 'Market Analysis', 'Technology Commercialization'],
                      1: ['Leadership & Vision', 'Financial Management', 'Strategic Partnerships', 'Scaling Operations'],
                      2: ['Serial Entrepreneurship', 'Portfolio Management', 'Investment Strategy', 'Mentorship']
                    },
                    'product_development': {
                      0: ['Product Strategy', 'Market Research', 'Cross-functional Leadership', 'User Experience'],
                      1: ['Portfolio Management', 'Go-to-Market Strategy', 'Team Leadership', 'P&L Ownership'],
                      2: ['Product Vision', 'Innovation Strategy', 'Executive Communication', 'Market Strategy']
                    },
                    'executive_consulting': {
                      0: ['Client Relationship Management', 'Business Analysis', 'Strategic Thinking', 'Presentation Skills'],
                      1: ['Thought Leadership', 'Business Development', 'Team Management', 'Industry Expertise'],
                      2: ['Partnership Development', 'P&L Management', 'Corporate Strategy', 'Board Advisory']
                    }
                  };
                  
                  let currentStageIndex, nextStageIndex, skillsKey, isLastStage, skillsNeeded;
                  
                  if (hoveredPoint.startsWith('main-')) {
                    // Main path skills
                    currentStageIndex = parseInt(hoveredPoint.replace('main-', ''));
                    nextStageIndex = currentStageIndex + 1;
                    skillsKey = careerKey || 'data_scientist';
                    isLastStage = nextStageIndex >= mainPath.length;
                    skillsNeeded = progressiveSkills[skillsKey]?.[nextStageIndex] || 
                                   progressiveSkills[skillsKey]?.[currentStageIndex] || 
                                   ['Leadership', 'Strategic Thinking', 'Communication', 'Technical Expertise'];
                  } else if (hoveredPoint.startsWith('pivot-')) {
                    // Pivot path skills
                    const [_, originalIndex, stageIndex] = hoveredPoint.split('-').map(Number);
                    const pivot = pivotOpportunities[originalIndex];
                    currentStageIndex = stageIndex;
                    nextStageIndex = stageIndex + 1;
                    
                    // Map pivot branch names to skill keys
                    const pivotSkillKeys = {
                      'Biotech Leadership': 'biotech_leadership',
                      'Entrepreneurship': 'entrepreneurship', 
                      'Product Development': 'product_development',
                      'Executive Consulting': 'executive_consulting'
                    };
                    
                    skillsKey = pivotSkillKeys[pivot.branchName] || 'biotech_leadership';
                    isLastStage = nextStageIndex >= pivot.stages.length;
                    skillsNeeded = progressiveSkills[skillsKey]?.[nextStageIndex] || 
                                   progressiveSkills[skillsKey]?.[currentStageIndex] || 
                                   ['Leadership', 'Strategic Thinking', 'Communication', 'Technical Expertise'];
                  }
                  
                  return (
                    <div className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                      <div className="font-semibold mb-1">
                        🎯 {isLastStage ? 'Key Skills at This Level' : 'Skills Needed for Next Level'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skillsNeeded.map((skill, idx) => (
                          <span key={idx} className="bg-purple-200 text-purple-800 px-1 py-0.5 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }
        })()}
        </div>
      )}

      {/* Mobile Pivot Opportunities */}
      {isMobile && showPivots && pivotOpportunities.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Career Pivot Opportunities</h4>
          <div className="space-y-4">
            {pivotOpportunities.map((pivot, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <h5 className="font-semibold text-gray-900">{pivot.branchName}</h5>
                  <span className="ml-auto text-xs text-green-600 font-medium">
                    {pivot.transitionSuccess} success rate
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  From: {mainPath[pivot.branchFromIndex]?.title} ({mainPath[pivot.branchFromIndex]?.cumulativeYears}y)
                </div>
                <div className="flex flex-wrap gap-2">
                  {pivot.stages.map((stage, stageIndex) => (
                    <div key={stageIndex} className="bg-white rounded px-2 py-1 text-xs">
                      <div className="font-medium">{stage.shortTitle}</div>
                      <div className="text-gray-600">{stage.salary}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex justify-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-lg">
          <div className={isMobile ? "text-xs font-medium text-gray-700 mb-4 text-center" : "text-sm font-medium text-gray-700 mb-4 text-center"}>
            Career Levels & Remote Work
          </div>
          <div className={isMobile ? "flex justify-center gap-3 flex-wrap" : "flex justify-center gap-6"}>
            {Object.entries(levelColors).filter(([level]) => level !== 'entry').map(([level, color]) => (
              <div key={level} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, borderRadius: '50%' }}
                ></div>
                <span className={isMobile ? "text-xs text-gray-600" : "text-sm text-gray-600"}>
                  {level === 'mid' ? 'PhD Entry' : 
                   level === 'senior' ? 'Senior' : 
                   level === 'lead' ? 'Leadership' : 'Executive'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-center space-y-2">
            <span className={isMobile ? "text-xs text-gray-500 block" : "text-xs text-gray-500 block"}>
              🏠 Remote OK indicates remote-friendly positions
            </span>
            <span className={isMobile ? "text-xs text-gray-500 italic block" : "text-xs text-gray-500 italic block"}>
              *Salary ranges based on US market averages (major tech hubs)
            </span>
            {!isMobile && (
              <span className="text-xs text-gray-(svgWidth - 280) block">
                💡 Hover over any position to see details
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicCareerTimeline;