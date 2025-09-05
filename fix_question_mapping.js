// Fix the question mapping between q1-q34 and actual question IDs
const fs = require('fs');

const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));

console.log('=== CORRECT QUESTION MAPPING ===\n');

// Extract all main questions in order
const questionOrder = quizQuestions.questions.map((q, index) => {
  console.log(`q${index + 1} -> ${q.id}: "${q.question}"`);
  return { qNumber: index + 1, id: q.id, question: q.question };
});

console.log(`\nTotal questions: ${questionOrder.length}`);

// Your original responses using q1-q34 format
const originalResponses = {
  "q1": "c",    // skills_technical_1
  "q2": "d",    // skills_communication_1
  "q3": "c",    // skills_leadership_1
  "q4": "c",    // skills_analytical_1
  "q5": ["a", "b", "c"],    // skills_management_1
  "q6": ["4", "2", "1", "3"], // values_impact_1
  "q7": "e",    // values_autonomy_1
  "q8": "a",    // values_stability_1
  "q9": "d",    // values_collaboration_1
  "q10": "b",   // values_creativity_1
  "q11": "c",   // temperament_social_1
  "q12": "c",   // temperament_detail_1
  "q13": "e",   // temperament_structure_1
  "q14": "a",   // temperament_pressure_1
  "q15": "c",   // temperament_decision_1
  "q16": "a",   // skills_specialized_1
  "q17": "d",   // career_goals_1
  "q18": ["1", "4", "3", "2", "5"], // work_motivation_1
  "q19": "c",   // risk_tolerance_1
  "q20": "b",   // problem_complexity_1
  "q21": "c",   // phd_domain_1
  "q22": "b",   // technical_depth_1
  "q23": "b",   // programming_experience
  "q24": ["a", "b", "c"], // programming_languages
  "q25": "b",   // mathematics_background
  "q26": ["a", "b", "c"], // mathematical_areas
  "q27": "c",   // data_analysis_experience
  "q28": ["a", "c", "d"], // data_tools_experience
  "q29": ["a", "f"], // research_methodology
  "q30": "d",   // technical_writing_experience
  "q31": "a",   // business_finance_background
  "q32": "c",   // lab_experience
  "q33": "a",   // creative_design_experience
  "q34": "e"    // clinical_experience
};

// Create correctly mapped responses
const correctlyMappedResponses = {};
Object.entries(originalResponses).forEach(([qNumber, response]) => {
  const qIndex = parseInt(qNumber.replace('q', '')) - 1; // Convert q1 to index 0
  if (qIndex < questionOrder.length) {
    const questionId = questionOrder[qIndex].id;
    correctlyMappedResponses[questionId] = response;
    console.log(`✅ ${qNumber} (${response}) -> ${questionId}`);
  } else {
    console.log(`❌ ${qNumber} has no corresponding question (index ${qIndex} out of range)`);
  }
});

console.log('\n=== CORRECTLY MAPPED RESPONSES ===');
console.log(JSON.stringify(correctlyMappedResponses, null, 2));

// Save the corrected mapping
fs.writeFileSync('corrected_responses.json', JSON.stringify(correctlyMappedResponses, null, 2));

console.log('\n✅ Corrected responses saved to corrected_responses.json');