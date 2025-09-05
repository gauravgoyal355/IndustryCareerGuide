// Comprehensive debug to understand why scores are low
const fs = require('fs');

const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));
const correctResponses = JSON.parse(fs.readFileSync('./corrected_responses.json', 'utf8'));

console.log('=== COMPREHENSIVE TAG GENERATION ANALYSIS ===\n');

// Simulate the exact tag processing from the API
const userTags = {};
const categoryWeights = {
  skills: 1.5,
  values: 1.0,  
  temperament: 1.0,
  technical_prerequisites: 0.5
};

// Process each response exactly like the API does
Object.entries(correctResponses).forEach(([questionId, answer]) => {
  const question = quizQuestions.questions.find(q => q.id === questionId);
  if (!question) {
    console.log(`❌ Question ${questionId} not found`);
    return;
  }

  const categoryWeight = categoryWeights[question.category] || 1.0;
  console.log(`\n📝 ${questionId} (${question.category}, weight: ${categoryWeight})`);
  console.log(`   Question: "${question.question}"`);
  console.log(`   Your answer: ${Array.isArray(answer) ? answer.join(', ') : answer}`);

  if (question.type === 'multiple_choice') {
    const option = question.options.find(opt => opt.id === answer);
    if (option) {
      console.log(`   ✅ Tags generated: ${option.tags.join(', ')}`);
      option.tags.forEach(tag => {
        userTags[tag] = (userTags[tag] || 0) + categoryWeight;
      });
    } else {
      console.log(`   ❌ Option "${answer}" not found`);
    }
  } else if (question.type === 'multiple_select') {
    if (Array.isArray(answer)) {
      answer.forEach(ans => {
        const option = question.options.find(opt => opt.id === ans);
        if (option) {
          console.log(`   ✅ Option ${ans}: ${option.tags.join(', ')}`);
          option.tags.forEach(tag => {
            userTags[tag] = (userTags[tag] || 0) + categoryWeight;
          });
        } else {
          console.log(`   ❌ Option "${ans}" not found`);
        }
      });
    }
  } else if (question.type === 'ranking') {
    if (Array.isArray(answer)) {
      answer.forEach((optionId, index) => {
        const option = question.options.find(opt => opt.id === optionId);
        if (option && option.tags) {
          const rankMultiplier = (answer.length - index) / answer.length;
          const weightedScore = categoryWeight * rankMultiplier;
          console.log(`   ✅ Rank ${index + 1}: ${option.text} (multiplier: ${rankMultiplier.toFixed(2)}) -> ${option.tags.join(', ')}`);
          option.tags.forEach(tag => {
            userTags[tag] = (userTags[tag] || 0) + weightedScore;
          });
        }
      });
    }
  } else if (question.type === 'scale') {
    const scaleValue = parseInt(answer);
    if (!isNaN(scaleValue) && question.tags && question.tags[scaleValue]) {
      console.log(`   ✅ Scale value ${scaleValue}: ${question.tags[scaleValue].join(', ')}`);
      question.tags[scaleValue].forEach(tag => {
        userTags[tag] = (userTags[tag] || 0) + categoryWeight;
      });
    } else {
      console.log(`   ❌ No tags found for scale value ${scaleValue}`);
    }
  }
});

console.log('\n=== YOUR COMPLETE TAG PROFILE ===');
const sortedTags = Object.entries(userTags)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20); // Show top 20

console.log('Top 20 strongest tags:');
sortedTags.forEach(([tag, value], index) => {
  console.log(`${index + 1}. ${tag}: ${value.toFixed(2)}`);
});

console.log('\n=== RADAR DIMENSION MATCHING ===');
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

const maxTagValue = Math.max(...Object.values(userTags), 1);
console.log(`Max tag value for normalization: ${maxTagValue.toFixed(2)}`);

Object.entries(radarDimensions).forEach(([dimension, tags]) => {
  console.log(`\n🎯 ${dimension}:`);
  console.log(`   Required tags: ${tags.join(', ')}`);
  
  let foundTags = [];
  let totalScore = 0;
  let tagCount = 0;
  
  tags.forEach(tag => {
    if (userTags[tag]) {
      foundTags.push(`${tag} (${userTags[tag].toFixed(2)})`);
      totalScore += userTags[tag];
      tagCount++;
    }
  });
  
  const avgScore = tagCount > 0 ? totalScore / tagCount : 0;
  const normalizedScore = avgScore / maxTagValue;
  const finalScore = Math.round(normalizedScore * 100);
  
  console.log(`   Found tags: ${foundTags.length > 0 ? foundTags.join(', ') : 'NONE'}`);
  console.log(`   Raw average: ${avgScore.toFixed(2)}, Normalized: ${normalizedScore.toFixed(2)}, Final: ${finalScore}%`);
  
  if (foundTags.length === 0) {
    console.log(`   ❌ ISSUE: No matching tags found! Quiz doesn't generate the required tags.`);
  }
});

console.log('\n=== POTENTIAL PROBLEMS IDENTIFIED ===');
console.log('1. Tag vocabulary mismatch: Quiz generates different tags than dimensions expect');
console.log('2. Missing tag mappings: Some questions might not have proper tags defined');
console.log('3. Over-normalization: Dividing by maxTagValue might be too aggressive');
console.log('4. Category weighting issues: Some categories might be weighted too low');

console.log('\n=== IMPROVEMENT SUGGESTIONS ===');
console.log('1. Audit tag vocabulary consistency across quiz questions and radar dimensions');
console.log('2. Add missing tag mappings to boost low-scoring dimensions');
console.log('3. Adjust normalization approach to be less aggressive');
console.log('4. Consider boosting technical_prerequisites category weight from 0.5 to 1.0');