// /pages/api/matchCareer.js
// Serverless function to match quiz answers to career paths using career taxonomy

import quizQuestions from '../../data/quizQuestions.json';
import careerTaxonomy from '../../data/career_taxonomy.json';
import enhancedTaxonomy from '../../data/enhanced_career_taxonomy.json';
import careerTimelineData from '../../data/careerTimelineData_PhDOptimized.json';

/**
 * Calculate radar chart data based on user's aggregated tags
 */
function calculateRadarChartData(userTags, userAnswers) {
  // Define radar chart dimensions based on career taxonomy
  const radarDimensions = {
    'Technical Skills': ['data analysis', 'programming', 'experimental design', 'technical expertise', 'analytical thinking'],
    'Communication': ['communication', 'public speaking', 'technical writing', 'relationship building', 'storytelling'],
    'Leadership': ['leadership', 'project management', 'strategic thinking', 'teaching', 'negotiation'],
    'Creativity': ['creativity', 'innovation', 'design thinking', 'aesthetics', 'user-centered design'],
    'Independence': ['independence', 'entrepreneurship', 'risk-taking', 'practical impact'],
    'Collaboration': ['collaboration', 'teamwork', 'community', 'knowledge-sharing', 'empathetic'],
    'Impact Focus': ['societal impact', 'mission-driven work', 'ethics', 'education', 'knowledge creation'],
    'Stability': ['stability', 'systematic', 'organized', 'reliable', 'conscientious']
  };

  const dimensionScores = {};
  
  // Calculate scores for each radar dimension
  Object.entries(radarDimensions).forEach(([dimension, relevantTags]) => {
    let score = 0;
    let totalPossible = 0;
    
    relevantTags.forEach(tag => {
      if (userTags[tag]) {
        score += userTags[tag];
      }
      totalPossible += 1; // Each tag could contribute max 1 point per question
    });
    
    // Normalize to 0-1 scale
    dimensionScores[dimension] = totalPossible > 0 ? Math.min(score / totalPossible, 1.0) : 0;
  });

  const categories = Object.keys(dimensionScores);
  const scores = Object.values(dimensionScores);

  return {
    categories,
    scores: scores.map(score => Math.max(0, Math.min(1, score))), // Ensure 0-1 range
    rawDimensions: dimensionScores
  };
}

/**
 * Main API handler for career matching
 */
export default function handler(req, res) {
  // Set CORS headers for cross-origin requests
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
    const { answers } = req.body;

    // Validate input
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide valid quiz answers'
      });
    }

    // Calculate career matches using enhanced algorithm with domain expertise
    const { matches, userTags, userDomain } = calculateCareerMatches(answers);
    
    // Calculate radar chart data
    const radarData = calculateRadarChartData(userTags, answers);
    
    // Add category breakdown from top match for the radar chart
    if (matches.length > 0) {
      radarData.topMatchBreakdown = matches[0].categoryScores;
    }

    // Return top 6 matches to account for better diversity with enhanced scoring
    const topMatches = matches.slice(0, 6);

    res.status(200).json({
      success: true,
      matches: topMatches,
      radarData,
      userProfile: {
        domain: userDomain,
        primaryTags: Object.entries(userTags)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([tag]) => tag)
      },
      metadata: {
        totalCareers: Object.keys(careerTimelineData.career_timelines).length,
        userTagCount: Object.keys(userTags).length,
        domainExpertise: userDomain,
        enhancedScoring: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in matchCareer API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process career matching'
    });
  }
}

/**
 * Calculate career match scores using enhanced algorithm with domain expertise weighting
 */
function calculateCareerMatches(answers) {
  // Step 1: Extract user tags and domain expertise
  const { userTags, userDomain } = extractUserTagsWithDomain(answers);
  
  // Step 2: Get all careers from timeline data (49 careers)
  const allCareers = Object.keys(careerTimelineData.career_timelines);
  
  // Step 3: Calculate match scores for each career
  const careerScores = [];
  
  allCareers.forEach(careerId => {
    const careerData = careerTimelineData.career_timelines[careerId];
    
    // Try enhanced taxonomy first, fallback to original
    let careerProfile = enhancedTaxonomy.career_paths.find(c => c.id === careerId);
    if (!careerProfile) {
      careerProfile = careerTaxonomy.career_paths.find(c => c.id === careerId);
      if (!careerProfile) {
        // Create minimal profile for careers not in taxonomy
        careerProfile = createMinimalCareerProfile(careerId, careerData);
      }
    }
    
    const matchScore = calculateEnhancedCareerScore(careerProfile, userTags, userDomain);
    
    careerScores.push({
      careerPath: careerId,
      name: careerData.name,
      category: careerProfile.category || 'General',
      description: careerProfile.description || `Career path for ${careerData.name}`,
      skills: careerProfile.skills,
      values: careerProfile.values,
      temperament: careerProfile.temperament,
      totalScore: matchScore.total,
      categoryScores: matchScore.categories,
      domainMatch: matchScore.domainBonus,
      matchLevel: getMatchLevel(matchScore.total),
      score: Math.round(matchScore.total * 100),
      details: {
        name: careerData.name,
        description: careerProfile.description
      }
    });
  });

  // Step 3: Sort by total score and filter for positive matches
  const sortedMatches = careerScores
    .filter(career => career.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return { matches: sortedMatches, userTags, userDomain };
}

/**
 * Create minimal career profile for careers not in taxonomy
 */
function createMinimalCareerProfile(careerId, careerData) {
  return {
    id: careerId,
    name: careerData.name,
    category: 'General',
    description: `Career path for ${careerData.name}`,
    domain_expertise: ['any'],
    technical_complexity: 'intermediate',
    skills: {
      required: ['analytical thinking', 'communication', 'problem-solving'],
      complexity_levels: {
        'analytical thinking': 'intermediate',
        'communication': 'basic',
        'problem-solving': 'intermediate'
      }
    },
    values: ['impact', 'growth', 'innovation'],
    temperament: ['analytical', 'organized', 'adaptable']
  };
}

/**
 * Extract weighted tags and domain expertise from user's quiz answers
 */
function extractUserTagsWithDomain(answers) {
  const userTags = {};
  let userDomain = null;
  
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = quizQuestions.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const category = question.category;
    const categoryWeight = quizQuestions.scoring.weights[category] || 1;
    
    // Extract domain expertise from PhD domain question
    if (questionId === 'phd_domain_1') {
      const selectedOption = question.options.find(opt => opt.id === answer);
      if (selectedOption) {
        if (selectedOption.tags.includes('life_sciences_domain')) userDomain = 'life_sciences';
        else if (selectedOption.tags.includes('physical_sciences_domain')) userDomain = 'physical_sciences';
        else if (selectedOption.tags.includes('engineering_domain')) userDomain = 'engineering';
        else if (selectedOption.tags.includes('mathematical_domain')) userDomain = 'mathematical';
        else if (selectedOption.tags.includes('interdisciplinary_domain')) userDomain = 'interdisciplinary';
      }
    }
    
    if (question.type === 'multiple_choice') {
      processMultipleChoiceTags(question, answer, userTags, categoryWeight);
    } else if (question.type === 'multiple_select') {
      processMultipleSelectTags(question, answer, userTags, categoryWeight);
    } else if (question.type === 'ranking') {
      processRankingTags(question, answer, userTags, categoryWeight);
    } else if (question.type === 'scale') {
      processScaleTags(question, answer, userTags, categoryWeight);
    }
  });
  
  return { userTags, userDomain };
}

/**
 * Calculate enhanced career score with domain expertise weighting
 */
function calculateEnhancedCareerScore(career, userTags, userDomain) {
  const maxTagValue = Math.max(...Object.values(userTags), 1);
  
  // Get category-specific weights or use defaults
  const categoryKey = career.category?.toLowerCase().replace(/\s+/g, '_') || 'general';
  const categoryWeights = enhancedTaxonomy.category_weights[categoryKey] || {
    skills: 0.5, values: 0.3, temperament: 0.2
  };
  
  const categoryScores = {
    skills: 0,
    values: 0, 
    temperament: 0
  };
  
  // Calculate domain expertise bonus
  let domainBonus = 0;
  if (userDomain && career.domain_expertise) {
    const domainMatch = career.domain_expertise.includes(userDomain) || 
                       career.domain_expertise.includes('any_technical') ||
                       career.domain_expertise.includes('any');
    if (domainMatch) {
      const domainData = enhancedTaxonomy.phd_domains[userDomain];
      domainBonus = domainData ? domainData.bonus_multiplier - 1 : 0.15; // Default 15% bonus
    }
  }
  
  // Enhanced skills calculation with complexity weighting
  if (career.skills) {
    const skillsArray = Array.isArray(career.skills) ? career.skills : career.skills.required || [];
    let skillsTotal = 0;
    let skillMatches = 0;
    
    skillsArray.forEach(skill => {
      if (userTags[skill]) {
        let skillScore = userTags[skill] / maxTagValue;
        
        // Apply complexity multiplier if available
        if (career.skills.complexity_levels && career.skills.complexity_levels[skill]) {
          const complexity = career.skills.complexity_levels[skill];
          const complexityData = enhancedTaxonomy.skill_complexity[complexity];
          if (complexityData) {
            skillScore *= complexityData.multiplier;
          }
        }
        
        // Apply domain expertise bonus to technical skills
        const technicalSkills = ['experimental design', 'computational biology', 'data modeling', 
                                'machine learning', 'algorithms', 'programming'];
        if (technicalSkills.includes(skill) && domainBonus > 0) {
          skillScore *= (1 + domainBonus * 0.4); // 40% of domain bonus applies to technical skills
        }
        
        skillsTotal += skillScore;
        skillMatches++;
      }
    });
    
    categoryScores.skills = skillMatches > 0 ? skillsTotal / skillsArray.length : 0;
  }
  
  // Values calculation (unchanged for now)
  if (career.values && career.values.length > 0) {
    let valuesTotal = 0;
    let valueMatches = 0;
    career.values.forEach(value => {
      if (userTags[value]) {
        valuesTotal += userTags[value] / maxTagValue;
        valueMatches++;
      }
    });
    categoryScores.values = valueMatches > 0 ? valuesTotal / career.values.length : 0;
  }
  
  // Temperament calculation (unchanged for now)
  if (career.temperament && career.temperament.length > 0) {
    let temperamentTotal = 0;
    let temperamentMatches = 0;
    career.temperament.forEach(trait => {
      if (userTags[trait]) {
        temperamentTotal += userTags[trait] / maxTagValue;
        temperamentMatches++;
      }
    });
    categoryScores.temperament = temperamentMatches > 0 ? temperamentTotal / career.temperament.length : 0;
  }
  
  // Calculate weighted total score with category-specific weights
  const totalScore = 
    (categoryScores.skills * categoryWeights.skills) +
    (categoryScores.values * categoryWeights.values) +
    (categoryScores.temperament * categoryWeights.temperament);
  
  // Apply overall domain bonus
  const finalScore = totalScore * (1 + domainBonus);
  
  return {
    total: Math.max(0, Math.min(1, finalScore)),
    categories: {
      skills: Math.max(0, Math.min(1, categoryScores.skills)),
      values: Math.max(0, Math.min(1, categoryScores.values)),
      temperament: Math.max(0, Math.min(1, categoryScores.temperament))
    },
    domainBonus: domainBonus
  };
}

/**
 * Legacy function for backwards compatibility
 */
