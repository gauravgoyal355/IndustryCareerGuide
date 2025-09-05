// Business/Strategy Profile Test Scenario
// Strong in leadership, communication, business strategy
// Should match: Consulting, Product Management, Business Development, VC

const businessProfile = {
  // Skills Questions
  skills_technical_1: "d", // Financial modeling and market analysis
  skills_communication_1: "b", // Via presentations and public speaking
  skills_leadership_1: "c", // Building strategic partnerships and business relationships
  skills_analytical_1: "d", // Collaborate with experts and gather multiple perspectives
  skills_management_1: ["project_mgmt", "market_research", "policy", "risk_mgmt"], // Strong business skills
  skills_specialized_1: ["finance", "user_research"], // Business-focused specializations
  problem_complexity_1: "b", // Strategic business problems with multiple stakeholders
  technical_depth_1: "c", // Translating technical knowledge for business applications
  
  // Values Questions
  values_impact_1: ["commercial", "societal", "intellectual", "personal"], // Commercial success first
  values_autonomy_1: 3, // Balance of independence and collaboration
  values_stability_1: "b", // Established company with resources and clear processes
  values_collaboration_1: "c", // Competing and driving results through partnerships
  values_creativity_1: "c", // Moderate - some creative elements enhance work
  career_goals_1: "b", // Leading teams and managing large organizations
  work_motivation_1: ["recognition", "compensation", "learning", "mission", "flexibility"], // Recognition and growth first
  
  // Temperament Questions
  temperament_social_1: 4, // High social interaction preference
  temperament_detail_1: "b", // Balance detail work with big-picture strategic thinking
  temperament_structure_1: 2, // Some structure but adaptable
  temperament_pressure_1: "b", // Become more decisive and take quick action
  temperament_decision_1: "c", // Seek diverse perspectives and build consensus
  risk_tolerance_1: 4, // Higher risk tolerance - strategic risks
  
  // Technical Prerequisites - Moderate technical, strong business
  programming_experience: 1, // Basic - simple scripts, basic syntax
  programming_languages: ["python", "sql"], // Basic programming for business analysis
  mathematics_background: 2, // Graduate coursework - advanced statistics
  mathematical_areas: ["statistics"], // Statistics for business analysis
  data_analysis_experience: 2, // Statistical software - SPSS, basic R/Python
  data_tools_experience: ["excel", "spss_sas", "sql_databases"], // Business-oriented tools
  research_methodology: ["survey_research", "literature_review"], // Business research methods
  technical_writing_experience: 2, // Intermediate - research papers, detailed documentation
  business_finance_background: 2, // Intermediate - formal training or significant experience
  lab_experience: 1, // Basic - undergraduate labs
  creative_design_experience: 0, // None - no design experience
  clinical_experience: ["none_clinical"], // No clinical experience
  
  // PhD Domain
  phd_domain_1: "f" // Social Sciences domain
};

module.exports = { businessProfile };