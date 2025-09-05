// Comprehensive Career Quiz Algorithm Test
// Tests multiple user archetypes against the career matching system

const axios = require('axios').default;
const fs = require('fs');

// Test profiles
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
  
  creative: {
    name: "Creative/Design PhD",
    description: "Strong in creativity, visual skills, user experience", 
    expectedTopCareers: ["ux_researcher", "science_illustrator", "science_communicator", "technical_writer"],
    answers: {
      skills_technical_1: "e",
      skills_communication_1: "e",
      skills_leadership_1: "d",
      skills_analytical_1: "e", 
      skills_management_1: ["project_mgmt", "market_research"],
      skills_specialized_1: ["user_research"],
      problem_complexity_1: "c",
      technical_depth_1: "d",
      values_impact_1: ["personal", "societal", "intellectual", "commercial"],
      values_autonomy_1: 4,
      values_stability_1: "a",
      values_collaboration_1: "b",
      values_creativity_1: "a",
      career_goals_1: "e",
      work_motivation_1: ["learning", "flexibility", "mission", "recognition", "compensation"],
      temperament_social_1: 3,
      temperament_detail_1: "d",
      temperament_structure_1: 4,
      temperament_pressure_1: "d",
      temperament_decision_1: "b",
      risk_tolerance_1: 4,
      programming_experience: 1,
      programming_languages: ["python", "javascript"],
      mathematics_background: 1,
      mathematical_areas: ["statistics"],
      data_analysis_experience: 1,
      data_tools_experience: ["excel", "python_data"],
      research_methodology: ["survey_research", "field_studies"],
      technical_writing_experience: 2,
      business_finance_background: 1,
      lab_experience: 1,
      creative_design_experience: 3,
      clinical_experience: ["none_clinical"],
      phd_domain_1: "f"
    }
  },
  
  research: {
    name: "Research/Academic PhD",
    description: "Strong in research methodology, writing, analysis",
    expectedTopCareers: ["research_scientist", "r_and_d_scientist", "scientific_writer", "technical_writer"],
    answers: {
      skills_technical_1: "c",
      skills_communication_1: "a",
      skills_leadership_1: "d",
      skills_analytical_1: "b",
      skills_management_1: ["fundraising", "policy"], 
      skills_specialized_1: ["epidemiology", "ip_law"],
      problem_complexity_1: "a",
      technical_depth_1: "a",
      values_impact_1: ["intellectual", "societal", "personal", "commercial"],
      values_autonomy_1: 4,
      values_stability_1: "c",
      values_collaboration_1: "a",
      values_creativity_1: "b",
      career_goals_1: "a",
      work_motivation_1: ["learning", "mission", "flexibility", "recognition", "compensation"],
      temperament_social_1: 2,
      temperament_detail_1: "a",
      temperament_structure_1: 2,
      temperament_pressure_1: "a",
      temperament_decision_1: "a",
      risk_tolerance_1: 2,
      programming_experience: 2,
      programming_languages: ["python", "r", "matlab"],
      mathematics_background: 3,
      mathematical_areas: ["statistics", "calculus", "numerical_methods"],
      data_analysis_experience: 3,
      data_tools_experience: ["r_stats", "python_data", "spss_sas"],
      research_methodology: ["experimental_design", "computational_modeling", "literature_review"],
      technical_writing_experience: 4,
      business_finance_background: 0,
      lab_experience: 4,
      creative_design_experience: 1,
      clinical_experience: ["none_clinical"],
      phd_domain_1: "a"
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
  },
  
  finance: {
    name: "Finance/Economics PhD",
    description: "Strong in quantitative analysis, financial modeling",
    expectedTopCareers: ["quantitative_analyst", "financial_analyst", "venture_capital_analyst", "data_scientist"],
    answers: {
      skills_technical_1: "d",
      skills_communication_1: "c",
      skills_leadership_1: "c",
      skills_analytical_1: "a",
      skills_management_1: ["project_mgmt", "market_research", "risk_mgmt"],
      skills_specialized_1: ["finance"],
      problem_complexity_1: "b",
      technical_depth_1: "c",
      values_impact_1: ["commercial", "intellectual", "personal", "societal"],
      values_autonomy_1: 3,
      values_stability_1: "b",
      values_collaboration_1: "c",
      values_creativity_1: "c",
      career_goals_1: "b",
      work_motivation_1: ["compensation", "recognition", "learning", "flexibility", "mission"],
      temperament_social_1: 3,
      temperament_detail_1: "a",
      temperament_structure_1: 2,
      temperament_pressure_1: "b",
      temperament_decision_1: "a",
      risk_tolerance_1: 4,
      programming_experience: 3,
      programming_languages: ["python", "r", "sql"],
      mathematics_background: 3,
      mathematical_areas: ["statistics", "calculus", "optimization", "numerical_methods"],
      data_analysis_experience: 4,
      data_tools_experience: ["python_data", "r_stats", "excel", "sql_databases"],
      research_methodology: ["survey_research", "literature_review"],
      technical_writing_experience: 2,
      business_finance_background: 3,
      lab_experience: 0,
      creative_design_experience: 1,
      clinical_experience: ["none_clinical"],
      phd_domain_1: "d"
    }
  }
};

