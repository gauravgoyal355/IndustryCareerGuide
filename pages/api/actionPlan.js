// /pages/api/actionPlan.js
// Serverless function to generate personalized action plans

import careerPaths from '../../data/careerPaths.json';
import careerTrajectories from '../../data/careerTrajectories.json';

/**
 * Action plan generation
 * Takes user answers + matched career path and returns personalized plan
 */
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { answers, topCareerMatch, userProfile = {} } = req.body;

    // Validate input
    if (!topCareerMatch) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide a target career path'
      });
    }

    // Get career data
    const careerData = careerPaths.career_paths[topCareerMatch];
    const trajectoryData = careerTrajectories.trajectories[topCareerMatch];

    if (!careerData) {
      return res.status(404).json({
        error: 'Career not found',
        message: `Career path "${topCareerMatch}" not found`
      });
    }

    // Generate personalized action plan
    const actionPlan = generateActionPlan(careerData, trajectoryData, answers, userProfile);

    res.status(200).json({
      success: true,
      actionPlan,
      metadata: {
        careerPath: topCareerMatch,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Error in actionPlan API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate action plan'
    });
  }
}

/**
 * Generate personalized action plan
 */
function generateActionPlan(careerData, trajectoryData, answers, userProfile) {
  // Determine user's current stage and timeline
  const currentStage = determineCurrentStage(userProfile);
  const targetTimeframe = userProfile.targetTimeframe || 'medium';
  
  // Create overview
  const overview = {
    currentStage,
    targetStage: careerData.name,
    estimatedTimeframe: getEstimatedTimeframe(currentStage, targetTimeframe),
    confidenceScore: calculateReadinessScore(answers, careerData, userProfile)
  };

  // Generate milestones based on trajectory
  const milestones = generateMilestones(trajectoryData, currentStage, targetTimeframe);

  // Create skill development plan
  const skillDevelopment = generateSkillPlan(careerData, trajectoryData, userProfile);

  // Generate learning recommendations
  const learningRecommendations = generateLearningPath(careerData, userProfile);

  // Create resume recommendations
  const resumeRecommendations = generateResumeGuidance(careerData, userProfile);

  // Generate career insights
  const careerInsights = generateCareerInsights(careerData, answers, userProfile);

  return {
    overview,
    milestones,
    skillDevelopment,
    learningRecommendations,
    resumeRecommendations,
    careerInsights
  };
}

/**
 * Determine user's current career stage
 */
function determineCurrentStage(userProfile) {
  const experience = userProfile.yearsExperience || 0;
  const hasPhD = userProfile.hasPhD !== false; // Default to true

  if (!hasPhD) {
    return 'Master&apos;s Student/Graduate';
  }

  if (experience <= 1) {
    return 'PhD Student/Recent Graduate';
  } else if (experience <= 3) {
    return 'Postdoc/Early Career Researcher';
  } else if (experience <= 6) {
    return 'Experienced Researcher';
  }
  
  return 'Senior Researcher';
}

/**
 * Calculate estimated timeframe for transition
 */
function getEstimatedTimeframe(currentStage, targetTimeframe) {
  const baseTimeframes = {
    immediate: '3-6 months',
    short: '6-9 months', 
    medium: '9-15 months',
    long: '12-24 months'
  };

  return baseTimeframes[targetTimeframe] || baseTimeframes.medium;
}

/**
 * Calculate readiness score based on answers and profile
 */
function calculateReadinessScore(answers, careerData, userProfile) {
  let score = 50; // Base score

  // Adjust based on experience
  const experience = userProfile.yearsExperience || 0;
  score += Math.min(experience * 5, 25);

  // Adjust based on PhD status
  if (userProfile.hasPhD !== false) {
    score += 15;
  }

  // Adjust based on relevant skills (simplified)
  if (answers && Object.keys(answers).length > 0) {
    score += 10;
  }

  return Math.min(Math.round(score), 95);
}

/**
 * Generate timeline milestones
 */
function generateMilestones(trajectoryData, currentStage, targetTimeframe) {
  const milestones = {
    immediate: {
      title: 'Foundation Building (0-3 months)',
      priority: 'high',
      tasks: [
        'Complete skills assessment and gap analysis',
        'Update resume with industry-focused language',
        'Start building professional network',
        'Begin learning core technical skills'
      ]
    },
    short_term: {
      title: 'Skill Development (3-6 months)',
      priority: 'high',
      tasks: [
        'Complete primary certification or course',
        'Build portfolio projects',
        'Attend industry events and meetups',
        'Conduct informational interviews'
      ]
    },
    medium_term: {
      title: 'Job Search & Application (6-12 months)',
      priority: 'medium',
      tasks: [
        'Launch active job search',
        'Apply to target positions',
        'Prepare for technical interviews',
        'Negotiate job offers'
      ]
    }
  };

  // Customize based on trajectory data if available
  if (trajectoryData && trajectoryData.phases) {
    // Override with specific trajectory milestones
    Object.entries(trajectoryData.phases).forEach(([phase, data]) => {
      if (data.milestones && data.milestones.length > 0) {
        const milestone = data.milestones[0]; // Use first milestone as template
        if (phase === 'preparation') {
          milestones.immediate = {
            title: milestone.title,
            priority: milestone.priority,
            tasks: milestone.tasks || milestones.immediate.tasks
          };
        }
      }
    });
  }

  return milestones;
}

