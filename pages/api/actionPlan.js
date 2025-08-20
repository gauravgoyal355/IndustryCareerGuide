// /pages/api/actionPlan.js
// Lightweight serverless API for personalized action plan generation
// Designed for Vercel free tier - minimal computation

import quizData from '../../career_assessment_quiz.json';
import careerPaths from '../../data/careerPaths.json';
import careerTrajectories from '../../data/careerTrajectories.json';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers, topCareerMatch, userProfile = {} } = req.body;
    
    if (!answers || !topCareerMatch) {
      return res.status(400).json({ error: 'Missing required data: answers and topCareerMatch' });
    }

    // Generate personalized action plan
    const actionPlan = generateActionPlan(answers, topCareerMatch, userProfile);
    
    res.status(200).json({
      actionPlan,
      timestamp: new Date().toISOString(),
      careerPath: topCareerMatch
    });

  } catch (error) {
    console.error('Action plan generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateActionPlan(answers, careerPath, userProfile) {
  // Get career trajectory and current stage
  const trajectory = careerTrajectories.career_trajectories[careerPath];
  const careerDetails = careerPaths.career_paths[careerPath];
  
  if (!trajectory || !careerDetails) {
    throw new Error('Career path not found');
  }

  // Determine current career stage based on profile
  const currentStage = determineCurrentStage(userProfile, trajectory);
  const targetStage = getNextStage(currentStage, trajectory);
  
  // Analyze user strengths and gaps
  const userAnalysis = analyzeUserProfile(answers, careerPath);
  
  // Generate timeline milestones
  const milestones = generateMilestones(currentStage, targetStage, userAnalysis, trajectory);
  
  // Create resume recommendations
  const resumeRecommendations = generateResumeRecommendations(careerPath, currentStage, userAnalysis);
  
  // Generate skill development plan
  const skillPlan = generateSkillPlan(currentStage, targetStage, userAnalysis);
  
  // Generate course and certification recommendations
  const learningRecommendations = generateLearningRecommendations(careerPath, currentStage, targetStage, userAnalysis);
  
  return {
    overview: {
      currentStage: currentStage.title,
      targetStage: targetStage.title,
      estimatedTimeframe: targetStage.typical_duration,
      confidenceScore: userAnalysis.readinessScore
    },
    resumeRecommendations,
    milestones,
    skillDevelopment: skillPlan,
    learningRecommendations,
    careerInsights: {
      strengths: userAnalysis.strengths,
      developmentAreas: userAnalysis.gaps,
      marketOutlook: getMarketOutlook(careerPath)
    }
  };
}

function determineCurrentStage(userProfile, trajectory) {
  // Simple logic - can be enhanced with more user data
  const yearsExperience = userProfile.yearsExperience || 0;
  const hasPhD = userProfile.hasPhD || true; // Assume PhD for STEM career guidance
  
  if (yearsExperience <= 1 && hasPhD) {
    return trajectory.stages[0]; // Entry level
  } else if (yearsExperience <= 4) {
    return trajectory.stages[0]; // Entry level
  } else if (yearsExperience <= 8) {
    return trajectory.stages[1]; // Mid level
  } else {
    return trajectory.stages[2]; // Senior level
  }
}

function getNextStage(currentStage, trajectory) {
  const currentIndex = trajectory.stages.findIndex(stage => stage.level === currentStage.level);
  return trajectory.stages[Math.min(currentIndex + 1, trajectory.stages.length - 1)];
}

function analyzeUserProfile(answers, careerPath) {
  // Quick analysis based on quiz responses
  const strengthAreas = [];
  const gapAreas = [];
  let totalScore = 0;
  let maxScore = 0;

  // Analyze quiz responses for career fit
  answers.forEach((answerIndex, questionIndex) => {
    const question = quizData.questions[questionIndex];
    const selectedChoice = question.choices[answerIndex];
    
    if (selectedChoice?.score?.[careerPath]) {
      totalScore += selectedChoice.score[careerPath];
      maxScore += 4; // Assuming max score is 4
      
      if (selectedChoice.score[careerPath] >= 3) {
        strengthAreas.push(question.subdimension || question.dimension);
      } else if (selectedChoice.score[careerPath] <= 2) {
        gapAreas.push(question.subdimension || question.dimension);
      }
    }
  });

  return {
    readinessScore: Math.round((totalScore / maxScore) * 100),
    strengths: [...new Set(strengthAreas)].slice(0, 4), // Remove duplicates, limit to 4
    gaps: [...new Set(gapAreas)].slice(0, 3) // Remove duplicates, limit to 3
  };
}

function generateMilestones(currentStage, targetStage, userAnalysis, trajectory) {
  const baseMilestones = {
    "3_months": {
      title: "Foundation Building",
      tasks: [],
      priority: "high"
    },
    "6_months": {
      title: "Skill Development",
      tasks: [],
      priority: "medium"
    },
    "12_months": {
      title: "Career Advancement",
      tasks: [],
      priority: "medium"
    }
  };

  // 3-month milestones (immediate actions)
  baseMilestones["3_months"].tasks = [
    "Complete resume optimization using IndustryResume.com",
    "Build LinkedIn profile highlighting transferable skills",
    `Research ${trajectory.name.toLowerCase()} job market and salary expectations`,
    "Identify 3-5 target companies in your field",
    "Start networking with professionals in the industry"
  ];

  // Add skill-specific tasks based on gaps
  if (userAnalysis.gaps.includes('Communication')) {
    baseMilestones["3_months"].tasks.push("Practice technical presentations and storytelling");
  }
  if (userAnalysis.gaps.includes('Business Acumen')) {
    baseMilestones["3_months"].tasks.push("Take online business fundamentals course");
  }

  // 6-month milestones (skill building)
  baseMilestones["6_months"].tasks = [
    `Develop proficiency in ${getKeySkillsForStage(targetStage)[0]}`,
    "Complete relevant online certifications or courses",
    "Attend industry conferences or networking events",
    "Start working on portfolio projects demonstrating new skills",
    "Conduct informational interviews with industry professionals"
  ];

  // 12-month milestones (career transition)
  baseMilestones["12_months"].tasks = [
    `Apply for ${targetStage.title.toLowerCase()} positions`,
    "Build a strong portfolio of relevant projects",
    "Establish thought leadership through blog posts or presentations",
    "Secure mentor in target industry",
    "Consider advanced training or specialized certifications"
  ];

  return baseMilestones;
}

function generateResumeRecommendations(careerPath, currentStage, userAnalysis) {
  const baseUrl = "https://industryresume.com";
  
  return {
    primaryRecommendation: {
      title: `${careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Resume Template`,
      description: `Specialized resume template optimized for ${careerPath.replace('_', ' ')} roles`,
      url: `${baseUrl}/templates/${careerPath}`,
      priority: "high"
    },
    additionalResources: [
      {
        title: "PhD to Industry Resume Guide",
        description: "Complete guide for transitioning from academia to industry",
        url: `${baseUrl}/guides/phd-to-industry`,
        priority: "high"
      },
      {
        title: "Skills Translation Worksheet",
        description: "Tool to translate academic experience into industry-relevant skills",
        url: `${baseUrl}/tools/skills-translator`,
        priority: "medium"
      },
      {
        title: "ATS Optimization Checklist",
        description: "Ensure your resume passes automated screening systems",
        url: `${baseUrl}/tools/ats-checker`,
        priority: "medium"
      }
    ],
    keyFocusAreas: [
      "Highlight quantifiable research achievements",
      "Emphasize project management and leadership experience",
      "Translate technical skills into business value",
      "Include relevant coursework and certifications",
      "Optimize for industry-specific keywords"
    ]
  };
}

function generateSkillPlan(currentStage, targetStage, userAnalysis) {
  const currentSkills = currentStage.core_skills || [];
  const targetSkills = targetStage.core_skills || [];
  const developingSkills = targetStage.developing_skills || [];
  
  // Find skills to develop
  const skillsToLearn = targetSkills.filter(skill => 
    !currentSkills.some(current => current.toLowerCase().includes(skill.toLowerCase()))
  );
  
  return {
    immediate: skillsToLearn.slice(0, 3),
    medium_term: developingSkills.slice(0, 3),
    advanced: targetSkills.slice(-2),
    resources: [
      "Coursera and edX for technical skills",
      "LinkedIn Learning for business skills",
      "Toastmasters for communication skills",
      "Industry conferences and workshops",
      "Professional mentorship programs"
    ]
  };
}

function getKeySkillsForStage(stage) {
  return stage.core_skills?.slice(0, 3) || [];
}

function getMarketOutlook(careerPath) {
  const outlooks = {
    'data_scientist': "Strong growth expected (22% by 2030) driven by AI/ML adoption",
    'product_management': "Continued high demand across all industries, especially in tech",
    'research_scientist': "Steady growth in biotech, materials science, and clean energy",
    'technical_consulting': "Growing demand for digital transformation expertise",
    'software_engineering': "Robust job market with emphasis on AI, cloud, and security",
    'business_development': "Strong prospects in emerging technologies and partnerships",
    'operations': "Increasing importance of operational efficiency and automation",
    'quality_assurance': "Growing demand in regulated industries and software development",
    'technical_sales': "High earning potential with shift toward complex technical solutions"
  };
  
  return outlooks[careerPath] || "Positive outlook with opportunities for skilled professionals";
}

function generateLearningRecommendations(careerPath, currentStage, targetStage, userAnalysis) {
  const careerLearningPaths = {
    'data_scientist': {
      courses: [
        {
          title: "Machine Learning Specialization",
          provider: "Coursera (Stanford)",
          duration: "3-6 months",
          level: "Intermediate",
          priority: "high",
          skills: ["Machine Learning", "Python", "Statistics"],
          url: "https://coursera.org/specializations/machine-learning",
          price: "$39-79/month"
        },
        {
          title: "Data Science Professional Certificate",
          provider: "IBM (Coursera)",
          duration: "3-6 months",
          level: "Beginner to Intermediate",
          priority: "high",
          skills: ["Python", "SQL", "Data Visualization", "Statistics"],
          url: "https://coursera.org/professional-certificates/ibm-data-science",
          price: "$39-79/month"
        },
        {
          title: "Deep Learning Specialization",
          provider: "Coursera (deeplearning.ai)",
          duration: "3-4 months",
          level: "Advanced",
          priority: "medium",
          skills: ["Neural Networks", "TensorFlow", "Deep Learning"],
          url: "https://coursera.org/specializations/deep-learning",
          price: "$39-79/month"
        }
      ],
      certifications: [
        {
          title: "AWS Certified Machine Learning - Specialty",
          provider: "Amazon Web Services",
          duration: "2-3 months prep",
          level: "Advanced",
          priority: "high",
          skills: ["AWS", "ML Engineering", "Cloud Computing"],
          exam_fee: "$300",
          url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/"
        },
        {
          title: "Google Cloud Professional Data Engineer",
          provider: "Google Cloud",
          duration: "2-3 months prep",
          level: "Advanced",
          priority: "medium",
          skills: ["GCP", "Big Data", "Data Engineering"],
          exam_fee: "$200",
          url: "https://cloud.google.com/certification/data-engineer"
        },
        {
          title: "Microsoft Certified: Azure Data Scientist Associate",
          provider: "Microsoft",
          duration: "1-2 months prep",
          level: "Intermediate",
          priority: "medium",
          skills: ["Azure", "Machine Learning", "Python"],
          exam_fee: "$165",
          url: "https://docs.microsoft.com/en-us/learn/certifications/azure-data-scientist/"
        }
      ]
    },
    'product_management': {
      courses: [
        {
          title: "Product Management Fundamentals",
          provider: "Udacity",
          duration: "2-3 months",
          level: "Beginner",
          priority: "high",
          skills: ["Product Strategy", "User Research", "Market Analysis"],
          url: "https://udacity.com/course/product-manager-nanodegree",
          price: "$399/month"
        },
        {
          title: "Digital Product Management",
          provider: "Coursera (University of Virginia)",
          duration: "4-6 months",
          level: "Intermediate",
          priority: "high",
          skills: ["Agile", "Design Thinking", "Analytics"],
          url: "https://coursera.org/specializations/digital-product-management",
          price: "$39-79/month"
        },
        {
          title: "Product Marketing and Management",
          provider: "edX (UC Berkeley)",
          duration: "2-4 months",
          level: "Intermediate",
          priority: "medium",
          skills: ["Go-to-Market", "Positioning", "Marketing Strategy"],
          url: "https://edx.org/course/product-marketing-management",
          price: "$150-300"
        }
      ],
      certifications: [
        {
          title: "Certified Scrum Product Owner (CSPO)",
          provider: "Scrum Alliance",
          duration: "2-day workshop",
          level: "Beginner to Intermediate",
          priority: "high",
          skills: ["Agile", "Scrum", "Product Ownership"],
          exam_fee: "$1,000-1,500",
          url: "https://scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner"
        },
        {
          title: "Product Management Certificate",
          provider: "Product School",
          duration: "8 weeks",
          level: "Intermediate",
          priority: "high",
          skills: ["Product Strategy", "Analytics", "Leadership"],
          exam_fee: "$3,000-4,000",
          url: "https://productschool.com/product-management-certification"
        },
        {
          title: "Google Analytics Individual Qualification",
          provider: "Google",
          duration: "1-2 weeks prep",
          level: "Beginner",
          priority: "medium",
          skills: ["Analytics", "Data Analysis", "Digital Marketing"],
          exam_fee: "Free",
          url: "https://skillshop.exceedlms.com/student/path/2938"
        }
      ]
    },
    'research_scientist': {
      courses: [
        {
          title: "Introduction to Research Methods",
          provider: "Coursera (University of London)",
          duration: "6-8 weeks",
          level: "Intermediate",
          priority: "medium",
          skills: ["Research Design", "Statistical Analysis", "Scientific Writing"],
          url: "https://coursera.org/learn/research-methods",
          price: "$39-79/month"
        },
        {
          title: "Project Management for Scientists",
          provider: "edX (MIT)",
          duration: "4-6 weeks",
          level: "Beginner",
          priority: "high",
          skills: ["Project Management", "Team Leadership", "Resource Planning"],
          url: "https://edx.org/course/project-management-scientists",
          price: "$99-199"
        },
        {
          title: "Science Communication",
          provider: "Coursera (UC San Diego)",
          duration: "4-6 weeks",
          level: "Beginner",
          priority: "high",
          skills: ["Science Communication", "Public Speaking", "Grant Writing"],
          url: "https://coursera.org/learn/science-communication",
          price: "$39-79/month"
        }
      ],
      certifications: [
        {
          title: "Project Management Professional (PMP)",
          provider: "Project Management Institute",
          duration: "3-6 months prep",
          level: "Advanced",
          priority: "medium",
          skills: ["Project Management", "Leadership", "Risk Management"],
          exam_fee: "$405-555",
          url: "https://pmi.org/certifications/project-management-pmp"
        },
        {
          title: "Good Clinical Practice (GCP) Certification",
          provider: "CITI Program",
          duration: "1-2 weeks",
          level: "Beginner",
          priority: "high",
          skills: ["Clinical Research", "Regulatory Compliance", "Ethics"],
          exam_fee: "$200-400",
          url: "https://citiprogram.org/"
        }
      ]
    },
    'technical_consulting': {
      courses: [
        {
          title: "Management Consulting Approach to Problem Solving",
          provider: "Coursera (Emory University)",
          duration: "4-6 weeks",
          level: "Beginner",
          priority: "high",
          skills: ["Problem Solving", "Case Analysis", "Strategic Thinking"],
          url: "https://coursera.org/learn/management-consulting",
          price: "$39-79/month"
        },
        {
          title: "Business Strategy Specialization",
          provider: "Coursera (University of Virginia)",
          duration: "3-4 months",
          level: "Intermediate",
          priority: "high",
          skills: ["Business Strategy", "Competitive Analysis", "Innovation"],
          url: "https://coursera.org/specializations/business-strategy",
          price: "$39-79/month"
        },
        {
          title: "Data Analysis and Presentation Skills",
          provider: "edX (PwC)",
          duration: "6-8 weeks",
          level: "Intermediate",
          priority: "medium",
          skills: ["Data Analysis", "Excel", "Presentation Skills"],
          url: "https://edx.org/course/data-analysis-presentation-skills",
          price: "$99-199"
        }
      ],
      certifications: [
        {
          title: "Certified Management Consultant (CMC)",
          provider: "Institute of Management Consultants",
          duration: "6-12 months prep",
          level: "Advanced",
          priority: "medium",
          skills: ["Consulting Excellence", "Ethics", "Professional Standards"],
          exam_fee: "$1,500-2,000",
          url: "https://imcusa.org/"
        },
        {
          title: "Digital Transformation Certificate",
          provider: "MIT xPRO",
          duration: "8-10 weeks",
          level: "Advanced",
          priority: "high",
          skills: ["Digital Strategy", "Change Management", "Technology Leadership"],
          exam_fee: "$3,500-4,500",
          url: "https://xpro.mit.edu/"
        }
      ]
    },
    'software_engineering': {
      courses: [
        {
          title: "Full Stack Web Development",
          provider: "Coursera (Johns Hopkins)",
          duration: "4-6 months",
          level: "Beginner to Intermediate",
          priority: "high",
          skills: ["HTML/CSS", "JavaScript", "React", "Node.js"],
          url: "https://coursera.org/specializations/full-stack-react",
          price: "$39-79/month"
        },
        {
          title: "Algorithms Specialization",
          provider: "Coursera (Stanford)",
          duration: "4-6 months",
          level: "Intermediate to Advanced",
          priority: "high",
          skills: ["Algorithms", "Data Structures", "Problem Solving"],
          url: "https://coursera.org/specializations/algorithms",
          price: "$39-79/month"
        },
        {
          title: "System Design Interview",
          provider: "Educative.io",
          duration: "2-3 months",
          level: "Advanced",
          priority: "medium",
          skills: ["System Design", "Scalability", "Architecture"],
          url: "https://educative.io/courses/grokking-the-system-design-interview",
          price: "$79/month"
        }
      ],
      certifications: [
        {
          title: "AWS Certified Solutions Architect",
          provider: "Amazon Web Services",
          duration: "2-3 months prep",
          level: "Intermediate",
          priority: "high",
          skills: ["Cloud Architecture", "AWS Services", "System Design"],
          exam_fee: "$150",
          url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/"
        },
        {
          title: "Certified Kubernetes Administrator (CKA)",
          provider: "Cloud Native Computing Foundation",
          duration: "2-3 months prep",
          level: "Advanced",
          priority: "medium",
          skills: ["Kubernetes", "Container Orchestration", "DevOps"],
          exam_fee: "$375",
          url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"
        }
      ]
    }
  };

  // Get career-specific recommendations
  const careerRecommendations = careerLearningPaths[careerPath] || {
    courses: [],
    certifications: []
  };

  // Filter recommendations based on current stage and gaps
  const prioritizedCourses = prioritizeLearningContent(
    careerRecommendations.courses, 
    currentStage, 
    userAnalysis
  );
  
  const prioritizedCertifications = prioritizeLearningContent(
    careerRecommendations.certifications, 
    currentStage, 
    userAnalysis
  );

  return {
    courses: prioritizedCourses,
    certifications: prioritizedCertifications,
    learningPath: {
      immediate: prioritizedCourses.filter(c => c.priority === 'high').slice(0, 2),
      medium_term: prioritizedCourses.filter(c => c.priority === 'medium').slice(0, 2),
      advanced: prioritizedCertifications.filter(c => c.priority === 'high').slice(0, 2)
    },
    estimatedCost: calculateEstimatedCost(prioritizedCourses, prioritizedCertifications),
    timeToComplete: "6-12 months for core recommendations"
  };
}

function prioritizeLearningContent(content, currentStage, userAnalysis) {
  return content.map(item => {
    // Boost priority for gap areas
    let adjustedPriority = item.priority;
    
    if (userAnalysis.gaps.some(gap => 
      item.skills.some(skill => skill.toLowerCase().includes(gap.toLowerCase()))
    )) {
      adjustedPriority = 'high';
    }

    return {
      ...item,
      priority: adjustedPriority,
      relevanceScore: calculateRelevanceScore(item, currentStage, userAnalysis)
    };
  }).sort((a, b) => {
    // Sort by priority and relevance
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    return b.relevanceScore - a.relevanceScore;
  });
}

function calculateRelevanceScore(item, currentStage, userAnalysis) {
  let score = 0;
  
  // Base score by level match
  const levelMapping = {
    'entry': ['Beginner', 'Beginner to Intermediate'],
    'mid': ['Intermediate', 'Beginner to Intermediate'],
    'senior': ['Advanced', 'Intermediate'],
    'leadership': ['Advanced']
  };
  
  if (levelMapping[currentStage.level]?.includes(item.level)) {
    score += 10;
  }
  
  // Bonus for addressing user gaps
  userAnalysis.gaps.forEach(gap => {
    if (item.skills.some(skill => skill.toLowerCase().includes(gap.toLowerCase()))) {
      score += 15;
    }
  });
  
  return score;
}

function calculateEstimatedCost(courses, certifications) {
  const courseCosts = courses.slice(0, 3).map(course => {
    const priceMatch = course.price?.match(/\$(\d+)/); 
    return priceMatch ? parseInt(priceMatch[1]) : 100;
  });
  
  const certCosts = certifications.slice(0, 2).map(cert => {
    const priceMatch = cert.exam_fee?.match(/\$(\d+)/); 
    return priceMatch ? parseInt(priceMatch[1]) : 200;
  });
  
  const totalCost = [...courseCosts, ...certCosts].reduce((sum, cost) => sum + cost, 0);
  
  return {
    estimated_total: `${totalCost.toLocaleString()}`,
    courses_cost: `${courseCosts.reduce((sum, cost) => sum + cost, 0).toLocaleString()}`,
    certifications_cost: `${certCosts.reduce((sum, cost) => sum + cost, 0).toLocaleString()}`,
    note: "Costs are estimates and may vary. Many courses offer financial aid or free audit options."
  };
}

// Export for testing
export { generateActionPlan, analyzeUserProfile, generateLearningRecommendations };