import React, { useState, useEffect } from 'react';
import careerTrajectories from '../data/careerTrajectories.json';

const CareerMap = ({ careerPath = 'data_scientist', showPivots = true, interactive = true }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [trajectory, setTrajectory] = useState(null);

  useEffect(() => {
    if (careerTrajectories.trajectories[careerPath]) {
      setTrajectory(careerTrajectories.trajectories[careerPath]);
    }
  }, [careerPath]);

  if (!trajectory) {
    return <div className="p-4 text-gray-500">Career path not found</div>;
  }

  const colors = careerTrajectories.visualization_settings?.stage_colors || {
    'entry': '#10B981',
    'mid': '#3B82F6', 
    'senior': '#8B5CF6',
    'lead': '#F59E0B'
  };
  const skillColors = careerTrajectories.visualization_settings?.skill_categories || {
    'technical': '#EF4444',
    'leadership': '#8B5CF6',
    'business': '#10B981',
    'communication': '#F59E0B'
  };

  const getSkillCategory = (skill) => {
    const techKeywords = ['programming', 'data', 'technical', 'system', 'algorithm', 'software', 'code', 'engineering'];
    const leadershipKeywords = ['leadership', 'management', 'team', 'mentor', 'strategy', 'vision', 'organizational'];
    const businessKeywords = ['business', 'market', 'revenue', 'customer', 'product', 'financial', 'competitive'];
    const communicationKeywords = ['communication', 'presentation', 'client', 'stakeholder', 'writing', 'relationship'];
    
    const lowerSkill = skill.toLowerCase();
    
    if (techKeywords.some(keyword => lowerSkill.includes(keyword))) return 'technical';
    if (leadershipKeywords.some(keyword => lowerSkill.includes(keyword))) return 'leadership';
    if (businessKeywords.some(keyword => lowerSkill.includes(keyword))) return 'business';
    if (communicationKeywords.some(keyword => lowerSkill.includes(keyword))) return 'communication';
    
    return 'technical'; // default
  };

  const StageCard = ({ stage, index, isSelected }) => (
    <div 
      className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => interactive && setSelectedStage(isSelected ? null : index)}
    >
      {/* Stage Header */}
      <div 
        className="p-4 rounded-t-lg text-white font-semibold"
        style={{ backgroundColor: colors[stage.level] }}
      >
        <h3 className="text-lg font-bold">{stage.title}</h3>
        <div className="text-sm opacity-90">
          {stage.years_experience} years experience • {stage.typical_duration}
        </div>
      </div>

      {/* Stage Content */}
      <div className="p-4">
        {/* Positions */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Typical Positions</h4>
          <div className="space-y-1">
            {stage.positions.map((position, idx) => (
              <div key={idx} className="text-sm bg-gray-50 px-2 py-1 rounded">
                {position}
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="mb-3">
          <span className="font-semibold text-green-600">{stage.salary_range}</span>
        </div>

        {/* Core Skills Preview */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {stage.core_skills.slice(0, 3).map((skill, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-1 rounded text-white"
                style={{ backgroundColor: skillColors[getSkillCategory(skill)] }}
              >
                {skill}
              </span>
            ))}
            {stage.core_skills.length > 3 && (
              <span className="text-xs text-gray-500">+{stage.core_skills.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Expand/Collapse Indicator */}
        {interactive && (
          <div className="text-center text-gray-400 text-sm">
            {isSelected ? '▲ Click to collapse' : '▼ Click to expand'}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* All Core Skills */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Core Skills</h4>
            <div className="flex flex-wrap gap-2">
              {stage.core_skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="text-sm px-3 py-1 rounded text-white cursor-pointer transition-opacity hover:opacity-80"
                  style={{ backgroundColor: skillColors[getSkillCategory(skill)] }}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Developing Skills */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Developing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {stage.developing_skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="text-sm px-3 py-1 rounded border-2 border-dashed"
                  style={{ 
                    borderColor: skillColors[getSkillCategory(skill)],
                    color: skillColors[getSkillCategory(skill)]
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Key Achievements</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {stage.key_achievements.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Connection Arrow */}
      {index < trajectory.stages.length - 1 && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl z-10">
          →
        </div>
      )}
    </div>
  );

  const PivotOpportunity = ({ pivot, fromStage }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 m-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-yellow-800">Pivot to {pivot.to_career.replace('_', ' ').toUpperCase()}</h4>
        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
          {pivot.timeline}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        From: {fromStage.title}
      </div>
      <div className="flex flex-wrap gap-1">
        {pivot.transition_skills.map((skill, idx) => (
          <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  const SkillLegend = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold mb-3">Skill Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(skillColors).map(([category, color]) => (
          <div key={category} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const TimelineOverview = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold mb-3">{trajectory.name} Career Timeline</h3>
      <div className="text-sm text-gray-600 mb-4">
        {trajectory.timeline_years}
      </div>
      
      {/* Timeline Visualization */}
      <div className="flex flex-col space-y-2">
        {trajectory.stages.map((stage, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[stage.level] }}
            ></div>
            <div className="flex-1">
              <div className="font-medium">{stage.title}</div>
              <div className="text-sm text-gray-500">
                {stage.years_experience} years • {stage.typical_duration}
              </div>
            </div>
            <div className="text-sm font-medium text-green-600">
              {stage.salary_range.split(' - ')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AlternativePaths = () => {
    const alternativePaths = trajectory.alternative_paths || [];
    
    if (alternativePaths.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Alternative Career Paths</h3>
          <p className="text-gray-600 text-sm">
            Alternative paths and specializations are being developed for this career. 
            Check back soon for more options!
          </p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Alternative Career Paths</h3>
        <div className="space-y-3">
          {alternativePaths.map((path, index) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-purple-700">{path.path_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{path.description}</p>
              <div className="flex flex-wrap gap-2">
                {path.typical_roles.map((role, idx) => (
                  <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {trajectory.name} Career Path
        </h1>
        <p className="text-gray-600">
          Interactive career progression map with skills, timelines, and pivot opportunities
        </p>
      </div>

      {/* Skill Legend */}
      <SkillLegend />

      {/* Timeline Overview */}
      <TimelineOverview />

      {/* Main Career Progression */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Career Progression</h2>
        
        {/* Desktop View - Horizontal Layout */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between space-x-6 overflow-x-auto pb-4">
            {trajectory.stages.map((stage, index) => (
              <div key={index} className="flex-1 min-w-80">
                <StageCard 
                  stage={stage} 
                  index={index} 
                  isSelected={selectedStage === index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet View - Vertical Layout */}
        <div className="lg:hidden space-y-6">
          {trajectory.stages.map((stage, index) => (
            <StageCard 
              key={index}
              stage={stage} 
              index={index} 
              isSelected={selectedStage === index}
            />
          ))}
        </div>
      </div>

      {/* Pivot Opportunities */}
      {showPivots && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Career Pivot Opportunities</h2>
          {trajectory.pivot_opportunities && trajectory.pivot_opportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trajectory.pivot_opportunities.map((pivot, index) => {
                const fromStage = trajectory.stages.find(stage => stage.level === pivot.from_level);
                return (
                  <PivotOpportunity 
                    key={index}
                    pivot={pivot} 
                    fromStage={fromStage}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">Pivot Opportunities Coming Soon</h3>
              <p className="text-yellow-700 text-sm">
                We're analyzing career transition data to provide specific pivot opportunities for this path. 
                Check back soon for detailed transition guidance!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative Paths */}
      <AlternativePaths />

      {/* Skill Tooltip */}
      {hoveredSkill && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded shadow-lg z-50">
          <div className="text-sm font-medium">{hoveredSkill}</div>
          <div className="text-xs opacity-75">Category: {getSkillCategory(hoveredSkill)}</div>
        </div>
      )}

      {/* Interactive Help */}
      {interactive && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm">
          💡 Click on career stages to expand details
        </div>
      )}
    </div>
  );
};

export default CareerMap;

// Additional utility component for embedding in other pages
export const MiniCareerMap = ({ careerPath, maxStages = 4 }) => {
  const trajectory = careerTrajectories.trajectories[careerPath];
  
  if (!trajectory) return null;
  
  const colors = careerTrajectories.visualization_settings?.stage_colors || {
    'entry': '#10B981',
    'mid': '#3B82F6', 
    'senior': '#8B5CF6',
    'lead': '#F59E0B'
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">{trajectory.name}</h3>
      <div className="flex space-x-2 overflow-x-auto">
        {trajectory.stages.slice(0, maxStages).map((stage, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-32 p-2 rounded text-center text-sm"
            style={{ backgroundColor: colors[stage.level] + '20', borderColor: colors[stage.level] }}
          >
            <div className="font-medium" style={{ color: colors[stage.level] }}>
              {stage.title}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {stage.years_experience}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Timeline: {trajectory.timeline_years}
      </div>
    </div>
  );
};