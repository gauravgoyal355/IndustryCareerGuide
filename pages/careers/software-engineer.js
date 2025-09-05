import React from 'react';
import Layout from '../../components/Layout';
import DynamicCareerTimeline from '../../components/DynamicCareerTimeline';

const SoftwareEngineerCareer = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Software Engineer Career Path
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the complete career progression for Software Engineers, including salary expectations, 
              timeline projections, and pivot opportunities optimized for PhD professionals.
            </p>
          </div>

          <DynamicCareerTimeline 
            careerKey="software_engineering"
            interactive={true}
            showPivots={true}
          />

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">PhD Advantages</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Complex problem-solving and algorithmic thinking</li>
                <li>• Mathematical modeling for advanced system architecture</li>
                <li>• Research methodology for systematic debugging</li>
                <li>• Academic rigor for code quality and documentation</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">Transition Tips</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Highlight algorithmic research as &apos;software optimization&apos;</li>
                <li>• Frame research tools as &apos;full-stack development&apos;</li>
                <li>• Position collaboration as &apos;agile team development&apos;</li>
                <li>• Emphasize reproducible analysis as &apos;testing frameworks&apos;</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Target Industries & Companies</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {['Tech', 'SaaS', 'FinTech', 'HealthTech'].map(industry => (
                    <span key={industry} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">PhD-Friendly Companies</h4>
                <div className="flex flex-wrap gap-2">
                  {['Google', 'Meta', 'Microsoft', 'OpenAI', 'DeepMind', 'Anthropic'].map(company => (
                    <span key={company} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SoftwareEngineerCareer;