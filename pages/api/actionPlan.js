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
  const milestones = generateMilestones(trajectoryData, currentStage, targetTimeframe, userProfile, careerData);

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
  // Use new career stage if provided
  if (userProfile.careerStage) {
    const stageMap = {
      'masters_student': "Master's Student",
      'early_phd': 'Early Stage PhD Student',
      'late_phd': 'Late Stage PhD Student', 
      'recent_postdoc': 'Recent Postdoc',
      'experienced_postdoc': 'Experienced Postdoc',
      'senior_researcher': 'Senior Researcher'
    };
    return stageMap[userProfile.careerStage] || userProfile.careerStage;
  }

  // Fallback to legacy logic
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

  // Check for long-term academic scenario and adjust scoring
  const longTermAcademic = checkLongTermAcademicScenario(userProfile);
  
  // Adjust based on career stage
  if (userProfile.careerStage) {
    const stageScores = {
      'masters_student': 10,
      'early_phd': 15,
      'late_phd': 25,
      'recent_postdoc': 30,
      'experienced_postdoc': 40, // Higher score - they have more experience
      'senior_researcher': 45   // Highest experience score
    };
    score += stageScores[userProfile.careerStage] || 20;
    
    // Bonus for long-term academics who show self-awareness and readiness to pivot
    if (longTermAcademic.isLongTerm) {
      score += 10; // Recognition that taking this step shows readiness for change
    }
  } else {
    // Fallback to legacy logic
    const experience = userProfile.yearsExperience || 0;
    score += Math.min(experience * 5, 25);
    
    // Adjust based on PhD status
    if (userProfile.hasPhD !== false) {
      score += 15;
    }
  }

  // Boost for having specific career interests
  if (userProfile.primaryInterests && userProfile.primaryInterests.length > 0) {
    score += 5;
  }

  // Boost for relevant PhD area (simplified check)
  if (userProfile.phdArea && userProfile.phdArea !== 'none') {
    score += 5;
  }

  // Adjust based on relevant skills (simplified)
  if (answers && Object.keys(answers).length > 0) {
    score += 10;
  }

  return Math.min(Math.round(score), 95);
}

/**
 * Generate narrative-specific milestone tasks
 */
