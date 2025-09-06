import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ActionPlan = ({ quizAnswers, topCareerMatch, userProfile = {}, isGenericFlow = false }) => {
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    milestones: true,
    resume: false,
    skills: false,
    learning: false,
    insights: false
  });

  // Use useCallback to stabilize the generateActionPlan function
  const generateActionPlan = React.useCallback(async () => {
    // Check if we have enhanced GAP data already
    if (userProfile.enhancedActionPlan) {
      console.log('Using enhanced GAP data');
      setActionPlan(userProfile.enhancedActionPlan);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/actionPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: quizAnswers,
          topCareerMatch,
          userProfile
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActionPlan(data.actionPlan);
    } catch (err) {
      setError(err.message);
      console.error('Error generating action plan:', err);
    } finally {
      setLoading(false);
    }
  }, [quizAnswers, topCareerMatch, userProfile]);

  useEffect(() => {
    // Generate action plan if we have topCareerMatch and either quizAnswers OR userProfile (for generic flow)
    if (topCareerMatch && (quizAnswers || (userProfile && Object.keys(userProfile).length > 0))) {
      generateActionPlan();
    }
  }, [quizAnswers, topCareerMatch, userProfile, generateActionPlan]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating your personalized action plan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Generating Action Plan</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={generateActionPlan}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!actionPlan && !loading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>
          {isGenericFlow 
            ? "Complete the form above to generate your action plan."
            : "Complete the career assessment to generate your personalized action plan."
          }
        </p>
      </div>
    );
  }

  const SectionHeader = ({ title, section, icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <span className="text-gray-400">
        {expandedSections[section] ? '▲' : '▼'}
      </span>
    </button>
  );

  const MilestoneCard = ({ timeframe, milestone }) => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{timeframe}</h4>
        <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(milestone.priority)}`}>
          {milestone.priority} priority
        </span>
      </div>
      <h5 className="font-medium text-blue-600 mb-3">{milestone.title}</h5>
      <ul className="space-y-2">
        {milestone.tasks.map((task, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-sm text-gray-700">{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const CourseCard = ({ course, type }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h6 className="font-semibold text-gray-800 mb-1">{course.title}</h6>
          <p className="text-sm text-gray-600 mb-2">{course.provider}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {course.level}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              {course.duration}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(course.priority)}`}>
              {course.priority} priority
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-600 text-sm">
            {type === 'certification' ? course.exam_fee : course.price}
          </div>
        </div>
      </div>
      
      {/* Skills covered */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Skills covered:</div>
        <div className="flex flex-wrap gap-1">
          {course.skills.map((skill, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Action button */}
      <div className="flex items-center justify-between">
        <a 
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          {type === 'certification' ? 'View Certification' : 'Start Course'}
          <span className="ml-1">→</span>
        </a>
        {course.relevanceScore && (
          <div className="text-xs text-gray-500">
            Match: {Math.round(course.relevanceScore)}%
          </div>
        )}
      </div>
    </div>
  );

  const LearningPathStep = ({ title, items, color }) => {
    const colorClasses = {
      red: 'border-red-300 bg-red-50',
      yellow: 'border-yellow-300 bg-yellow-50', 
      green: 'border-green-300 bg-green-50'
    };
    
    const textColorClasses = {
      red: 'text-red-800',
      yellow: 'text-yellow-800',
      green: 'text-green-800'
    };
    
    return (
      <div className={`border rounded-lg p-3 ${colorClasses[color] || colorClasses.red}`}>
        <h6 className={`font-semibold mb-2 ${textColorClasses[color] || textColorClasses.red}`}>
          {title}
        </h6>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-600">{item.provider}</div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-gray-500 italic">Complete previous steps first</div>
          )}
        </div>
      </div>
    );
  };

  const ResumeRecommendation = ({ recommendation, isMain = false }) => (
    <div className={`border rounded-lg p-4 ${isMain ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-gray-800">{recommendation.title}</h5>
        <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(recommendation.priority)}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
      <a 
        href={recommendation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      >
        Access Resource
        <span className="ml-1">→</span>
      </a>
    </div>
  );

  const SkillCategory = ({ title, skills, icon }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span>{icon}</span>
        <h5 className="font-semibold text-gray-800">{title}</h5>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-white rounded border text-sm text-gray-700"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Your Personalized Action Plan</h2>
        <p className="opacity-90">
          {actionPlan.overview.targetStage ? (
            `Transition from ${actionPlan.overview.currentStage} to ${actionPlan.overview.targetStage}`
          ) : (
            `Transition path: ${actionPlan.overview.targetPath || 'Career Development'}`
          )}
        </p>
        <div className="mt-4 flex space-x-6 text-sm">
          <div>
            <span className="opacity-75">
              {actionPlan.overview.currentStage ? 'Current Stage: ' : 'Career Stage: '}
            </span>
            <span className="font-semibold">{actionPlan.overview.currentStage}</span>
          </div>
          <div>
            <span className="opacity-75">Estimated Timeline: </span>
            <span className="font-semibold">{actionPlan.overview.estimatedTimeframe}</span>
          </div>
          {actionPlan.overview.confidenceScore && (
            <div>
              <span className="opacity-75">Readiness Score: </span>
              <span className="font-semibold">{actionPlan.overview.confidenceScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Empathy Message and Stage-Specific Guidance */}
      {(actionPlan.overview.empathyMessage || actionPlan.overview.stageSpecificGuidance) && (
        <div className="bg-blue-50 border-b border-blue-200 p-6">
          {actionPlan.overview.empathyMessage && (
            <div className="mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl mt-0.5">💙</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Your Journey</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">{actionPlan.overview.empathyMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {actionPlan.overview.stageSpecificGuidance && (
            <div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl mt-0.5">🎯</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Strategic Focus for Your Stage</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">{actionPlan.overview.stageSpecificGuidance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Career Transition Narrative Section */}
      {actionPlan.narrative && (
        <div className="border-b">
          <SectionHeader 
            title="Career Transition Analysis" 
            section="narrative" 
            icon="🎓" 
          />
          {(expandedSections.narrative === undefined ? true : expandedSections.narrative) && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Your Strengths & Alignment
                  </h5>
                  <p className="text-sm text-green-700">{actionPlan.narrative.alignment}</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="text-orange-500 mr-2">🎯</span>
                    Skills to Develop
                  </h5>
                  <p className="text-sm text-orange-700">{actionPlan.narrative.gaps}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">⚡</span>
                  Transition Difficulty Assessment
                </h5>
                <p className="text-sm text-blue-700">{actionPlan.narrative.difficulty}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="text-purple-500 mr-2">🚀</span>
                  Encouragement & Success Path
                </h5>
                <p className="text-sm text-purple-700">{actionPlan.narrative.encouragement}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Intersection Careers Section */}
      {actionPlan.intersectionCareers && actionPlan.intersectionCareers.length > 0 && (
        <div className="border-b">
          <SectionHeader 
            title="Career Opportunities at the Intersection" 
            section="intersection" 
            icon="🔍" 
          />
          {(expandedSections.intersection === undefined ? true : expandedSections.intersection) && (
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Based on your PhD background and career interest, here are specific roles that combine both:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {actionPlan.intersectionCareers.map((career, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <h6 className="font-semibold text-gray-800 text-sm">{career}</h6>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> These intersection careers often provide the smoothest transition path as they leverage your existing expertise while moving toward your career interests.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Milestones Section */}
      <div className="border-b">
        <SectionHeader 
          title="Timeline & Milestones" 
          section="milestones" 
          icon="🎯" 
        />
        {expandedSections.milestones && (
          <div className="p-6 bg-gray-50">
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(actionPlan.milestones).map(([timeframe, milestone]) => (
                <MilestoneCard 
                  key={timeframe}
                  timeframe={timeframe.replace('_', ' ').toUpperCase()}
                  milestone={milestone}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resume Recommendations Section - only show for detailed plans */}
      {actionPlan.resumeRecommendations && (
        <div className="border-b">
          <SectionHeader 
            title="Resume & Application Materials" 
            section="resume" 
            icon="📄" 
          />
          {expandedSections.resume && (
            <div className="p-6 space-y-4">
              {/* Primary Recommendation */}
              <ResumeRecommendation 
                recommendation={actionPlan.resumeRecommendations.primaryRecommendation}
                isMain={true}
              />
              
              {/* Additional Resources */}
              <div className="grid md:grid-cols-2 gap-4">
                {actionPlan.resumeRecommendations.additionalResources.map((resource, index) => (
                  <ResumeRecommendation key={index} recommendation={resource} />
                ))}
              </div>

              {/* Key Focus Areas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-3">Key Resume Focus Areas</h5>
                <ul className="space-y-1">
                  {actionPlan.resumeRecommendations.keyFocusAreas.map((area, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-blue-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Learning Recommendations Section */}
      {actionPlan.learningRecommendations && (
        <div className="border-b">
          <SectionHeader 
            title="Courses & Certifications" 
            section="learning" 
            icon="🎓" 
          />
          {expandedSections.learning && (
            <div className="p-6 space-y-6">
              {/* Check if this is GAP data (has generalAreas) or detailed data (has courses array) */}
              {actionPlan.learningRecommendations.generalAreas ? (
                // Generic Action Plan Learning Recommendations
                <div className="space-y-6">
                  {/* Cost Overview for GAP */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-3">Learning Investment Overview</h5>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Estimated Cost:</span>
                        <div className="text-lg font-bold text-blue-800">
                          {actionPlan.learningRecommendations.estimatedCost.estimated_total}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Time to Complete:</span>
                        <div className="font-semibold text-blue-700">
                          {actionPlan.learningRecommendations.timeToComplete}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {actionPlan.learningRecommendations.estimatedCost.note}
                    </p>
                  </div>

                  {/* Learning Platforms */}
                  {actionPlan.learningRecommendations.platforms && actionPlan.learningRecommendations.platforms.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-4">🌐 Recommended Learning Platforms</h5>
                      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {actionPlan.learningRecommendations.platforms.map((platform, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-sm transition-shadow">
                            <div className="font-medium text-gray-800 text-sm">{platform}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Learning Areas */}
                  {actionPlan.learningRecommendations.generalAreas && actionPlan.learningRecommendations.generalAreas.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-4">📚 Recommended Learning Areas</h5>
                      <div className="space-y-3">
                        {actionPlan.learningRecommendations.generalAreas.map((area, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <span className="text-blue-500 text-lg">📖</span>
                            <span className="text-gray-800 font-medium">{area}</span>
                          </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upgrade Message */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <span className="text-purple-500 mr-2">💡</span>
                      Want More Specific Recommendations?
                    </h5>
                    <p className="text-sm text-purple-700 mb-3">
                      {actionPlan.learningRecommendations.note}
                    </p>
                    <p className="text-sm text-purple-600 font-medium">
                      {actionPlan.learningRecommendations.upgradeMessage}
                    </p>
                    <div className="mt-3">
                      <Link
                        href="/quiz/"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Take Detailed Assessment →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Detailed Action Plan Learning Recommendations (existing format)
                <div className="space-y-6">
                  {/* Cost Overview for detailed plans */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-3">Learning Investment Overview</h5>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Total Estimated Cost:</span>
                        <div className="text-lg font-bold text-blue-800">
                          ${actionPlan.learningRecommendations.estimatedCost.estimated_total}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Time to Complete:</span>
                        <div className="font-semibold text-blue-700">
                          {actionPlan.learningRecommendations.timeToComplete}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Learning Path:</span>
                        <div className="font-semibold text-blue-700">
                          {actionPlan.learningRecommendations.courses.length} courses + {actionPlan.learningRecommendations.certifications.length} certs
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {actionPlan.learningRecommendations.estimatedCost.note}
                    </p>
                  </div>

                  {/* Recommended Courses */}
                  {actionPlan.learningRecommendations.specificCourses && actionPlan.learningRecommendations.specificCourses.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-4">📚 Recommended Courses</h5>
                      <div className="grid gap-4">
                        {actionPlan.learningRecommendations.specificCourses.slice(0, 4).map((courseName, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h6 className="font-semibold text-gray-800 mb-1">{courseName}</h6>
                            <p className="text-sm text-gray-600">Online Course</p>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Recommended
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Certifications */}
                  {actionPlan.learningRecommendations.certifications && actionPlan.learningRecommendations.certifications.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-4">🏆 Recommended Certifications</h5>
                      <div className="grid gap-4">
                        {actionPlan.learningRecommendations.certifications.slice(0, 3).map((certName, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h6 className="font-semibold text-gray-800 mb-1">{certName}</h6>
                            <p className="text-sm text-gray-600">Professional Certification</p>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                High Value
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prioritized Learning Path - only show if learningPath exists */}
                  {actionPlan.learningRecommendations.learningPath && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-4">🎯 Your Prioritized Learning Path</h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <LearningPathStep 
                          title="Start Immediately"
                          items={actionPlan.learningRecommendations.learningPath.immediate || []}
                          color="red"
                        />
                        <LearningPathStep 
                          title="Medium Term (3-6 months)"
                          items={actionPlan.learningRecommendations.learningPath.medium_term || []}
                          color="yellow"
                        />
                        <LearningPathStep 
                          title="Advanced (6+ months)"
                          items={actionPlan.learningRecommendations.learningPath.advanced || []}
                          color="green"
                        />
                      </div>
                    </div>
                  )}

                  {/* Learning Platforms and Communities */}
                  {(actionPlan.learningRecommendations.platforms || actionPlan.learningRecommendations.communities) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-4">🌐 Learning Platforms & Communities</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        {actionPlan.learningRecommendations.platforms && actionPlan.learningRecommendations.platforms.length > 0 && (
                          <div>
                            <h6 className="font-medium text-gray-700 mb-2">Recommended Platforms</h6>
                            <div className="space-y-1">
                              {actionPlan.learningRecommendations.platforms.map((platform, index) => (
                                <div key={index} className="text-sm text-gray-600">• {platform}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {actionPlan.learningRecommendations.communities && actionPlan.learningRecommendations.communities.length > 0 && (
                          <div>
                            <h6 className="font-medium text-gray-700 mb-2">Communities to Join</h6>
                            <div className="space-y-1">
                              {actionPlan.learningRecommendations.communities.map((community, index) => (
                                <div key={index} className="text-sm text-gray-600">• {community}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Skill Development Section */}
      <div className="border-b">
        <SectionHeader 
          title="Skill Development Plan" 
          section="skills" 
          icon="🚀" 
        />
        {expandedSections.skills && (
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <SkillCategory 
                title="Immediate Focus (0-3 months)"
                skills={actionPlan.skillDevelopment.immediate}
                icon="⚡"
              />
              <SkillCategory 
                title="Medium Term (3-6 months)"
                skills={actionPlan.skillDevelopment.medium_term}
                icon="📈"
              />
            </div>
            <SkillCategory 
              title="Advanced Skills (6+ months)"
              skills={actionPlan.skillDevelopment.advanced}
              icon="🎓"
            />
            
            {/* Learning Resources - only show if available */}
            {actionPlan.skillDevelopment.resources && actionPlan.skillDevelopment.resources.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-3">Recommended Learning Resources</h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {actionPlan.skillDevelopment.resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-green-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Career Insights Section */}
      <div>
        <SectionHeader 
          title="Career Insights & Market Outlook" 
          section="insights" 
          icon="💡" 
        />
        {expandedSections.insights && (
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-3">Your Strengths</h5>
                <div className="space-y-2">
                  {actionPlan.careerInsights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm text-green-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Areas */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-semibold text-orange-800 mb-3">Development Areas</h5>
                <div className="space-y-2">
                  {actionPlan.careerInsights.developmentAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-orange-500">🎯</span>
                      <span className="text-sm text-orange-700">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Outlook */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">Market Outlook</h5>
              <p className="text-sm text-blue-700">{actionPlan.careerInsights.marketOutlook}</p>
            </div>
          </div>
        )}
      </div>

      {/* Generic Flow Upgrade CTA */}
      {isGenericFlow && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-500 p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🎯 Want Even More Personalized Recommendations?
            </h3>
            <p className="text-gray-700 mb-4">
              This action plan is based on your general interests. Take our comprehensive career assessment to get:
            </p>
            <ul className="text-left text-gray-700 mb-6 max-w-md mx-auto space-y-2">
              <li>✅ <strong>Precise career matches</strong> based on your unique skills & values</li>
              <li>✅ <strong>Action plans for your top 3 matches</strong> to compare options</li>
              <li>✅ <strong>Advanced pivot analysis</strong> for your specific PhD background</li>
              <li>✅ <strong>Detailed transition strategies</strong> for your career stage</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quiz/"
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                🧠 Take Career Assessment
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-primary-600 font-semibold border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-gray-100 p-6 flex flex-wrap gap-3">
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          📄 Save as PDF
        </button>
        <a 
          href="https://industryresume.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔗 Visit IndustryResume.com
        </a>
        <button 
          onClick={generateActionPlan}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          🔄 Refresh Plan
        </button>
      </div>
    </div>
  );
};

export default ActionPlan;