/**
 * Test a single profile against the career matching API
 */
async function testProfile(profileKey, profileData, apiUrl = 'http://localhost:3000/api/matchCareer') {
  try {
    console.log(`\n=== Testing ${profileData.name} ===`);
    console.log(`Description: ${profileData.description}`);
    console.log(`Expected top careers: ${profileData.expectedTopCareers.join(', ')}`);
    
    const response = await axios.post(apiUrl, {
      answers: profileData.answers
    });
    
    if (response.data.success) {
      const matches = response.data.matches.slice(0, 5); // Top 5 matches
      const radarData = response.data.radarData;
      
      console.log('\n--- Top 5 Career Matches ---');
      matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.name} (${match.matchLevel.level}) - Score: ${match.score}%`);
        console.log(`   Category: ${match.category}`);
        console.log(`   Prerequisites met: ${match.prerequisites.length > 0 ? 'Yes' : 'Some gaps'}`);
      });
      
      console.log('\n--- Radar Chart Dimensions ---');
      radarData.categories.forEach((category, index) => {
        const score = (radarData.scores[index] * 100).toFixed(1);
        console.log(`${category}: ${score}%`);
      });
      
      // Validate expectations
      const actualTopCareerIds = matches.slice(0, 3).map(m => m.careerPath);
      const expectedMatches = profileData.expectedTopCareers.filter(expected => 
        actualTopCareerIds.includes(expected)
      );
      
      console.log(`\n--- Validation ---`);
      console.log(`Expected matches found: ${expectedMatches.length}/${Math.min(3, profileData.expectedTopCareers.length)}`);
      console.log(`Match accuracy: ${(expectedMatches.length / Math.min(3, profileData.expectedTopCareers.length) * 100).toFixed(1)}%`);
      
      return {
        profile: profileKey,
        name: profileData.name,
        success: true,
        matches: matches,
        radarData: radarData,
        expectedMatches: expectedMatches,
        accuracy: expectedMatches.length / Math.min(3, profileData.expectedTopCareers.length),
        userProfile: response.data.userProfile
      };
    } else {
      throw new Error(`API returned error: ${response.data.error}`);
    }
    
  } catch (error) {
    console.error(`Error testing ${profileData.name}:`, error.message);
    return {
      profile: profileKey,
      name: profileData.name,
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all profile tests
 */
async function runAllTests(apiUrl) {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE CAREER QUIZ ALGORITHM TESTING');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const [profileKey, profileData] of Object.entries(testProfiles)) {
    const result = await testProfile(profileKey, profileData, apiUrl);
    results.push(result);
    
    // Wait between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Generate comprehensive test report
 */
function generateReport(results) {
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
  
  // Analyze results
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Profiles Tested: ${report.summary.totalProfiles}`);
  console.log(`Successful Tests: ${report.summary.successful}`);
  console.log(`Failed Tests: ${report.summary.failed}`);
  console.log(`Average Match Accuracy: ${(report.summary.averageAccuracy * 100).toFixed(1)}%`);
  
  // Individual profile analysis
  console.log('\n--- Individual Profile Performance ---');
  results.forEach(result => {
    if (result.success) {
      console.log(`${result.name}: ${(result.accuracy * 100).toFixed(1)}% accuracy`);
      console.log(`  Top match: ${result.matches[0]?.name} (${result.matches[0]?.score}%)`);
    } else {
      console.log(`${result.name}: FAILED - ${result.error}`);
    }
  });
  
  // Generate recommendations
  if (report.summary.averageAccuracy < 0.6) {
    report.algorithmAnalysis.recommendations.push("Consider adjusting algorithm weights - accuracy below 60%");
  }
  
  if (report.summary.failed > 0) {
    report.algorithmAnalysis.recommendations.push("Investigate API failures and error handling");
  }
  
  // Save report
  fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to: comprehensive-test-report.json');
  
  return report;
}

// Main execution function
async function main() {
  const apiUrl = process.argv[2] || 'http://localhost:3000/api/matchCareer';
  
  console.log(`Using API endpoint: ${apiUrl}`);
  console.log('Starting comprehensive career quiz algorithm tests...\n');
  
  try {
    const results = await runAllTests(apiUrl);
    const report = generateReport(results);
    
    console.log('\n=== Test Complete ===');
    console.log('Check comprehensive-test-report.json for detailed results');
    
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testProfiles,
  testProfile,
  runAllTests,
  generateReport
};