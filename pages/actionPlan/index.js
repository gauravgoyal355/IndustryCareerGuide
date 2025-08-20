import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ActionPlan from '../../components/ActionPlan';
import careerPaths from '../../data/careerPaths.json';

const ActionPlanPage = () => {
  const router = useRouter();
  const { career } = router.query;
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(career || null);
  const [userProfile, setUserProfile] = useState({});
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [hasQuizData, setHasQuizData] = useState(false);

  const availableCareers = Object.keys(careerPaths.career_paths);

  useEffect(() => {
    const storedAnswers = sessionStorage.getItem('quizAnswers');
    
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers);
        setQuizAnswers(answers);
        setHasQuizData(true);
      } catch (err) {
        console.error('Error parsing quiz answers:', err);
      }
    }

    if (career && availableCareers.includes(career)) {
      setSelectedCareer(career);
    }
  }, [career, availableCareers]);

  const handleProfileSubmit = (profileData) => {
    setUserProfile(profileData);
    setShowProfileForm(false);
  };

  const handleCareerSelect = (careerPath) => {
    setSelectedCareer(careerPath);
    router.push(`/actionPlan/?career=${careerPath}`, undefined, { shallow: true });
  };

  const getCareerDisplayName = (careerPath) => {
    return careerPaths.career_paths[careerPath]?.name || 
           careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const ProfileForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      yearsExperience: '',
      hasPhD: true,
      currentRole: '',
      targetTimeframe: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        yearsExperience: parseInt(formData.yearsExperience) || 0
      });
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tell us about your background
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Research Experience
            </label>
            <select
              value={formData.yearsExperience}
              onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select experience level</option>
              <option value="0">0-1 years (PhD student)</option>
              <option value="2">2-3 years (Recent PhD/Postdoc)</option>
              <option value="4">4-6 years (Experienced Postdoc)</option>
              <option value="7">7+ years (Senior Researcher)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Level
            </label>
            <select
              value={formData.hasPhD}
              onChange={(e) => setFormData({...formData, hasPhD: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="true">PhD or equivalent</option>
              <option value="false">Master's degree</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Role (Optional)
            </label>
            <input
              type="text"
              value={formData.currentRole}
              onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
              placeholder="e.g., Postdoc, PhD Student, Research Scientist"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Transition Timeline
            </label>
            <select
              value={formData.targetTimeframe}
              onChange={(e) => setFormData({...formData, targetTimeframe: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select timeframe</option>
              <option value="immediate">Immediate (0-3 months)</option>
              <option value="short">Short-term (3-6 months)</option>
              <option value="medium">Medium-term (6-12 months)</option>
              <option value="long">Long-term (12+ months)</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 btn-primary">
              Create Action Plan
            </button>
            <button type="button" onClick={onCancel} className="flex-1 btn-secondary">
              Skip
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (!hasQuizData && !selectedCareer) {
    return (
      <Layout
        title="Create Your Action Plan - IndustryCareerGuide"
        description="Generate a personalized action plan for your STEM PhD to industry career transition."
        canonicalUrl="/actionPlan/"
      >
        <div className="bg-gray-50 min-h-screen">
          <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white section-padding">
            <div className="container-max text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Create Your Personalized Action Plan
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Get a customized roadmap with courses, certifications, and milestones for your industry transition.
              </p>
            </div>
          </section>

          <section className="section-padding">
            <div className="container-max max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choose Your Target Career Path
                </h2>
                <p className="text-gray-600 mb-8">
                  Select the career path you&apos;re most interested in pursuing, or take our assessment for personalized recommendations.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link href="/quiz/" className="btn-primary text-lg px-8 py-3">
                    Take Career Assessment First
                  </Link>
                  <span className="text-gray-500 self-center">or</span>
                  <button 
                    onClick={() => setShowProfileForm(true)}
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    Choose Career Below
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCareers.map((careerPath) => {
                  const career = careerPaths.career_paths[careerPath];
                  return (
                    <button
                      key={careerPath}
                      onClick={() => handleCareerSelect(careerPath)}
                      className="card text-left hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-primary-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {career.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {career.description}
                      </p>
                      <div className="text-sm text-primary-600 font-medium">
                        Click to create action plan →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (selectedCareer && showProfileForm) {
    return (
      <Layout
        title={`${getCareerDisplayName(selectedCareer)} Action Plan - IndustryCareerGuide`}
        description={`Create a personalized action plan for transitioning to ${getCareerDisplayName(selectedCareer)}.`}
      >
        <div className="bg-gray-50 min-h-screen">
          <section className="section-padding">
            <div className="container-max max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {getCareerDisplayName(selectedCareer)} Action Plan
                </h1>
                <p className="text-gray-600">
                  Help us customize your action plan with some basic information about your background.
                </p>
              </div>
              
              <ProfileForm 
                onSubmit={handleProfileSubmit}
                onCancel={() => setShowProfileForm(false)}
              />
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (selectedCareer && (hasQuizData || Object.keys(userProfile).length > 0)) {
    return (
      <Layout
        title={`${getCareerDisplayName(selectedCareer)} Action Plan - IndustryCareerGuide`}
        description={`Your personalized action plan for transitioning to ${getCareerDisplayName(selectedCareer)} with courses, certifications, and milestones.`}
        canonicalUrl={`/actionPlan/?career=${selectedCareer}`}
      >
        <ActionPlan 
          quizAnswers={quizAnswers}
          topCareerMatch={selectedCareer}
          userProfile={userProfile}
        />
      </Layout>
    );
  }

  if (selectedCareer && !showProfileForm) {
    setShowProfileForm(true);
  }

  return (
    <Layout
      title="Loading Action Plan - IndustryCareerGuide"
      description="Loading your personalized action plan."
    >
      <div className="section-padding bg-primary-50">
        <div className="container-max max-w-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Your Action Plan</h1>
          <p className="text-gray-600">
            We&apos;re preparing your personalized career transition roadmap...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ActionPlanPage;