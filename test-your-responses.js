#!/usr/bin/env node

/**
 * Test Your Updated Quiz Responses with Improved Algorithm
 */

const fs = require('fs');

// Load data files
const quizQuestions = JSON.parse(fs.readFileSync('./data/quizQuestions.json', 'utf8'));
const enhancedTaxonomy = JSON.parse(fs.readFileSync('./data/enhanced_career_taxonomy.json', 'utf8'));
const careerTimelineData = JSON.parse(fs.readFileSync('./data/careerTimelineData_PhDOptimized.json', 'utf8'));

// Load your updated responses
const yourResponses = JSON.parse(fs.readFileSync('./truly_corrected_responses.json', 'utf8'));

console.log('🧪 Testing Your Updated Quiz Responses');
console.log('=' + '='.repeat(50));

console.log('\n📝 Your Updated Responses:');
console.log(`   Commercial focus prioritized (values_impact_1)`);
console.log(`   Lower collaboration preference (values_collaboration_1: "2")`);
console.log(`   Higher risk tolerance (risk_tolerance_1: "5")`);

// Extract user tags and domain (simplified version of the algorithm)
function extractUserTagsWithDomain(answers) {
  const userTags = {};
  let userDomain = null;
  
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = quizQuestions.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const category = question.category;
    const categoryWeight = quizQuestions.scoring.weights[category] || 1;
    
    // Extract domain expertise from PhD domain question
    if (questionId === 'phd_domain_1') {
      const selectedOption = question.options.find(opt => opt.id === answer);
      if (selectedOption) {
        if (selectedOption.tags.includes('engineering_domain')) userDomain = 'engineering';
        else if (selectedOption.tags.includes('life_sciences_domain')) userDomain = 'life_sciences';
        else if (selectedOption.tags.includes('physical_sciences_domain')) userDomain = 'physical_sciences';
        else if (selectedOption.tags.includes('mathematical_domain')) userDomain = 'mathematical';
      }
    }
    
    if (question.type === 'multiple_choice') {
      const selectedOption = question.options.find(opt => opt.id === answer);
      if (selectedOption && selectedOption.tags) {
        selectedOption.tags.forEach(tag => {
          userTags[tag] = (userTags[tag] || 0) + categoryWeight;
        });
      }
    } else if (question.type === 'multiple_select') {
      if (Array.isArray(answer)) {
        answer.forEach(selectedId => {
          const option = question.options.find(opt => opt.id === selectedId);
          if (option && option.tags) {
            option.tags.forEach(tag => {
              userTags[tag] = (userTags[tag] || 0) + categoryWeight;
            });
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
            option.tags.forEach(tag => {
              userTags[tag] = (userTags[tag] || 0) + weightedScore;
            });
          }
        });
      }
    } else if (question.type === 'scale') {
      const scaleValue = parseInt(answer);
      if (!isNaN(scaleValue) && question.tags && question.tags[scaleValue]) {
        question.tags[scaleValue].forEach(tag => {
          userTags[tag] = (userTags[tag] || 0) + categoryWeight;
        });
      }
    }
  });
  
  return { userTags, userDomain };
}

