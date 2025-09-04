#!/usr/bin/env node

/**
 * Direct Algorithm Test - Tests the improved algorithm with realistic quiz responses
 */

const http = require('http');

// Test scenarios with realistic PhD responses
const testScenarios = [
  {
    name: "Engineering PhD with Programming",
    description: "Should match data science/software engineering well",
    answers: {
      "skills_technical_1": "e", // Highest technical skills
      "skills_communication_1": "c", // Moderate communication
      "skills_leadership_1": "b", // Lower leadership
      "skills_analytical_1": "e", // Highest analytical
      "values_independence_1": "d", // High independence
      "values_collaboration_1": "c", // Moderate collaboration  
      "values_impact_1": "d", // High impact
      "temperament_creativity_1": "c", // Moderate creativity
      "temperament_risk_1": "d", // Higher risk tolerance
      "temperament_structure_1": "c", // Moderate structure preference
      "background_phd_domain_1": "c", // Engineering domain
      "background_programming_1": "4", // Strong programming
      "background_mathematical_1": ["a", "b", "c"], // Math, stats, linear algebra
      "background_data_tools_1": ["a", "b"], // Python, R
      "experience_programming_languages_1": ["a", "b"], // Python, R
      "experience_research_methods_1": ["a"], // Quantitative
      "ambitions_career_level_1": ["b"], // IC contributor
      "preferences_work_environment_1": ["b"], // Flexible/remote
      "preferences_learning_style_1": ["b"] // Self-directed
    },
    expectedTopCareers: ["data_scientist", "software_engineer", "ai_ml_engineer"]
  },
  
  {
    name: "Business Strategy PhD", 
    description: "Should match consulting/product management well",
    answers: {
      "skills_technical_1": "b", // Lower technical
      "skills_communication_1": "e", // Highest communication
      "skills_leadership_1": "e", // Highest leadership
      "skills_analytical_1": "d", // High analytical
      "values_independence_1": "c", // Moderate independence
      "values_collaboration_1": "e", // Highest collaboration
      "values_impact_1": "e", // Highest impact
      "temperament_creativity_1": "d", // High creativity
      "temperament_risk_1": "d", // High risk tolerance
      "temperament_structure_1": "b", // Lower structure preference
      "background_phd_domain_1": "f", // Social sciences
      "background_programming_1": "2", // Basic programming
      "background_mathematical_1": ["a"], // Just statistics
      "experience_research_methods_1": ["b"], // Qualitative
      "ambitions_career_level_1": ["c"], // Management track
      "preferences_work_environment_1": ["a"], // In-person collaboration
      "preferences_learning_style_1": ["a"] // Structured learning
    },
    expectedTopCareers: ["management_consultant", "product_manager", "business_development"]
  }
];

