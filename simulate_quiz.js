// Simulate quiz submission with saved responses
const fs = require('fs');
const path = require('path');

// Load the saved responses
const savedResponses = JSON.parse(fs.readFileSync('debug_quiz_responses.json', 'utf8'));
const userResponses = savedResponses.user_quiz_responses.responses;

// Load the quiz questions to map responses to question IDs
const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));

// Map the q1, q2, etc. format to actual question IDs
const questionMapping = [];
quizQuestions.questions.forEach(question => {
  questionMapping.push(question.id);
});

// Convert user responses to API format
const apiResponses = {};
Object.entries(userResponses).forEach(([qNumber, response]) => {
  const qIndex = parseInt(qNumber.replace('q', '')) - 1; // Convert q1 to index 0
  const questionId = questionMapping[qIndex];
  if (questionId) {
    apiResponses[questionId] = response;
  }
});

console.log('Mapped responses:', JSON.stringify(apiResponses, null, 2));

// Save to sessionStorage format for the browser
const sessionStorageData = JSON.stringify(apiResponses);
fs.writeFileSync('simulated_responses.json', sessionStorageData);

console.log('Responses ready for API call');