function getMilestonesByNarrative(narrativeType, alignment, careerData) {
  const milestoneTemplates = {
    standard: {
      immediate: [
        'Complete skills assessment and gap analysis',
        'Update resume with industry-focused language',
        'Start building professional network',
        'Begin learning core technical skills'
      ],
      shortTerm: [
        'Complete primary certification or course',
        'Build portfolio projects',
        'Attend industry events and meetups',
        'Conduct informational interviews'
      ]
    },
    skill_building: {
      immediate: [
        'Assess and inventory transferable skills from research',
        'Begin intensive programming/data analysis skill building',
        'Update resume to emphasize quantitative and analytical achievements',
        'Connect with other PhD career pivoters for networking and advice'
      ],
      shortTerm: [
        'Complete foundational courses in target technical skills',
        'Build 2-3 portfolio projects demonstrating new technical capabilities',
        'Seek informational interviews with professionals who made similar pivots',
        'Consider freelance or volunteer projects to build experience'
      ]
    },
    business_acumen: {
      immediate: [
        'Assess business-relevant aspects of research experience',
        'Begin learning business fundamentals and industry landscape',
        'Update resume to emphasize project management and stakeholder communication',
        'Network with professionals in target business roles'
      ],
      shortTerm: [
        'Complete business or product management courses',
        'Participate in case competitions or business simulations',
        'Conduct informational interviews with industry professionals',
        'Consider consulting projects to build business experience'
      ]
    },
    application_focus: {
      immediate: [
        'Map theoretical knowledge to practical industry applications',
        'Begin learning industry-standard tools and technologies',
        'Update resume to highlight analytical and modeling skills',
        'Connect with professionals who transitioned from academia'
      ],
      shortTerm: [
        'Complete industry-relevant technical certifications',
        'Build applied projects demonstrating practical problem-solving',
        'Attend industry conferences and technical meetups',
        'Seek opportunities to apply skills in real-world contexts'
      ]
    },
    technical_adaptation: {
      immediate: [
        'Assess overlap between current and target technical skills',
        'Begin learning software development or data science practices',
        'Update resume to emphasize systems thinking and technical projects',
        'Network with engineers who transitioned between domains'
      ],
      shortTerm: [
        'Complete technical bootcamp or intensive courses',
        'Contribute to open source projects in target domain',
        'Build full-stack projects demonstrating new technical skills',
        'Participate in technical communities and forums'
      ]
    },
    content_creation: {
      immediate: [
        'Identify unique technical knowledge and expertise areas',
        'Begin building content creation and communication portfolio',
        'Update resume to highlight technical writing and presentation experience',
        'Network with science communicators and technical writers'
      ],
      shortTerm: [
        'Complete courses in content strategy and digital marketing',
        'Build diverse content portfolio (blog, videos, podcasts)',
        'Engage with target audiences and build online presence',
        'Collaborate with established communicators on projects'
      ]
    },
    industry_immersion: {
      immediate: [
        'Research target industry landscape and key players',
        'Begin building foundational knowledge in new domain',
        'Update resume to emphasize transferable analytical skills',
        'Network extensively with professionals in target field'
      ],
      shortTerm: [
        'Complete comprehensive training in target industry',
        'Seek mentorship from professionals who made similar transitions',
        'Participate in industry events and professional organizations',
        'Consider entry-level roles or internships to gain experience'
      ]
    },
    senior_transition: {
      immediate: [
        'Conduct honest assessment of unique value proposition and niche expertise',
        'Research startup ecosystems and mid-size companies in your domain',
        'Update resume to emphasize project leadership and independent execution',
        'Connect with other senior researchers who successfully transitioned',
        'Explore consulting opportunities to test market demand for expertise'
      ],
      shortTerm: [
        'Build portfolio of business-relevant applications of research expertise',
        'Develop relationships with entrepreneurs and startup founders in related fields',
        'Consider fractional consulting or part-time roles to gain industry experience',
        'Explore alternative career paths: science policy, technical due diligence, advisory roles',
        'Investigate opportunities in smaller companies where depth of expertise is valued',
        'Consider entrepreneurship or starting own consultancy based on domain expertise'
      ]
    }
  };

  const narrative = getNarrativeContent(alignment, '', careerData.name);
  return milestoneTemplates[narrative.milestoneFocus] || milestoneTemplates.standard;
}

/**
 * Generate timeline milestones
 */
