import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import CareerMap from '../../components/CareerMap';
import careerTrajectories from '../../data/careerTrajectories.json';
import careerData from '../../data/careerTimelineData_PhDOptimized.json';
import careerTaxonomy from '../../data/career_taxonomy.json';

const CareerMapPage = () => {
  const router = useRouter();
  const { path } = router.query;
  const [selectedCareerPath, setSelectedCareerPath] = useState(path || 'data_scientist');
  const [showPivots, setShowPivots] = useState(true);

  const careerPaths = Object.keys(careerData.career_timelines || {});

  useEffect(() => {
    if (path && careerPaths.includes(path)) {
      setSelectedCareerPath(path);
    }
  }, [path, careerPaths]);

  const handleCareerPathChange = (newPath) => {
    setSelectedCareerPath(newPath);
    router.push(`/careerMap/?path=${newPath}`, undefined, { shallow: true });
  };

  const getCareerPathDisplayName = (careerPath) => {
    return careerData.career_timelines[careerPath]?.name || 
           careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCareerCategory = (careerPath) => {
    // Smart categorization for PhD professionals
    const categoryMap = {
      // Data & Analytics
      'data_scientist': 'Data & Analytics',
      'data_analyst': 'Data & Analytics', 
      'biostatistician': 'Data & Analytics',
      'quantitative_analyst': 'Data & Analytics',
      'market_analyst': 'Data & Analytics',
      'market_research_analyst': 'Data & Analytics',
      'public_health_analyst': 'Data & Analytics',
      'financial_analyst': 'Data & Analytics',
      
      // Technology & Engineering
      'software_engineering': 'Technology & Engineering',
      'ai_ml_engineer': 'Technology & Engineering',
      'devops_engineer': 'Technology & Engineering',
      'systems_engineer': 'Technology & Engineering',
      'cybersecurity_analyst': 'Technology & Engineering',
      'biomedical_engineer': 'Technology & Engineering',
      'chemical_engineer': 'Technology & Engineering',
      'electrical_engineer': 'Technology & Engineering',
      'mechanical_engineer': 'Technology & Engineering',
      'materials_scientist': 'Technology & Engineering',
      
      // Research & Development  
      'research_scientist': 'Research & Development',
      'r_and_d_scientist': 'Research & Development',
      'bioinformatics_scientist': 'Research & Development',
      'process_development_scientist': 'Research & Development',
      'digital_health_scientist': 'Research & Development',
      'environmental_scientist': 'Research & Development',
      
      // Business & Strategy
      'product_manager': 'Business & Strategy',
      'management_consultant': 'Business & Strategy', 
      'technical_consulting': 'Business & Strategy',
      'business_development_manager': 'Business & Strategy',
      'program_management': 'Business & Strategy',
      'operations_manager': 'Business & Strategy',
      'venture_capital_analyst': 'Business & Strategy',
      'entrepreneur_startup_founder': 'Business & Strategy',
      
      // Healthcare & Life Sciences
      'medical_science_liaison': 'Healthcare & Life Sciences',
      'clinical_research_associate': 'Healthcare & Life Sciences',
      'clinical_data_manager': 'Healthcare & Life Sciences',
      'regulatory_affairs_specialist': 'Healthcare & Life Sciences',
      'quality_assurance_specialist': 'Healthcare & Life Sciences',
      
      // Communication & Creative
      'ux_researcher': 'Communication & Creative',
      'scientific_writer': 'Communication & Creative',
      'technical_writer': 'Communication & Creative',
      'copywriter': 'Communication & Creative',
      'science_communicator': 'Communication & Creative',
      'science_illustrator': 'Communication & Creative',
      
      // Policy & Social Impact
      'science_policy_analyst': 'Policy & Social Impact',
      'education_and_outreach_specialist': 'Policy & Social Impact',
      'ngo_researcher': 'Policy & Social Impact',
      'nonprofit_program_manager': 'Policy & Social Impact',
      
      // Legal & IP
      'intellectual_property_analyst': 'Legal & Intellectual Property',
      'technology_transfer_officer': 'Legal & Intellectual Property'
    };
    
    return categoryMap[careerPath] || 'Other';
  };

  const careersByCategory = () => {
    const categories = {};
    careerPaths.forEach(path => {
      const category = getCareerCategory(path);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(path);
    });
    
    // Define the desired order of categories
    const categoryOrder = [
      'Research & Development',
      'Healthcare & Life Sciences', 
      'Data & Analytics',
      'Technology & Engineering',
      'Business & Strategy',
      'Communication & Creative',
      'Policy & Social Impact',
      'Legal & Intellectual Property'
    ];
    
    // Return categories in the specified order
    const orderedCategories = {};
    categoryOrder.forEach(category => {
      if (categories[category]) {
        orderedCategories[category] = categories[category];
      }
    });
    
    // Add any remaining categories not in the order list
    Object.keys(categories).forEach(category => {
      if (!orderedCategories[category]) {
        orderedCategories[category] = categories[category];
      }
    });
    
    return orderedCategories;
  };

  const categorizedCareers = careersByCategory();

  return (
    <Layout
      title={`${getCareerPathDisplayName(selectedCareerPath)} Career Map - IndustryCareerGuide`}
      description={`Explore the ${getCareerPathDisplayName(selectedCareerPath)} career path with detailed progression maps, skills requirements, and salary information.`}
      canonicalUrl="/careerMap/"
    >
      <div className="bg-gray-50 min-h-screen">
        <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white section-padding">
          <div className="container-max text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Interactive Career Maps
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Explore detailed career progression paths with skills, timelines, and salary information for STEM industry roles.
            </p>
          </div>
        </section>

        <section className="bg-white border-b">
          <div className="container-max py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Career Path to Explore
                </h2>
                <p className="text-gray-600">
                  Choose from our comprehensive collection of STEM industry career paths
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <select
                  value={selectedCareerPath}
                  onChange={(e) => handleCareerPathChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-72"
                >
                  {Object.entries(categorizedCareers).map(([category, paths]) => (
                    <optgroup key={category} label={`${category} Careers`}>
                      {paths.map((path) => (
                        <option key={path} value={path}>
                          {getCareerPathDisplayName(path)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showPivots}
                      onChange={(e) => setShowPivots(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Show Pivot Opportunities
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <CareerMap 
            careerPath={selectedCareerPath}
            showPivots={showPivots}
            interactive={true}
          />
        </section>

        <section className="bg-white section-padding border-t">
          <div className="container-max">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  💡 How to Use This Map
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Hover over career bubbles to see detailed progression information</li>
                  <li>• Review skills needed to advance to the next career level</li>
                  <li>• Explore pivot opportunities to related career paths</li>
                  <li>• Use salary ranges to plan your financial trajectory</li>
                </ul>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎯 Next Steps
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Take our career assessment for personalized matches</li>
                  <li>• Generate a custom action plan for your chosen path</li>
                  <li>• Optimize your resume for industry applications</li>
                  <li>• Connect with professionals in your target field</li>
                </ul>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 Data Sources
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Industry salary surveys and job market data</li>
                  <li>• Professional networking platform insights</li>
                  <li>• Career transition success stories</li>
                  <li>• Expert interviews and industry analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary-50 section-padding">
          <div className="container-max text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Take action on your career transition with our comprehensive tools and resources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quiz/" className="btn-primary text-lg px-8 py-3">
                Take Career Assessment
              </Link>
              <a href={`/actionPlan/?career=${selectedCareerPath}`} className="btn-secondary text-lg px-8 py-3">
                Get Action Plan
              </a>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 section-padding lg:hidden">
          <div className="container-max">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Explore Other Career Paths
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careerPaths.filter(path => path !== selectedCareerPath).map((path) => (
                <button
                  key={path}
                  onClick={() => handleCareerPathChange(path)}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getCareerPathDisplayName(path)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    View career progression timeline
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CareerMapPage;