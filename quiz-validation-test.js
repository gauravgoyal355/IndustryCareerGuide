#!/usr/bin/env node

/**
 * Comprehensive Career Quiz Algorithm Validation System
 * 
 * This script tests the career matching algorithm against various user profiles
 * and provides detailed performance metrics and validation results.
 * 
 * Usage: node quiz-validation-test.js
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// Simulate the API environment
const quizQuestions = require('./data/quizQuestions.json');
const careerTaxonomy = require('./data/career_taxonomy.json');
const enhancedTaxonomy = require('./data/enhanced_career_taxonomy.json');
const careerTimelineData = require('./data/careerTimelineData_PhDOptimized.json');

// Import the algorithm functions by requiring the API file
const matchCareerAPI = require('./pages/api/matchCareer.js');

// Test user profiles representing different PhD archetypes
const testProfiles = {
  technical_engineering: {
    name: "Technical/Engineering PhD",
    description: "Strong in quantitative skills, programming, analytical thinking",
    expectedTopCareers: ["data_scientist", "software_engineer", "ai_ml_engineer"],
    answers: {
      "phd_domain_1": "opt_engineering_1",
      "programming_experience": "4",
      "mathematical_areas": ["statistics", "linear_algebra", "calculus"],
      "data_tools_experience": ["python", "r", "sql"],
      "programming_languages": ["python", "r"],
      "research_methodology": ["quantitative_research"],
      "analytical_thinking": "5",
      "problem_solving": "5",
      "technical_skills": "5",
      "creativity": "3",
      "leadership": "3",
      "collaboration": "4",
      "independence": "4",
      "adaptability": "4",
      "worklife_balance": ["opt_3_2"],
      "career_ambitions": ["opt_4_1"],
      "learning_preference": ["opt_5_2"]
    }
  },

  business_strategy: {
    name: "Business/Strategy PhD",
    description: "Strong in leadership, communication, business strategy",
    expectedTopCareers: ["management_consultant", "product_manager", "business_development"],
    answers: {
      "phd_domain_1": "opt_social_sciences_1", 
      "programming_experience": "2",
      "mathematical_areas": ["statistics"],
      "leadership": "5",
      "communication": "5",
      "strategic_thinking": "5",
      "analytical_thinking": "4",
      "problem_solving": "4",
      "technical_skills": "2",
      "creativity": "4",
      "collaboration": "5",
      "independence": "4",
      "adaptability": "5",
      "worklife_balance": ["opt_3_1"],
      "career_ambitions": ["opt_4_2"],
      "learning_preference": ["opt_5_1"]
    }
  },

  creative_design: {
    name: "Creative/Design PhD",
    description: "Strong in creativity, visual skills, user experience",
    expectedTopCareers: ["ux_ui_designer", "science_illustrator", "product_designer"],
    answers: {
      "phd_domain_1": "opt_interdisciplinary_1",
      "programming_experience": "2",
      "mathematical_areas": ["statistics"],
      "creativity": "5",
      "design_thinking": "5",
      "visual_design": "5",
      "user_centered_design": "5",
      "communication": "4",
      "analytical_thinking": "3",
      "problem_solving": "4",
      "technical_skills": "3",
      "leadership": "3",
      "collaboration": "4",
      "independence": "4",
      "adaptability": "4",
      "worklife_balance": ["opt_3_2"],
      "career_ambitions": ["opt_4_3"],
      "learning_preference": ["opt_5_3"]
    }
  },

  research_academic: {
    name: "Research/Academic PhD", 
    description: "Strong in research methodology, writing, analysis",
    expectedTopCareers: ["research_scientist", "technical_writer", "data_analyst"],
    answers: {
      "phd_domain_1": "opt_physical_sciences_1",
      "programming_experience": "3",
      "mathematical_areas": ["statistics", "calculus"],
      "research_methodology": ["quantitative_research", "qualitative_research"],
      "technical_writing": "5",
      "analytical_thinking": "5",
      "research": "5",
      "problem_solving": "5",
      "communication": "4",
      "technical_skills": "4",
      "creativity": "3",
      "leadership": "3",
      "collaboration": "3",
      "independence": "5",
      "adaptability": "3",
      "worklife_balance": ["opt_3_3"],
      "career_ambitions": ["opt_4_1"],
      "learning_preference": ["opt_5_1"]
    }
  },

  healthcare_biotech: {
    name: "Healthcare/Biotech PhD",
    description: "Strong in life sciences, regulatory knowledge",
    expectedTopCareers: ["regulatory_affairs", "clinical_research", "biotech_scientist"],
    answers: {
      "phd_domain_1": "opt_life_sciences_1",
      "programming_experience": "2",
      "mathematical_areas": ["statistics"],
      "clinical_experience": ["patient_interaction", "clinical_trials"],
      "research_methodology": ["clinical_research", "experimental_design"],
      "analytical_thinking": "4",
      "problem_solving": "4",
      "technical_skills": "3",
      "research": "5",
      "communication": "4",
      "creativity": "3",
      "leadership": "3",
      "collaboration": "4",
      "independence": "4",
      "adaptability": "4",
      "worklife_balance": ["opt_3_2"],
      "career_ambitions": ["opt_4_1"],
      "learning_preference": ["opt_5_1"]
    }
  },

  finance_economics: {
    name: "Finance/Economics PhD",
    description: "Strong in quantitative analysis, financial modeling",
    expectedTopCareers: ["quantitative_analyst", "financial_analyst", "data_scientist"],
    answers: {
      "phd_domain_1": "opt_mathematical_1",
      "programming_experience": "4",
      "mathematical_areas": ["statistics", "linear_algebra", "calculus", "optimization"],
      "data_tools_experience": ["python", "r", "sql"],
      "programming_languages": ["python", "r"],
      "analytical_thinking": "5",
      "problem_solving": "5",
      "technical_skills": "4",
      "quantitative_analysis": "5",
      "communication": "4",
      "creativity": "3",
      "leadership": "3",
      "collaboration": "3",
      "independence": "4",
      "adaptability": "4",
      "worklife_balance": ["opt_3_1"],
      "career_ambitions": ["opt_4_1"],
      "learning_preference": ["opt_5_2"]
    }
  }
};

// Performance metrics
const metrics = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  profileResults: {},
  algorithmIssues: [],
  improvements: [],
  timestamp: new Date().toISOString()
};

/**
 * Mock the Next.js API request/response for testing
 */
