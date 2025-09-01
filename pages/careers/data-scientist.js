import React from 'react';
import Layout from '../../components/Layout';
import DynamicCareerTimeline from '../../components/DynamicCareerTimeline';
import careerData from '../../data/careerTimelineData_PhDOptimized.json';

const DataScientistCareer = () => {
  const career = careerData.career_timelines.data_scientist;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Data Scientist Career Path
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Complete career progression for Data Scientists, optimized for PhD and postdoc professionals 
              entering industry with advanced analytical and research skills.
            </p>
          </div>

          <DynamicCareerTimeline 
            careerKey="data_scientist"
            interactive={true}
            showPivots={true}
          />

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">PhD Advantages</h3>
              <ul className="space-y-2 text-blue-800">
                {career.phdAdvantages.map((advantage, index) => (
                  <li key={index}>• {advantage}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">PhD Transition Tips</h3>
              <ul className="space-y-2 text-green-800">
                {career.phdTransitionTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enhanced Pivot Opportunities Section */}
          <div className="mt-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Strategic Career Pivots</h3>
            <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              With {career.pivot_opportunities.length} distinct pivot paths, Data Scientists have exceptional flexibility to transition 
              into specialized roles that leverage their analytical foundation while opening new career trajectories.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {career.pivot_opportunities.map((pivot, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md border-l-4" style={{ borderLeftColor: pivot.color }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-900">{pivot.branchName}</h4>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {pivot.transitionSuccess} success
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Pivot from: <span className="font-semibold">{career.main_path[pivot.branchFromIndex]?.title}</span>
                    <span className="text-gray-500"> ({career.main_path[pivot.branchFromIndex]?.cumulativeYears}y experience)</span>
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-700 text-sm">Career Progression:</h5>
                    {pivot.stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{stage.shortTitle}</span>
                        <span className="text-gray-500 font-medium">{stage.salary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Target Industries & Companies</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {career.targetIndustries.map(industry => (
                    <span key={industry} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">PhD-Friendly Companies</h4>
                <div className="flex flex-wrap gap-2">
                  {career.phdFriendlyCompanies.map(company => (
                    <span key={company} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* How to Get Started - PhD/Postdoc Optimized */}
          <div className="mt-12 bg-indigo-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">How to Get Started (PhD/Postdoc)</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">🎓 Direct PhD Transition</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Entry Point:</span>
                    <span className="text-blue-600 font-semibold">Data Scientist</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Starting Salary:</span>
                    <span className="font-semibold">{career.main_path[0].salary}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Time to Senior:</span>
                    <span className="font-semibold">{career.main_path[0].timeToNext} years</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Negotiation Tip:</strong> {career.compensationNotes.phdNegotiationTip}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">🔬 Postdoc Bridge Path</h4>
                <div className="space-y-3">
                  {career.academicBridge.postdocTransition.map((step, index) => (
                    <div key={index} className="border-l-4 border-orange-300 pl-4">
                      <div className="font-semibold text-gray-900">{step.role}</div>
                      <div className="text-sm text-gray-600">
                        {step.duration && `Duration: ${step.duration}`}
                        {step.salary && ` • Salary: ${step.salary}`}
                        {step.transitionProbability && ` • Success Rate: ${step.transitionProbability}`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Equity Range:</strong> {career.compensationNotes.equityRange} • 
                    <strong> Bonus:</strong> {career.compensationNotes.bonusStructure}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DataScientistCareer;