function calculateCareerMatches_Legacy(answers) {
  const userTags = extractUserTags(answers);
  const careerScores = [];
  
  careerTaxonomy.career_paths.forEach(career => {
    const matchScore = calculateCareerScore(career, userTags);
    
    careerScores.push({
      careerPath: career.id,
      name: career.name,
      category: career.category,
      description: career.description,
      skills: career.skills,
      values: career.values,
      temperament: career.temperament,
      totalScore: matchScore.total,
      categoryScores: matchScore.categories,
      matchLevel: getMatchLevel(matchScore.total),
      score: Math.round(matchScore.total * 100)
    });
  });

  const sortedMatches = careerScores
    .filter(career => career.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return { matches: sortedMatches, userTags };
}

/**
 * Extract weighted tags from user's quiz answers (legacy version)
 */
function extractUserTags(answers) {
  const { userTags } = extractUserTagsWithDomain(answers);
  return userTags;
}

/**
 * Process multiple choice question tags
 */
function processMultipleChoiceTags(question, answer, userTags, categoryWeight) {
  const selectedOption = question.options.find(opt => opt.id === answer);
  if (!selectedOption || !selectedOption.tags) return;
  
  selectedOption.tags.forEach(tag => {
    userTags[tag] = (userTags[tag] || 0) + categoryWeight;
  });
}

/**
 * Process multiple select question tags
 */
function processMultipleSelectTags(question, answer, userTags, categoryWeight) {
  if (!Array.isArray(answer)) return;
  
  answer.forEach(selectedId => {
    const option = question.options.find(opt => opt.id === selectedId);
    if (option && option.tags) {
      option.tags.forEach(tag => {
        userTags[tag] = (userTags[tag] || 0) + categoryWeight;
      });
    }
  });
}

/**
 * Process ranking question tags (higher rank = higher weight)
 */
function processRankingTags(question, answer, userTags, categoryWeight) {
  if (!Array.isArray(answer)) return;
  
  answer.forEach((optionId, index) => {
    const option = question.options.find(opt => opt.id === optionId);
    if (option && option.tags) {
      // Higher rank (lower index) gets higher weight
      const rankMultiplier = (answer.length - index) / answer.length;
      const weightedScore = categoryWeight * rankMultiplier;
      
      option.tags.forEach(tag => {
        userTags[tag] = (userTags[tag] || 0) + weightedScore;
      });
    }
  });
}

/**
 * Process scale question tags
 */
function processScaleTags(question, answer, userTags, categoryWeight) {
  const scaleValue = parseInt(answer);
  if (isNaN(scaleValue) || !question.tags || !question.tags[scaleValue]) return;
  
  question.tags[scaleValue].forEach(tag => {
    userTags[tag] = (userTags[tag] || 0) + categoryWeight;
  });
}

/**
 * Calculate match score between user tags and career requirements
 */
function calculateCareerScore(career, userTags) {
  // First, determine the max possible tag value for normalization
  const maxTagValue = Math.max(...Object.values(userTags), 1);
  
  const categoryScores = {
    skills: 0,
    values: 0,
    temperament: 0
  };
  
  // Calculate skills match
  if (career.skills && career.skills.length > 0) {
    let skillsTotal = 0;
    let skillMatches = 0;
    career.skills.forEach(skill => {
      if (userTags[skill]) {
        skillsTotal += userTags[skill] / maxTagValue; // Normalize each tag
        skillMatches++;
      }
    });
    // Average match strength for skills that were found
    categoryScores.skills = skillMatches > 0 ? skillsTotal / career.skills.length : 0;
  }
  
  // Calculate values match
  if (career.values && career.values.length > 0) {
    let valuesTotal = 0;
    let valueMatches = 0;
    career.values.forEach(value => {
      if (userTags[value]) {
        valuesTotal += userTags[value] / maxTagValue; // Normalize each tag
        valueMatches++;
      }
    });
    categoryScores.values = valueMatches > 0 ? valuesTotal / career.values.length : 0;
  }
  
  // Calculate temperament match
  if (career.temperament && career.temperament.length > 0) {
    let temperamentTotal = 0;
    let temperamentMatches = 0;
    career.temperament.forEach(trait => {
      if (userTags[trait]) {
        temperamentTotal += userTags[trait] / maxTagValue; // Normalize each tag
        temperamentMatches++;
      }
    });
    categoryScores.temperament = temperamentMatches > 0 ? temperamentTotal / career.temperament.length : 0;
  }
  
  // Calculate weighted total score (already normalized between 0-1)
  const weights = quizQuestions.scoring.weights;
  const totalScore = 
    (categoryScores.skills * weights.skills) +
    (categoryScores.values * weights.values) +
    (categoryScores.temperament * weights.temperament);
  
  // Total score is already normalized since each category score is 0-1 and weights sum to 1
  
  return {
    total: Math.max(0, Math.min(1, totalScore)),
    categories: {
      skills: Math.max(0, Math.min(1, categoryScores.skills)),
      values: Math.max(0, Math.min(1, categoryScores.values)),
      temperament: Math.max(0, Math.min(1, categoryScores.temperament))
    }
  };
}

/**
 * Determine match level based on score
 */
function getMatchLevel(score) {
  const thresholds = quizQuestions.scoring.thresholds;
  
  if (score >= thresholds.excellent_match) {
    return 'Excellent Match';
  } else if (score >= thresholds.good_match) {
    return 'Good Match';
  } else if (score >= thresholds.moderate_match) {
    return 'Moderate Match';
  } else {
    return 'Poor Match';
  }
}