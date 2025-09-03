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
  const svgHeight = isMobile ? 800 : 400; // Increased from 360 to 400 to add more top padding
  const timelineY = isMobile ? (svgWidth - 280) : 220; // Increased from 180 to 220 to add more top whitespace
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
                    y={timelineY + (isMobile ? 15 : 18)}
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
                          y={pivot.isAbove ? pivot.pivotY + 15 : pivot.pivotY + 15}
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
                    'bioinformatics_scientist': {
                      0: ['Python/R Programming', 'Genomics Analysis', 'Statistical Methods', 'Database Management'],
                      1: ['Machine Learning', 'Pipeline Development', 'Team Leadership', 'Project Management'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Technology Strategy', 'Innovation Management'],
                      3: ['Executive Leadership', 'Organizational Strategy', 'Partnership Development', 'Technology Vision']
                    },
                    'process_development_scientist': {
                      0: ['Process Optimization', 'Scale-up Chemistry', 'Quality Control', 'Technical Documentation'],
                      1: ['Process Engineering', 'Team Leadership', 'Manufacturing Systems', 'Regulatory Compliance'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Technology Transfer', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Operational Strategy', 'Business Development', 'Technology Vision']
                    },
                    'digital_health_scientist': {
                      0: ['Digital Health Platforms', 'Data Analysis', 'Healthcare Technology', 'Clinical Research'],
                      1: ['Machine Learning', 'Product Development', 'Team Leadership', 'Regulatory Knowledge'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Innovation Management', 'Technology Strategy'],
                      3: ['Executive Leadership', 'Digital Strategy', 'Partnership Development', 'Healthcare Vision']
                    },
                    'environmental_scientist': {
                      0: ['Environmental Assessment', 'Data Analysis', 'Research Methods', 'Technical Writing'],
                      1: ['Environmental Monitoring', 'Team Leadership', 'Regulatory Knowledge', 'Project Management'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Environmental Strategy', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Environmental Vision', 'Policy Development', 'Organizational Strategy']
                    },
                    'medical_science_liaison': {
                      0: ['Medical Communication', 'Clinical Knowledge', 'Relationship Building', 'Scientific Presentation'],
                      1: ['Medical Education', 'KOL Management', 'Team Leadership', 'Strategic Communication'],
                      2: ['Medical Strategy', 'Cross-functional Leadership', 'Program Management', 'Therapeutic Planning'],
                      3: ['Executive Leadership', 'Medical Affairs Strategy', 'Commercial Strategy', 'Healthcare Vision']
                    },
                    'clinical_research_associate': {
                      0: ['Clinical Trial Management', 'GCP Knowledge', 'Site Management', 'Data Collection'],
                      1: ['Clinical Operations', 'Team Leadership', 'Protocol Development', 'Regulatory Knowledge'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Clinical Strategy', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Clinical Vision', 'Operational Strategy', 'Healthcare Innovation']
                    },
                    'clinical_data_manager': {
                      0: ['Clinical Data Management', 'Database Design', 'Data Quality', 'Regulatory Compliance'],
                      1: ['Data Strategy', 'Team Leadership', 'Process Improvement', 'Technology Integration'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Data Programs', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Data Vision', 'Technology Strategy', 'Healthcare Innovation']
                    },
                    'regulatory_affairs_specialist': {
                      0: ['Regulatory Submissions', 'FDA Guidelines', 'Documentation', 'Compliance Management'],
                      1: ['Regulatory Strategy', 'Team Leadership', 'Cross-functional Collaboration', 'Global Regulations'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Regulatory Programs', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Regulatory Vision', 'Strategic Partnerships', 'Organizational Excellence']
                    },
                    'quality_assurance_specialist': {
                      0: ['Quality Systems', 'GMP Guidelines', 'Audit Management', 'Documentation'],
                      1: ['Quality Strategy', 'Team Leadership', 'Process Improvement', 'Compliance Management'],
                      2: ['Strategic Planning', 'Cross-functional Management', 'Quality Programs', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Quality Vision', 'Organizational Excellence', 'Strategic Partnerships']
                    },
                    'data_analyst': {
                      0: ['SQL Programming', 'Data Visualization', 'Excel/Tableau', 'Business Intelligence'],
                      1: ['Advanced Analytics', 'Statistical Methods', 'Dashboard Design', 'Stakeholder Communication'],
                      2: ['Team Leadership', 'Strategic Analysis', 'Process Optimization', 'Executive Reporting'],
                      3: ['Analytics Strategy', 'P&L Management', 'Innovation Leadership', 'Organizational Excellence']
                    },
                    'biostatistician': {
                      0: ['Statistical Programming', 'Clinical Study Design', 'Regulatory Guidelines', 'Data Management'],
                      1: ['Advanced Statistics', 'Statistical Planning', 'Team Leadership', 'Regulatory Submissions'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Innovation Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Statistical Vision', 'Organizational Strategy', 'Healthcare Innovation']
                    },
                    'quantitative_analyst': {
                      0: ['Mathematical Modeling', 'Programming (Python/R)', 'Financial Markets', 'Risk Analysis'],
                      1: ['Advanced Modeling', 'Portfolio Theory', 'Team Leadership', 'Trading Systems'],
                      2: ['Strategic Planning', 'Risk Management', 'Executive Communication', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Quantitative Vision', 'P&L Management', 'Strategic Partnerships']
                    },
                    'market_analyst': {
                      0: ['Market Research', 'Data Analysis', 'Industry Analysis', 'Report Writing'],
                      1: ['Strategic Analysis', 'Competitive Intelligence', 'Team Leadership', 'Presentation Skills'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Market Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Market Vision', 'Organizational Strategy', 'Innovation Leadership']
                    },
                    'market_research_analyst': {
                      0: ['Survey Design', 'Statistical Analysis', 'Consumer Insights', 'Data Visualization'],
                      1: ['Advanced Research Methods', 'Team Leadership', 'Strategic Insights', 'Client Management'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Research Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Research Vision', 'Organizational Strategy', 'Innovation Leadership']
                    },
                    'public_health_analyst': {
                      0: ['Epidemiological Methods', 'Public Health Data', 'Statistical Analysis', 'Health Policy'],
                      1: ['Program Evaluation', 'Team Leadership', 'Policy Analysis', 'Community Engagement'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Public Health Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Public Health Vision', 'Policy Development', 'Organizational Excellence']
                    },
                    'financial_analyst': {
                      0: ['Financial Modeling', 'Investment Analysis', 'Excel/Financial Software', 'Market Research'],
                      1: ['Advanced Modeling', 'Portfolio Analysis', 'Team Leadership', 'Client Presentation'],
                      2: ['Strategic Planning', 'Cross-functional Leadership', 'Investment Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Financial Vision', 'P&L Management', 'Strategic Partnerships']
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
                    },
                    // Pivot-specific skills for Bioinformatics Scientist paths
                    'computational_biology': {
                      0: ['Algorithm Development', 'Mathematical Modeling', 'Systems Biology', 'Data Visualization'],
                      1: ['Research Leadership', 'Grant Writing', 'Technology Development', 'Strategic Planning'],
                      2: ['Innovation Strategy', 'Team Management', 'Partnership Development', 'Technology Vision']
                    },
                    'data_science': {
                      0: ['Machine Learning', 'Business Analytics', 'Product Metrics', 'Statistical Modeling'],
                      1: ['Team Leadership', 'Strategic Analytics', 'Cross-functional Collaboration', 'Business Intelligence'],
                      2: ['Data Strategy', 'Executive Communication', 'Innovation Leadership', 'Organizational Impact']
                    },
                    'biotech_product_management': {
                      0: ['Product Strategy', 'Market Analysis', 'Stakeholder Management', 'Technical Communication'],
                      1: ['Product Roadmaps', 'Cross-functional Leadership', 'User Research', 'Competitive Analysis'],
                      2: ['Executive Leadership', 'Business Strategy', 'Innovation Management', 'Portfolio Management']
                    },
                    'scientific_consulting': {
                      0: ['Client Relations', 'Technical Writing', 'Regulatory Knowledge', 'Project Management'],
                      1: ['Business Development', 'Strategic Consulting', 'Team Leadership', 'Proposal Writing'],
                      2: ['Partnership Development', 'Practice Leadership', 'Client Strategy', 'Business Growth']
                    },
                    // Pivot-specific skills for Process Development Scientist paths
                    'manufacturing_engineering': {
                      0: ['Manufacturing Processes', 'Equipment Design', 'Process Control', 'Safety Management'],
                      1: ['Operations Management', 'Team Leadership', 'Continuous Improvement', 'Supply Chain'],
                      2: ['Strategic Operations', 'Executive Leadership', 'Technology Strategy', 'Business Growth']
                    },
                    'quality_engineering': {
                      0: ['Quality Systems', 'Regulatory Compliance', 'Process Validation', 'Risk Assessment'],
                      1: ['Quality Management', 'Team Leadership', 'Audit Management', 'Strategic Planning'],
                      2: ['Quality Strategy', 'Executive Leadership', 'Organizational Excellence', 'Compliance Vision']
                    },
                    'technical_operations': {
                      0: ['Operations Management', 'Process Improvement', 'Cross-functional Leadership', 'Strategic Planning'],
                      1: ['Operational Strategy', 'Team Management', 'Technology Integration', 'Performance Optimization'],
                      2: ['Executive Leadership', 'Business Strategy', 'Innovation Management', 'Organizational Growth']
                    },
                    'process_consulting': {
                      0: ['Client Relations', 'Process Analysis', 'Technical Writing', 'Project Management'],
                      1: ['Business Development', 'Strategic Consulting', 'Team Leadership', 'Proposal Development'],
                      2: ['Partnership Development', 'Practice Leadership', 'Client Strategy', 'Business Growth']
                    },
                    // Pivot-specific skills for Digital Health Scientist paths
                    'health_data_science': {
                      0: ['Healthcare Analytics', 'Clinical Data', 'Machine Learning', 'Statistical Analysis'],
                      1: ['Advanced Analytics', 'Team Leadership', 'Product Development', 'Healthcare Strategy'],
                      2: ['Data Strategy', 'Executive Leadership', 'Innovation Management', 'Healthcare Vision']
                    },
                    'digital_therapeutics': {
                      0: ['Product Management', 'Clinical Validation', 'Regulatory Strategy', 'Digital Health'],
                      1: ['Product Strategy', 'Cross-functional Leadership', 'Market Development', 'Innovation'],
                      2: ['Executive Leadership', 'Business Strategy', 'Partnership Development', 'Market Vision']
                    },
                    'clinical_research_technology': {
                      0: ['Clinical Research', 'Technology Integration', 'Regulatory Compliance', 'Data Management'],
                      1: ['Strategic Planning', 'Team Leadership', 'Clinical Operations', 'Innovation Management'],
                      2: ['Executive Leadership', 'Clinical Strategy', 'Technology Vision', 'Healthcare Innovation']
                    },
                    'healthcare_innovation': {
                      0: ['Innovation Strategy', 'Healthcare Technology', 'Strategic Planning', 'Project Management'],
                      1: ['Innovation Leadership', 'Cross-functional Management', 'Partnership Development', 'Technology Strategy'],
                      2: ['Executive Leadership', 'Innovation Vision', 'Strategic Partnerships', 'Healthcare Transformation']
                    },
                    // Pivot-specific skills for Environmental Scientist paths
                    'sustainability_consulting': {
                      0: ['Sustainability Assessment', 'Client Relations', 'Environmental Reporting', 'Project Management'],
                      1: ['Strategic Consulting', 'Team Leadership', 'Business Development', 'Sustainability Strategy'],
                      2: ['Executive Leadership', 'Client Strategy', 'Organizational Sustainability', 'Business Growth']
                    },
                    'environmental_policy': {
                      0: ['Policy Analysis', 'Regulatory Knowledge', 'Technical Writing', 'Data Analysis'],
                      1: ['Policy Development', 'Stakeholder Management', 'Strategic Planning', 'Team Leadership'],
                      2: ['Policy Strategy', 'Executive Leadership', 'Government Relations', 'Environmental Vision']
                    },
                    'climate_tech': {
                      0: ['Climate Science', 'Technology Assessment', 'Data Analysis', 'Innovation Strategy'],
                      1: ['Technology Development', 'Team Leadership', 'Strategic Planning', 'Market Analysis'],
                      2: ['Executive Leadership', 'Climate Strategy', 'Technology Vision', 'Innovation Management']
                    },
                    'environmental_consulting': {
                      0: ['Environmental Assessment', 'Client Relations', 'Technical Writing', 'Project Management'],
                      1: ['Strategic Consulting', 'Team Leadership', 'Business Development', 'Environmental Strategy'],
                      2: ['Partnership Development', 'Practice Leadership', 'Client Strategy', 'Business Growth']
                    },
                    // Pivot-specific skills for Medical Science Liaison paths
                    'clinical_development': {
                      0: ['Clinical Trial Design', 'Regulatory Strategy', 'Protocol Development', 'Data Analysis'],
                      1: ['Clinical Operations', 'Team Leadership', 'Strategic Planning', 'Cross-functional Management'],
                      2: ['Clinical Strategy', 'Executive Leadership', 'Development Programs', 'Regulatory Excellence']
                    },
                    'regulatory_affairs': {
                      0: ['Regulatory Submissions', 'FDA Guidelines', 'Clinical Documentation', 'Compliance Management'],
                      1: ['Regulatory Strategy', 'Team Leadership', 'Cross-functional Collaboration', 'Global Regulations'],
                      2: ['Executive Leadership', 'Regulatory Vision', 'Strategic Partnerships', 'Organizational Excellence']
                    },
                    'medical_affairs_leadership': {
                      0: ['Medical Strategy', 'Evidence Generation', 'KOL Management', 'Scientific Communication'],
                      1: ['Program Management', 'Team Leadership', 'Cross-functional Strategy', 'Medical Education'],
                      2: ['Executive Leadership', 'Medical Vision', 'Commercial Strategy', 'Healthcare Innovation']
                    },
                    'pharmaceutical_marketing': {
                      0: ['Product Marketing', 'Market Analysis', 'Commercial Strategy', 'Brand Management'],
                      1: ['Marketing Strategy', 'Team Leadership', 'Cross-functional Collaboration', 'Revenue Growth'],
                      2: ['Executive Leadership', 'Commercial Vision', 'Brand Portfolio', 'Market Innovation']
                    },
                    // Pivot-specific skills for Clinical Research Associate paths  
                    'clinical_data_management': {
                      0: ['Clinical Data', 'Database Management', 'Data Quality', 'Statistical Analysis'],
                      1: ['Data Strategy', 'Team Leadership', 'Process Improvement', 'Technology Integration'],
                      2: ['Executive Leadership', 'Data Vision', 'Technology Strategy', 'Innovation Management']
                    },
                    'medical_writing': {
                      0: ['Medical Writing', 'Regulatory Documentation', 'Clinical Protocols', 'Scientific Communication'],
                      1: ['Writing Strategy', 'Team Leadership', 'Publication Management', 'Cross-functional Collaboration'],
                      2: ['Executive Leadership', 'Communication Strategy', 'Medical Affairs', 'Innovation Leadership']
                    },
                    'clinical_operations_leadership': {
                      0: ['Clinical Operations', 'Project Management', 'Site Management', 'Team Leadership'],
                      1: ['Operations Strategy', 'Cross-functional Leadership', 'Process Optimization', 'Strategic Planning'],
                      2: ['Executive Leadership', 'Clinical Strategy', 'Operational Excellence', 'Healthcare Innovation']
                    },
                    // Pivot-specific skills for Regulatory Affairs Specialist paths
                    'quality_assurance': {
                      0: ['Quality Systems', 'GMP Knowledge', 'Audit Management', 'Risk Assessment'],
                      1: ['Quality Strategy', 'Team Leadership', 'Process Improvement', 'Compliance Management'],
                      2: ['Executive Leadership', 'Quality Vision', 'Organizational Excellence', 'Innovation Management']
                    },
                    'clinical_operations': {
                      0: ['Clinical Operations', 'Project Management', 'Site Management', 'Protocol Development'],
                      1: ['Operations Strategy', 'Team Leadership', 'Process Optimization', 'Cross-functional Management'],
                      2: ['Executive Leadership', 'Clinical Strategy', 'Operational Excellence', 'Healthcare Innovation']
                    },
                    'regulatory_strategy': {
                      0: ['Regulatory Strategy', 'Global Regulations', 'Strategic Planning', 'Cross-functional Collaboration'],
                      1: ['Strategic Leadership', 'Regulatory Programs', 'Team Management', 'Innovation Strategy'],
                      2: ['Executive Leadership', 'Regulatory Vision', 'Strategic Partnerships', 'Healthcare Innovation']
                    },
                    'regulatory_leadership': {
                      0: ['Regulatory Leadership', 'Strategic Planning', 'Team Management', 'Cross-functional Leadership'],
                      1: ['Executive Strategy', 'Organizational Leadership', 'Regulatory Programs', 'Innovation Management'],
                      2: ['Executive Leadership', 'Regulatory Vision', 'Strategic Partnerships', 'Organizational Excellence']
                    },
                    // Pivot-specific skills for Clinical Data Manager paths
                    'clinical_analytics': {
                      0: ['Clinical Analytics', 'Statistical Analysis', 'Data Visualization', 'Healthcare Metrics'],
                      1: ['Analytics Strategy', 'Team Leadership', 'Advanced Analytics', 'Cross-functional Collaboration'],
                      2: ['Executive Leadership', 'Analytics Vision', 'Data Strategy', 'Healthcare Innovation']
                    },
                    'biostatistics': {
                      0: ['Statistical Methods', 'Clinical Trial Design', 'SAS/R Programming', 'Regulatory Statistics'],
                      1: ['Statistical Strategy', 'Team Leadership', 'Advanced Modeling', 'Cross-functional Collaboration'],
                      2: ['Executive Leadership', 'Statistical Vision', 'Regulatory Strategy', 'Innovation Management']
                    },
                    'clinical_technology': {
                      0: ['Clinical Technology', 'System Integration', 'Data Management', 'Innovation Strategy'],
                      1: ['Technology Strategy', 'Team Leadership', 'Digital Transformation', 'Cross-functional Management'],
                      2: ['Executive Leadership', 'Technology Vision', 'Innovation Management', 'Healthcare Technology']
                    },
                    // Pivot-specific skills for Quality Assurance Specialist paths
                    'process_improvement': {
                      0: ['Process Analysis', 'Continuous Improvement', 'Lean Methodologies', 'Data Analysis'],
                      1: ['Process Strategy', 'Team Leadership', 'Operational Excellence', 'Change Management'],
                      2: ['Executive Leadership', 'Process Vision', 'Organizational Excellence', 'Innovation Management']
                    },
                    'operations_management': {
                      0: ['Operations Management', 'Process Control', 'Team Leadership', 'Performance Metrics'],
                      1: ['Operational Strategy', 'Cross-functional Leadership', 'Process Optimization', 'Strategic Planning'],
                      2: ['Executive Leadership', 'Operational Vision', 'Business Strategy', 'Organizational Growth']
                    },
                    'quality_consulting': {
                      0: ['Quality Consulting', 'Client Relations', 'Quality Assessment', 'Technical Writing'],
                      1: ['Consulting Strategy', 'Team Leadership', 'Business Development', 'Quality Strategy'],
                      2: ['Partnership Development', 'Practice Leadership', 'Client Strategy', 'Business Growth']
                    },
                    // Pivot-specific skills for Data & Analytics careers
                    'business_intelligence': {
                      0: ['BI Tools', 'Dashboard Design', 'Data Warehousing', 'Reporting Systems'],
                      1: ['BI Strategy', 'Team Leadership', 'Advanced Analytics', 'Executive Reporting'],
                      2: ['Analytics Vision', 'Executive Leadership', 'Data Strategy', 'Business Intelligence']
                    },
                    'product_analytics': {
                      0: ['Product Metrics', 'A/B Testing', 'User Analytics', 'Product Intelligence'],
                      1: ['Product Strategy', 'Team Leadership', 'Advanced Analytics', 'Cross-functional Collaboration'],
                      2: ['Product Vision', 'Executive Leadership', 'Analytics Strategy', 'Innovation Management']
                    },
                    'marketing_analytics': {
                      0: ['Marketing Analytics', 'Campaign Analysis', 'Customer Segmentation', 'Attribution Modeling'],
                      1: ['Marketing Strategy', 'Team Leadership', 'Advanced Analytics', 'Revenue Optimization'],
                      2: ['Marketing Vision', 'Executive Leadership', 'Growth Strategy', 'Innovation Management']
                    },
                    'algorithmic_trading': {
                      0: ['Trading Algorithms', 'Financial Modeling', 'Risk Management', 'Market Analysis'],
                      1: ['Trading Strategy', 'Team Leadership', 'Portfolio Management', 'Risk Assessment'],
                      2: ['Trading Vision', 'Executive Leadership', 'Investment Strategy', 'Financial Innovation']
                    },
                    'financial_data_science': {
                      0: ['Financial Analytics', 'Machine Learning', 'Risk Modeling', 'Alternative Data'],
                      1: ['Analytics Strategy', 'Team Leadership', 'Advanced Modeling', 'Cross-functional Collaboration'],
                      2: ['Data Vision', 'Executive Leadership', 'Financial Strategy', 'Innovation Management']
                    },
                    'consumer_insights': {
                      0: ['Consumer Research', 'Survey Design', 'Data Analysis', 'Market Intelligence'],
                      1: ['Insights Strategy', 'Team Leadership', 'Advanced Research', 'Client Management'],
                      2: ['Research Vision', 'Executive Leadership', 'Market Strategy', 'Innovation Management']
                    },
                    'market_strategy': {
                      0: ['Market Analysis', 'Strategic Planning', 'Competitive Intelligence', 'Business Development'],
                      1: ['Strategic Leadership', 'Team Management', 'Market Development', 'Cross-functional Collaboration'],
                      2: ['Market Vision', 'Executive Leadership', 'Business Strategy', 'Innovation Management']
                    },
                    'ux_research': {
                      0: ['User Research', 'Usability Testing', 'Research Methods', 'Data Analysis'],
                      1: ['Research Strategy', 'Team Leadership', 'Product Development', 'Cross-functional Collaboration'],
                      2: ['UX Vision', 'Executive Leadership', 'Product Strategy', 'Innovation Management']
                    },
                    'healthcare_analytics': {
                      0: ['Healthcare Data', 'Clinical Analytics', 'Population Health', 'Statistical Analysis'],
                      1: ['Analytics Strategy', 'Team Leadership', 'Health Outcomes', 'Cross-functional Collaboration'],
                      2: ['Healthcare Vision', 'Executive Leadership', 'Data Strategy', 'Healthcare Innovation']
                    },
                    'policy_research': {
                      0: ['Policy Analysis', 'Research Methods', 'Data Collection', 'Report Writing'],
                      1: ['Policy Strategy', 'Team Leadership', 'Stakeholder Management', 'Strategic Planning'],
                      2: ['Policy Vision', 'Executive Leadership', 'Government Relations', 'Innovation Management']
                    },
                    'health_data_science': {
                      0: ['Health Data', 'Machine Learning', 'Clinical Analytics', 'Statistical Modeling'],
                      1: ['Data Strategy', 'Team Leadership', 'Advanced Analytics', 'Cross-functional Collaboration'],
                      2: ['Data Vision', 'Executive Leadership', 'Health Strategy', 'Innovation Management']
                    },
                    'corporate_development': {
                      0: ['Financial Analysis', 'Business Development', 'Strategic Planning', 'Market Research'],
                      1: ['Corporate Strategy', 'Team Leadership', 'M&A Analysis', 'Cross-functional Collaboration'],
                      2: ['Strategic Vision', 'Executive Leadership', 'Business Strategy', 'Innovation Management']
                    },
                    'venture_capital': {
                      0: ['Investment Analysis', 'Due Diligence', 'Financial Modeling', 'Market Research'],
                      1: ['Investment Strategy', 'Team Leadership', 'Portfolio Management', 'Business Development'],
                      2: ['Investment Vision', 'Executive Leadership', 'Fund Strategy', 'Innovation Management']
                    },
                    'financial_planning': {
                      0: ['Financial Planning', 'Budget Analysis', 'Forecasting', 'Business Analysis'],
                      1: ['Planning Strategy', 'Team Leadership', 'Strategic Planning', 'Cross-functional Collaboration'],
                      2: ['Financial Vision', 'Executive Leadership', 'Business Strategy', 'Innovation Management']
                    },
                    'technical_consulting': {
                      0: ['Technical Analysis', 'Client Communication', 'Problem Solving', 'Project Management'],
                      1: ['Solution Architecture', 'Team Leadership', 'Business Development', 'Strategic Consulting'],
                      2: ['Practice Leadership', 'Executive Communication', 'Client Strategy', 'Innovation Management'],
                      3: ['Partnership Development', 'P&L Management', 'Technology Vision', 'Business Growth']
                    },
                    'business_development_manager': {
                      0: ['Business Development', 'Sales Strategy', 'Market Analysis', 'Relationship Building'],
                      1: ['Partnership Strategy', 'Team Leadership', 'Revenue Growth', 'Strategic Planning'],
                      2: ['Business Strategy', 'Cross-functional Leadership', 'Market Expansion', 'Executive Communication'],
                      3: ['Executive Leadership', 'Growth Vision', 'P&L Management', 'Strategic Partnerships']
                    },
                    'program_management': {
                      0: ['Program Management', 'Project Coordination', 'Stakeholder Management', 'Process Improvement'],
                      1: ['Program Strategy', 'Team Leadership', 'Cross-functional Management', 'Strategic Planning'],
                      2: ['Portfolio Management', 'Executive Communication', 'Organizational Strategy', 'Innovation Leadership'],
                      3: ['Executive Leadership', 'Program Vision', 'P&L Management', 'Organizational Excellence']
                    },
                    'operations_manager': {
                      0: ['Operations Management', 'Process Optimization', 'Team Leadership', 'Performance Metrics'],
                      1: ['Operational Strategy', 'Cross-functional Leadership', 'Supply Chain', 'Quality Management'],
                      2: ['Strategic Planning', 'Business Operations', 'Innovation Management', 'Executive Communication'],
                      3: ['Executive Leadership', 'Operational Vision', 'P&L Management', 'Business Growth']
                    },
                    'venture_capital_analyst': {
                      0: ['Investment Analysis', 'Due Diligence', 'Financial Modeling', 'Market Research'],
                      1: ['Investment Strategy', 'Portfolio Management', 'Team Leadership', 'Business Development'],
                      2: ['Fund Strategy', 'Cross-functional Leadership', 'Partnership Development', 'Executive Communication'],
                      3: ['Executive Leadership', 'Investment Vision', 'Fund Management', 'Strategic Partnerships']
                    },
                    'entrepreneur_startup_founder': {
                      0: ['Business Planning', 'Product Development', 'Fundraising', 'Team Building'],
                      1: ['Strategic Leadership', 'Business Development', 'Scaling Operations', 'Financial Management'],
                      2: ['Executive Leadership', 'Vision Setting', 'Strategic Partnerships', 'Innovation Management'],
                      3: ['Serial Entrepreneurship', 'Portfolio Management', 'Investment Strategy', 'Mentorship']
                    },
                    // Additional pivot-specific skills for Business & Strategy careers
                    'solution_architecture': {
                      0: ['Solution Design', 'Technical Analysis', 'Systems Integration', 'Client Communication'],
                      1: ['Architecture Strategy', 'Team Leadership', 'Technology Planning', 'Business Analysis'],
                      2: ['Technology Vision', 'Executive Leadership', 'Innovation Strategy', 'Strategic Partnerships']
                    },
                    'digital_transformation': {
                      0: ['Digital Strategy', 'Change Management', 'Technology Assessment', 'Process Improvement'],
                      1: ['Transformation Leadership', 'Team Management', 'Strategic Planning', 'Innovation Management'],
                      2: ['Digital Vision', 'Executive Leadership', 'Organizational Change', 'Technology Strategy']
                    },
                    'client_management': {
                      0: ['Client Relations', 'Account Management', 'Business Development', 'Communication'],
                      1: ['Client Strategy', 'Team Leadership', 'Relationship Management', 'Business Growth'],
                      2: ['Client Vision', 'Executive Leadership', 'Strategic Partnerships', 'Business Development']
                    },
                    'technology_leadership': {
                      0: ['Technology Strategy', 'Team Management', 'Innovation Planning', 'Technical Leadership'],
                      1: ['Technology Vision', 'Executive Leadership', 'Strategic Planning', 'Innovation Management'],
                      2: ['Technology Innovation', 'Organizational Leadership', 'Strategic Partnerships', 'Technology Excellence']
                    },
                    'sales_leadership': {
                      0: ['Sales Strategy', 'Team Management', 'Revenue Growth', 'Client Development'],
                      1: ['Sales Vision', 'Executive Leadership', 'Business Development', 'Strategic Planning'],
                      2: ['Sales Excellence', 'Organizational Leadership', 'Market Strategy', 'Revenue Innovation']
                    },
                    'partnership_development': {
                      0: ['Partnership Strategy', 'Business Development', 'Relationship Building', 'Strategic Planning'],
                      1: ['Partnership Leadership', 'Team Management', 'Strategic Alliances', 'Business Growth'],
                      2: ['Partnership Vision', 'Executive Leadership', 'Strategic Partnerships', 'Business Innovation']
                    },
                    'project_management_office': {
                      0: ['PMO Strategy', 'Project Management', 'Process Standardization', 'Team Leadership'],
                      1: ['PMO Leadership', 'Portfolio Management', 'Strategic Planning', 'Organizational Excellence'],
                      2: ['PMO Vision', 'Executive Leadership', 'Organizational Strategy', 'Innovation Management']
                    },
                    'supply_chain_management': {
                      0: ['Supply Chain Strategy', 'Operations Management', 'Vendor Management', 'Process Optimization'],
                      1: ['Supply Chain Leadership', 'Team Management', 'Strategic Planning', 'Innovation Strategy'],
                      2: ['Supply Chain Vision', 'Executive Leadership', 'Organizational Strategy', 'Business Growth']
                    },
                    'process_optimization': {
                      0: ['Process Analysis', 'Continuous Improvement', 'Lean Methodologies', 'Change Management'],
                      1: ['Process Strategy', 'Team Leadership', 'Operational Excellence', 'Innovation Management'],
                      2: ['Process Vision', 'Executive Leadership', 'Organizational Excellence', 'Strategic Innovation']
                    },
                    'corporate_strategy': {
                      0: ['Strategic Analysis', 'Business Planning', 'Market Research', 'Financial Modeling'],
                      1: ['Strategic Leadership', 'Team Management', 'Strategic Planning', 'Cross-functional Collaboration'],
                      2: ['Strategic Vision', 'Executive Leadership', 'Organizational Strategy', 'Innovation Management']
                    },
                    'fund_management': {
                      0: ['Investment Management', 'Portfolio Analysis', 'Risk Assessment', 'Client Relations'],
                      1: ['Fund Strategy', 'Team Leadership', 'Investment Planning', 'Business Development'],
                      2: ['Fund Vision', 'Executive Leadership', 'Investment Strategy', 'Strategic Partnerships']
                    },
                    'investment_banking': {
                      0: ['Financial Analysis', 'Investment Banking', 'Client Management', 'Deal Execution'],
                      1: ['Investment Strategy', 'Team Leadership', 'Business Development', 'Client Relations'],
                      2: ['Investment Vision', 'Executive Leadership', 'Strategic Partnerships', 'Financial Innovation']
                    },
                    'innovation_leadership': {
                      0: ['Innovation Strategy', 'Product Development', 'Team Leadership', 'Strategic Planning'],
                      1: ['Innovation Management', 'Cross-functional Leadership', 'Technology Strategy', 'Business Growth'],
                      2: ['Innovation Vision', 'Executive Leadership', 'Organizational Innovation', 'Strategic Excellence']
                    },
                    'angel_investing': {
                      0: ['Investment Analysis', 'Startup Evaluation', 'Market Research', 'Mentorship'],
                      1: ['Investment Strategy', 'Portfolio Management', 'Strategic Advice', 'Network Development'],
                      2: ['Investment Vision', 'Executive Leadership', 'Strategic Partnerships', 'Innovation Strategy']
                    },
                    'executive_leadership': {
                      0: ['Executive Strategy', 'Team Leadership', 'Strategic Planning', 'Organizational Management'],
                      1: ['Executive Vision', 'Cross-functional Leadership', 'Strategic Excellence', 'Innovation Management'],
                      2: ['Organizational Leadership', 'Strategic Innovation', 'Executive Excellence', 'Strategic Partnerships']
                    },
                    'ux_researcher': {
                      0: ['User Research Methods', 'Data Analysis', 'Research Design', 'Communication Skills'],
                      1: ['Advanced Research', 'Team Leadership', 'Product Strategy', 'Stakeholder Management'],
                      2: ['Research Strategy', 'Cross-functional Leadership', 'User Experience Vision', 'Executive Communication'],
                      3: ['Executive Leadership', 'Research Innovation', 'Product Vision', 'Organizational Strategy']
                    },
                    'scientific_writer': {
                      0: ['Scientific Writing', 'Research Communication', 'Publication Strategy', 'Content Development'],
                      1: ['Content Strategy', 'Team Leadership', 'Medical Writing', 'Strategic Communication'],
                      2: ['Communication Strategy', 'Cross-functional Leadership', 'Content Vision', 'Executive Communication'],
                      3: ['Executive Leadership', 'Content Innovation', 'Communication Vision', 'Strategic Partnerships']
                    },
                    'technical_writer': {
                      0: ['Technical Documentation', 'Content Development', 'API Documentation', 'User Guides'],
                      1: ['Documentation Strategy', 'Team Leadership', 'Content Management', 'Cross-functional Collaboration'],
                      2: ['Content Strategy', 'Cross-functional Leadership', 'Documentation Vision', 'Product Communication'],
                      3: ['Executive Leadership', 'Content Innovation', 'Communication Strategy', 'Organizational Excellence']
                    },
                    'copywriter': {
                      0: ['Copywriting', 'Brand Voice', 'Content Creation', 'Marketing Communication'],
                      1: ['Content Strategy', 'Team Leadership', 'Brand Strategy', 'Campaign Development'],
                      2: ['Marketing Strategy', 'Cross-functional Leadership', 'Brand Vision', 'Creative Direction'],
                      3: ['Executive Leadership', 'Marketing Innovation', 'Brand Leadership', 'Strategic Partnerships']
                    },
                    'science_communicator': {
                      0: ['Science Communication', 'Public Engagement', 'Content Creation', 'Educational Design'],
                      1: ['Communication Strategy', 'Team Leadership', 'Public Relations', 'Media Relations'],
                      2: ['Strategic Communication', 'Cross-functional Leadership', 'Outreach Vision', 'Educational Strategy'],
                      3: ['Executive Leadership', 'Communication Innovation', 'Public Engagement Vision', 'Strategic Partnerships']
                    },
                    'science_illustrator': {
                      0: ['Scientific Illustration', 'Visual Design', 'Digital Art', 'Communication Design'],
                      1: ['Design Strategy', 'Team Leadership', 'Creative Direction', 'Visual Communication'],
                      2: ['Creative Strategy', 'Cross-functional Leadership', 'Design Vision', 'Brand Development'],
                      3: ['Executive Leadership', 'Creative Innovation', 'Design Leadership', 'Strategic Partnerships']
                    },
                    // Additional pivot-specific skills for Communication & Creative careers
                    'content_strategy': {
                      0: ['Content Strategy', 'Content Planning', 'Editorial Calendar', 'Brand Voice'],
                      1: ['Content Leadership', 'Team Management', 'Strategic Content', 'Cross-functional Collaboration'],
                      2: ['Content Vision', 'Executive Leadership', 'Brand Strategy', 'Innovation Management']
                    },
                    'public_relations': {
                      0: ['Public Relations', 'Media Relations', 'Crisis Communication', 'Brand Management'],
                      1: ['PR Strategy', 'Team Leadership', 'Stakeholder Communication', 'Reputation Management'],
                      2: ['Communications Vision', 'Executive Leadership', 'Brand Strategy', 'Strategic Partnerships']
                    },
                    'educational_content': {
                      0: ['Educational Design', 'Curriculum Development', 'Learning Strategy', 'Content Creation'],
                      1: ['Education Strategy', 'Team Leadership', 'Learning Programs', 'Instructional Design'],
                      2: ['Learning Vision', 'Executive Leadership', 'Educational Innovation', 'Strategic Partnerships']
                    },
                    'regulatory_writing': {
                      0: ['Regulatory Writing', 'Clinical Documentation', 'Regulatory Strategy', 'Compliance Writing'],
                      1: ['Regulatory Communications', 'Team Leadership', 'Documentation Strategy', 'Cross-functional Collaboration'],
                      2: ['Regulatory Vision', 'Executive Leadership', 'Compliance Strategy', 'Innovation Management']
                    },
                    'grant_writing': {
                      0: ['Grant Writing', 'Proposal Development', 'Research Communication', 'Funding Strategy'],
                      1: ['Grant Strategy', 'Team Leadership', 'Development Programs', 'Stakeholder Management'],
                      2: ['Funding Vision', 'Executive Leadership', 'Development Strategy', 'Strategic Partnerships']
                    },
                    'research_operations': {
                      0: ['Research Operations', 'Process Design', 'Research Systems', 'Team Coordination'],
                      1: ['Research Strategy', 'Team Leadership', 'Operations Management', 'Process Optimization'],
                      2: ['Research Vision', 'Executive Leadership', 'Organizational Strategy', 'Innovation Management']
                    },
                    'design_strategy': {
                      0: ['Design Strategy', 'User Experience', 'Design Systems', 'Visual Communication'],
                      1: ['Design Leadership', 'Team Management', 'Design Vision', 'Cross-functional Collaboration'],
                      2: ['Creative Vision', 'Executive Leadership', 'Design Innovation', 'Strategic Partnerships']
                    },
                    'research_leadership': {
                      0: ['Research Leadership', 'Team Management', 'Research Strategy', 'Cross-functional Leadership'],
                      1: ['Research Vision', 'Executive Leadership', 'Organizational Research', 'Innovation Management'],
                      2: ['Research Excellence', 'Strategic Leadership', 'Research Innovation', 'Strategic Partnerships']
                    },
                    'developer_relations': {
                      0: ['Developer Relations', 'Technical Communication', 'Community Building', 'Content Creation'],
                      1: ['DevRel Strategy', 'Team Leadership', 'Developer Programs', 'Cross-functional Collaboration'],
                      2: ['Developer Vision', 'Executive Leadership', 'Community Strategy', 'Innovation Management']
                    },
                    'documentation_leadership': {
                      0: ['Documentation Strategy', 'Content Management', 'Information Architecture', 'Team Leadership'],
                      1: ['Documentation Vision', 'Executive Leadership', 'Content Strategy', 'Cross-functional Management'],
                      2: ['Information Excellence', 'Strategic Leadership', 'Documentation Innovation', 'Organizational Strategy']
                    },
                    'brand_strategy': {
                      0: ['Brand Strategy', 'Brand Development', 'Market Positioning', 'Creative Strategy'],
                      1: ['Brand Leadership', 'Team Management', 'Brand Vision', 'Strategic Marketing'],
                      2: ['Brand Excellence', 'Executive Leadership', 'Brand Innovation', 'Strategic Partnerships']
                    },
                    'agency_leadership': {
                      0: ['Agency Management', 'Client Relations', 'Creative Leadership', 'Business Development'],
                      1: ['Agency Strategy', 'Team Leadership', 'Client Strategy', 'Creative Vision'],
                      2: ['Agency Excellence', 'Executive Leadership', 'Creative Innovation', 'Strategic Partnerships']
                    },
                    'visual_communications_management': {
                      0: ['Visual Communications', 'Design Management', 'Brand Development', 'Creative Strategy'],
                      1: ['Visual Strategy', 'Team Leadership', 'Creative Direction', 'Cross-functional Collaboration'],
                      2: ['Visual Vision', 'Executive Leadership', 'Creative Innovation', 'Strategic Partnerships']
                    },
                    'creative_consulting': {
                      0: ['Creative Consulting', 'Client Relations', 'Design Strategy', 'Project Management'],
                      1: ['Creative Strategy', 'Team Leadership', 'Business Development', 'Client Management'],
                      2: ['Creative Vision', 'Executive Leadership', 'Strategic Partnerships', 'Business Growth']
                    },
                    'medical_illustration': {
                      0: ['Medical Illustration', 'Scientific Visualization', 'Healthcare Communication', 'Digital Design'],
                      1: ['Medical Design Strategy', 'Team Leadership', 'Healthcare Branding', 'Cross-functional Collaboration'],
                      2: ['Medical Communication Vision', 'Executive Leadership', 'Healthcare Innovation', 'Strategic Partnerships']
                    },
                    'ai_ml_engineer': {
                      0: ['Machine Learning', 'Python Programming', 'Data Engineering', 'Model Development'],
                      1: ['ML Architecture', 'Team Leadership', 'Advanced ML', 'Product Integration'],
                      2: ['AI Strategy', 'Cross-functional Leadership', 'ML Innovation', 'Technical Vision'],
                      3: ['Executive Leadership', 'AI Vision', 'Technology Strategy', 'Innovation Management']
                    },
                    'devops_engineer': {
                      0: ['CI/CD Pipelines', 'Cloud Infrastructure', 'Automation', 'System Administration'],
                      1: ['DevOps Architecture', 'Team Leadership', 'Infrastructure Strategy', 'Platform Engineering'],
                      2: ['Technology Strategy', 'Cross-functional Leadership', 'Infrastructure Vision', 'Engineering Excellence'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Platform Strategy', 'Organizational Excellence']
                    },
                    'systems_engineer': {
                      0: ['Systems Design', 'Architecture Planning', 'Technical Analysis', 'Integration'],
                      1: ['Systems Architecture', 'Team Leadership', 'Technical Strategy', 'Cross-functional Collaboration'],
                      2: ['Engineering Strategy', 'Cross-functional Leadership', 'Technology Vision', 'Innovation Management'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Systems Excellence', 'Strategic Partnerships']
                    },
                    'cybersecurity_analyst': {
                      0: ['Security Analysis', 'Threat Detection', 'Risk Assessment', 'Security Tools'],
                      1: ['Security Strategy', 'Team Leadership', 'Advanced Security', 'Incident Response'],
                      2: ['Security Architecture', 'Cross-functional Leadership', 'Security Vision', 'Risk Management'],
                      3: ['Executive Leadership', 'Security Innovation', 'Organizational Security', 'Strategic Partnerships']
                    },
                    'biomedical_engineer': {
                      0: ['Biomedical Engineering', 'Medical Devices', 'Regulatory Knowledge', 'Product Development'],
                      1: ['Engineering Strategy', 'Team Leadership', 'Advanced Engineering', 'Cross-functional Collaboration'],
                      2: ['Technology Strategy', 'Cross-functional Leadership', 'Innovation Management', 'Product Vision'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Healthcare Vision', 'Strategic Partnerships']
                    },
                    'chemical_engineer': {
                      0: ['Chemical Engineering', 'Process Design', 'Manufacturing', 'Quality Control'],
                      1: ['Process Strategy', 'Team Leadership', 'Advanced Engineering', 'Operations Management'],
                      2: ['Engineering Strategy', 'Cross-functional Leadership', 'Technology Vision', 'Innovation Management'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Manufacturing Excellence', 'Strategic Partnerships']
                    },
                    'electrical_engineer': {
                      0: ['Electrical Engineering', 'Circuit Design', 'Systems Integration', 'Technical Analysis'],
                      1: ['Engineering Strategy', 'Team Leadership', 'Advanced Engineering', 'Product Development'],
                      2: ['Technology Strategy', 'Cross-functional Leadership', 'Engineering Vision', 'Innovation Management'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Engineering Excellence', 'Strategic Partnerships']
                    },
                    'mechanical_engineer': {
                      0: ['Mechanical Engineering', 'Product Design', 'Manufacturing', 'CAD/Engineering Tools'],
                      1: ['Engineering Strategy', 'Team Leadership', 'Advanced Engineering', 'Product Management'],
                      2: ['Technology Strategy', 'Cross-functional Leadership', 'Engineering Vision', 'Innovation Management'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Product Excellence', 'Strategic Partnerships']
                    },
                    'materials_scientist': {
                      0: ['Materials Science', 'Material Characterization', 'R&D Methodology', 'Technical Analysis'],
                      1: ['Materials Strategy', 'Team Leadership', 'Advanced Materials', 'Product Development'],
                      2: ['Technology Strategy', 'Cross-functional Leadership', 'Materials Innovation', 'R&D Management'],
                      3: ['Executive Leadership', 'Technology Innovation', 'Materials Excellence', 'Strategic Partnerships']
                    },
                    'science_policy_analyst': {
                      0: ['Policy Analysis', 'Research Methods', 'Government Relations', 'Policy Writing'],
                      1: ['Policy Strategy', 'Team Leadership', 'Stakeholder Management', 'Legislative Analysis'],
                      2: ['Policy Leadership', 'Cross-functional Management', 'Strategic Planning', 'Executive Communication'],
                      3: ['Executive Leadership', 'Policy Vision', 'Government Strategy', 'Strategic Partnerships']
                    },
                    'education_and_outreach_specialist': {
                      0: ['Educational Design', 'Public Outreach', 'Program Development', 'Communication Skills'],
                      1: ['Education Strategy', 'Team Leadership', 'Program Management', 'Stakeholder Engagement'],
                      2: ['Educational Leadership', 'Cross-functional Management', 'Strategic Planning', 'Community Engagement'],
                      3: ['Executive Leadership', 'Educational Vision', 'Organizational Strategy', 'Strategic Partnerships']
                    },
                    'ngo_researcher': {
                      0: ['Research Methods', 'Data Analysis', 'Grant Writing', 'Program Evaluation'],
                      1: ['Research Strategy', 'Team Leadership', 'Program Management', 'Stakeholder Relations'],
                      2: ['Research Leadership', 'Cross-functional Management', 'Strategic Planning', 'Impact Assessment'],
                      3: ['Executive Leadership', 'Research Vision', 'Organizational Strategy', 'Strategic Partnerships']
                    },
                    'nonprofit_program_manager': {
                      0: ['Program Management', 'Grant Management', 'Community Engagement', 'Impact Measurement'],
                      1: ['Program Strategy', 'Team Leadership', 'Fundraising', 'Strategic Planning'],
                      2: ['Program Leadership', 'Cross-functional Management', 'Organizational Development', 'Executive Communication'],
                      3: ['Executive Leadership', 'Program Vision', 'Organizational Strategy', 'Strategic Partnerships']
                    },
                    'intellectual_property_analyst': {
                      0: ['Patent Analysis', 'IP Research', 'Technology Assessment', 'Legal Research'],
                      1: ['IP Strategy', 'Team Leadership', 'Patent Portfolio', 'Business Analysis'],
                      2: ['IP Leadership', 'Cross-functional Management', 'Strategic Planning', 'Executive Communication'],
                      3: ['Executive Leadership', 'IP Vision', 'Business Strategy', 'Strategic Partnerships']
                    },
                    'technology_transfer_officer': {
                      0: ['Technology Transfer', 'IP Management', 'Business Development', 'Market Analysis'],
                      1: ['Transfer Strategy', 'Team Leadership', 'Partnership Development', 'Commercial Strategy'],
                      2: ['Technology Leadership', 'Cross-functional Management', 'Innovation Strategy', 'Executive Communication'],
                      3: ['Executive Leadership', 'Innovation Vision', 'Strategic Partnerships', 'Technology Commercialization']
                    },
                    // Additional pivot-specific skills for Technology & Engineering careers
                    'engineering_management': {
                      0: ['Engineering Leadership', 'Team Management', 'Technical Strategy', 'Project Management'],
                      1: ['Engineering Strategy', 'Cross-functional Leadership', 'Technology Planning', 'Innovation Management'],
                      2: ['Technology Vision', 'Executive Leadership', 'Engineering Excellence', 'Strategic Partnerships']
                    },
                    'technical_consulting': {
                      0: ['Technical Consulting', 'Client Relations', 'Problem Solving', 'Technical Analysis'],
                      1: ['Consulting Strategy', 'Team Leadership', 'Business Development', 'Technical Leadership'],
                      2: ['Technical Vision', 'Executive Leadership', 'Client Strategy', 'Innovation Management']
                    },
                    'product_management': {
                      0: ['Product Strategy', 'Market Research', 'Technical Communication', 'Cross-functional Collaboration'],
                      1: ['Product Leadership', 'Team Management', 'Product Vision', 'Strategic Planning'],
                      2: ['Product Innovation', 'Executive Leadership', 'Business Strategy', 'Technology Vision']
                    },
                    'process_engineering_management': {
                      0: ['Process Engineering', 'Team Management', 'Manufacturing Strategy', 'Operations Management'],
                      1: ['Process Leadership', 'Cross-functional Management', 'Technology Strategy', 'Innovation Management'],
                      2: ['Process Vision', 'Executive Leadership', 'Manufacturing Excellence', 'Strategic Partnerships']
                    },
                    'manufacturing_engineering': {
                      0: ['Manufacturing Engineering', 'Process Design', 'Production Systems', 'Quality Control'],
                      1: ['Manufacturing Strategy', 'Team Leadership', 'Operations Management', 'Technology Integration'],
                      2: ['Manufacturing Vision', 'Executive Leadership', 'Operational Excellence', 'Innovation Management']
                    },
                    'systems_engineering': {
                      0: ['Systems Engineering', 'Architecture Design', 'Integration Planning', 'Technical Analysis'],
                      1: ['Systems Strategy', 'Team Leadership', 'Technology Planning', 'Cross-functional Collaboration'],
                      2: ['Systems Vision', 'Executive Leadership', 'Technology Strategy', 'Innovation Management']
                    },
                    'technical_product_management': {
                      0: ['Technical Product Management', 'Product Strategy', 'Engineering Collaboration', 'Market Analysis'],
                      1: ['Product Leadership', 'Team Management', 'Technology Strategy', 'Cross-functional Leadership'],
                      2: ['Product Vision', 'Executive Leadership', 'Technology Innovation', 'Strategic Partnerships']
                    },
                    'project_management': {
                      0: ['Project Management', 'Team Leadership', 'Resource Planning', 'Stakeholder Management'],
                      1: ['Project Strategy', 'Portfolio Management', 'Cross-functional Leadership', 'Strategic Planning'],
                      2: ['Project Vision', 'Executive Leadership', 'Organizational Excellence', 'Innovation Management']
                    },
                    'process_engineering': {
                      0: ['Process Engineering', 'Process Design', 'Manufacturing Systems', 'Technical Analysis'],
                      1: ['Process Strategy', 'Team Leadership', 'Technology Integration', 'Operations Management'],
                      2: ['Process Vision', 'Executive Leadership', 'Manufacturing Excellence', 'Innovation Management']
                    },
                    'r_and_d_management': {
                      0: ['R&D Management', 'Research Strategy', 'Innovation Planning', 'Team Leadership'],
                      1: ['R&D Leadership', 'Cross-functional Management', 'Technology Strategy', 'Innovation Management'],
                      2: ['R&D Vision', 'Executive Leadership', 'Research Excellence', 'Strategic Partnerships']
                    },
                    'quality_engineering': {
                      0: ['Quality Engineering', 'Quality Systems', 'Process Validation', 'Compliance Management'],
                      1: ['Quality Strategy', 'Team Leadership', 'Quality Management', 'Cross-functional Collaboration'],
                      2: ['Quality Vision', 'Executive Leadership', 'Quality Excellence', 'Innovation Management']
                    },
                    'ai_research': {
                      0: ['AI Research', 'Machine Learning', 'Research Methods', 'Technical Innovation'],
                      1: ['AI Strategy', 'Research Leadership', 'Technology Development', 'Cross-functional Collaboration'],
                      2: ['AI Vision', 'Executive Leadership', 'Research Excellence', 'Innovation Management']
                    },
                    'ai_product_management': {
                      0: ['AI Product Management', 'Product Strategy', 'Machine Learning', 'Technical Communication'],
                      1: ['AI Product Leadership', 'Team Management', 'Technology Strategy', 'Cross-functional Leadership'],
                      2: ['AI Product Vision', 'Executive Leadership', 'Technology Innovation', 'Strategic Partnerships']
                    },
                    'ai_engineering_leadership': {
                      0: ['AI Engineering Leadership', 'Team Management', 'Technical Strategy', 'Machine Learning'],
                      1: ['AI Strategy', 'Cross-functional Leadership', 'Technology Planning', 'Innovation Management'],
                      2: ['AI Vision', 'Executive Leadership', 'Technology Excellence', 'Strategic Partnerships']
                    },
                    'chief_ai_officer': {
                      0: ['AI Strategy', 'Executive Leadership', 'Technology Vision', 'Organizational AI'],
                      1: ['AI Innovation', 'Strategic Leadership', 'Technology Transformation', 'Strategic Partnerships'],
                      2: ['AI Excellence', 'Organizational Leadership', 'Technology Revolution', 'Innovation Strategy']
                    },
                    'site_reliability_engineering': {
                      0: ['Site Reliability', 'System Monitoring', 'Infrastructure Management', 'Automation'],
                      1: ['SRE Strategy', 'Team Leadership', 'Platform Engineering', 'Technology Planning'],
                      2: ['SRE Vision', 'Executive Leadership', 'Infrastructure Excellence', 'Innovation Management']
                    },
                    'cloud_architecture': {
                      0: ['Cloud Architecture', 'Infrastructure Design', 'Cloud Services', 'System Integration'],
                      1: ['Cloud Strategy', 'Team Leadership', 'Architecture Planning', 'Technology Innovation'],
                      2: ['Cloud Vision', 'Executive Leadership', 'Infrastructure Excellence', 'Strategic Partnerships']
                    },
                    'platform_engineering': {
                      0: ['Platform Engineering', 'Infrastructure Development', 'Developer Experience', 'System Design'],
                      1: ['Platform Strategy', 'Team Leadership', 'Technology Planning', 'Cross-functional Collaboration'],
                      2: ['Platform Vision', 'Executive Leadership', 'Technology Excellence', 'Innovation Management']
                    },
                    'technical_leadership': {
                      0: ['Technical Leadership', 'Team Management', 'Technology Strategy', 'Cross-functional Collaboration'],
                      1: ['Technology Vision', 'Executive Leadership', 'Strategic Planning', 'Innovation Management'],
                      2: ['Technology Excellence', 'Organizational Leadership', 'Strategic Partnerships', 'Innovation Strategy']
                    },
                    'security_research': {
                      0: ['Security Research', 'Threat Analysis', 'Vulnerability Research', 'Technical Innovation'],
                      1: ['Security Strategy', 'Research Leadership', 'Technology Development', 'Cross-functional Collaboration'],
                      2: ['Security Vision', 'Executive Leadership', 'Research Excellence', 'Innovation Management']
                    },
                    'security_consulting': {
                      0: ['Security Consulting', 'Client Relations', 'Risk Assessment', 'Security Analysis'],
                      1: ['Security Strategy', 'Team Leadership', 'Business Development', 'Client Management'],
                      2: ['Security Vision', 'Executive Leadership', 'Client Strategy', 'Strategic Partnerships']
                    },
                    'security_engineering': {
                      0: ['Security Engineering', 'System Security', 'Security Architecture', 'Technical Implementation'],
                      1: ['Security Strategy', 'Team Leadership', 'Architecture Planning', 'Technology Integration'],
                      2: ['Security Vision', 'Executive Leadership', 'Security Excellence', 'Innovation Management']
                    },
                    'executive_security_leadership': {
                      0: ['Security Leadership', 'Executive Strategy', 'Risk Management', 'Organizational Security'],
                      1: ['Security Vision', 'Strategic Leadership', 'Technology Transformation', 'Strategic Partnerships'],
                      2: ['Security Excellence', 'Organizational Leadership', 'Security Innovation', 'Strategic Excellence']
                    },
                    'medical_device_pm': {
                      0: ['Medical Device Product Management', 'Product Strategy', 'Regulatory Knowledge', 'Healthcare Market'],
                      1: ['Healthcare Product Leadership', 'Team Management', 'Medical Strategy', 'Cross-functional Leadership'],
                      2: ['Healthcare Product Vision', 'Executive Leadership', 'Healthcare Innovation', 'Strategic Partnerships']
                    },
                    'hardware_engineering': {
                      0: ['Hardware Engineering', 'Circuit Design', 'System Design', 'Technical Development'],
                      1: ['Hardware Strategy', 'Team Leadership', 'Technology Planning', 'Product Development'],
                      2: ['Hardware Vision', 'Executive Leadership', 'Technology Excellence', 'Innovation Management']
                    },
                    'solutions_architecture': {
                      0: ['Solutions Architecture', 'System Design', 'Technical Analysis', 'Client Solutions'],
                      1: ['Architecture Strategy', 'Team Leadership', 'Technology Planning', 'Cross-functional Collaboration'],
                      2: ['Architecture Vision', 'Executive Leadership', 'Technology Excellence', 'Strategic Partnerships']
                    },
                    // Additional pivot-specific skills for Policy & Social Impact and Legal & IP careers
                    'government_relations': {
                      0: ['Government Relations', 'Policy Analysis', 'Stakeholder Management', 'Legislative Process'],
                      1: ['Government Strategy', 'Team Leadership', 'Policy Development', 'Strategic Communication'],
                      2: ['Government Vision', 'Executive Leadership', 'Policy Innovation', 'Strategic Partnerships']
                    },
                    'think_tank_leadership': {
                      0: ['Think Tank Research', 'Policy Analysis', 'Research Management', 'Strategic Thinking'],
                      1: ['Research Leadership', 'Team Management', 'Policy Strategy', 'Cross-functional Collaboration'],
                      2: ['Research Vision', 'Executive Leadership', 'Policy Innovation', 'Strategic Partnerships']
                    },
                    'policy_consulting': {
                      0: ['Policy Consulting', 'Client Relations', 'Policy Analysis', 'Strategic Advice'],
                      1: ['Consulting Strategy', 'Team Leadership', 'Business Development', 'Client Management'],
                      2: ['Policy Vision', 'Executive Leadership', 'Client Strategy', 'Strategic Partnerships']
                    },
                    'corporate_training': {
                      0: ['Corporate Training', 'Curriculum Development', 'Adult Learning', 'Program Design'],
                      1: ['Training Strategy', 'Team Leadership', 'Learning Programs', 'Organizational Development'],
                      2: ['Learning Vision', 'Executive Leadership', 'Training Innovation', 'Strategic Partnerships']
                    },
                    'communications_marketing': {
                      0: ['Communications', 'Marketing Strategy', 'Brand Management', 'Public Relations'],
                      1: ['Marketing Leadership', 'Team Management', 'Strategic Communications', 'Cross-functional Collaboration'],
                      2: ['Marketing Vision', 'Executive Leadership', 'Brand Innovation', 'Strategic Partnerships']
                    },
                    'policy_advocacy': {
                      0: ['Policy Advocacy', 'Campaign Strategy', 'Stakeholder Engagement', 'Legislative Process'],
                      1: ['Advocacy Strategy', 'Team Leadership', 'Coalition Building', 'Strategic Communication'],
                      2: ['Advocacy Vision', 'Executive Leadership', 'Policy Innovation', 'Strategic Partnerships']
                    },
                    'impact_consulting': {
                      0: ['Impact Consulting', 'Social Impact Measurement', 'Program Evaluation', 'Client Relations'],
                      1: ['Impact Strategy', 'Team Leadership', 'Business Development', 'Strategic Analysis'],
                      2: ['Impact Vision', 'Executive Leadership', 'Social Innovation', 'Strategic Partnerships']
                    },
                    'foundation_program_officer': {
                      0: ['Foundation Programs', 'Grant Management', 'Program Evaluation', 'Strategic Analysis'],
                      1: ['Foundation Strategy', 'Team Leadership', 'Portfolio Management', 'Strategic Planning'],
                      2: ['Foundation Vision', 'Executive Leadership', 'Philanthropic Strategy', 'Strategic Partnerships']
                    },
                    'grant_management': {
                      0: ['Grant Management', 'Program Administration', 'Compliance Management', 'Stakeholder Relations'],
                      1: ['Grant Strategy', 'Team Leadership', 'Program Development', 'Strategic Planning'],
                      2: ['Grant Vision', 'Executive Leadership', 'Development Strategy', 'Strategic Partnerships']
                    },
                    'social_impact_consulting': {
                      0: ['Social Impact', 'Consulting Strategy', 'Impact Measurement', 'Program Evaluation'],
                      1: ['Impact Leadership', 'Team Management', 'Business Development', 'Strategic Analysis'],
                      2: ['Impact Vision', 'Executive Leadership', 'Social Innovation', 'Strategic Partnerships']
                    },
                    'corporate_social_responsibility': {
                      0: ['CSR Strategy', 'Sustainability Programs', 'Stakeholder Engagement', 'Impact Reporting'],
                      1: ['CSR Leadership', 'Team Management', 'Strategic Planning', 'Cross-functional Collaboration'],
                      2: ['CSR Vision', 'Executive Leadership', 'Sustainability Innovation', 'Strategic Partnerships']
                    },
                    'patent_law': {
                      0: ['Patent Law', 'Legal Research', 'IP Strategy', 'Patent Prosecution'],
                      1: ['Patent Strategy', 'Legal Leadership', 'IP Portfolio', 'Client Management'],
                      2: ['Legal Vision', 'Executive Leadership', 'IP Innovation', 'Strategic Partnerships']
                    },
                    'technology_assessment': {
                      0: ['Technology Assessment', 'Market Analysis', 'IP Evaluation', 'Strategic Analysis'],
                      1: ['Technology Strategy', 'Team Leadership', 'Assessment Programs', 'Cross-functional Collaboration'],
                      2: ['Technology Vision', 'Executive Leadership', 'Innovation Strategy', 'Strategic Partnerships']
                    },
                    'business_development': {
                      0: ['Business Development', 'Partnership Strategy', 'Market Analysis', 'Relationship Building'],
                      1: ['BD Strategy', 'Team Leadership', 'Strategic Partnerships', 'Revenue Growth'],
                      2: ['BD Vision', 'Executive Leadership', 'Growth Strategy', 'Strategic Partnerships']
                    },
                    'intellectual_property': {
                      0: ['Intellectual Property', 'IP Strategy', 'Patent Portfolio', 'Legal Analysis'],
                      1: ['IP Leadership', 'Team Management', 'Strategic Planning', 'Cross-functional Collaboration'],
                      2: ['IP Vision', 'Executive Leadership', 'IP Innovation', 'Strategic Partnerships']
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
                      'Executive Consulting': 'executive_consulting',
                      'Computational Biology': 'computational_biology',
                      'Data Science': 'data_science',
                      'Biotech Product Management': 'biotech_product_management',
                      'Scientific Consulting': 'scientific_consulting',
                      'Manufacturing Engineering': 'manufacturing_engineering',
                      'Quality Engineering': 'quality_engineering',
                      'Technical Operations': 'technical_operations',
                      'Process Consulting': 'process_consulting',
                      'Health Data Science': 'health_data_science',
                      'Digital Therapeutics': 'digital_therapeutics',
                      'Clinical Research Technology': 'clinical_research_technology',
                      'Healthcare Innovation': 'healthcare_innovation',
                      'Sustainability Consulting': 'sustainability_consulting',
                      'Environmental Policy': 'environmental_policy',
                      'Climate Tech': 'climate_tech',
                      'Environmental Consulting': 'environmental_consulting',
                      'Clinical Development': 'clinical_development',
                      'Regulatory Affairs': 'regulatory_affairs',
                      'Medical Affairs Leadership': 'medical_affairs_leadership',
                      'Pharmaceutical Marketing': 'pharmaceutical_marketing',
                      'Clinical Data Management': 'clinical_data_management',
                      'Medical Writing': 'medical_writing',
                      'Clinical Operations Leadership': 'clinical_operations_leadership',
                      'Clinical Analytics': 'clinical_analytics',
                      'Biostatistics': 'biostatistics',
                      'Clinical Technology': 'clinical_technology',
                      'Process Improvement': 'process_improvement',
                      'Operations Management': 'operations_management',
                      'Quality Consulting': 'quality_consulting',
                      'Quality Assurance': 'quality_assurance',
                      'Clinical Operations': 'clinical_operations',
                      'Regulatory Strategy': 'regulatory_strategy',
                      'Regulatory Leadership': 'regulatory_leadership',
                      'Business Intelligence': 'business_intelligence',
                      'Product Analytics': 'product_analytics',
                      'Marketing Analytics': 'marketing_analytics',
                      'Algorithmic Trading': 'algorithmic_trading',
                      'Financial Data Science': 'financial_data_science',
                      'Consumer Insights': 'consumer_insights',
                      'Market Strategy': 'market_strategy',
                      'UX Research': 'ux_research',
                      'Healthcare Analytics': 'healthcare_analytics',
                      'Policy Research': 'policy_research',
                      'Corporate Development': 'corporate_development',
                      'Venture Capital': 'venture_capital',
                      'Financial Planning': 'financial_planning',
                      'Solution Architecture': 'solution_architecture',
                      'Digital Transformation': 'digital_transformation',
                      'Client Management': 'client_management',
                      'Technology Leadership': 'technology_leadership',
                      'Sales Leadership': 'sales_leadership',
                      'Partnership Development': 'partnership_development',
                      'Project Management Office': 'project_management_office',
                      'Supply Chain Management': 'supply_chain_management',
                      'Process Optimization': 'process_optimization',
                      'Corporate Strategy': 'corporate_strategy',
                      'Fund Management': 'fund_management',
                      'Investment Banking': 'investment_banking',
                      'Innovation Leadership': 'innovation_leadership',
                      'Angel Investing': 'angel_investing',
                      'Executive Leadership': 'executive_leadership',
                      'Content Strategy': 'content_strategy',
                      'Public Relations': 'public_relations',
                      'Educational Content': 'educational_content',
                      'Regulatory Writing': 'regulatory_writing',
                      'Grant Writing': 'grant_writing',
                      'Research Operations': 'research_operations',
                      'Design Strategy': 'design_strategy',
                      'Research Leadership': 'research_leadership',
                      'Developer Relations': 'developer_relations',
                      'Documentation Leadership': 'documentation_leadership',
                      'Brand Strategy': 'brand_strategy',
                      'Agency Leadership': 'agency_leadership',
                      'Visual Communications Management': 'visual_communications_management',
                      'Creative Consulting': 'creative_consulting',
                      'Medical Illustration': 'medical_illustration',
                      'Engineering Management': 'engineering_management',
                      'Technical Consulting': 'technical_consulting',
                      'Product Management': 'product_management',
                      'Process Engineering Management': 'process_engineering_management',
                      'Manufacturing Engineering': 'manufacturing_engineering',
                      'Systems Engineering': 'systems_engineering',
                      'Technical Product Management': 'technical_product_management',
                      'Project Management': 'project_management',
                      'Process Engineering': 'process_engineering',
                      'R&D Management': 'r_and_d_management',
                      'Quality Engineering': 'quality_engineering',
                      'AI Research': 'ai_research',
                      'AI Product Management': 'ai_product_management',
                      'AI Engineering Leadership': 'ai_engineering_leadership',
                      'Chief AI Officer': 'chief_ai_officer',
                      'Site Reliability Engineering': 'site_reliability_engineering',
                      'Cloud Architecture': 'cloud_architecture',
                      'Platform Engineering': 'platform_engineering',
                      'Technical Leadership': 'technical_leadership',
                      'Security Research': 'security_research',
                      'Security Consulting': 'security_consulting',
                      'Security Engineering': 'security_engineering',
                      'Executive Security Leadership': 'executive_security_leadership',
                      'Medical Device PM': 'medical_device_pm',
                      'Hardware Engineering': 'hardware_engineering',
                      'Solutions Architecture': 'solutions_architecture',
                      'Government Relations': 'government_relations',
                      'Think Tank Leadership': 'think_tank_leadership',
                      'Policy Consulting': 'policy_consulting',
                      'Corporate Training': 'corporate_training',
                      'Communications/Marketing': 'communications_marketing',
                      'Technical Writing': 'technical_writing',
                      'Policy Advocacy': 'policy_advocacy',
                      'Impact Consulting': 'impact_consulting',
                      'Foundation Program Officer': 'foundation_program_officer',
                      'Grant Management': 'grant_management',
                      'Social Impact Consulting': 'social_impact_consulting',
                      'Corporate Social Responsibility': 'corporate_social_responsibility',
                      'Patent Law': 'patent_law',
                      'Technology Assessment': 'technology_assessment',
                      'Business Development': 'business_development',
                      'Intellectual Property': 'intellectual_property'
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