import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import CareerMap from '../../components/CareerMap';
import careerTrajectories from '../../data/careerTrajectories.json';
import careerTaxonomy from '../../data/career_taxonomy.json';

const CareerMapPage = () => {
  const router = useRouter();
  const { path } = router.query;
  const [selectedCareerPath, setSelectedCareerPath] = useState(path || 'data_scientist');
  const [showPivots, setShowPivots] = useState(true);

  const careerPaths = Object.keys(careerTrajectories.trajectories || {});

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
    return careerTrajectories.trajectories[careerPath]?.name || 
           careerPath.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCareerCategory = (careerPath) => {
    const career = careerTaxonomy.career_paths.find(c => c.id === careerPath);
    return career?.category || 'Other';
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
    return categories;
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
                  <li>• Click on career stages to expand detailed information</li>
                  <li>• Review skill requirements for each progression level</li>
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
              <a
                href="https://industryresume.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Optimize Resume
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
                    {careerTrajectories.trajectories[path]?.timeline_years || 'View career progression'}
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