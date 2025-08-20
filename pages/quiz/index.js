import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import quizData from '../../career_assessment_quiz.json';

const QuizPage = () => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const questions = quizData.questions;
  const totalQuestions = questions.length;

  useEffect(() => {
    setProgress(((currentQuestion) / totalQuestions) * 100);
  }, [currentQuestion, totalQuestions]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(newAnswers[currentQuestion + 1] || null);
    } else {
      setIsCompleted(true);
      sessionStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
      router.push('/results/');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      'Skills': 'bg-blue-100 text-blue-800',
      'Values': 'bg-green-100 text-green-800',
      'Temperament': 'bg-purple-100 text-purple-800',
      'Ambitions': 'bg-orange-100 text-orange-800'
    };
    return colors[dimension] || 'bg-gray-100 text-gray-800';
  };

  if (isCompleted) {
    return (
      <Layout 
        title="Quiz Completed - IndustryCareerGuide"
        description="Your career assessment is complete. View your personalized results."
      >
        <div className="section-padding bg-primary-50">
          <div className="container-max max-w-2xl text-center">
            <div className="animate-fade-in">
              <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✓
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDimensionColor(currentQ.dimension)}`}>
                    {currentQ.dimension}
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

              <div className="space-y-4 mb-8">
                {currentQ.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">
                        {choice.text}
                      </span>
                    </div>
                  </button>
                ))}
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
    </Layout>
  );
};

export default QuizPage;