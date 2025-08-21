import React from 'react';
import Link from 'next/link';
import SalaryTimelineGraph from '../components/SalaryTimelineGraph';

// Demo data that matches the careerTrajectories structure
const demoTrajectory = {
  "name": "Data Scientist",
  "timeline_years": "3-5 years to senior level",
  "stages": [
    {
      "title": "Junior Data Scientist",
      "level": "entry",
      "years_experience": "0-2",
      "typical_duration": "12-18 months",
      "salary_range": "$70K - $95K",
      "positions": ["Data Scientist I", "Associate Data Scientist", "Junior Data Analyst"],
      "core_skills": ["Python programming", "Statistics", "Data manipulation", "SQL", "Machine learning basics"],
      "developing_skills": ["Advanced ML algorithms", "Data visualization", "Business communication", "A/B testing"],
      "key_achievements": ["Complete first data science project end-to-end", "Deliver actionable insights to stakeholders"]
    },
    {
      "title": "Data Scientist",
      "level": "mid",
      "years_experience": "2-4",
      "typical_duration": "18-24 months",
      "salary_range": "$95K - $130K",
      "positions": ["Data Scientist II", "Data Scientist", "ML Engineer"],
      "core_skills": ["Advanced machine learning", "Statistical modeling", "Data visualization", "Business communication"],
      "developing_skills": ["Deep learning", "Big data technologies", "Team leadership", "Product analytics"],
      "key_achievements": ["Lead complex data science projects", "Mentor junior team members"]
    },
    {
      "title": "Senior Data Scientist",
      "level": "senior",
      "years_experience": "4-7",
      "typical_duration": "2-3 years",
      "salary_range": "$130K - $180K",
      "positions": ["Senior Data Scientist", "Lead Data Scientist", "Principal Data Scientist"],
      "core_skills": ["Advanced analytics", "Team leadership", "Strategic thinking", "Cross-functional collaboration"],
      "developing_skills": ["Organizational leadership", "Data strategy", "Technology architecture"],
      "key_achievements": ["Lead data science teams", "Define data strategy for business units"]
    }
  ],
  "pivot_opportunities": [
    {
      "to_career": "product_management",
      "from_level": "mid", 
      "timeline": "6-12 months",
      "transition_skills": ["Product sense", "User research", "Business strategy"]
    },
    {
      "to_career": "technical_consulting",
      "from_level": "senior",
      "timeline": "3-6 months", 
      "transition_skills": ["Client communication", "Business development", "Industry expertise"]
    }
  ]
};

const DemoGraphPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interactive Salary Timeline Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of the interactive salary progression graph with pivot points
          </p>
        </div>
        
        <SalaryTimelineGraph 
          trajectory={demoTrajectory} 
          interactive={true}
          showPivots={true}
        />

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ <strong>Salary progression line graph</strong> - Blue line showing career growth over time</li>
            <li>✅ <strong>Time on X-axis</strong> - Years of experience from 0 to {Math.max(...demoTrajectory.stages.map(s => parseInt(s.years_experience.split('-')[1])))}</li>
            <li>✅ <strong>Salary on Y-axis</strong> - Salary ranges from $70K to $180K</li>
            <li>✅ <strong>Interactive career stage points</strong> - Hover over blue circles to see details</li>
            <li>✅ <strong>Pivot opportunity markers</strong> - Orange dashed circles showing transition points</li>
            <li>✅ <strong>Tooltips</strong> - Detailed information on hover</li>
            <li>✅ <strong>Grid lines</strong> - Visual reference for salary levels and time periods</li>
            <li>✅ <strong>Color-coded career levels</strong> - Entry (green), Mid (blue), Senior (purple)</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link href="/careerMap" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            ← Back to Career Maps
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoGraphPage;