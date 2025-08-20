// /pages/api/matchCareer.js
// Lightweight serverless API for career matching
// Designed for Vercel free tier - minimal computation

import quizData from '../../career_assessment_quiz.json';
import careerPaths from '../../data/careerPaths.json';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Quick validation
    if (answers.length !== quizData.questions.length) {
      return res.status(400).json({ error: 'Incomplete quiz answers' });
    }

    // Calculate career scores efficiently
    const careerScores = calculateCareerScores(answers);
    
    // Get top 5 matches
    const topMatches = getTopMatches(careerScores, 5);
    
    // Return ranked results with minimal data transfer
    const results = topMatches.map(match => ({
      careerPath: match.career,
      score: Math.round(match.score * 100) / 100,
      matchLevel: getMatchLevel(match.score),
      details: careerPaths.career_paths[match.career] || null
    }));

    res.status(200).json({
      matches: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Career matching error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function calculateCareerScores(answers) {
  const careerScores = {};
  
  // Initialize all career paths with score 0
  Object.keys(careerPaths.career_paths).forEach(career => {
    careerScores[career] = 0;
  });

  // Process each answer efficiently
  answers.forEach((answerIndex, questionIndex) => {
    const question = quizData.questions[questionIndex];
    const selectedChoice = question.choices[answerIndex];
    
    if (selectedChoice && selectedChoice.score) {
      // Add scores for this choice to relevant careers
      Object.entries(selectedChoice.score).forEach(([career, score]) => {
        if (careerScores.hasOwnProperty(career)) {
          careerScores[career] += score;
        }
      });
    }
  });

  // Normalize scores (simple approach for speed)
  const maxPossibleScore = quizData.questions.length * 4; // Assuming max score per question is 4
  Object.keys(careerScores).forEach(career => {
    careerScores[career] = careerScores[career] / maxPossibleScore;
  });

  return careerScores;
}

function getTopMatches(careerScores, limit = 5) {
  return Object.entries(careerScores)
    .map(([career, score]) => ({ career, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getMatchLevel(score) {
  const thresholds = careerPaths.scoring_thresholds;
  
  if (score >= thresholds.excellent_match) return 'Excellent Match';
  if (score >= thresholds.good_match) return 'Good Match';
  if (score >= thresholds.moderate_match) return 'Moderate Match';
  return 'Limited Match';
}

// Export for testing purposes (optional)
export { calculateCareerScores, getTopMatches, getMatchLevel };