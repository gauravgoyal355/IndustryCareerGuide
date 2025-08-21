import React, { useState, useEffect } from 'react';
import careerTrajectories from '../data/careerTrajectories.json';
import SalaryTimelineGraph from './SalaryTimelineGraph';

const CareerMap = ({ careerPath = 'data_scientist', showPivots = true, interactive = true }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [trajectory, setTrajectory] = useState(null);

  useEffect(() => {
    if (careerTrajectories?.trajectories?.[careerPath]) {
      setTrajectory(careerTrajectories.trajectories[careerPath]);
    } else {
      // Set a default trajectory for demonstration
      setTrajectory(careerTrajectories?.trajectories?.data_scientist || null);
    }
  }, [careerPath]);

  // Ensure we have trajectory data on initial load
  useEffect(() => {
    if (!trajectory && careerTrajectories?.trajectories?.data_scientist) {
      setTrajectory(careerTrajectories.trajectories.data_scientist);
    }
  }, [trajectory]);

  if (!trajectory) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Career Data...</h2>
          <p className="text-gray-600">
            Career path data is being loaded. If this persists, the career path &quot;{careerPath}&quot; may not be available.
          </p>
        </div>
      </div>
    );
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
    <div className="mb-6">
      <SalaryTimelineGraph 
        trajectory={trajectory} 
        interactive={interactive}
        showPivots={showPivots}
      />
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

  const HowToGetStarted = () => {
    const gettingStarted = trajectory.getting_started;
    
    if (!gettingStarted) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
            🚀 How to Get Started in {trajectory.name}
          </h3>
          <p className="text-blue-700 text-sm">
            Getting started guidance for this career path is being developed. 
            Check back soon for detailed prerequisites, preparation steps, and daily activities information!
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
          🚀 How to Get Started in {trajectory.name}
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Prerequisites */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              📚 Prerequisites
            </h4>
            <div className="space-y-2">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Education</h5>
                <p className="text-sm text-gray-600">{gettingStarted.education}</p>
              </div>
              {gettingStarted.certifications && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Certifications</h5>
                  <div className="flex flex-wrap gap-1">
                    {gettingStarted.certifications.map((cert, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {typeof cert === 'object' && cert.url ? (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {cert.name}
                          </a>
                        ) : (
                          cert
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {gettingStarted.key_skills && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Essential Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {gettingStarted.key_skills.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Steps */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              🎯 How to Prepare
            </h4>
            <div className="space-y-3">
              {gettingStarted.preparation_steps?.map((step, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            
            {gettingStarted.recommended_resources && (
              <div className="mt-4 pt-3 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Resources</h5>
                <div className="space-y-1">
                  {gettingStarted.recommended_resources.map((resource, idx) => (
                    <div key={idx} className="text-xs text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {typeof resource === 'object' && resource.url ? (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {resource.name}
                        </a>
                      ) : (
                        resource
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Activities */}
          <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              ⏰ Daily Activities
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">{gettingStarted.daily_overview}</p>
              {gettingStarted.typical_day && (
                <div className="space-y-2">
                  {gettingStarted.typical_day.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                      <p className="text-xs text-gray-600">{activity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Next Steps */}
        {gettingStarted.timeline_to_entry && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              ⏱️ Expected Timeline to Entry
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Time to first role:</span> {gettingStarted.timeline_to_entry}
                </p>
                {gettingStarted.entry_level_positions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Common entry positions:</p>
                    <div className="flex flex-wrap gap-1">
                      {gettingStarted.entry_level_positions.map((position, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {gettingStarted.salary_expectations && (
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Entry-level salary range:</span> {gettingStarted.salary_expectations}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
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
                We&apos;re analyzing career transition data to provide specific pivot opportunities for this path. 
                Check back soon for detailed transition guidance!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative Paths */}
      <AlternativePaths />

      {/* How to Get Started */}
      <div className="mb-8">
        <HowToGetStarted />
      </div>

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