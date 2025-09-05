import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import quizData from '../../data/quizQuestions.json';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../../components/AuthModal';

const QuizPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const questions = quizData.questions;
  const totalQuestions = questions.length;

  useEffect(() => {
    setProgress(((currentQuestion) / totalQuestions) * 100);
  }, [currentQuestion, totalQuestions]);

  const handleAnswerSelect = (answerData) => {
    setSelectedAnswer(answerData);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const currentQ = questions[currentQuestion];
    
    // Store answer in the format the API expects: {questionId: answer}
    const newAnswers = { ...answers };
    newAnswers[currentQ.id] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Check if we already have an answer for the next question
      const nextQ = questions[currentQuestion + 1];
      const existingAnswer = newAnswers[nextQ.id];
      setSelectedAnswer(existingAnswer || null);
    } else {
      // Quiz is completed - store answers
      setIsCompleted(true);
      sessionStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
      
      // Check if user is authenticated before showing results
      if (isAuthenticated()) {
        router.push('/results/');
      } else {
        setShowSignupModal(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQ = questions[currentQuestion - 1];
      const existingAnswer = answers[prevQ.id];
      setSelectedAnswer(existingAnswer || null);
    }
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      'skills': 'bg-blue-100 text-blue-800',
      'values': 'bg-green-100 text-green-800', 
      'temperament': 'bg-purple-100 text-purple-800',
      'ambitions': 'bg-orange-100 text-orange-800'
    };
    return colors[dimension] || 'bg-gray-100 text-gray-800';
  };

  // Function to render different question types
  const renderQuestionContent = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedAnswer === option.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === option.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );
      
      case 'scale':
        const scaleMin = question.scale?.min || 1;
        const scaleMax = question.scale?.max || 5;
        const labels = question.scale?.labels || {};
        return (
          <div className="space-y-3">
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => {
              const value = scaleMin + i;
              const isSelected = selectedAnswer === value.toString();
              const label = labels[value] || `Option ${value}`;
              
              return (
                <button
                  key={value}
                  onClick={() => handleAnswerSelect(value.toString())}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="text-white text-xs font-bold">✓</div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-800 font-medium block">
                        {label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      
      case 'ranking':
        const rankingOptions = question.options || [];
        const currentRanking = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Drag or click to rank these options from most important (top) to least important (bottom):
            </p>
            {rankingOptions.map((option, index) => {
              const currentRank = currentRanking.indexOf(option.id) + 1;
              const isSelected = currentRank > 0;
              return (
                <button
                  key={index}
                  onClick={() => {
                    let newRanking = [...currentRanking];
                    if (isSelected) {
                      // Remove from ranking
                      newRanking = newRanking.filter(id => id !== option.id);
                    } else {
                      // Add to end of ranking
                      newRanking.push(option.id);
                    }
                    handleAnswerSelect(newRanking);
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">
                      {option.text}
                    </span>
                    {isSelected && (
                      <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        #{currentRank}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      
      case 'multiple_select':
        const selectedOptions = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select all that apply:
            </p>
            {question.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <button
                  key={index}
                  onClick={() => {
                    let newSelection = [...selectedOptions];
                    if (isSelected) {
                      newSelection = newSelection.filter(id => id !== option.id);
                    } else {
                      newSelection.push(option.id);
                    }
                    handleAnswerSelect(newSelection);
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="text-white text-xs font-bold">✓</div>
                      )}
                    </div>
                    <span className="text-gray-800 font-medium">
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  if (isCompleted) {
    if (!isAuthenticated()) {
      // Show signup gate for quiz results
      return (
        <Layout
          title="Assessment Complete - Create Your Account - IndustryCareerGuide"
          description="Your career assessment is complete. Create a free account to view your personalized career match results."
        >
          <div className="section-padding bg-primary-50 min-h-screen flex items-center">
            <div className="container-max max-w-3xl text-center">
              <div className="animate-fade-in">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                  ✓
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  🎉 Assessment Complete!
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Congratulations! You've completed our comprehensive 25-question career assessment. 
                  We've analyzed your skills, values, and preferences to find your perfect industry matches.
                </p>
                
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🔓 Create Your Free Account to Unlock:
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Personalized Career Matches</h3>
                          <p className="text-sm text-gray-600">See your top career recommendations with match scores</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Career Radar Chart</h3>
                          <p className="text-sm text-gray-600">Visual breakdown of your skills and preferences</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Interactive Career Maps</h3>
                          <p className="text-sm text-gray-600">Explore career progression paths and timelines</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Action Plan Previews</h3>
                          <p className="text-sm text-gray-600">Compare roadmaps for your top 3 matches</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Detailed Match Analysis</h3>
                          <p className="text-sm text-gray-600">Understand why each career aligns with your profile</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-green-500 mt-1 mr-3">✓</span>
                        <div>
                          <h3 className="font-semibold">Save Your Progress</h3>
                          <p className="text-sm text-gray-600">Access your results anytime from any device</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="btn-primary text-lg px-8 py-4 mb-4 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  🚀 Create Free Account & See My Results
                </button>
                
                <p className="text-sm text-gray-500 mb-6">
                  It takes less than 30 seconds • No spam, ever • Cancel anytime
                </p>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setShowSignupModal(true);
                        // The modal can handle switching to login mode
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium underline"
                    >
                      Sign in to see results
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      );
    }
    
    // User is authenticated - show processing screen before redirect
    return (
      <Layout 
        title="Processing Your Results - IndustryCareerGuide"
        description="We're analyzing your career assessment responses to provide personalized recommendations."
      >
        <div className="section-padding bg-primary-50">
          <div className="container-max max-w-2xl text-center">
            <div className="animate-fade-in">
              <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✓
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Results...</h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for completing the career assessment. We&apos;re analyzing your responses to provide personalized recommendations.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Layout 
      title={`Career Assessment - Question ${currentQuestion + 1} of ${totalQuestions}`}
      description="Complete our comprehensive career assessment to discover your ideal industry career path."
      canonicalUrl="/quiz/"
    >
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container-max">
            <div className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-padding">
          <div className="container-max max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDimensionColor(currentQ.category || 'Skills')}`}>
                    {(currentQ.category || 'Skills').charAt(0).toUpperCase() + (currentQ.category || 'Skills').slice(1)}
                  </span>
                  {currentQ.subdimension && (
                    <span className="text-sm text-gray-500">
                      • {currentQ.subdimension}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {currentQ.question}
                </h1>
                <p className="text-gray-600">
                  {currentQ.description}
                </p>
              </div>

              <div className="mb-8">
                {renderQuestionContent(currentQ)}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <div className="text-sm text-gray-500">
                  {currentQuestion + 1} / {totalQuestions}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestion === totalQuestions - 1 ? 'Complete Assessment' : 'Next →'}
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 Choose the answer that best reflects your preferences and working style. 
                There are no right or wrong answers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal for Quiz Results */}
      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        mode="signup"
        onSuccess={(userData) => {
          console.log('User signed up after quiz:', userData);
          setShowSignupModal(false);
          // Redirect to results after successful signup
          router.push('/results/');
        }}
      />
    </Layout>
  );
};

export default QuizPage;