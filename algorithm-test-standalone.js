#!/usr/bin/env node

/**
 * Standalone Algorithm Testing Script
 * Tests the career matching algorithm with extracted logic from the API
 */

const fs = require('fs');
const path = require('path');

// Load data files
const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));
const enhancedTaxonomy = JSON.parse(fs.readFileSync('./data/enhanced_career_taxonomy.json', 'utf8'));
const careerTimelineData = JSON.parse(fs.readFileSync('./data/careerTimelineData_PhDOptimized.json', 'utf8'));

// Test profiles
const testProfiles = {
  technical_engineering: {
    name: "Technical/Engineering PhD",
    expectedTopCareers: ["data_scientist", "software_engineer", "ai_ml_engineer"],
    answers: {
      "phd_domain_1": "opt_engineering_1",
      "programming_experience": "4",
      "mathematical_areas": ["statistics", "linear_algebra"],
      "data_tools_experience": ["python", "r"],
      "programming_languages": ["python"],
      "analytical_thinking": "5",
      "problem_solving": "5",
      "technical_skills": "5"
    }
  },

  business_strategy: {
    name: "Business/Strategy PhD", 
    expectedTopCareers: ["management_consultant", "product_manager", "business_development"],
    answers: {
      "phd_domain_1": "opt_social_sciences_1",
      "programming_experience": "2", 
      "leadership": "5",
      "communication": "5",
      "strategic_thinking": "5"
    }
  }
};

// Extracted algorithm functions
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
      const selectedOption = question.options.find(opt => opt.id === answer);
      if (selectedOption && selectedOption.tags) {
        selectedOption.tags.forEach(tag => {
          userTags[tag] = (userTags[tag] || 0) + categoryWeight;
        });
      }
    } else if (question.type === 'multiple_select') {
      if (Array.isArray(answer)) {
        answer.forEach(selectedId => {
          const option = question.options.find(opt => opt.id === selectedId);
          if (option && option.tags) {
            option.tags.forEach(tag => {
              userTags[tag] = (userTags[tag] || 0) + categoryWeight;
            });
          }
        });
      }
    } else if (question.type === 'scale') {
      const scaleValue = parseInt(answer);
      if (!isNaN(scaleValue) && question.tags && question.tags[scaleValue]) {
        question.tags[scaleValue].forEach(tag => {
          userTags[tag] = (userTags[tag] || 0) + categoryWeight;
        });
      }
    }
  });
  
  return { userTags, userDomain };
}

