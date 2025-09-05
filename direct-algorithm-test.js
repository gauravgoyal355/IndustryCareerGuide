// Direct Algorithm Test - Tests the matching logic without HTTP requests
// This bypasses the API and directly tests the core algorithm

const fs = require('fs');
const path = require('path');

// Import the data files
const quizQuestions = require('./data/quizQuestions.json');
const careerTaxonomy = require('./data/career_taxonomy.json');
const enhancedTaxonomy = require('./data/enhanced_career_taxonomy.json');
const careerTimelineData = require('./data/careerTimelineData_PhDOptimized.json');

// Import matching algorithm functions (copied from the API file)

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
        else if (selectedOption.tags.includes('social_sciences_domain')) userDomain = 'social_sciences';
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
 * Check if user meets technical prerequisites for a specific career
 */
function checkKnockoutRules(careerId, answers) {
  const rules = quizQuestions.knockout_rules?.[careerId];
  if (!rules) {
    return { qualifies: true, metRequirements: [], failedRequirements: [] };
  }
  
  const metRequirements = [];
  const failedRequirements = [];
  
  // Check minimum scale requirements
  Object.entries(rules).forEach(([ruleKey, ruleValue]) => {
    if (ruleKey.endsWith('_experience') || ruleKey.endsWith('_background')) {
      const userResponse = parseInt(answers[ruleKey]) || 0;
      const minRequired = ruleValue.min;
      
      if (userResponse >= minRequired) {
        metRequirements.push(`${ruleKey}: ${userResponse} >= ${minRequired}`);
      } else {
        failedRequirements.push({
          rule: ruleKey,
          description: ruleValue.description,
          userLevel: userResponse,
          required: minRequired
        });
      }
    }
  });
  
  // Check PhD domain requirements
  if (rules.phd_domain_1) {
    const userDomain = answers.phd_domain_1;
    if (rules.phd_domain_1.includes(userDomain)) {
      metRequirements.push(`PhD domain: ${userDomain} matches required`);
    } else {
      failedRequirements.push({
        rule: 'phd_domain_1',
        description: 'PhD field requirement not met',
        userChoice: userDomain,
        required: rules.phd_domain_1
      });
    }
  }
  
  // Add other checks for required tools, languages, etc.
  // ... (similar to original implementation)
  
  const qualifies = failedRequirements.length === 0;
  
  return {
    qualifies,
    metRequirements,
    failedRequirements
  };
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
        
        skillsTotal += skillScore;
        skillMatches++;
      }
    });
    
    categoryScores.skills = skillMatches > 0 ? skillsTotal / skillsArray.length : 0;
  }
  
  // Values calculation
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
  
  // Temperament calculation
  if (career.temperament && career.temperament.length > 0) {
    let temperamentTotal = 0;
    let temperamentMatches = 0;
    career.temperament.forEach(trait => {
      if (userTags[trait]) {
        temperamentTotal += userTags[trait] / maxTagValue;
        temperamentMatches++;
      }
    });
    categoryScores.temperament = temperamentMatches > 0 ? temperamentTotal / temperamentMatches : 0;
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
 * Get match level based on score
 */
function getMatchLevel(score, hasAllPrereqs = true, failedRequirements = []) {
  if (!hasAllPrereqs) {
    return {
      tier: 'gap_to_bridge',
      level: 'Gap to Bridge',
      emoji: '🔴',
      description: 'High compatibility but missing key prerequisites',
      gapCount: failedRequirements.length
    };
  }
  
  if (score >= 0.80) {
    return {
      tier: 'strong_match',
      level: 'Strong Match', 
      emoji: '🟢',
      description: 'Prerequisites met with high compatibility'
    };
  }
  
  if (score >= 0.60) {
    return {
      tier: 'good_match',
      level: 'Good Match',
      emoji: '🟡', 
      description: 'Prerequisites met with good compatibility'
    };
  }
  
  if (score >= 0.40) {
    return {
      tier: 'potential_match',
      level: 'Potential Match',
      emoji: '🟠',
      description: 'Prerequisites met but consider skill development'
    };
  }
  
  return {
    tier: 'weak_match',
    level: 'Weak Match',
    emoji: '⚪',
    description: 'Prerequisites met but low compatibility'
  };
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
    
    // Check knockout rules first - skip career if user doesn't meet prerequisites
    const knockoutResult = checkKnockoutRules(careerId, answers);
    if (!knockoutResult.qualifies) {
      return; // Skip this career entirely
    }
    
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
      prerequisites: knockoutResult.metRequirements,
      matchLevel: getMatchLevel(matchScore.total, true, []),
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

// Test profiles (same as before)
const testProfiles = {
  technical: {
    name: "Technical/Engineering PhD",
    description: "Strong in quantitative skills, programming, analytical thinking",
    expectedTopCareers: ["data_scientist", "ai_ml_engineer", "software_engineering", "bioinformatics_scientist"],
    answers: {
      skills_technical_1: "a",
      skills_communication_1: "c", 
      skills_leadership_1: "a",
      skills_analytical_1: "a",
      skills_management_1: ["project_mgmt", "operations"],
      skills_specialized_1: ["computational", "finance"],
      problem_complexity_1: "a",
      technical_depth_1: "a",
      values_impact_1: ["intellectual", "commercial", "societal", "personal"],
      values_autonomy_1: 4,
      values_stability_1: "a",
      values_collaboration_1: "a", 
      values_creativity_1: "b",
      career_goals_1: "a",
      work_motivation_1: ["learning", "recognition", "compensation", "flexibility", "mission"],
      temperament_social_1: 2,
      temperament_detail_1: "a",
      temperament_structure_1: 3,
      temperament_pressure_1: "a",
      temperament_decision_1: "a",
      risk_tolerance_1: 3,
      programming_experience: 3,
      programming_languages: ["python", "r", "matlab", "cpp"],
      mathematics_background: 3,
      mathematical_areas: ["statistics", "linear_algebra", "calculus", "optimization"],
      data_analysis_experience: 4,
      data_tools_experience: ["python_data", "r_stats", "sql_databases", "cloud_platforms"],
      research_methodology: ["experimental_design", "computational_modeling", "literature_review"],
      technical_writing_experience: 3,
      business_finance_background: 1,
      lab_experience: 2,
      creative_design_experience: 1,
      clinical_experience: ["none_clinical"],
      phd_domain_1: "d"
    }
  },
  
  business: {
    name: "Business/Strategy PhD", 
    description: "Strong in leadership, communication, business strategy",
    expectedTopCareers: ["management_consultant", "product_manager", "venture_capital_analyst", "business_development_manager"],
    answers: {
      skills_technical_1: "d",
      skills_communication_1: "b",
      skills_leadership_1: "c", 
      skills_analytical_1: "d",
      skills_management_1: ["project_mgmt", "market_research", "policy", "risk_mgmt"],
      skills_specialized_1: ["finance", "user_research"],
      problem_complexity_1: "b",
      technical_depth_1: "c",
      values_impact_1: ["commercial", "societal", "intellectual", "personal"],
      values_autonomy_1: 3,
      values_stability_1: "b",
      values_collaboration_1: "c",
      values_creativity_1: "c", 
      career_goals_1: "b",
      work_motivation_1: ["recognition", "compensation", "learning", "mission", "flexibility"],
      temperament_social_1: 4,
      temperament_detail_1: "b",
      temperament_structure_1: 2,
      temperament_pressure_1: "b",
      temperament_decision_1: "c",
      risk_tolerance_1: 4,
      programming_experience: 1,
      programming_languages: ["python", "sql"],
      mathematics_background: 2,
      mathematical_areas: ["statistics"],
      data_analysis_experience: 2,
      data_tools_experience: ["excel", "spss_sas", "sql_databases"],
      research_methodology: ["survey_research", "literature_review"],
      technical_writing_experience: 2,
      business_finance_background: 2,
      lab_experience: 1,
      creative_design_experience: 0,
      clinical_experience: ["none_clinical"],
      phd_domain_1: "f"
    }
  },

  healthcare: {
    name: "Healthcare/Biotech PhD",
    description: "Strong in life sciences, regulatory knowledge",
    expectedTopCareers: ["medical_science_liaison", "regulatory_affairs_specialist", "clinical_research_associate", "r_and_d_scientist"],
    answers: {
      skills_technical_1: "c",
      skills_communication_1: "d",
      skills_leadership_1: "b",
      skills_analytical_1: "a",
      skills_management_1: ["project_mgmt", "policy", "risk_mgmt"],
      skills_specialized_1: ["clinical", "epidemiology"],
      problem_complexity_1: "e",
      technical_depth_1: "b",
      values_impact_1: ["societal", "intellectual", "commercial", "personal"],
      values_autonomy_1: 3,
      values_stability_1: "e",
      values_collaboration_1: "d",
      values_creativity_1: "c",
      career_goals_1: "f",
      work_motivation_1: ["mission", "learning", "recognition", "flexibility", "compensation"],
      temperament_social_1: 4,
      temperament_detail_1: "a",
      temperament_structure_1: 1,
      temperament_pressure_1: "a", 
      temperament_decision_1: "a",
      risk_tolerance_1: 2,
      programming_experience: 1,
      programming_languages: ["r", "sql"],
      mathematics_background: 2,
      mathematical_areas: ["statistics"],
      data_analysis_experience: 2,
      data_tools_experience: ["r_stats", "spss_sas", "sql_databases"],
      research_methodology: ["experimental_design", "clinical_trials", "survey_research"],
      technical_writing_experience: 3,
      business_finance_background: 1,
      lab_experience: 3,
      creative_design_experience: 1,
      clinical_experience: ["clinical_trials", "medical_research", "regulatory_submission"],
      phd_domain_1: "a"
    }
  }
};

/**
 * Test a profile directly
 */
function testProfileDirect(profileKey, profileData) {
  console.log(`\n=== Testing ${profileData.name} ===`);
  console.log(`Description: ${profileData.description}`);
  console.log(`Expected top careers: ${profileData.expectedTopCareers.join(', ')}`);
  
  try {
    const { matches, userTags, userDomain } = calculateCareerMatches(profileData.answers);
    
    const topMatches = matches.slice(0, 5);
    
    console.log('\n--- Top 5 Career Matches ---');
    topMatches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.name} (${match.matchLevel.level}) - Score: ${match.score}%`);
      console.log(`   Category: ${match.category} | Domain bonus: ${(match.domainMatch * 100).toFixed(1)}%`);
      console.log(`   Prerequisites: ${match.prerequisites.length} met`);
    });
    
    console.log('\n--- User Profile Analysis ---');
    console.log(`PhD Domain: ${userDomain}`);
    console.log(`Top User Tags: ${Object.entries(userTags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, score]) => `${tag} (${score.toFixed(2)})`)
      .join(', ')}`);
    
    // Validate expectations
    const actualTopCareerIds = topMatches.slice(0, 3).map(m => m.careerPath);
    const expectedMatches = profileData.expectedTopCareers.filter(expected => 
      actualTopCareerIds.includes(expected)
    );
    
    console.log(`\n--- Validation ---`);
    console.log(`Expected matches found: ${expectedMatches.length}/${Math.min(3, profileData.expectedTopCareers.length)}`);
    console.log(`Match accuracy: ${(expectedMatches.length / Math.min(3, profileData.expectedTopCareers.length) * 100).toFixed(1)}%`);
    if (expectedMatches.length > 0) {
      console.log(`Found expected careers: ${expectedMatches.join(', ')}`);
    }
    
    return {
      profile: profileKey,
      name: profileData.name,
      success: true,
      matches: topMatches,
      userTags: userTags,
      userDomain: userDomain,
      expectedMatches: expectedMatches,
      accuracy: expectedMatches.length / Math.min(3, profileData.expectedTopCareers.length)
    };
    
  } catch (error) {
    console.error(`Error testing ${profileData.name}:`, error);
    return {
      profile: profileKey,
      name: profileData.name,
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all tests
 */
function runAllTestsDirect() {
  console.log('='.repeat(60));
  console.log('DIRECT CAREER QUIZ ALGORITHM TESTING');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const [profileKey, profileData] of Object.entries(testProfiles)) {
    const result = testProfileDirect(profileKey, profileData);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate test report
 */
function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalProfiles: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageAccuracy: 0
    },
    profileResults: results,
    algorithmAnalysis: {
      strengths: [],
      weaknesses: [],
      recommendations: []
    }
  };
  
  // Calculate average accuracy
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    report.summary.averageAccuracy = successfulResults.reduce((sum, r) => sum + r.accuracy, 0) / successfulResults.length;
  }
  
  // Generate analysis
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY & ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Total Profiles Tested: ${report.summary.totalProfiles}`);
  console.log(`Successful Tests: ${report.summary.successful}`);
  console.log(`Failed Tests: ${report.summary.failed}`);
  console.log(`Average Match Accuracy: ${(report.summary.averageAccuracy * 100).toFixed(1)}%`);
  
  console.log('\n--- Individual Profile Performance ---');
  results.forEach(result => {
    if (result.success) {
      console.log(`${result.name}:`);
      console.log(`  Accuracy: ${(result.accuracy * 100).toFixed(1)}%`);
      console.log(`  Top match: ${result.matches[0]?.name} (${result.matches[0]?.score}%)`);
      console.log(`  Domain: ${result.userDomain}`);
    } else {
      console.log(`${result.name}: FAILED - ${result.error}`);
    }
  });
  
  // Algorithm analysis
  console.log('\n--- Algorithm Analysis ---');
  
  if (report.summary.averageAccuracy >= 0.7) {
    report.algorithmAnalysis.strengths.push("Good overall matching accuracy (≥70%)");
    console.log("✓ Good overall matching accuracy");
  } else {
    report.algorithmAnalysis.weaknesses.push("Below-target matching accuracy (<70%)");
    console.log("✗ Below-target matching accuracy");
  }
  
  // Analyze specific profile performance
  successfulResults.forEach(result => {
    if (result.accuracy < 0.5) {
      report.algorithmAnalysis.weaknesses.push(`Poor performance for ${result.name} (${(result.accuracy * 100).toFixed(1)}%)`);
      console.log(`✗ Poor performance for ${result.name}`);
    } else if (result.accuracy >= 0.8) {
      report.algorithmAnalysis.strengths.push(`Strong performance for ${result.name} (${(result.accuracy * 100).toFixed(1)}%)`);
      console.log(`✓ Strong performance for ${result.name}`);
    }
  });
  
  // Generate recommendations
  if (report.summary.averageAccuracy < 0.6) {
    report.algorithmAnalysis.recommendations.push("Consider adjusting algorithm weights and knockout rules");
  }
  
  if (report.algorithmAnalysis.weaknesses.length > 0) {
    report.algorithmAnalysis.recommendations.push("Review career taxonomy and skill mappings for underperforming profiles");
  }
  
  console.log('\n--- Recommendations ---');
  report.algorithmAnalysis.recommendations.forEach(rec => {
    console.log(`• ${rec}`);
  });
  
  // Save report
  fs.writeFileSync('algorithm-test-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to: algorithm-test-report.json');
  
  return report;
}

// Main execution
if (require.main === module) {
  const results = runAllTestsDirect();
  generateTestReport(results);
}

module.exports = {
  testProfiles,
  testProfileDirect,
  runAllTestsDirect,
  generateTestReport,
  calculateCareerMatches
};