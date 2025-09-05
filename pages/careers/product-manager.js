import React from 'react';
import Layout from '../../components/Layout';
import DynamicCareerTimeline from '../../components/DynamicCareerTimeline';

const ProductManagerCareer = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Product Manager Career Path
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the complete career progression for Product Managers, including salary expectations, 
              timeline projections, and pivot opportunities optimized for PhD professionals.
            </p>
          </div>

          <DynamicCareerTimeline 
            careerKey="product_manager"
            interactive={true}
            showPivots={true}
          />

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">PhD Advantages</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Analytical thinking for data-driven product decisions</li>
                <li>• Research methodology for user discovery and validation</li>
                <li>• Technical depth for complex product architecture</li>
                <li>• Academic presentation skills for stakeholder communication</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">Transition Tips</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Highlight user research as 'product discovery frameworks'</li>
                <li>• Frame project management as 'cross-functional leadership'</li>
                <li>• Position technical expertise as 'engineering collaboration'</li>
                <li>• Emphasize impact metrics as 'product success measurement'</li>
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
                  {['Google', 'Meta', 'Uber', 'Stripe', 'Notion', 'Figma'].map(company => (
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

export default ProductManagerCareer;