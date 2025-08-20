import React from 'react';
import careerTrajectories from '../data/careerTrajectories.json';

const TestPage = () => {
  const trajectories = careerTrajectories.trajectories || {};
  const careerPaths = Object.keys(trajectories);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page - Career Trajectories</h1>
      <h2>Available Career Paths:</h2>
      <ul>
        {careerPaths.map((path) => (
          <li key={path}>
            <strong>{path}</strong>: {trajectories[path]?.name || 'No name'}
          </li>
        ))}
      </ul>
      
      <h2>Visualization Settings:</h2>
      <pre>{JSON.stringify(careerTrajectories.visualization_settings, null, 2)}</pre>
      
      <h2>Data Scientist Trajectory (if available):</h2>
      {trajectories.data_scientist ? (
        <div>
          <h3>{trajectories.data_scientist.name}</h3>
          <p>Timeline: {trajectories.data_scientist.timeline_years}</p>
          <p>Stages: {trajectories.data_scientist.stages?.length || 0}</p>
        </div>
      ) : (
        <p>Data scientist trajectory not found</p>
      )}
    </div>
  );
};

export default TestPage;