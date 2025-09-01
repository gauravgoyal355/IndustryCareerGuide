import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const HomePage = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Personalized Assessment',
      description: 'Take our comprehensive quiz to discover career paths that match your skills, values, and ambitions.'
    },
    {
      icon: '🗺️',
      title: 'Interactive Career Maps',
      description: 'Explore detailed career trajectories with timelines, skills, and salary progressions for each path.'
    },
    {
      icon: '📋',
      title: 'Actionable Plans',
      description: 'Get personalized action plans with course recommendations, certifications, and milestone timelines.'
    },
    {
      icon: '📄',
      title: 'Resume Optimization',
      description: 'Access specialized resume templates and guides optimized for industry transitions.'
    }
  ];

  const careerPaths = [
    'data_scientist',
    'research_scientist',
    'product_management',
    'technical_consulting',
    'software_engineering',
    'program_management'
  ];


  return (
    <Layout
      title="IndustryCareerGuide - STEM PhD Career Transition Platform"
      description="Interactive career assessment and guidance for STEM PhDs transitioning to industry. Personalized career paths, action plans, and resume optimization."
      canonicalUrl="/"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-purple-50 section-padding">
        <div className="container-max">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Transform Your
              <span className="text-gradient block">PhD into Industry Success</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in animation-delay-200">
              The comprehensive career guidance platform designed specifically for STEM PhDs and postdocs transitioning to industry roles. 
              Get personalized assessments, career maps, and actionable plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              <Link href="/quiz/" className="btn-primary text-lg px-8 py-3">
                Take Free Assessment
              </Link>
              <Link href="/careerMap/" className="btn-secondary text-lg px-8 py-3">
                Explore Career Paths
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Career Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform guides you through every step of your career transition
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths Preview */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Popular Career Paths
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover detailed career trajectories with skills, timelines, and salary progressions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {careerPaths.map((path, index) => (
              <div key={index} className="animate-slide-up bg-white rounded-lg shadow p-6" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-semibold mb-2">
                  {path.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-gray-600">Explore this career path with detailed progression maps.</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/careerMap/" className="btn-primary text-lg px-8 py-3">
              View All Career Paths
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-primary-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your career
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Take Assessment</h3>
              <p className="text-gray-600">
                Complete our comprehensive 25-question quiz to identify your strengths, values, and career preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Matched</h3>
              <p className="text-gray-600">
                Receive personalized career path recommendations with detailed progression maps and requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Take Action</h3>
              <p className="text-gray-600">
                Follow your personalized action plan with course recommendations, milestones, and resume optimization.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/quiz/" className="btn-primary text-lg px-8 py-3">
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 section-padding text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Start your journey to a rewarding industry career with personalized guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz/" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Take Free Assessment
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;