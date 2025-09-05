import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const CareersIndex = () => {
  const careers = [
    {
      key: 'data-scientist',
      name: 'Data Scientist',
      description: 'Analyze complex datasets and build predictive models',
      remoteFriendly: true,
      industries: ['Tech', 'Biotech', 'Finance', 'Healthcare']
    },
    {
      key: 'software-engineer',
      name: 'Software Engineer',
      description: 'Design and develop software applications and systems',
      remoteFriendly: true,
      industries: ['Tech', 'SaaS', 'FinTech', 'HealthTech']
    },
    {
      key: 'product-manager',
      name: 'Product Manager',
      description: 'Guide product strategy and coordinate cross-functional teams',
      remoteFriendly: true,
      industries: ['Tech', 'SaaS', 'FinTech', 'HealthTech']
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Career Timelines
            </h1>
            <p className="text-lg text-gray-600">
              Explore detailed career progression paths with salary expectations and pivot opportunities, 
              optimized for PhD professionals transitioning to industry.
            </p>
          </div>

          <div className="grid gap-6">
            {careers.map((career) => (
              <Link 
                key={career.key} 
                href={`/careers/${career.key}`}
                className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {career.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {career.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {career.industries.map(industry => (
                        <span key={industry} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {industry}
                        </span>
                      ))}
                    </div>

                    {career.remoteFriendly && (
                      <div className="flex items-center text-green-600 text-sm">
                        <span className="mr-2">🏠</span>
                        Remote-Friendly
                      </div>
                    )}
                  </div>
                  
                  <div className="text-blue-600 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">More Careers Coming Soon</h3>
              <p className="text-blue-700">
                We&apos;re building timeline visualizations for all 31 career paths in our database. 
                Check back soon for more detailed career progression maps!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CareersIndex;