// Enhanced career scoring with all our improvements
function calculateEnhancedCareerScore(career, userTags, userDomain) {
  const maxTagValue = Math.max(...Object.values(userTags), 1);
  
  // Get category-specific weights with technical boost
  const categoryKey = career.category?.toLowerCase().replace(/\\s+/g, '_') || 'general';
  let categoryWeights = enhancedTaxonomy.category_weights[categoryKey] || {
    skills: 0.5, values: 0.3, temperament: 0.2
  };
  
  const technicalCategories = ['data_science', 'software_engineering', 'ai_ml', 'biotech_engineering'];
  if (technicalCategories.some(cat => career.category?.toLowerCase().includes(cat.replace('_', '')))) {
    categoryWeights = { skills: 0.7, values: 0.2, temperament: 0.1 };
  }
  
  const categoryScores = { skills: 0, values: 0, temperament: 0 };
  
  // Calculate improved domain bonus
  let domainBonus = 0;
  if (userDomain && career.domain_expertise) {
    const domainMatch = career.domain_expertise.includes(userDomain) || 
                       career.domain_expertise.includes('any_technical');
    if (domainMatch) {
      domainBonus = 0.15; // Reduced back to 15% to prevent over-inflation
    } else if (career.domain_expertise.includes('any')) {
      domainBonus = 0.05; // Reduced from 0.15
    }
  }
  
  // Enhanced skills calculation
  if (career.skills) {
    const skillsArray = Array.isArray(career.skills) ? career.skills : career.skills.required || [];
    let skillsTotal = 0;
    let skillMatches = 0;
    
    skillsArray.forEach(skill => {
      if (userTags[skill]) {
        let skillScore = userTags[skill] / maxTagValue;
        
        // Apply capped complexity multiplier
        if (career.skills.complexity_levels && career.skills.complexity_levels[skill]) {
          const complexity = career.skills.complexity_levels[skill];
          const complexityData = enhancedTaxonomy.skill_complexity[complexity];
          if (complexityData) {
            const cappedMultiplier = Math.min(complexityData.multiplier, 1.5);
            skillScore *= cappedMultiplier;
          }
        }
        
        // Apply enhanced domain bonus to technical skills
        const technicalSkills = ['experimental design', 'computational biology', 'data modeling', 
                                'machine learning', 'algorithms', 'programming', 'data analysis'];
        if (technicalSkills.includes(skill) && domainBonus > 0) {
          skillScore *= (1 + domainBonus * 0.6);
        }
        
        skillsTotal += skillScore;
        skillMatches++;
      }
    });
    
    // Use average of matched skills but penalize low coverage
    if (skillMatches > 0) {
      const skillCoverage = skillMatches / skillsArray.length;
      const avgSkillScore = skillsTotal / skillMatches;
      
      // Apply coverage penalty for careers with low skill alignment
      let coveragePenalty = 1.0;
      if (skillCoverage < 0.3) {
        coveragePenalty = 0.5; // 50% penalty for <30% skill match
      } else if (skillCoverage < 0.5) {
        coveragePenalty = 0.75; // 25% penalty for <50% skill match
      }
      
      categoryScores.skills = avgSkillScore * coveragePenalty;
    } else {
      categoryScores.skills = 0;
    }
  }
  
  // Values calculation
  if (career.values && career.values.length > 0) {
    let valuesTotal = 0;
    let valueMatches = 0;
    career.values.forEach(value => {
      if (userTags[value]) {
        valuesTotal += userTags[value] / maxTagValue;
        valueMatches++;
      }
    });
    categoryScores.values = valueMatches > 0 ? valuesTotal / valueMatches : 0;
  }
  
  // Temperament calculation
  if (career.temperament && career.temperament.length > 0) {
    let temperamentTotal = 0;
    let temperamentMatches = 0;
    career.temperament.forEach(trait => {
      if (userTags[trait]) {
        temperamentTotal += userTags[trait] / maxTagValue;
        temperamentMatches++;
      }
    });
    categoryScores.temperament = temperamentMatches > 0 ? temperamentTotal / temperamentMatches : 0;
  }
  
  // Calculate weighted total with domain bonus
  const totalScore = 
    (categoryScores.skills * categoryWeights.skills) +
    (categoryScores.values * categoryWeights.values) +
    (categoryScores.temperament * categoryWeights.temperament);
  
  let finalScore = totalScore * (1 + domainBonus);
  
  // IP Analyst penalty
  if (career.id === 'intellectual_property_analyst') {
    const hasRelevantBackground = userTags['technical writing'] > 0 || 
                                  userTags['patent law basics'] > 0 ||
                                  userTags['research'] > 1;
    if (!hasRelevantBackground) {
      finalScore *= 0.3;
    }
  }
  
  return {
    total: Math.max(0, Math.min(1, finalScore)),
    categories: categoryScores,
    domainBonus: domainBonus
  };
}

function getMatchLevel(score) {
  if (score >= 0.80) return 'Strong Match';
  if (score >= 0.60) return 'Good Match';  
  if (score >= 0.40) return 'Potential Match';
  return 'Weak Match';
}