/**
 * Generate skill development plan
 */
function generateSkillPlan(careerData, trajectoryData, userProfile) {
  // Default skill progression
  let skillPlan = {
    immediate: ['Professional communication', 'Industry networking', 'Resume optimization'],
    medium_term: ['Technical interviews', 'Project management', 'Business acumen'],
    advanced: ['Leadership', 'Strategic thinking', 'Mentoring'],
    resources: [
      'LinkedIn Learning courses',
      'Coursera specializations',
      'Industry meetups and conferences',
      'Professional associations'
    ]
  };

  // Override with trajectory-specific skills if available
  if (trajectoryData && trajectoryData.skills_timeline) {
    skillPlan = {
      immediate: trajectoryData.skills_timeline.immediate || skillPlan.immediate,
      medium_term: trajectoryData.skills_timeline.medium_term || skillPlan.medium_term,
      advanced: trajectoryData.skills_timeline.long_term || skillPlan.advanced,
      resources: skillPlan.resources
    };
  }

  return skillPlan;
}

/**
 * Generate learning path recommendations
 */
function generateLearningPath(careerData, userProfile) {
  const recommendations = {
    courses: [],
    certifications: [],
    estimatedCost: {
      estimated_total: 2500,
      note: 'Costs may vary based on selected providers and current promotions'
    },
    timeToComplete: '6-12 months',
    learningPath: {
      immediate: [],
      medium_term: [],
      advanced: []
    }
  };

  // Add career-specific courses from transition requirements
  if (careerData.transition_requirements && careerData.transition_requirements.recommended_courses) {
    recommendations.courses = careerData.transition_requirements.recommended_courses.map(course => ({
      ...course,
      priority: 'high',
      level: 'beginner',
      skills: ['Core competency'],
      url: `https://coursera.org/search?query=${encodeURIComponent(course.name)}`,
      relevanceScore: 90,
      price: course.cost
    }));
  }

  // Add certifications
  if (careerData.transition_requirements && careerData.transition_requirements.certifications) {
    recommendations.certifications = careerData.transition_requirements.certifications.map(cert => ({
      ...cert,
      title: cert.name,
      provider: 'Professional Association',
      priority: 'medium',
      level: 'intermediate',
      skills: ['Industry credibility'],
      exam_fee: cert.cost,
      url: `https://google.com/search?q=${encodeURIComponent(cert.name)}`,
      relevanceScore: 85
    }));
  }

  // Create learning path
  recommendations.learningPath = {
    immediate: recommendations.courses.slice(0, 2).map(c => ({
      title: c.name || c.title,
      provider: c.provider
    })),
    medium_term: recommendations.courses.slice(2, 4).map(c => ({
      title: c.name || c.title,
      provider: c.provider
    })),
    advanced: recommendations.certifications.slice(0, 2).map(c => ({
      title: c.name || c.title,
      provider: c.provider
    }))
  };

  return recommendations;
}

/**
 * Generate resume recommendations
 */
function generateResumeGuidance(careerData, userProfile) {
  return {
    primaryRecommendation: {
      title: 'Industry-Focused Resume Optimization',
      description: 'Transform your academic CV into an industry-focused resume that highlights transferable skills and quantifiable achievements.',
      priority: 'high',
      url: 'https://industryresume.com'
    },
    additionalResources: [
      {
        title: 'ATS-Optimized Templates',
        description: 'Use templates optimized for Applicant Tracking Systems',
        priority: 'high',
        url: 'https://industryresume.com/templates'
      },
      {
        title: 'LinkedIn Profile Optimization',
        description: 'Align your LinkedIn profile with your target career path',
        priority: 'medium',
        url: 'https://linkedin.com/help'
      }
    ],
    keyFocusAreas: [
      'Quantify research impact with metrics and numbers',
      'Highlight transferable skills like project management',
      'Emphasize collaborative and cross-functional experience', 
      'Showcase technical skills relevant to target role',
      'Include industry keywords for ATS optimization'
    ]
  };
}

/**
 * Generate career insights and market outlook
 */
function generateCareerInsights(careerData, answers, userProfile) {
  const insights = {
    strengths: [
      'Strong analytical and problem-solving skills',
      'Deep technical expertise from PhD research',
      'Ability to work independently and manage complex projects',
      'Experience with data analysis and research methodology'
    ],
    developmentAreas: [
      'Business communication and stakeholder management',
      'Industry-specific technical skills',
      'Understanding of commercial product development',
      'Cross-functional collaboration in fast-paced environments'
    ],
    marketOutlook: careerData.market_outlook ? 
      `${careerData.name} roles are expected to grow by ${careerData.market_outlook.growth_rate} with ${careerData.market_outlook.job_availability.toLowerCase()} job availability. Remote work opportunities are ${careerData.market_outlook.remote_opportunities.toLowerCase()}.` :
      `${careerData.name} offers strong career prospects with growing demand for professionals who can bridge technical expertise with business applications.`
  };

  // Customize based on user profile
  if (userProfile.hasPhD !== false) {
    insights.strengths.unshift('Advanced degree provides credibility and deep expertise');
  }

  if (userProfile.yearsExperience > 3) {
    insights.strengths.push('Substantial research experience demonstrates persistence and expertise');
  }

  return insights;
}
