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
  const [isGenericFlow, setIsGenericFlow] = useState(!career); // New: track if this is generic flow

  const availableCareers = Object.keys(careerPaths.career_paths);

  // Debug logging
  console.log('ActionPlan State:', {
    isGenericFlow,
    selectedCareer,
    hasQuizData,
    userProfileKeys: Object.keys(userProfile),
    showProfileForm
  });

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

  // Handle generic form submission - use new narrative-driven approach
  const handleGenericFormSubmit = async (formData) => {
    console.log('Generic form submitted:', formData);
    
    try {
      // Call the new GAP API
      const response = await fetch('/api/genericActionPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: formData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('GAP API response:', data);

      // Set up state for the enhanced action plan
      setUserProfile({ ...formData, enhancedActionPlan: data.actionPlan });
      setSelectedCareer('gap_enhanced'); // Special marker for GAP
      setIsGenericFlow(false); // Switch to show action plan
      
    } catch (error) {
      console.error('Error generating GAP:', error);
      // Fallback to old approach
      const recommendedCareer = getSmartCareerRecommendation(formData);
      setUserProfile(formData);
      setSelectedCareer(recommendedCareer);
      setIsGenericFlow(false);
    }
  };

  // Simplified career recommendation algorithm for single interest
  const getSmartCareerRecommendation = (profile) => {
    const { primaryInterest, phdArea, careerStage } = profile;
    
    // Broad interest to career category mapping
    const interestToCareerMap = {
      'Data/Analytics': 'data_analytics_career',
      'Technology/Engineering': 'technology_engineering_career', 
      'Product/Strategy': 'product_strategy_career',
      'Consulting': 'consulting_career',
      'Business/Finance': 'business_finance_career',
      'R&D/Innovation': 'research_innovation_career',
      'Healthcare/Biotech': 'healthcare_biotech_career',
      'Entrepreneurship': 'entrepreneurship_career',
      'Science Communication': 'communication_career',
      'Policy/Advocacy': 'policy_advocacy_career'
    };

    // Get base career from interest
    let recommendedCareer = interestToCareerMap[primaryInterest] || 'data_scientist';
    
    // Apply PhD background adjustments for better fit
    if (phdArea === 'neuroscience' && primaryInterest === 'Data/Analytics') {
      recommendedCareer = 'data_scientist'; // Perfect match
    } else if (phdArea === 'molecular_biology' && primaryInterest === 'Consulting') {
      recommendedCareer = 'technical_consulting'; // Biotech consulting
    } else if (['physics', 'mathematics', 'statistics'].includes(phdArea) && primaryInterest === 'Data/Analytics') {
      recommendedCareer = 'data_scientist'; // Strong technical background
    } else if (careerStage === 'senior_researcher' && primaryInterest === 'Entrepreneurship') {
      recommendedCareer = 'technical_consulting'; // Senior experience + business acumen
    }

    console.log('GAP Smart recommendation:', {
      primaryInterest,
      phdArea, 
      careerStage,
      recommendedCareer,
      mappingExists: interestToCareerMap[primaryInterest] ? 'Yes' : 'No'
    });
    
    return recommendedCareer;
  };

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

  // Generic Action Plan Form (for career-agnostic instant gratification)
  const GenericActionPlanForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      careerStage: '',
      phdArea: '',
      targetTimeframe: '',
      primaryInterest: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    // No longer needed - using radio buttons for single selection

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Get Your Instant Action Plan
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          Tell us about your background and get an immediate career transition roadmap.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Career Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What stage are you at? *
            </label>
            <select
              value={formData.careerStage}
              onChange={(e) => setFormData({...formData, careerStage: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select your current stage</option>
              <option value="masters_student">Master's Student</option>
              <option value="early_phd">Early Stage PhD Student</option>
              <option value="late_phd">Late Stage PhD Student</option>
              <option value="recent_postdoc">Recent Postdoc</option>
              <option value="experienced_postdoc">Experienced Postdoc</option>
              <option value="senior_researcher">Senior Researcher</option>
            </select>
          </div>

          {/* PhD Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select area closest to your PhD *
            </label>
            <select
              value={formData.phdArea}
              onChange={(e) => setFormData({...formData, phdArea: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select PhD area</option>
              <option value="none">None (Master's level)</option>
              
              <optgroup label="Life Sciences">
                <option value="biology">Biology</option>
                <option value="biochemistry">Biochemistry</option>
                <option value="molecular_biology">Molecular Biology</option>
                <option value="neuroscience">Neuroscience</option>
                <option value="genetics">Genetics</option>
                <option value="microbiology">Microbiology</option>
                <option value="immunology">Immunology</option>
              </optgroup>
              
              <optgroup label="Physical Sciences">
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="materials_science">Materials Science</option>
              </optgroup>
              
              <optgroup label="Engineering">
                <option value="mechanical_engineering">Mechanical Engineering</option>
                <option value="electrical_engineering">Electrical Engineering</option>
                <option value="chemical_engineering">Chemical Engineering</option>
                <option value="biomedical_engineering">Biomedical Engineering</option>
              </optgroup>
              
              <optgroup label="Mathematical Sciences">
                <option value="mathematics">Mathematics</option>
                <option value="statistics">Statistics</option>
                <option value="computer_science">Computer Science</option>
              </optgroup>
              
              <optgroup label="Other">
                <option value="other">Other</option>
              </optgroup>
            </select>
          </div>

          {/* Career Interest (Single Selection) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of career interests you most? (select one) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Data/Analytics', 
                'Product/Strategy', 
                'Consulting', 
                'R&D/Innovation', 
                'Business/Finance', 
                'Technology/Engineering', 
                'Healthcare/Biotech', 
                'Entrepreneurship',
                'Science Communication',
                'Policy/Advocacy'
              ].map(interest => (
                <label key={interest} className="flex items-center">
                  <input
                    type="radio"
                    name="primaryInterest"
                    value={interest}
                    checked={formData.primaryInterest === interest}
                    onChange={(e) => setFormData({...formData, primaryInterest: e.target.value})}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Transition Timeline
            </label>
            <select
              value={formData.targetTimeframe}
              onChange={(e) => setFormData({...formData, targetTimeframe: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="short">ASAP (3-6 months)</option>
              <option value="medium">Medium term (6-12 months)</option>
              <option value="long">Long term (12+ months)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!formData.careerStage || !formData.phdArea || !formData.primaryInterest}
            className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate My Action Plan
          </button>
        </form>
      </div>
    );
  };

  // Profile Form for personalized (post-quiz) action plans
  const ProfileForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      careerStage: '',
      phdArea: '',
      targetTimeframe: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    // No longer needed - using radio buttons for single selection

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tell us about your background
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What stage are you at?
            </label>
            <select
              value={formData.careerStage}
              onChange={(e) => setFormData({...formData, careerStage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select your current stage</option>
              <option value="masters_student">Master's Student</option>
              <option value="early_phd">Early Stage PhD Student</option>
              <option value="late_phd">Late Stage PhD Student</option>
              <option value="recent_postdoc">Recent Postdoc</option>
              <option value="experienced_postdoc">Experienced Postdoc</option>
              <option value="senior_researcher">Senior Researcher</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select area closest to your PhD
            </label>
            <select
              value={formData.phdArea}
              onChange={(e) => setFormData({...formData, phdArea: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select PhD area</option>
              <option value="none">None (Master's level)</option>
              
              {/* Life Sciences */}
              <optgroup label="Life Sciences">
                <option value="biology">Biology</option>
                <option value="biochemistry">Biochemistry</option>
                <option value="molecular_biology">Molecular Biology</option>
                <option value="cell_biology">Cell Biology</option>
                <option value="genetics">Genetics</option>
                <option value="microbiology">Microbiology</option>
                <option value="immunology">Immunology</option>
                <option value="neuroscience">Neuroscience</option>
                <option value="pharmacology">Pharmacology</option>
                <option value="biotechnology">Biotechnology</option>
                <option value="bioinformatics">Bioinformatics</option>
                <option value="ecology">Ecology</option>
                <option value="marine_biology">Marine Biology</option>
              </optgroup>
              
              {/* Physical Sciences */}
              <optgroup label="Physical Sciences">
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="materials_science">Materials Science</option>
                <option value="astronomy">Astronomy</option>
                <option value="earth_sciences">Earth Sciences</option>
                <option value="environmental_science">Environmental Science</option>
                <option value="atmospheric_science">Atmospheric Science</option>
                <option value="geophysics">Geophysics</option>
                <option value="physical_chemistry">Physical Chemistry</option>
                <option value="organic_chemistry">Organic Chemistry</option>
                <option value="inorganic_chemistry">Inorganic Chemistry</option>
              </optgroup>
              
              {/* Engineering */}
              <optgroup label="Engineering">
                <option value="mechanical_engineering">Mechanical Engineering</option>
                <option value="electrical_engineering">Electrical Engineering</option>
                <option value="chemical_engineering">Chemical Engineering</option>
                <option value="civil_engineering">Civil Engineering</option>
                <option value="biomedical_engineering">Biomedical Engineering</option>
                <option value="computer_engineering">Computer Engineering</option>
                <option value="aerospace_engineering">Aerospace Engineering</option>
                <option value="materials_engineering">Materials Engineering</option>
                <option value="environmental_engineering">Environmental Engineering</option>
                <option value="industrial_engineering">Industrial Engineering</option>
              </optgroup>
              
              {/* Mathematical Sciences */}
              <optgroup label="Mathematical Sciences">
                <option value="mathematics">Mathematics</option>
                <option value="statistics">Statistics</option>
                <option value="applied_mathematics">Applied Mathematics</option>
                <option value="computational_mathematics">Computational Mathematics</option>
                <option value="operations_research">Operations Research</option>
              </optgroup>
              
              {/* Computer Science */}
              <optgroup label="Computer Science">
                <option value="computer_science">Computer Science</option>
                <option value="artificial_intelligence">Artificial Intelligence</option>
                <option value="machine_learning">Machine Learning</option>
                <option value="data_science">Data Science</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="software_engineering">Software Engineering</option>
                <option value="human_computer_interaction">Human-Computer Interaction</option>
              </optgroup>
              
              {/* Medical/Health Sciences */}
              <optgroup label="Medical/Health Sciences">
                <option value="medicine">Medicine (MD/PhD)</option>
                <option value="public_health">Public Health</option>
                <option value="epidemiology">Epidemiology</option>
                <option value="biostatistics">Biostatistics</option>
                <option value="health_policy">Health Policy</option>
                <option value="clinical_research">Clinical Research</option>
              </optgroup>
              
              {/* Social Sciences */}
              <optgroup label="Social Sciences">
                <option value="psychology">Psychology</option>
                <option value="economics">Economics</option>
                <option value="sociology">Sociology</option>
                <option value="political_science">Political Science</option>
                <option value="anthropology">Anthropology</option>
                <option value="cognitive_science">Cognitive Science</option>
              </optgroup>
              
              {/* Other */}
              <optgroup label="Other">
                <option value="interdisciplinary">Interdisciplinary</option>
                <option value="other">Other</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary career interests (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Data/Analytics', 
                'Product/Strategy', 
                'Consulting', 
                'R&D/Innovation', 
                'Business/Finance', 
                'Technology/Engineering', 
                'Healthcare/Biotech', 
                'Entrepreneurship',
                'Remote Work',
                'Science Communication',
                'Policy/Advocacy',
                'Teaching/Training',
                'Writing/Content',
                'Non-Profit/Impact'
              ].map(interest => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.primaryInterests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
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

  // Generic flow - show instant action plan form
  if (isGenericFlow && !selectedCareer) {
    return (
      <Layout
        title="Get Your Action Plan - IndustryCareerGuide"
        description="Get an instant, personalized action plan for your STEM PhD to industry career transition."
        canonicalUrl="/actionPlan/"
      >
        <div className="bg-gray-50 min-h-screen">
          <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white section-padding">
            <div className="container-max text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Get Your Instant Action Plan
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Tell us about your background and career interests, and get an immediate customized roadmap for your industry transition.
              </p>
            </div>
          </section>

          <section className="section-padding">
            <div className="container-max">
              <GenericActionPlanForm onSubmit={handleGenericFormSubmit} />
              
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">
                  Want even more personalized recommendations?
                </p>
                <Link href="/quiz/" className="text-primary-600 hover:text-primary-700 font-medium">
                  Take our comprehensive career assessment first →
                </Link>
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
          isGenericFlow={true}
        />
      </Layout>
    );
  }

  // If we have a selected career but no quiz/profile data, show the profile form
  // But first try to generate action plan with what we have
  if (selectedCareer && !hasQuizData && Object.keys(userProfile).length === 0 && !showProfileForm) {
    // Try to generate action plan anyway - the API can work with minimal data
    return (
      <Layout
        title={`${getCareerDisplayName(selectedCareer)} Action Plan - IndustryCareerGuide`}
        description={`Your personalized action plan for transitioning to ${getCareerDisplayName(selectedCareer)} with courses, certifications, and milestones.`}
        canonicalUrl={`/actionPlan/?career=${selectedCareer}`}
      >
        <ActionPlan 
          quizAnswers={quizAnswers || {}}
          topCareerMatch={selectedCareer}
          userProfile={userProfile}
          isGenericFlow={isGenericFlow}
        />
      </Layout>
    );
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