// Calculate radar chart data
function calculateRadarChartData(userTags, userAnswers) {
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

  const dimensionScores = {};
  const maxTagValue = Math.max(...Object.values(userTags), 1);
  
  Object.entries(radarDimensions).forEach(([dimension, relevantTags]) => {
    let score = 0;
    let tagsFound = 0;
    
    relevantTags.forEach(tag => {
      if (userTags[tag]) {
        score += userTags[tag];
        tagsFound++;
      }
    });
    
    if (tagsFound > 0) {
      const avgScore = score / tagsFound;
      dimensionScores[dimension] = Math.min(avgScore / maxTagValue, 1.0);
    } else {
      dimensionScores[dimension] = 0;
    }
  });

  return {
    categories: Object.keys(dimensionScores),
    scores: Object.values(dimensionScores).map(score => Math.max(0, Math.min(1, score))),
    rawDimensions: dimensionScores
  };
}

// Test your responses
function testYourResponses() {
  console.log('\\n🔍 Analyzing Your Profile...');
  
  const { userTags, userDomain } = extractUserTagsWithDomain(yourResponses);
  
  console.log(`\\n🏷️  Detected Domain: ${userDomain || 'Unknown'}`);
  console.log(`📊 Top User Tags:`);
  Object.entries(userTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .forEach(([tag, score]) => {
      console.log(`     ${tag}: ${score.toFixed(2)}`);
    });
  
  // Calculate career scores
  const allCareers = Object.keys(careerTimelineData.career_timelines);
  const careerScores = [];
  
  allCareers.forEach(careerId => {
    const careerData = careerTimelineData.career_timelines[careerId];
    let careerProfile = enhancedTaxonomy.career_paths.find(c => c.id === careerId);
    
    if (!careerProfile) {
      careerProfile = {
        id: careerId,
        name: careerData.name,
        category: 'General',
        domain_expertise: ['any'],
        skills: { required: ['analytical thinking', 'communication'] },
        values: ['impact'],
        temperament: ['analytical']
      };
    }
    
    const matchScore = calculateEnhancedCareerScore(careerProfile, userTags, userDomain);
    
    careerScores.push({
      careerPath: careerId,
      name: careerData.name,
      category: careerProfile.category,
      totalScore: matchScore.total,
      matchLevel: getMatchLevel(matchScore.total),
      domainBonus: matchScore.domainBonus
    });
  });
  
  // Sort and show results
  const sortedMatches = careerScores
    .filter(career => career.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);
  
  console.log('\\n🎯 YOUR TOP CAREER MATCHES:');
  console.log('=' + '='.repeat(45));
  
  sortedMatches.slice(0, 10).forEach((match, i) => {
    const score = Math.round(match.totalScore * 100);
    const domainIcon = match.domainBonus > 0 ? '🎯' : '  ';
    console.log(`${i + 1}.${domainIcon} ${match.name}`);
    console.log(`     Score: ${score}% | ${match.matchLevel} | ${match.category}`);
  });
  
  // Debug the top technical careers to understand the scoring
  console.log('\\n🔍 DEBUG: Technical Career Scoring Analysis');
  console.log('=' + '='.repeat(50));
  
  const technicalCareersToDebug = ['software_engineer', 'cybersecurity_analyst', 'data_scientist'];
  
  technicalCareersToDebug.forEach(careerId => {
    const match = sortedMatches.find(m => m.careerPath === careerId);
    if (match) {
      console.log(`\\n📊 ${match.name} (${Math.round(match.totalScore * 100)}%):`);
      
      // Get career profile for detailed analysis
      let careerProfile = enhancedTaxonomy.career_paths.find(c => c.id === careerId);
      if (careerProfile) {
        console.log(`   Domain Match: ${match.domainBonus > 0 ? 'YES' : 'NO'} (${(match.domainBonus * 100).toFixed(1)}% bonus)`);
        console.log(`   Required Skills: ${JSON.stringify(careerProfile.skills?.required?.slice(0, 3) || [])}`);
        console.log(`   Category Weights: ${JSON.stringify(enhancedTaxonomy.category_weights[careerProfile.category?.toLowerCase().replace(/\\s+/g, '_')] || 'default')}`);
        
        // Check if this career gets the technical boost
        const technicalCategories = ['data_science', 'software_engineering', 'ai_ml', 'biotech_engineering'];
        const getsTechnicalBoost = technicalCategories.some(cat => 
          careerProfile.category?.toLowerCase().includes(cat.replace('_', ''))
        );
        console.log(`   Technical Weight Boost: ${getsTechnicalBoost ? 'YES (skills: 0.7)' : 'NO (skills: 0.5)'}`);
        
        // Show which skills are matching
        const skillsArray = careerProfile.skills?.required || [];
        const matchingSkills = skillsArray.filter(skill => userTags[skill] > 0);
        console.log(`   Matching Skills: ${matchingSkills.length}/${skillsArray.length} - ${JSON.stringify(matchingSkills.slice(0, 3))}`);
        
        if (matchingSkills.length > 0) {
          const avgUserSkillScore = matchingSkills.reduce((sum, skill) => sum + userTags[skill], 0) / matchingSkills.length;
          console.log(`   Avg User Skill Score: ${avgUserSkillScore.toFixed(2)} (normalized: ${(avgUserSkillScore / Math.max(...Object.values(userTags), 1)).toFixed(2)})`);
          
          // Show coverage penalty
          const skillCoverage = matchingSkills.length / skillsArray.length;
          const coveragePenalty = skillCoverage < 0.3 ? 0.5 : (skillCoverage < 0.5 ? 0.75 : 1.0);
          console.log(`   Skill Coverage: ${(skillCoverage * 100).toFixed(1)}% (penalty: ${coveragePenalty}x)`);
        }
      }
    }
  });
  
  // Check for improvements
  console.log('\\n📈 ALGORITHM IMPROVEMENTS ANALYSIS:');
  const ipAnalyst = sortedMatches.find(m => m.careerPath === 'intellectual_property_analyst');
  if (ipAnalyst) {
    const ipScore = Math.round(ipAnalyst.totalScore * 100);
    console.log(`🔍 IP Analyst: ${ipScore}% (should be <80% without relevant background)`);
  }
  
  const topScore = Math.round(sortedMatches[0].totalScore * 100);
  console.log(`🏆 Top Match Score: ${topScore}% (good if 40%+)`);
  
  const technicalCareers = ['data_scientist', 'software_engineer', 'ai_ml_engineer', 'biotech_scientist'];
  const technicalMatches = sortedMatches.filter(m => technicalCareers.includes(m.careerPath));
  if (technicalMatches.length > 0) {
    console.log(`⚡ Best Technical Match: ${technicalMatches[0].name} at ${Math.round(technicalMatches[0].totalScore * 100)}%`);
  }
  
  // Calculate and display radar chart
  console.log('\\n📡 YOUR RADAR CHART PROFILE:');
  console.log('=' + '='.repeat(45));
  const radarData = calculateRadarChartData(userTags, yourResponses);
  
  radarData.categories.forEach((category, i) => {
    const score = radarData.scores[i];
    const percentage = Math.round(score * 100);
    const barLength = Math.round(score * 20); // 20 char bar
    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
    console.log(`${category.padEnd(18)} │${bar}│ ${percentage}%`);
  });
  
  console.log('\\n🎯 RADAR CHART INSIGHTS:');
  const topDimensions = radarData.categories
    .map((cat, i) => ({ name: cat, score: radarData.scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  console.log(`   Strongest: ${topDimensions.map(d => `${d.name} (${Math.round(d.score * 100)}%)`).join(', ')}`);
  
  const entrepreneurialScore = radarData.rawDimensions['Independence'] + radarData.rawDimensions['Risk Tolerance'];
  const technicalScore = radarData.rawDimensions['Technical Skills'] + radarData.rawDimensions['Analytical Thinking'];
  const leadershipScore = radarData.rawDimensions['Leadership'] + radarData.rawDimensions['Communication'];
  
  console.log(`   Entrepreneurial Index: ${Math.round(entrepreneurialScore * 50)}% (Independence + Risk Tolerance)`);
  console.log(`   Technical Index: ${Math.round(technicalScore * 50)}% (Technical + Analytical)`);
  console.log(`   Leadership Index: ${Math.round(leadershipScore * 50)}% (Leadership + Communication)`);
  
  console.log('\\n✅ Updated Profile Summary:');
  console.log('   • Higher commercial focus should boost business/entrepreneurship careers');
  console.log('   • Lower collaboration preference may favor independent roles');
  console.log('   • Higher risk tolerance should boost startup/entrepreneurship matches');
  console.log('   • Engineering domain with programming should still favor technical roles');
}

// Run the test
testYourResponses();