function createMockRequest(answers) {
  return {
    method: 'POST',
    body: { answers }
  };
}

function createMockResponse() {
  let responseData = null;
  let statusCode = 200;
  
  return {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
          return { statusCode, data: responseData };
        },
        end: () => ({ statusCode })
      };
    },
    json: (data) => {
      responseData = data;
      return { statusCode, data: responseData };
    },
    _getResponse: () => ({ statusCode, data: responseData })
  };
}

/**
 * Test a single user profile against the algorithm
 */
async function testProfile(profileKey, profile) {
  console.log(`\\n🧪 Testing Profile: ${profile.name}`);
  console.log(`📝 Description: ${profile.description}`);
  console.log(`🎯 Expected Top Careers: ${profile.expectedTopCareers.join(', ')}`);
  
  try {
    // Create mock request/response
    const req = createMockRequest(profile.answers);
    const res = createMockResponse();
    
    // Call the API handler directly
    await matchCareerAPI.default(req, res);
    
    const response = res._getResponse();
    
    if (response.statusCode !== 200) {
      throw new Error(`API returned status ${response.statusCode}`);
    }
    
    const { matches, radarData, userProfile } = response.data;
    
    if (!matches || matches.length === 0) {
      throw new Error('No career matches returned');
    }
    
    // Analyze results
    const topMatches = matches.slice(0, 3);
    const topCareerIds = topMatches.map(m => m.careerPath);
    const topScores = topMatches.map(m => Math.round(m.totalScore * 100));
    
    console.log(`\\n📊 Results:`);
    topMatches.forEach((match, i) => {
      console.log(`${i + 1}. ${match.details?.name || match.name} (${match.careerPath})`);
      console.log(`   Score: ${Math.round(match.totalScore * 100)}% | Level: ${match.matchLevel.level}`);
      console.log(`   Category: ${match.category} | Domain Match: ${match.domainMatch > 0 ? 'Yes' : 'No'}`);
    });
    
    // Calculate accuracy
    const expectedSet = new Set(profile.expectedTopCareers);
    const actualSet = new Set(topCareerIds);
    const intersection = new Set([...expectedSet].filter(x => actualSet.has(x)));
    const accuracy = intersection.size / expectedSet.size;
    
    console.log(`\\n✅ Accuracy: ${(accuracy * 100).toFixed(1)}% (${intersection.size}/${expectedSet.size} expected careers in top 3)`);
    
    // Check for specific issues
    const issues = [];
    
    // Check for intellectual property analyst over-matching
    const ipAnalystMatch = matches.find(m => m.careerPath === 'intellectual_property_analyst');
    if (ipAnalystMatch && ipAnalystMatch.totalScore > 0.8) {
      issues.push(`IP Analyst over-matching: ${Math.round(ipAnalystMatch.totalScore * 100)}%`);
    }
    
    // Check if top match is reasonable
    const topMatch = matches[0];
    if (topMatch.totalScore < 0.4) {
      issues.push(`Low top match score: ${Math.round(topMatch.totalScore * 100)}%`);
    }
    
    // Check radar data
    if (!radarData || !radarData.scores || radarData.scores.length === 0) {
      issues.push('Missing or invalid radar chart data');
    }
    
    const result = {
      profile: profile.name,
      accuracy: accuracy * 100,
      topMatches: topMatches.map(m => ({
        career: m.careerPath,
        name: m.details?.name || m.name,
        score: Math.round(m.totalScore * 100),
        level: m.matchLevel.level
      })),
      expectedCareers: profile.expectedTopCareers,
      actualTopCareers: topCareerIds,
      matchingCareers: [...intersection],
      issues: issues,
      userDomain: userProfile?.domain,
      radarScores: radarData?.scores,
      passed: accuracy >= 0.67 && issues.length === 0 // 67% accuracy threshold
    };
    
    metrics.profileResults[profileKey] = result;
    metrics.totalTests++;
    
    if (result.passed) {
      console.log(`🟢 PASSED - Good algorithm performance`);
      metrics.passedTests++;
    } else {
      console.log(`🔴 FAILED - Algorithm needs improvement`);
      metrics.failedTests++;
      if (issues.length > 0) {
        console.log(`❌ Issues: ${issues.join(', ')}`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error testing profile ${profile.name}:`, error.message);
    
    const result = {
      profile: profile.name,
      accuracy: 0,
      error: error.message,
      passed: false
    };
    
    metrics.profileResults[profileKey] = result;
    metrics.totalTests++;
    metrics.failedTests++;
    
    return result;
  }
}

/**
 * Run all profile tests and generate comprehensive report
 */
async function runValidationTests() {
  console.log('🚀 Starting Comprehensive Career Quiz Algorithm Validation');
  console.log('=' * 60);
  
  const startTime = Date.now();
  const results = {};
  
  // Test each profile
  for (const [profileKey, profile] of Object.entries(testProfiles)) {
    results[profileKey] = await testProfile(profileKey, profile);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Generate comprehensive report
  console.log('\\n' + '=' * 60);
  console.log('📈 VALIDATION REPORT SUMMARY');
  console.log('=' * 60);
  
  const overallAccuracy = Object.values(results).reduce((sum, r) => sum + (r.accuracy || 0), 0) / Object.keys(results).length;
  
  console.log(`\\n📊 Overall Performance:`);
  console.log(`   Tests Run: ${metrics.totalTests}`);
  console.log(`   Passed: ${metrics.passedTests} (${(metrics.passedTests/metrics.totalTests*100).toFixed(1)}%)`);
  console.log(`   Failed: ${metrics.failedTests} (${(metrics.failedTests/metrics.totalTests*100).toFixed(1)}%)`);
  console.log(`   Average Accuracy: ${overallAccuracy.toFixed(1)}%`);
  console.log(`   Duration: ${duration.toFixed(1)}s`);
  
  console.log(`\\n🎯 Profile Performance:`);
  Object.entries(results).forEach(([key, result]) => {
    const status = result.passed ? '🟢' : '🔴';
    console.log(`   ${status} ${result.profile}: ${result.accuracy?.toFixed(1) || 0}% accuracy`);
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
    }
  });
  
  // Identify algorithm issues
  const allIssues = Object.values(results).flatMap(r => r.issues || []);
  const issueCount = {};
  allIssues.forEach(issue => {
    const key = issue.split(':')[0];
    issueCount[key] = (issueCount[key] || 0) + 1;
  });
  
  if (Object.keys(issueCount).length > 0) {
    console.log(`\\n❌ Common Algorithm Issues:`);
    Object.entries(issueCount).forEach(([issue, count]) => {
      console.log(`   ${issue}: ${count} occurrences`);
    });
  }
  
  // Recommendations
  console.log(`\\n💡 Recommendations:`);
  if (overallAccuracy < 75) {
    console.log('   🔧 Algorithm requires calibration improvements');
    console.log('   📊 Consider adjusting scoring weights and thresholds');
  }
  
  if (metrics.failedTests > metrics.passedTests) {
    console.log('   ⚠️  Critical: More profiles failing than passing');
    console.log('   🎯 Focus on fixing most common issues first');
  }
  
  if (issueCount['IP Analyst over-matching']) {
    console.log('   🔒 Fix Intellectual Property Analyst scoring mechanism');
  }
  
  // Save detailed results
  const reportData = {
    summary: {
      timestamp: new Date().toISOString(),
      totalTests: metrics.totalTests,
      passedTests: metrics.passedTests,
      failedTests: metrics.failedTests,
      overallAccuracy: overallAccuracy,
      duration: duration
    },
    profileResults: results,
    issueFrequency: issueCount,
    recommendations: generateRecommendations(results, overallAccuracy, issueCount)
  };
  
  // Write report to file
  const reportPath = path.join(__dirname, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\\n📄 Detailed report saved to: ${reportPath}`);
  
  return reportData;
}

/**
 * Generate specific recommendations based on test results
 */
function generateRecommendations(results, overallAccuracy, issueCount) {
  const recommendations = [];
  
  if (overallAccuracy < 50) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: 'Very low overall accuracy',
      action: 'Complete algorithm overhaul required',
      details: 'Less than 50% accuracy indicates fundamental issues'
    });
  } else if (overallAccuracy < 75) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Below target accuracy',
      action: 'Algorithm calibration needed',
      details: 'Target is 75%+ accuracy across all profiles'
    });
  }
  
  if (issueCount['IP Analyst over-matching']) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Intellectual Property Analyst over-scoring',
      action: 'Add stricter prerequisite requirements',
      details: 'Career shows up as top match without relevant background'
    });
  }
  
  if (issueCount['Low top match score']) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Low confidence in top matches',
      action: 'Review scoring normalization',
      details: 'Top matches scoring below 40% indicate weak algorithm confidence'
    });
  }
  
  // Profile-specific recommendations
  const failedProfiles = Object.values(results).filter(r => !r.passed);
  if (failedProfiles.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: `${failedProfiles.length} profiles failing validation`,
      action: 'Review career taxonomy and weights',
      details: failedProfiles.map(p => p.profile).join(', ')
    });
  }
  
  return recommendations;
}

