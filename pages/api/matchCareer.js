// /pages/api/matchCareer.js
// Serverless function to match quiz answers to career paths

import quizQuestions from '../../data/quizQuestions.json';
import careerPaths from '../../data/careerPaths.json';

/**
 * Career matching algorithm
 * Takes quiz answers and returns ranked career matches
 */
export default function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { answers } = req.body;

    // Validate input
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide valid quiz answers'
      });
    }

    // Calculate career matches
    const matches = calculateCareerMatches(answers);

    // Return sorted matches
    res.status(200).json({
      success: true,
      matches: matches.slice(0, 10), // Return top 10 matches
      metadata: {
        totalCareers: Object.keys(careerPaths.career_paths).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in matchCareer API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process career matching'
    });
  }
}

/**
 * Calculate career match scores based on quiz answers
 */
function calculateCareerMatches(answers) {
  const careerScores = {};
  const weights = quizQuestions.scoring.weights;
  const careers = Object.keys(careerPaths.career_paths);

  // Initialize scores for all careers
  careers.forEach(career => {
    careerScores[career] = {
      careerPath: career,
      details: careerPaths.career_paths[career],
      scores: { skills: 0, values: 0, temperament: 0, ambitions: 0 },
      totalScore: 0,
      matchLevel: 'poor_match'
    };
  });

  // Process each answer
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = quizQuestions.questions.find(q => q.id === questionId);
    if (!question) return;

    const category = question.category;

    if (question.type === 'multiple_choice') {
      processMultipleChoiceAnswer(question, answer, careerScores, category);
    } else if (question.type === 'ranking') {
      processRankingAnswer(question, answer, careerScores, category);
    } else if (question.type === 'scale') {
      processScaleAnswer(question, answer, careerScores, category);
    } else if (question.type === 'multiple_select') {
      processMultipleSelectAnswer(question, answer, careerScores, category);
    }
  });

  // Calculate final weighted scores
  Object.values(careerScores).forEach(career => {
    career.totalScore = 
      career.scores.skills * weights.skills +
      career.scores.values * weights.values +
      career.scores.temperament * weights.temperament +
      career.scores.ambitions * weights.ambitions;

    // Determine match level
    const score = career.totalScore;
    const thresholds = quizQuestions.scoring.thresholds;
    
    if (score >= thresholds.excellent_match) {
      career.matchLevel = 'Excellent Match';
    } else if (score >= thresholds.good_match) {
      career.matchLevel = 'Good Match';
    } else if (score >= thresholds.moderate_match) {
      career.matchLevel = 'Moderate Match';
    } else {
      career.matchLevel = 'Poor Match';
    }

    // Round score for display
    career.score = Math.round(career.totalScore * 100) / 100;
  });

  // Sort by total score descending
  return Object.values(careerScores)
    .sort((a, b) => b.totalScore - a.totalScore)
    .filter(career => career.totalScore > 0); // Only return careers with positive scores
}

/**
 * Process multiple choice question answers
 */
function processMultipleChoiceAnswer(question, answer, careerScores, category) {
  const selectedOption = question.options.find(opt => opt.id === answer);
  if (!selectedOption || !selectedOption.weight) return;

  Object.entries(selectedOption.weight).forEach(([career, weight]) => {
    if (careerScores[career]) {
      careerScores[career].scores[category] += weight;
    }
  });
}

/**
 * Process ranking question answers
 */
function processRankingAnswer(question, answer, careerScores, category) {
  if (!Array.isArray(answer)) return;

  answer.forEach((optionId, index) => {
    const option = question.options.find(opt => opt.id === optionId);
    if (!option || !option.weight) return;

    // Higher rank (lower index) gets higher weight
    const rankMultiplier = (answer.length - index) / answer.length;
    
    Object.entries(option.weight).forEach(([career, weight]) => {
      if (careerScores[career]) {
        careerScores[career].scores[category] += weight * rankMultiplier;
      }
    });
  });
}

/**
 * Process scale question answers
 */
function processScaleAnswer(question, answer, careerScores, category) {
  const scaleValue = parseInt(answer);
  if (isNaN(scaleValue) || !question.weights || !question.weights[scaleValue]) return;

  Object.entries(question.weights[scaleValue]).forEach(([career, weight]) => {
    if (careerScores[career]) {
      careerScores[career].scores[category] += weight;
    }
  });
}

/**
 * Process multiple select question answers
 */
function processMultipleSelectAnswer(question, answer, careerScores, category) {
  if (!Array.isArray(answer)) return;

  answer.forEach(selectedId => {
    const option = question.options.find(opt => opt.id === selectedId);
    if (!option || !option.weight) return;

    Object.entries(option.weight).forEach(([career, weight]) => {
      if (careerScores[career]) {
        careerScores[career].scores[category] += weight;
      }
    });
  });
}