function calculateEnhancedCareerScore(career, userTags, userDomain) {
  const maxTagValue = Math.max(...Object.values(userTags), 1);
  
  // Get category-specific weights or use defaults
  const categoryKey = career.category?.toLowerCase().replace(/\\s+/g, '_') || 'general';
  let categoryWeights = enhancedTaxonomy.category_weights[categoryKey] || {
    skills: 0.5, values: 0.3, temperament: 0.2
  };
  
  // Boost technical skill weights for data/engineering roles
  const technicalCategories = ['data_science', 'software_engineering', 'ai_ml', 'biotech_engineering'];
  if (technicalCategories.some(cat => career.category?.toLowerCase().includes(cat.replace('_', '')))) {
    categoryWeights = { skills: 0.7, values: 0.2, temperament: 0.1 };
  }
  
  const categoryScores = {
    skills: 0,
    values: 0, 
    temperament: 0
  };
  
  // Calculate domain expertise bonus
  let domainBonus = 0;
  if (userDomain && career.domain_expertise) {
    const domainMatch = career.domain_expertise.includes(userDomain) || 
                       career.domain_expertise.includes('any_technical');
    if (domainMatch) {
      const domainData = enhancedTaxonomy.phd_domains[userDomain];
      domainBonus = domainData ? domainData.bonus_multiplier - 1 : 0.40; // Increased to 40% bonus
    }
    // Reduced bonus for 'any' domain to prevent over-matching
    else if (career.domain_expertise.includes('any')) {
      domainBonus = 0.05; // Only 5% bonus for generic matches
    }
  }
  
  // Enhanced skills calculation
  if (career.skills) {
    const skillsArray = Array.isArray(career.skills) ? career.skills : career.skills.required || [];
    let skillsTotal = 0;
    let skillMatches = 0;
    
    skillsArray.forEach(skill => {
      if (userTags[skill]) {
        let skillScore = userTags[skill] / maxTagValue;
        
        // Apply complexity multiplier if available, but cap inflation
        if (career.skills.complexity_levels && career.skills.complexity_levels[skill]) {
          const complexity = career.skills.complexity_levels[skill];
          const complexityData = enhancedTaxonomy.skill_complexity[complexity];
          if (complexityData) {
            // Cap complexity multipliers to prevent over-inflation
            const cappedMultiplier = Math.min(complexityData.multiplier, 1.5);
            skillScore *= cappedMultiplier;
          }
        }
        
        // Apply domain expertise bonus to technical skills
        const technicalSkills = ['experimental design', 'computational biology', 'data modeling', 
                                'machine learning', 'algorithms', 'programming', 'data analysis'];
        if (technicalSkills.includes(skill) && domainBonus > 0) {
          skillScore *= (1 + domainBonus * 0.6); // Increased to 60% of domain bonus for technical skills
        }
        
        skillsTotal += skillScore;
        skillMatches++;
      }
    });
    
    // Use average of matched skills to reward specialization
    categoryScores.skills = skillMatches > 0 ? skillsTotal / skillMatches : 0;
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
    categoryScores.values = valueMatches > 0 ? valuesTotal / valueMatches : 0;
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
  
  // Apply overall domain bonus with improved weighting
  let finalScore = totalScore * (1 + domainBonus);
  
  // Special handling for intellectual property analyst - add prerequisite checking
  if (career.id === 'intellectual_property_analyst') {
    // Require evidence of technical writing or patent experience
    const hasRelevantBackground = userTags['technical writing'] > 0 || 
                                  userTags['patent law basics'] > 0 ||
                                  userTags['research'] > 1;
    if (!hasRelevantBackground) {
      finalScore *= 0.3; // Significant penalty without relevant background
    }
  }
  
  return {
    total: Math.max(0, Math.min(1, finalScore)),
    categories: categoryScores,
    domainBonus: domainBonus
  };
}

function getMatchLevel(score) {
  if (score >= 0.80) return 'Strong Match';
  if (score >= 0.60) return 'Good Match';  
  if (score >= 0.40) return 'Potential Match';
  return 'Weak Match';
}

// Test function
async function testProfile(profileKey, profile) {
  console.log(`\\n🧪 Testing: ${profile.name}`);
  console.log(`🎯 Expected: ${profile.expectedTopCareers.join(', ')}`);
  
  // Extract user tags and domain
  const { userTags, userDomain } = extractUserTagsWithDomain(profile.answers);
  console.log(`🏷️  User Domain: ${userDomain}`);
  console.log(`📊 Top Tags: ${Object.entries(userTags).sort(([,a], [,b]) => b-a).slice(0,5).map(([k,v]) => `${k}(${v.toFixed(1)})`).join(', ')}`);
  
  // Get all careers and calculate scores
  const allCareers = Object.keys(careerTimelineData.career_timelines);
  const careerScores = [];
  
  allCareers.forEach(careerId => {
    const careerData = careerTimelineData.career_timelines[careerId];
    
    // Try enhanced taxonomy first, fallback to creating minimal profile
    let careerProfile = enhancedTaxonomy.career_paths.find(c => c.id === careerId);
    if (!careerProfile) {
      // Create minimal profile
      careerProfile = {
        id: careerId,
        name: careerData.name,
        category: 'General',
        domain_expertise: ['any'],
        skills: { required: ['analytical thinking', 'communication'] },
        values: ['impact'],
        temperament: ['analytical']
      };
    }
    
    const matchScore = calculateEnhancedCareerScore(careerProfile, userTags, userDomain);
    
    careerScores.push({
      careerPath: careerId,
      name: careerData.name,
      category: careerProfile.category,
      totalScore: matchScore.total,
      matchLevel: getMatchLevel(matchScore.total),
      domainBonus: matchScore.domainBonus
    });
  });
  
  // Sort by score
  const sortedMatches = careerScores
    .filter(career => career.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);
  
  // Show top matches
  const topMatches = sortedMatches.slice(0, 5);
  console.log(`\\n📊 Top Matches:`);
  topMatches.forEach((match, i) => {
    const score = Math.round(match.totalScore * 100);
    console.log(`${i + 1}. ${match.name} (${match.careerPath}) - ${score}% ${match.matchLevel}`);
  });
  
  // Calculate accuracy
  const topCareerIds = topMatches.slice(0, 3).map(m => m.careerPath);
  const expectedSet = new Set(profile.expectedTopCareers);
  const actualSet = new Set(topCareerIds);
  const intersection = new Set([...expectedSet].filter(x => actualSet.has(x)));
  const accuracy = intersection.size / expectedSet.size;
  
  console.log(`\\n✅ Accuracy: ${(accuracy * 100).toFixed(1)}% (${intersection.size}/${expectedSet.size})`);
  if (intersection.size > 0) {
    console.log(`   Matched: ${[...intersection].join(', ')}`);
  }
  
  // Check for issues
  const issues = [];
  const ipAnalyst = sortedMatches.find(m => m.careerPath === 'intellectual_property_analyst');
  if (ipAnalyst && ipAnalyst.totalScore > 0.8) {
    issues.push(`IP Analyst over-matching: ${Math.round(ipAnalyst.totalScore * 100)}%`);
  }
  
  if (topMatches[0].totalScore < 0.4) {
    issues.push(`Low top score: ${Math.round(topMatches[0].totalScore * 100)}%`);
  }
  
  if (issues.length > 0) {
    console.log(`❌ Issues: ${issues.join(', ')}`);
  }
  
  return {
    profile: profile.name,
    accuracy: accuracy * 100,
    topScore: Math.round(topMatches[0].totalScore * 100),
    issues: issues,
    passed: accuracy >= 0.67 && issues.length === 0
  };
}

// Run all tests
async function runTests() {
  console.log('🚀 Running Algorithm Validation Tests');
  console.log('=' + '='.repeat(50));
  
  const results = [];
  
  for (const [key, profile] of Object.entries(testProfiles)) {
    const result = await testProfile(key, profile);
    results.push(result);
  }
  
  // Summary
  console.log('\\n' + '='.repeat(50));
  console.log('📈 SUMMARY');
  console.log('='.repeat(50));
  
  const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  const passed = results.filter(r => r.passed).length;
  
  console.log(`Overall Accuracy: ${avgAccuracy.toFixed(1)}%`);
  console.log(`Tests Passed: ${passed}/${results.length}`);
  
  results.forEach(r => {
    const status = r.passed ? '🟢' : '🔴';
    console.log(`${status} ${r.profile}: ${r.accuracy.toFixed(1)}% accuracy`);
  });
  
  if (avgAccuracy >= 75) {
    console.log('\\n✅ Algorithm meets 75% accuracy target!');
  } else {
    console.log('\\n❌ Algorithm needs improvement to reach 75% target');
  }
  
  return { results, avgAccuracy, passed };
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testProfile };