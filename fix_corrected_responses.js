// Fix the responses based on the actual screenshots and UI
const fs = require('fs');

// Your corrected responses based on the screenshots and proper mappings
const fixedResponses = {
  // Original working responses (1-6)
  "skills_technical_1": "c",           // Experimental design and lab techniques
  "skills_communication_1": "d",       // One-on-one conversations and relationship building  
  "skills_leadership_1": "c",          // Strategic oversight and relationship-building
  "skills_analytical_1": "c",          // Systematic experimentation with iterative testing
  "skills_management_1": ["project_mgmt", "fundraising", "market_research"], // Q5: a,b,c = these actual IDs
  "values_impact_1": ["personal", "societal", "intellectual", "commercial"], // Q6: Ranked 4,2,1,3

  // Fixed scale responses (convert letters to numbers based on screenshots)
  "values_autonomy_1": "5",            // Q7: e = 5th option = maximum autonomy
  "values_stability_1": "a",           // Q8: Working (this one was fine)
  "values_collaboration_1": "d",       // Q9: Working (this one was fine) 
  "values_creativity_1": "b",          // Q10: Working (this one was fine)
  "temperament_social_1": "3",         // Q11: c = 3rd option = balance of social/independent
  "temperament_detail_1": "c",         // Q12: Working (this one was fine)
  "temperament_structure_1": "5",      // Q13: e = 5th option = thrive in ambiguous environments
  "temperament_pressure_1": "a",       // Q14: Working (this one was fine)
  "temperament_decision_1": "c",       // Q15: Working (this one was fine)

  // Fixed specialized skills
  "skills_specialized_1": "clinical",  // Q16: a = clinical research and trial management
  
  "career_goals_1": "d",               // Q17: Working
  "work_motivation_1": ["learning", "mission", "flexibility", "recognition", "compensation"], // Q18: Ranked 1,4,3,2,5
  "risk_tolerance_1": "3",             // Q19: c = 3rd option = moderate risk
  "problem_complexity_1": "b",         // Q20: Working
  "phd_domain_1": "c",                 // Q21: Working  
  "technical_depth_1": "b",            // Q22: Working

  // Technical prerequisites (convert to numbers for scale questions)
  "programming_experience": "2",        // Q23: b = 2 = intermediate
  "programming_languages": ["python", "r", "matlab"], // Q24: a,b,c = these common languages
  "mathematics_background": "2",        // Q25: b = 2 = graduate coursework  
  "mathematical_areas": ["statistics", "linear_algebra", "calculus"], // Q26: a,b,c = common areas
  "data_analysis_experience": "3",      // Q27: c = 3 = programming-based analysis
  "data_tools_experience": ["excel", "r_stats", "python_data"], // Q28: a,c,d = common tools
  "research_methodology": ["experimental_design", "literature_review"], // Q29: a,f = common methods
  "technical_writing_experience": "4",  // Q30: d = 4 = expert level
  "business_finance_background": "0",   // Q31: a = 0 = no background
  "lab_experience": "3",               // Q32: c = 3 = advanced  
  "creative_design_experience": "0",    // Q33: a = 0 = no experience
  "clinical_experience": ["none_clinical"] // Q34: e = none
};

console.log('=== FIXED RESPONSES MAPPING ===');
console.log(JSON.stringify(fixedResponses, null, 2));

// Save the fixed responses
fs.writeFileSync('truly_corrected_responses.json', JSON.stringify(fixedResponses, null, 2));

console.log('\n✅ Truly corrected responses saved!');
console.log('\nKey fixes made:');
console.log('1. Scale questions: Converted letters (e,c) to numbers (5,3)');
console.log('2. Multiple select: Used proper option IDs instead of letters');  
console.log('3. Technical prerequisites: Converted to proper numeric values');
console.log('4. Specialized skills: Used proper ID "clinical" instead of "a"');
console.log('\nThese fixes should dramatically improve your matching scores!');