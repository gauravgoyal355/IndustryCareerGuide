import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ActionPlan = ({ quizAnswers, topCareerMatch, userProfile = {}, isGenericFlow = false }) => {
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const SimpleHeader = ({ title }) => (
    <div className="p-4 bg-gray-50 border-b">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
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
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8">
        <h1 className="text-3xl font-light mb-3">Career Transition Plan</h1>
        <div className="text-primary-100 space-y-1">
          <p className="text-lg">{actionPlan.overview.targetPath || 'Career Development'}</p>
          <div className="flex items-center space-x-6 text-sm">
            <span>{actionPlan.overview.currentStage}</span>
            <span>•</span>
            <span>{actionPlan.overview.estimatedTimeframe}</span>
          </div>
        </div>
      </div>

      {/* Stage Guidance - Clean and Professional */}
      {(actionPlan.overview.empathyMessage || actionPlan.overview.stageSpecificGuidance) && (
        <div className="border-b bg-gray-50 p-8">
          {actionPlan.overview.empathyMessage && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">{actionPlan.overview.empathyMessage}</p>
            </div>
          )}
          
          {actionPlan.overview.stageSpecificGuidance && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Strategic Focus</h3>
              <p className="text-gray-700 leading-relaxed">{actionPlan.overview.stageSpecificGuidance}</p>
            </div>
          )}
        </div>
      )}

      {/* Career Transition Analysis */}
      {actionPlan.narrative && (
        <div className="p-8 border-b">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Career Transition Analysis</h2>
          <div className="space-y-6">
            {/* Strengths & Alignment */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Your Strengths & Alignment</h3>
              <p className="text-gray-700 leading-relaxed">{actionPlan.narrative.alignment}</p>
            </div>

            {/* Skills to Develop */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Skills to Develop</h3>
              <p className="text-gray-700 leading-relaxed">{actionPlan.narrative.gaps}</p>
            </div>

            {/* Transition Assessment */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Transition Assessment</h3>
              <p className="text-gray-700 leading-relaxed">{actionPlan.narrative.difficulty}</p>
            </div>

            {/* Success Path */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Success Path</h3>
              <p className="text-gray-700 leading-relaxed">{actionPlan.narrative.encouragement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Career Insights Section */}
      <div>
        <SimpleHeader title="Career Insights & Market Outlook" />
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
      </div>

      {/* Intersection Careers Section */}
      {actionPlan.intersectionCareers && actionPlan.intersectionCareers.length > 0 && (
        <div className="border-b">
          <SimpleHeader title="Career Opportunities at the Intersection" />
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Based on your PhD background and career interest, here are specific roles that combine both:
            </p>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {actionPlan.intersectionCareers.map((career, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <h6 className="font-semibold text-gray-800 text-sm">{career}</h6>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Milestones Section */}
      <div className="border-b">
        <SimpleHeader title="Timeline & Milestones" />
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
      </div>

      {/* Resume Recommendations Section - only show for detailed plans */}
      {actionPlan.resumeRecommendations && (
        <div className="border-b">
          <SimpleHeader title="Resume & Application Materials" />
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
        </div>
      )}

      {/* Learning Recommendations Section */}
      {actionPlan.learningRecommendations && (
        <div className="border-b">
          <SimpleHeader title="Courses & Certifications" />
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

                </div>
              )}
          </div>
        </div>
      )}



      {/* Compact Upgrade CTA */}
      {isGenericFlow && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-700 mb-3">
            Get more personalized career recommendations with our detailed assessment
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/quiz/"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Take Assessment
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-white text-gray-600 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActionPlan;