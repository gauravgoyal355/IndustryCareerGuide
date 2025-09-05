// Debug script to understand why matching scores are so low
const fs = require('fs');

// Load quiz questions to understand tag generation
const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));

// Your quiz responses
const responses = {
  "skills_technical_1": "c",           // Q1: Experimental design
  "skills_communication_1": "d",       // Q2: One-on-one conversations  
  "skills_leadership_1": "c",          // Q3: ?
  "skills_analytical_1": "c",          // Q4: ?
  "skills_management_1": ["a", "b", "c"], // Q5: Multiple skills
  // ... etc
};

console.log('=== DEBUGGING QUIZ RESPONSE TO TAG MAPPING ===\n');

// Simulate tag generation from responses
const userTags = {};

// Process each response
Object.entries(responses).forEach(([questionId, answer]) => {
  const question = quizQuestions.questions.find(q => q.id === questionId);
  if (!question) {
    console.log(`❌ Question ${questionId} not found`);
    return;
  }

  console.log(`\n📝 ${questionId}: "${question.question}"`);
  console.log(`Your answer: ${Array.isArray(answer) ? answer.join(', ') : answer}`);

  if (question.type === 'multiple_choice') {
    const option = question.options.find(opt => opt.id === answer);
    if (option) {
      console.log(`   Tags: ${option.tags.join(', ')}`);
      option.tags.forEach(tag => {
        userTags[tag] = (userTags[tag] || 0) + 1;
      });
    }
  } else if (question.type === 'multiple_select') {
    if (Array.isArray(answer)) {
      answer.forEach(ans => {
        const option = question.options.find(opt => opt.id === ans);
        if (option) {
          console.log(`   Option ${ans}: ${option.tags.join(', ')}`);
          option.tags.forEach(tag => {
            userTags[tag] = (userTags[tag] || 0) + 1;
          });
        }
      });
    }
  }
  // Add more type handling as needed
});

console.log('\n=== YOUR GENERATED TAGS ===');
Object.entries(userTags)
  .sort(([,a], [,b]) => b - a)
  .forEach(([tag, count]) => {
    console.log(`${tag}: ${count}`);
  });

console.log('\n=== RADAR DIMENSION ANALYSIS ===');

// Check radar dimension mapping
const radarDimensions = {
  'Technical Skills': ['data analysis', 'programming', 'experimental design', 'technical expertise', 'computational modeling'],
  'Leadership': ['leadership', 'project management', 'strategic thinking', 'teaching', 'negotiation'],
  'Communication': ['communication', 'public speaking', 'technical writing', 'relationship building', 'storytelling'],
  'Creativity': ['creativity', 'innovation', 'design thinking', 'aesthetics', 'user-centered design'],
  'Independence': ['independence', 'entrepreneurship', 'autonomy', 'self-directed', 'practical impact'],
  'Collaboration': ['collaboration', 'teamwork', 'community', 'knowledge-sharing', 'empathetic'],
  'Impact Focus': ['societal impact', 'mission-driven work', 'ethics', 'education', 'knowledge creation'],
  'Risk Tolerance': ['risk-taking', 'entrepreneurship', 'innovation', 'adaptable', 'uncertainty'],
  'Analytical Thinking': ['analytical thinking', 'systematic', 'methodical', 'problem-solving', 'logical reasoning']
};

Object.entries(radarDimensions).forEach(([dimension, tags]) => {
  console.log(`\n🎯 ${dimension}:`);
  console.log(`   Looking for: ${tags.join(', ')}`);
  
  let foundTags = [];
  let totalScore = 0;
  tags.forEach(tag => {
    if (userTags[tag]) {
      foundTags.push(`${tag} (${userTags[tag]})`);
      totalScore += userTags[tag];
    }
  });
  
  console.log(`   Found: ${foundTags.length > 0 ? foundTags.join(', ') : 'NONE!'}`);
  console.log(`   Score: ${foundTags.length > 0 ? (totalScore / foundTags.length) : 0} (avg of found tags)`);
});

console.log('\n=== POTENTIAL ISSUES ===');
console.log('1. Tag mismatch: Quiz generates different tags than radar expects');
console.log('2. Missing tag mappings in questions');  
console.log('3. Algorithm normalization issues');
console.log('4. Career requirements not matching user strengths');