/**
 * Compare algorithm performance before and after fixes
 */
async function performanceComparison(beforeResults, afterResults) {
  console.log('\\n🔄 PERFORMANCE COMPARISON');
  console.log('=' * 40);
  
  const before = beforeResults.summary.overallAccuracy;
  const after = afterResults.summary.overallAccuracy;
  const improvement = after - before;
  
  console.log(`Before Fixes: ${before.toFixed(1)}%`);
  console.log(`After Fixes:  ${after.toFixed(1)}%`);
  console.log(`Improvement:  ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
  
  if (improvement > 0) {
    console.log(`🟢 Algorithm performance improved by ${improvement.toFixed(1)} percentage points`);
  } else if (improvement < 0) {
    console.log(`🔴 Algorithm performance decreased by ${Math.abs(improvement).toFixed(1)} percentage points`);
  } else {
    console.log(`⚪ No change in algorithm performance`);
  }
  
  return improvement;
}

// Run the validation if this script is executed directly
if (require.main === module) {
  runValidationTests()
    .then(results => {
      const overallAccuracy = results.summary.overallAccuracy;
      console.log(`\\n🏁 Validation Complete - Overall Accuracy: ${overallAccuracy.toFixed(1)}%`);
      
      if (overallAccuracy >= 75) {
        console.log('✅ Algorithm meets accuracy target!');
        process.exit(0);
      } else {
        console.log('❌ Algorithm needs improvement to reach 75% target');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runValidationTests,
  testProfiles,
  performanceComparison
};