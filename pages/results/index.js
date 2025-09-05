import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { MiniCareerMap } from '../../components/CareerMap';
import CareerRadarChart from '../../components/CareerRadarChart';
import ActionPlan from '../../components/ActionPlan';

// ActionPlansComparison Component
const ActionPlansComparison = ({ topMatches, quizAnswers }) => {
  const [actionPlans, setActionPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActionPlans = async () => {
      if (!topMatches || topMatches.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const plans = {};

      try {
        // Fetch action plans for top 3 matches in parallel
        const promises = topMatches.map(async (match) => {
          try {
            const response = await fetch('/api/actionPlan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                answers: quizAnswers,
                topCareerMatch: match.careerPath,
                userProfile: {}
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch plan for ${match.careerPath}`);
            }

            const data = await response.json();
            return { careerPath: match.careerPath, plan: data.actionPlan };
          } catch (err) {
            console.error(`Error fetching action plan for ${match.careerPath}:`, err);
            return { careerPath: match.careerPath, plan: null, error: err.message };
          }
        });

        const results = await Promise.all(promises);
        results.forEach(result => {
          plans[result.careerPath] = result.plan;
        });

        setActionPlans(plans);
      } catch (err) {
        setError('Failed to load action plans');
        console.error('Error fetching action plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActionPlans();
  }, [topMatches, quizAnswers]);

  const ActionPlanCard = ({ match, plan }) => {
    const careerName = match.details?.name || match.careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
          <h3 className="font-bold text-lg mb-1">{careerName}</h3>
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>Timeline: {plan?.overview?.estimatedTimeframe || '6-12 months'}</span>
            <span>Readiness: {plan?.overview?.confidenceScore || '75'}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Immediate Actions */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-red-500 mr-2">⚡</span>
              Start Immediately
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {(plan?.milestones?.immediate?.tasks || ['Update LinkedIn profile', 'Research target companies', 'Complete foundational course']).slice(0, 3).map((task, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>

          {/* Top Skills to Develop */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-blue-500 mr-2">🎯</span>
              Key Skills
            </h4>
            <div className="flex flex-wrap gap-1">
              {(plan?.skillDevelopment?.immediate || ['Data Analysis', 'Python', 'Communication']).slice(0, 4).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Investment Overview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-1 flex items-center">
              <span className="text-green-500 mr-2">💰</span>
              Investment
            </h4>
            <div className="text-sm text-gray-600">
              <span className="font-medium">${plan?.learningRecommendations?.estimatedCost?.estimated_total || '2,500'}</span>
              <span className="mx-2">•</span>
              <span>{plan?.learningRecommendations?.timeToComplete || '6-8 months'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 pt-0">
          <Link 
            href={`/actionPlan/?career=${match.careerPath}`}
            className="w-full btn-primary text-center block"
          >
            Get Full Action Plan
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading action plan previews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topMatches.map((match) => {
        const plan = actionPlans[match.careerPath];
        if (!plan) {
          return (
            <div key={match.careerPath} className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
              Action plan not available
            </div>
          );
        }
        return (
          <ActionPlanCard 
            key={match.careerPath} 
            match={match} 
            plan={plan} 
          />
        );
      })}
    </div>
  );
};

const ResultsPage = () => {
  const router = useRouter();
  const [matches, setMatches] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);

  useEffect(() => {
    const storedAnswers = sessionStorage.getItem('quizAnswers');
    
    if (!storedAnswers) {
      router.push('/quiz/');
      return;
    }

    try {
      const answers = JSON.parse(storedAnswers);
      setQuizAnswers(answers);
      fetchCareerMatches(answers);
    } catch (err) {
      setError('Invalid quiz data. Please retake the assessment.');
      setLoading(false);
    }
  }, [router]);

  const fetchCareerMatches = async (answers) => {
    try {
      const response = await fetch('/api/matchCareer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches);
      setRadarData(data.radarData);
    } catch (err) {
      setError('Failed to analyze your responses. Please try again.');
      console.error('Error fetching career matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (matchLevel) => {
    const tier = typeof matchLevel === 'object' ? matchLevel.tier : matchLevel;
    switch (tier) {
      case 'strong_match':
      case 'Excellent Match':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good_match':
      case 'Good Match':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'potential_match':
      case 'Moderate Match':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'weak_match':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'gap_to_bridge':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMatchEmoji = (matchLevel) => {
    const tier = typeof matchLevel === 'object' ? matchLevel.tier : matchLevel;
    switch (tier) {
      case 'strong_match':
      case 'Excellent Match':
        return '🟢';
      case 'good_match':
      case 'Good Match':
        return '🟡';
      case 'potential_match':
      case 'Moderate Match':
        return '🟠';
      case 'weak_match':
        return '🔴';
      case 'gap_to_bridge':
        return '⚫';
      default:
        return '⚪';
    }
  };

  const getMatchDescription = (matchLevel) => {
    const tier = typeof matchLevel === 'object' ? matchLevel.tier : matchLevel;
    switch (tier) {
      case 'strong_match':
      case 'Excellent Match':
        return 'Outstanding alignment with your skills, values, and background. Prerequisites met with high compatibility.';
      case 'good_match':
      case 'Good Match':
        return 'Strong alignment with your profile. Prerequisites met with good compatibility.';
      case 'potential_match':
      case 'Moderate Match':
        return 'Moderate fit with some skill development needed. Prerequisites met but consider building complementary skills.';
      case 'weak_match':
        return 'Limited alignment. Significant skill gaps need to be addressed.';
      case 'gap_to_bridge':
        return 'High potential but missing critical prerequisites. Substantial preparation required.';
      default:
        return 'Career match assessment available.';
    }
  };

  const getScoreColor = (score) => {
    // Handle both percentage (0-100) and decimal (0-1) formats
    const normalizedScore = score > 1 ? score / 100 : score;
    if (normalizedScore >= 0.8) return 'text-green-600';
    if (normalizedScore >= 0.65) return 'text-blue-600';
    if (normalizedScore >= 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // MatchCard component for the new tiered display
  const MatchCard = ({ match, index, tier }) => {
    const matchLevel = typeof match.matchLevel === 'object' ? match.matchLevel : { level: match.matchLevel, tier: tier };
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {match.details?.name || match.careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(matchLevel)}`}>
                {getMatchEmoji(matchLevel)} {matchLevel.level}
              </span>
              {match.prerequisites && match.prerequisites.length > 0 && (
                <span className="text-xs text-green-600 font-medium">✓ Prerequisites met</span>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {match.details?.description || 'A career path that aligns with your assessment results.'}
        </p>

        {/* Match explanation */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">{getMatchDescription(matchLevel)}</p>
        </div>

        {/* Prerequisites or skill gaps */}
        {match.prerequisites && match.prerequisites.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Prerequisites Met:</h5>
            <div className="flex flex-wrap gap-2">
              {match.prerequisites.slice(0, 3).map((prereq, idx) => (
                <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ {prereq.replace(/[_:]/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <MiniCareerMap careerPath={match.careerPath} maxStages={3} />
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={`/careerMap/?path=${match.careerPath}`}
            className="flex-1 text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            View Details
          </Link>
          <Link 
            href={`/actionPlan/?career=${match.careerPath}`}
            className="flex-1 text-center py-2 px-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Action Plan
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout 
        title="Analyzing Your Results - IndustryCareerGuide"
        description="We&apos;re analyzing your career assessment responses to provide personalized recommendations."
      >
        <div className="section-padding bg-primary-50">
          <div className="container-max max-w-2xl text-center">
            <div className="animate-fade-in">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Responses</h1>
              <p className="text-gray-600">
                We&apos;re matching your skills, values, and preferences with industry career paths...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout 
        title="Error - IndustryCareerGuide"
        description="There was an error processing your career assessment."
      >
        <div className="section-padding bg-red-50">
          <div className="container-max max-w-2xl text-center">
            <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/quiz/" className="btn-primary">
              Retake Assessment
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Layout 
        title="No Matches Found - IndustryCareerGuide"
        description="No career matches were found for your assessment responses."
      >
        <div className="section-padding">
          <div className="container-max max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Matches Found</h1>
            <p className="text-gray-600 mb-8">
              We couldn&apos;t find suitable career matches. Please try retaking the assessment.
            </p>
            <Link href="/quiz/" className="btn-primary">
              Retake Assessment
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const topMatch = matches[0];

  return (
    <Layout 
      title="Your Career Match Results - IndustryCareerGuide"
      description={`Your top career match is ${topMatch.careerPath.replace('_', ' ')}. Explore your personalized career recommendations.`}
      canonicalUrl="/results/"
    >
      <div className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white section-padding">
          <div className="container-max text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Your Career Match Results
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Based on your assessment, we&apos;ve identified the best career paths that align with your skills, values, and ambitions.
            </p>
          </div>
        </section>

        <section className="bg-white border-b">
          <div className="container-max section-padding">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Top Career Match</h2>
              <div className="flex items-center justify-center gap-4">
                <span className={`px-6 py-3 rounded-full text-lg font-semibold border-2 ${getMatchColor(topMatch.matchLevel)}`}>
                  {getMatchEmoji(topMatch.matchLevel)} {typeof topMatch.matchLevel === 'object' ? topMatch.matchLevel.level : topMatch.matchLevel}
                </span>
              </div>
              <p className="text-gray-600 mt-4 max-w-xl mx-auto">
                {getMatchDescription(topMatch.matchLevel)}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-8 mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  {topMatch.details?.name || topMatch.careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-lg text-gray-700 text-center mb-6">
                  {topMatch.details?.description || 'A great career path that matches your profile.'}
                </p>
                
                {topMatch.details && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Entry Level Salary</h4>
                      <p className="text-primary-600 font-bold">
                        {topMatch.details.career_progression?.entry_level?.salary_range || 'Varies'}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Growth Potential</h4>
                      <p className="text-primary-600 font-bold">
                        {topMatch.details.career_progression?.senior_level?.salary_range || 'High'}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Top Industries</h4>
                      <p className="text-primary-600 font-bold">
                        {topMatch.details.industries?.slice(0, 2).join(', ') || 'Multiple'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <Link 
                  href={`/actionPlan/?career=${topMatch.careerPath}`}
                  className="btn-primary text-lg px-8 py-3 mr-4"
                >
                  Get Your Action Plan
                </Link>
                <Link 
                  href={`/careerMap/?path=${topMatch.careerPath}`}
                  className="btn-secondary text-lg px-8 py-3"
                >
                  View Career Map
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Radar Chart Section */}
        {radarData && (
          <section className="bg-gray-50 section-padding">
            <div className="container-max">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Career Profile</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your personalized skills, values, and temperament radar chart based on your assessment responses.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <CareerRadarChart 
                  scores={radarData.scores}
                  skillCategories={radarData.categories}
                  categoryBreakdown={radarData.topMatchBreakdown}
                  shareText={`I just completed my career assessment! My top match is ${topMatch.details?.name || topMatch.careerPath}. Check out IndustryCareerGuide to find your ideal industry career path!`}
                />
              </div>
            </div>
          </section>
        )}

        <section className="section-padding">
          <div className="container-max">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Your Career Match Analysis
            </h2>
            
            {/* Group matches by tier */}
            {(() => {
              // Group matches by their matchLevel tier
              const groupedMatches = matches.reduce((groups, match) => {
                const tier = typeof match.matchLevel === 'object' ? match.matchLevel.tier : 
                  (match.matchLevel === 'Excellent Match' ? 'strong_match' :
                   match.matchLevel === 'Good Match' ? 'good_match' :
                   match.matchLevel === 'Moderate Match' ? 'potential_match' :
                   match.matchLevel === 'Weak Match' ? 'weak_match' : 'gap_to_bridge');
                
                if (!groups[tier]) groups[tier] = [];
                groups[tier].push(match);
                return groups;
              }, {});
              
              return (
                <div className="space-y-12">
                  {/* Strong Matches */}
                  {groupedMatches.strong_match && groupedMatches.strong_match.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">🟢</span>
                        <h3 className="text-xl font-bold text-green-800">EXCELLENT MATCHES</h3>
                        <span className="ml-3 text-sm text-green-600">Prerequisites met + high compatibility</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {groupedMatches.strong_match.map((match, index) => (
                          <MatchCard key={match.careerPath} match={match} index={index} tier="strong" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Good Matches */}
                  {groupedMatches.good_match && groupedMatches.good_match.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">🟡</span>
                        <h3 className="text-xl font-bold text-blue-800">STRONG MATCHES</h3>
                        <span className="ml-3 text-sm text-blue-600">Prerequisites met + good compatibility</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {groupedMatches.good_match.map((match, index) => (
                          <MatchCard key={match.careerPath} match={match} index={index} tier="good" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Potential Matches */}
                  {groupedMatches.potential_match && groupedMatches.potential_match.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">🟠</span>
                        <h3 className="text-xl font-bold text-yellow-800">POTENTIAL MATCHES</h3>
                        <span className="ml-3 text-sm text-yellow-600">Some development needed</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {groupedMatches.potential_match.map((match, index) => (
                          <MatchCard key={match.careerPath} match={match} index={index} tier="potential" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weak Matches */}
                  {groupedMatches.weak_match && groupedMatches.weak_match.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">🔴</span>
                        <h3 className="text-xl font-bold text-red-800">DEVELOPMENT NEEDED</h3>
                        <span className="ml-3 text-sm text-red-600">Significant skill gaps to address</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {groupedMatches.weak_match.slice(0, 4).map((match, index) => (
                          <MatchCard key={match.careerPath} match={match} index={index} tier="weak" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gap to Bridge */}
                  {groupedMatches.gap_to_bridge && groupedMatches.gap_to_bridge.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <span className="text-2xl mr-3">⚫</span>
                        <h3 className="text-xl font-bold text-gray-800">MAJOR PREPARATION REQUIRED</h3>
                        <span className="ml-3 text-sm text-gray-600">Missing critical prerequisites</span>
                      </div>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {groupedMatches.gap_to_bridge.slice(0, 2).map((match, index) => (
                          <MatchCard key={match.careerPath} match={match} index={index} tier="gap" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

        {/* Action Plans Comparison Section */}
        <section className="bg-white border-t section-padding">
          <div className="container-max">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Compare Action Plans for Your Top Matches
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get a quick overview of the transition roadmaps for your best career matches and choose the path that excites you most.
              </p>
            </div>
            
            <ActionPlansComparison 
              topMatches={matches.slice(0, 3)} 
              quizAnswers={quizAnswers}
            />
          </div>
        </section>

        <section className="bg-primary-50 section-padding">
          <div className="container-max text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Take Action?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Now that you know your best career matches, take the next step toward your industry transition.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-4">📋</div>
                <h3 className="font-semibold mb-2">Get Your Action Plan</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Personalized roadmap with courses, certifications, and milestones
                </p>
                <Link 
                  href={`/actionPlan/?career=${topMatch.careerPath}`}
                  className="btn-primary w-full"
                >
                  Create Plan
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-4">📄</div>
                <h3 className="font-semibold mb-2">Optimize Your Resume</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Industry-specific templates and PhD-to-industry guidance
                </p>
                <a 
                  href="https://industryresume.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full"
                >
                  Get Resume Help
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-4">🗺️</div>
                <h3 className="font-semibold mb-2">Explore Career Maps</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Interactive progression paths with skills and timelines
                </p>
                <Link 
                  href="/careerMap/"
                  className="btn-secondary w-full"
                >
                  View All Paths
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-t section-padding">
          <div className="container-max text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Want Different Results?
            </h3>
            <p className="text-gray-600 mb-6">
              If these results don&apos;t feel right, you can retake the assessment to get new recommendations.
            </p>
            <Link href="/quiz/" className="btn-secondary">
              Retake Assessment
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ResultsPage;