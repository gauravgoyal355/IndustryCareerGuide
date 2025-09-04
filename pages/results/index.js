import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { MiniCareerMap } from '../../components/CareerMap';
import CareerRadarChart from '../../components/CareerRadarChart';

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good_match':
      case 'Good Match':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'potential_match':
      case 'Moderate Match':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'weak_match':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'gap_to_bridge':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your #1 Career Match</h2>
              <div className="flex items-center justify-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getMatchColor(topMatch.matchLevel)}`}>
                  {typeof topMatch.matchLevel === 'object' ? topMatch.matchLevel.level : topMatch.matchLevel}
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(topMatch.score)}`}>
                  {topMatch.score > 1 ? Math.round(topMatch.score) : Math.round(topMatch.score * 100)}% Match
                </span>
              </div>
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
              All Your Career Matches
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {matches.map((match, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {match.details?.name || match.careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(match.matchLevel)}`}>
                        #{index + 1} • {typeof match.matchLevel === 'object' ? match.matchLevel.level : match.matchLevel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score > 1 ? Math.round(match.score) : Math.round(match.score * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Match Score</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {match.details?.description || 'A career path that aligns with your assessment results.'}
                  </p>
                  
                  <div className="mb-4">
                    <MiniCareerMap careerPath={match.careerPath} maxStages={3} />
                  </div>
                  
                  <div className="flex gap-3">
                    <Link 
                      href={`/careerMap/?path=${match.careerPath}`}
                      className="flex-1 text-center py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/actionPlan/?career=${match.careerPath}`}
                      className="flex-1 text-center py-2 px-4 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 transition-colors"
                    >
                      Action Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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