function generateMilestones(trajectoryData, currentStage, targetTimeframe, userProfile, careerData) {
  const alignment = detectCareerAlignment(careerData.name?.toLowerCase().replace(/\s+/g, '_') || 'general', userProfile.phdArea, userProfile);
  const narrativeTasks = getMilestonesByNarrative(alignment.narrativeType, alignment, careerData);
  
  let immediateTasks = narrativeTasks.immediate;
  let shortTermTasks = narrativeTasks.shortTerm;
  
  const milestones = {
    immediate: {
      title: 'Foundation Building (0-3 months)',
      priority: 'high',
      tasks: immediateTasks
    },
    short_term: {
      title: 'Skill Development (3-6 months)',
      priority: 'high',
      tasks: shortTermTasks
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
 * Detect long-term academic career scenarios that need special handling
 */
function checkLongTermAcademicScenario(userProfile) {
  const isLongTermPostdoc = userProfile.careerStage === 'experienced_postdoc' || userProfile.careerStage === 'senior_researcher';
  
  // Additional indicators of long-term academic situation
  const hasExtendedAcademicStay = userProfile.yearsExperience > 6; // Legacy field
  
  return {
    isLongTerm: isLongTermPostdoc || hasExtendedAcademicStay,
    stage: userProfile.careerStage,
    challengeLevel: 'high' // These transitions are particularly challenging
  };
}

/**
 * Comprehensive pivot scenario detection and narrative building
 */
function detectCareerAlignment(careerPath, phdArea, userProfile = {}) {
  // Define career-PhD perfect matches
  const perfectAlignmentMap = {
    'data_scientist': ['data_science', 'machine_learning', 'statistics', 'computer_science', 'artificial_intelligence', 'bioinformatics', 'computational_mathematics'],
    'r_and_d_scientist': ['biology', 'chemistry', 'physics', 'materials_science', 'biochemistry', 'molecular_biology', 'neuroscience', 'pharmacology', 'biotechnology'],
    'software_engineer': ['computer_science', 'software_engineering', 'electrical_engineering', 'computer_engineering'],
    'biotech_scientist': ['biology', 'biochemistry', 'molecular_biology', 'biotechnology', 'genetics', 'microbiology', 'immunology'],
    'quantitative_analyst': ['mathematics', 'statistics', 'physics', 'economics', 'applied_mathematics', 'operations_research'],
    'technical_consulting': [], // Broad - depends on domain
    'product_management': [], // Always a pivot regardless of background
    'science_communication': [], // Always a pivot but leverages any technical background
  };

  // Define PhD area categories for pivot analysis
  const phdCategories = {
    wetLab: ['biology', 'chemistry', 'biochemistry', 'molecular_biology', 'cell_biology', 'microbiology', 'immunology', 'pharmacology', 'neuroscience', 'genetics'],
    dryLab: ['bioinformatics', 'computational_biology', 'data_science', 'computer_science', 'machine_learning', 'artificial_intelligence'],
    quantitative: ['mathematics', 'statistics', 'physics', 'economics', 'applied_mathematics', 'operations_research', 'computational_mathematics'],
    engineering: ['mechanical_engineering', 'electrical_engineering', 'chemical_engineering', 'biomedical_engineering', 'civil_engineering', 'aerospace_engineering', 'materials_engineering'],
    social: ['psychology', 'sociology', 'anthropology', 'political_science', 'economics', 'cognitive_science'],
    medical: ['medicine', 'public_health', 'epidemiology', 'clinical_research', 'biostatistics', 'health_policy'],
    physical: ['chemistry', 'physics', 'materials_science', 'astronomy', 'earth_sciences', 'environmental_science'],
  };

  // Define target career categories
  const careerCategories = {
    techData: ['data_scientist', 'machine_learning_engineer', 'software_engineer', 'ai_researcher'],
    biotech: ['biotech_scientist', 'r_and_d_scientist', 'regulatory_affairs', 'clinical_research'],
    business: ['product_management', 'technical_consulting', 'business_analyst', 'strategy_consulting'],
    finance: ['quantitative_analyst', 'data_analyst', 'risk_analyst', 'investment_analyst'],
    policy: ['science_policy', 'regulatory_affairs', 'government_consultant'],
    communication: ['science_communication', 'technical_writing', 'science_journalism'],
  };

  // Determine if perfect match exists
  const perfectMatch = perfectAlignmentMap[careerPath]?.includes(phdArea);
  
  // Classify PhD area
  let phdCategory = 'other';
  for (const [category, areas] of Object.entries(phdCategories)) {
    if (areas.includes(phdArea)) {
      phdCategory = category;
      break;
    }
  }
  
  // Classify target career
  let careerCategory = 'other';
  for (const [category, careers] of Object.entries(careerCategories)) {
    if (careers.includes(careerPath)) {
      careerCategory = category;
      break;
    }
  }

  // Check for long-term academic scenario first
  const isLongTermAcademic = checkLongTermAcademicScenario(userProfile);
  
  // Determine pivot type and difficulty
  let pivotType = 'aligned';
  let pivotDifficulty = 'easy';
  let narrativeType = 'direct_match';

  if (isLongTermAcademic.isLongTerm) {
    pivotType = 'long_term_academic_transition';
    pivotDifficulty = 'challenging_but_viable';
    narrativeType = 'senior_academic_pivot';
  } else if (!perfectMatch) {
    // Analyze the specific pivot scenario
    if (phdCategory === 'wetLab' && careerCategory === 'techData') {
      pivotType = 'lab_to_tech';
      pivotDifficulty = 'moderate';
      narrativeType = 'skill_bridge';
    } else if (phdCategory === 'wetLab' && careerCategory === 'business') {
      pivotType = 'lab_to_business';
      pivotDifficulty = 'moderate';
      narrativeType = 'domain_expertise';
    } else if (phdCategory === 'quantitative' && careerCategory === 'techData') {
      pivotType = 'quant_to_tech';
      pivotDifficulty = 'easy';
      narrativeType = 'skill_translation';
    } else if (phdCategory === 'engineering' && careerCategory === 'techData') {
      pivotType = 'eng_to_tech';
      pivotDifficulty = 'easy';
      narrativeType = 'technical_transfer';
    } else if (careerCategory === 'business') {
      pivotType = 'any_to_business';
      pivotDifficulty = 'moderate';
      narrativeType = 'domain_expertise';
    } else if (careerCategory === 'communication') {
      pivotType = 'any_to_communication';
      pivotDifficulty = 'easy';
      narrativeType = 'knowledge_transfer';
    } else {
      pivotType = 'general_pivot';
      pivotDifficulty = 'challenging';
      narrativeType = 'transferable_skills';
    }
  }

  return {
    perfectMatch,
    isPivot: !perfectMatch,
    phdCategory,
    careerCategory,
    pivotType,
    pivotDifficulty,
    narrativeType,
    // Legacy fields for backward compatibility
    pivotFromLab: phdCategory === 'wetLab',
    hasQuantitativeBackground: phdCategory === 'quantitative'
  };
}

/**
 * Generate narrative-specific content based on pivot type
 */
function getNarrativeContent(alignment, phdArea, careerName) {
  const narratives = {
    direct_match: {
      strengthsIntro: 'Advanced degree provides credibility and deep expertise',
      developmentIntro: 'Business communication and stakeholder management',
      milestoneFocus: 'standard'
    },
    skill_bridge: {
      strengthsIntro: 'Advanced degree demonstrates ability to master complex domains',
      additionalStrengths: [
        'Proven ability to learn and master complex technical skills',
        'Experience with experimental design translates well to A/B testing and data experimentation',
        'Strong foundation in hypothesis-driven thinking and data interpretation',
        'Quantitative mindset developed through research data analysis'
      ],
      developmentIntro: 'Transitioning from wet lab to computational/analytical focus',
      additionalDevelopment: [
        'Building programming and data analysis portfolio to demonstrate technical pivot',
        'Developing industry-standard coding practices and version control'
      ],
      milestoneFocus: 'skill_building'
    },
    domain_expertise: {
      strengthsIntro: 'Advanced degree provides deep domain knowledge valued in business contexts',
      additionalStrengths: [
        'Deep understanding of scientific processes and regulatory landscapes',
        'Ability to communicate complex technical concepts to diverse audiences',
        'Experience managing stakeholder expectations in research environments'
      ],
      developmentIntro: 'Translating technical expertise into business impact',
      additionalDevelopment: [
        'Understanding market dynamics and competitive landscapes',
        'Developing financial acumen and business case development skills'
      ],
      milestoneFocus: 'business_acumen'
    },
    skill_translation: {
      strengthsIntro: 'Advanced degree provides strong quantitative foundation directly applicable to industry',
      additionalStrengths: [
        'Solid mathematical and statistical modeling background',
        'Experience with complex data analysis and interpretation',
        'Comfort with abstract thinking and theoretical frameworks'
      ],
      developmentIntro: 'Applying theoretical knowledge to practical business problems',
      additionalDevelopment: [
        'Learning industry-specific tools and technologies',
        'Understanding business context and commercial applications'
      ],
      milestoneFocus: 'application_focus'
    },
    technical_transfer: {
      strengthsIntro: 'Advanced degree provides strong technical foundation with practical applications',
      additionalStrengths: [
        'Systems thinking and engineering problem-solving approach',
        'Experience with project management and technical execution',
        'Understanding of technology development lifecycles'
      ],
      developmentIntro: 'Adapting engineering skills to software/data contexts',
      additionalDevelopment: [
        'Learning software development methodologies and practices',
        'Understanding scalability and performance optimization'
      ],
      milestoneFocus: 'technical_adaptation'
    },
    knowledge_transfer: {
      strengthsIntro: 'Advanced degree provides credibility and expertise for knowledge communication',
      additionalStrengths: [
        'Deep technical knowledge to translate for diverse audiences',
        'Research and analytical skills for content development',
        'Experience presenting complex information clearly'
      ],
      developmentIntro: 'Developing professional communication and media skills',
      additionalDevelopment: [
        'Learning content creation and marketing strategies',
        'Building audience development and engagement skills'
      ],
      milestoneFocus: 'content_creation'
    },
    transferable_skills: {
      strengthsIntro: 'Advanced degree demonstrates ability to tackle complex challenges',
      additionalStrengths: [
        'Proven ability to learn and master new domains',
        'Strong analytical and critical thinking skills',
        'Experience with independent project management'
      ],
      developmentIntro: 'Building industry-specific knowledge and skills',
      additionalDevelopment: [
        'Developing expertise in target industry practices',
        'Building professional network in new field'
      ],
      milestoneFocus: 'industry_immersion'
    },
    senior_academic_pivot: {
      strengthsIntro: 'Extensive research experience demonstrates deep expertise and persistence',
      additionalStrengths: [
        'Proven ability to work independently and drive projects to completion',
        'Deep subject matter expertise that can provide unique competitive advantage',
        'Experience with complex problem-solving in ambiguous, cutting-edge domains',
        'Self-motivation and ability to work with minimal supervision',
        'Track record of learning and adapting to new research areas and methodologies',
        'Strong written communication skills from grant writing and publications',
        'Experience managing research projects with long timelines and uncertain outcomes'
      ],
      developmentIntro: 'Translating deep expertise into industry value while building missing business skills',
      additionalDevelopment: [
        'Developing business communication for non-technical stakeholders',
        'Learning to work within corporate structures and timelines',
        'Building experience with team collaboration and cross-functional work',
        'Understanding market needs and commercial applications of expertise',
        'Gaining experience with fast-paced iteration and MVP approaches',
        'Developing comfort with ambiguity in business contexts vs academic precision'
      ],
      milestoneFocus: 'senior_transition'
    }
  };

  return narratives[alignment.narrativeType] || narratives.transferable_skills;
}

/**
 * Generate career insights and market outlook
 */
function generateCareerInsights(careerData, answers, userProfile) {
  const alignment = detectCareerAlignment(careerData.name?.toLowerCase().replace(/\s+/g, '_') || 'general', userProfile.phdArea, userProfile);
  const narrative = getNarrativeContent(alignment, userProfile.phdArea, careerData.name);
  
  let baseStrengths = [
    'Strong analytical and problem-solving skills',
    'Deep technical expertise from research background',
    'Ability to work independently and manage complex projects',
    'Experience with data analysis and research methodology'
  ];
  
  let baseDevelopmentAreas = [
    narrative.developmentIntro,
    'Industry-specific technical skills',
    'Understanding of commercial product development',
    'Cross-functional collaboration in fast-paced environments'
  ];
  
  // Add narrative-specific content
  if (narrative.additionalStrengths) {
    baseStrengths = [...baseStrengths, ...narrative.additionalStrengths];
  }
  
  if (narrative.additionalDevelopment) {
    baseDevelopmentAreas = [...baseDevelopmentAreas, ...narrative.additionalDevelopment];
  }
  
  let marketOutlook = careerData.market_outlook ? 
    `${careerData.name} roles are expected to grow by ${careerData.market_outlook.growth_rate} with ${careerData.market_outlook.job_availability.toLowerCase()} job availability. Remote work opportunities are ${careerData.market_outlook.remote_opportunities.toLowerCase()}.` :
    `${careerData.name} offers strong career prospects with growing demand for professionals who can bridge technical expertise with business applications.`;

  // Add empathetic messaging for long-term academics
  if (alignment.narrativeType === 'senior_academic_pivot') {
    marketOutlook += ' While the transition may feel challenging after years in academia, your deep expertise and research experience are increasingly valued in industry, especially at startups and mid-size companies that need domain experts who can work independently and solve complex problems.';
  }

  const insights = {
    strengths: baseStrengths,
    developmentAreas: baseDevelopmentAreas,
    marketOutlook,
    pivotContext: {
      difficulty: alignment.pivotDifficulty,
      type: alignment.pivotType,
      narrative: alignment.narrativeType
    }
  };

  // Add PhD-specific strengths based on alignment
  if (userProfile.phdArea && userProfile.phdArea !== 'none') {
    if (!alignment.isPivot) {
      // Perfect alignment - emphasize direct expertise
      insights.strengths.unshift('Advanced degree provides credibility and deep expertise');
    } else {
      // Pivot scenario - emphasize adaptability and transferable skills
      insights.strengths.unshift('Advanced degree demonstrates ability to master complex domains');
    }
    
    // Add domain-specific strengths (perfect alignment)
    if (!alignment.isPivot) {
      if (userProfile.phdArea.includes('data_science') || userProfile.phdArea.includes('machine_learning') || userProfile.phdArea.includes('statistics')) {
        insights.strengths.push('Strong quantitative and computational modeling background');
      }
      
      if (userProfile.phdArea.includes('biology') || userProfile.phdArea.includes('chemistry') || userProfile.phdArea.includes('physics')) {
        insights.strengths.push('Scientific rigor and experimental design expertise');
      }
      
      if (userProfile.phdArea.includes('engineering')) {
        insights.strengths.push('Systems thinking and practical problem-solving approach');
      }
    } else {
      // Pivot scenario - emphasize transferable skills
      if (alignment.pivotFromLab) {
        insights.strengths.push('Strong foundation in hypothesis-driven thinking and data interpretation');
        insights.strengths.push('Experience managing complex, long-term projects with uncertain outcomes');
      }
      
      if (userProfile.phdArea.includes('biology') || userProfile.phdArea.includes('chemistry') || userProfile.phdArea.includes('neuroscience')) {
        insights.strengths.push('Quantitative mindset developed through research data analysis');
      }
    }
  }

  // Adjust based on career stage
  if (userProfile.careerStage) {
    if (userProfile.careerStage === 'experienced_postdoc' || userProfile.careerStage === 'senior_researcher') {
      insights.strengths.push('Substantial research experience demonstrates persistence and expertise');
      insights.strengths.push('Leadership experience from supervising students and managing projects');
    }
    
    if (userProfile.careerStage === 'masters_student' || userProfile.careerStage === 'early_phd') {
      insights.developmentAreas.push('Building professional network outside academia');
      insights.developmentAreas.push('Gaining industry exposure through internships or collaborations');
    }
  }

  // Add remote work considerations
  if (userProfile.primaryInterests && userProfile.primaryInterests.includes('Remote Work')) {
    insights.marketOutlook += ' This role offers excellent remote work opportunities, which aligns with your preference for location flexibility.';
  }

  // Add considerations for non-conventional interests
  if (userProfile.primaryInterests && userProfile.primaryInterests.includes('Science Communication')) {
    insights.strengths.push('Strong technical communication skills from research background');
  }

  if (userProfile.primaryInterests && userProfile.primaryInterests.includes('Policy/Advocacy')) {
    insights.strengths.push('Experience with evidence-based analysis and policy implications');
  }

  return insights;
}