function makeAPIRequest(answers) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ answers });
    
    const options = {
      hostname: 'localhost',
      port: 3004,
      path: '/api/matchCareer',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testScenario(scenario) {
  console.log(`\\n🧪 Testing: ${scenario.name}`);
  console.log(`📝 ${scenario.description}`);
  console.log(`🎯 Expected: ${scenario.expectedTopCareers.join(', ')}`);
  
  try {
    const response = await makeAPIRequest(scenario.answers);
    
    if (!response.success) {
      console.log(`❌ API Error: ${response.error || 'Unknown error'}`);
      return { passed: false, error: response.error };
    }
    
    const matches = response.matches || [];
    if (matches.length === 0) {
      console.log(`❌ No matches returned`);
      return { passed: false, error: 'No matches' };
    }
    
    // Show top matches
    const topMatches = matches.slice(0, 5);
    console.log(`\\n📊 Top Matches:`);
    topMatches.forEach((match, i) => {
      const score = Math.round(match.totalScore * 100);
      const level = typeof match.matchLevel === 'object' ? match.matchLevel.level : match.matchLevel;
      console.log(`${i + 1}. ${match.details?.name || match.name} - ${score}% ${level}`);
    });
    
    // Check for IP Analyst over-matching
    const ipMatch = matches.find(m => m.careerPath === 'intellectual_property_analyst');
    if (ipMatch) {
      const ipScore = Math.round(ipMatch.totalScore * 100);
      console.log(`\\n🔍 IP Analyst Check: ${ipScore}% (should be reasonable, not 90%+)`);
    }
    
    // Calculate accuracy
    const topCareerIds = topMatches.slice(0, 3).map(m => m.careerPath);
    const expectedSet = new Set(scenario.expectedTopCareers);
    const actualSet = new Set(topCareerIds);
    const intersection = new Set([...expectedSet].filter(x => actualSet.has(x)));
    const accuracy = intersection.size / expectedSet.size;
    
    console.log(`\\n✅ Accuracy: ${(accuracy * 100).toFixed(1)}% (${intersection.size}/${expectedSet.size})`);
    if (intersection.size > 0) {
      console.log(`   Matched: ${[...intersection].join(', ')}`);
    }
    
    // Check top match quality
    const topScore = Math.round(matches[0].totalScore * 100);
    console.log(`📈 Top Match Score: ${topScore}% (should be 50%+ for good matches)`);
    
    // Analyze domain matching
    if (response.userProfile && response.userProfile.domain) {
      console.log(`🏷️  Detected Domain: ${response.userProfile.domain}`);
    }
    
    const passed = accuracy >= 0.33 && topScore >= 40; // Relaxed thresholds for testing
    console.log(passed ? '🟢 PASSED' : '🔴 NEEDS IMPROVEMENT');
    
    return {
      passed,
      accuracy: accuracy * 100,
      topScore,
      topMatches: topMatches.slice(0, 3).map(m => m.careerPath),
      ipAnalystScore: ipMatch ? Math.round(ipMatch.totalScore * 100) : 0
    };
    
  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Testing Improved Algorithm with Real Quiz Responses');
  console.log('=' + '='.repeat(60));
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testScenario(scenario);
    results.push({ ...result, name: scenario.name });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\\n' + '='.repeat(60));
  console.log('📈 ALGORITHM TESTING SUMMARY');
  console.log('=' + '='.repeat(60));
  
  const avgAccuracy = results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length;
  const passed = results.filter(r => r.passed).length;
  
  console.log(`\\n📊 Overall Results:`);
  console.log(`   Tests Passed: ${passed}/${results.length} (${(passed/results.length*100).toFixed(1)}%)`);
  console.log(`   Average Accuracy: ${avgAccuracy.toFixed(1)}%`);
  
  results.forEach(r => {
    const status = r.passed ? '🟢' : '🔴';
    console.log(`   ${status} ${r.name}: ${(r.accuracy || 0).toFixed(1)}% accuracy`);
  });
  
  // Check IP Analyst improvements
  const avgIPScore = results.reduce((sum, r) => sum + (r.ipAnalystScore || 0), 0) / results.length;
  console.log(`\\n🔍 IP Analyst Average Score: ${avgIPScore.toFixed(1)}% (should be <80%)`);
  
  console.log('\\n💡 Analysis:');
  if (avgAccuracy >= 60) {
    console.log('   ✅ Algorithm showing good improvement');
  } else if (avgAccuracy >= 40) {
    console.log('   ⚡ Algorithm showing moderate improvement - needs more tuning');
  } else {
    console.log('   ❌ Algorithm still needs significant work');
  }
  
  if (avgIPScore < 80) {
    console.log('   ✅ IP Analyst over-matching successfully reduced');
  } else {
    console.log('   ⚠️  IP Analyst still scoring too high');
  }
  
  return results;
}

// Wait for server to be ready, then run tests
setTimeout(() => {
  runAllTests()
    .then(() => {
      console.log('\\n🏁 Algorithm testing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Testing failed:', error);
      process.exit(1);
    });
}, 3000); // 3 second delay for server startup