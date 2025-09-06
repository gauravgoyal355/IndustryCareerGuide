// Generic Action Plan API - Sophisticated narrative-driven approach
import gapPersonalization from '../../data/gapPersonalization.json';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { userProfile } = req.body;
    const { primaryInterest, phdArea, careerStage, targetTimeframe } = userProfile;

    console.log('GAP API - Processing:', { primaryInterest, phdArea, careerStage });

    // Generate sophisticated action plan
    const actionPlan = generateNarrativeActionPlan(primaryInterest, phdArea, careerStage, targetTimeframe);

    res.status(200).json({
      success: true,
      actionPlan
    });

  } catch (error) {
    console.error('GAP API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate action plan'
    });
  }
}

function generateNarrativeActionPlan(interest, phdArea, stage, timeframe) {
  // PhD area categories
  const lifeScienceFields = ['biology', 'biochemistry', 'molecular_biology', 'neuroscience', 'genetics', 'microbiology', 'immunology'];
  const physicalScienceFields = ['physics', 'chemistry', 'materials_science'];
  const engineeringFields = ['mechanical_engineering', 'electrical_engineering', 'chemical_engineering', 'biomedical_engineering'];
  const mathFields = ['mathematics', 'statistics', 'computer_science'];

  // Generate career path display name
  const careerDisplayNames = {
    'Data/Analytics': 'Data & Analytics Career',
    'Technology/Engineering': 'Technology & Engineering Career',
    'Product/Strategy': 'Product & Strategy Career',
    'Consulting': 'Consulting Career',
    'Business/Finance': 'Business & Finance Career',
    'R&D/Innovation': 'Research & Innovation Career',
    'Healthcare/Biotech': 'Healthcare & Biotech Career',
    'Entrepreneurship': 'Entrepreneurship Career',
    'Science Communication': 'Science Communication Career',
    'Policy/Advocacy': 'Policy & Advocacy Career'
  };

  // Generate narrative and intersection careers
  const { narrative, intersectionCareers } = generatePhDInterestNarrative(interest, phdArea, stage);
  
  // Generate timeline-appropriate milestones
  const milestones = generateBroadMilestones(interest, stage, timeframe, phdArea);
  
  // Generate general learning recommendations
  const learningRecommendations = generatePersonalizedLearning(interest, phdArea);
  
  // Get stage-specific adjustments including empathy and guidance
  const stageAdjustments = gapPersonalization.stageSpecificAdjustments[stage] || {};

  return {
    overview: {
      targetPath: careerDisplayNames[interest] || interest,
      currentStage: getStageDisplayName(stage),
      estimatedTimeframe: getTimeframeText(timeframe, stage, interest),
      empathyMessage: stageAdjustments.empathyMessage,
      stageSpecificGuidance: stageAdjustments.stageSpecificGuidance
    },
    narrative: narrative,
    intersectionCareers: intersectionCareers,
    milestones: milestones,
    learningRecommendations: learningRecommendations,
    skillDevelopment: generateSkillDevelopment(interest, phdArea),
    careerInsights: generatePersonalizedInsights(interest, phdArea, stage)
  };
}

function generatePhDInterestNarrative(interest, phdArea, stage) {
  // Handle Masters students (no PhD)
  const isMastersStudent = phdArea === 'none';
  
  // Helper function to get appropriate degree reference
  const getDegreeReference = (includeArea = true) => {
    if (isMastersStudent) {
      return includeArea ? "Your Master's degree background" : "Your Master's training";
    }
    if (includeArea && phdArea !== 'none') {
      return `Your PhD in ${phdArea.replace('_', ' ')}`;
    }
    return "Your PhD";
  };
  
  // Define PhD area groupings
  const lifeScienceFields = ['biology', 'biochemistry', 'molecular_biology', 'neuroscience', 'genetics', 'microbiology', 'immunology'];
  const physicalScienceFields = ['physics', 'chemistry', 'materials_science'];
  const engineeringFields = ['mechanical_engineering', 'electrical_engineering', 'chemical_engineering', 'biomedical_engineering'];
  const mathFields = ['mathematics', 'statistics', 'computer_science'];

  const isLifeScience = lifeScienceFields.includes(phdArea);
  const isPhysicalScience = physicalScienceFields.includes(phdArea);
  const isEngineering = engineeringFields.includes(phdArea);
  const isMath = mathFields.includes(phdArea);

  let narrative = {};
  let intersectionCareers = [];

  // Generate narrative based on PhD area + Interest combinations
  switch (interest) {
    case 'Technology/Engineering':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} has provided you with deep scientific knowledge and analytical thinking that's highly valued in biotechnology and medical device industries.`,
          gaps: `However, transitioning to engineering requires developing more quantitative and technical skills such as programming, systems design, and engineering principles.`,
          difficulty: stage === 'senior_researcher' ? 'This transition may require significant retraining but your research experience and problem-solving skills provide a strong foundation.' : 'With your analytical background, developing technical skills is achievable with focused effort.',
          encouragement: `Many successful biotech engineers and medical device professionals started with life science PhDs. Your domain expertise gives you a unique advantage in understanding user needs and biological constraints.`
        };
        intersectionCareers = ['Biomedical Engineer', 'Medical Device R&D', 'Bioprocess Engineer', 'Computational Biology Specialist', 'Biosensor Developer', 'Gene Editing Technology', 'Drug Delivery Systems'];
      } else if (isPhysicalScience) {
        narrative = {
          alignment: `${getDegreeReference()} has equipped you with strong quantitative skills and understanding of fundamental principles that translate well to engineering roles.`,
          gaps: `The transition requires learning specific engineering methodologies and potentially programming skills, depending on your target area.`,
          difficulty: 'Your analytical and mathematical background provides an excellent foundation for engineering roles.',
          encouragement: `Physical science PhDs often excel in engineering because of their deep understanding of underlying principles and strong problem-solving abilities.`
        };
        intersectionCareers = ['Materials Engineer', 'Process Engineer', 'R&D Engineer', 'Technical Product Manager', 'Engineering Consultant', 'Hardware Engineer', 'Chemical Process Designer'];
      } else if (isMath) {
        narrative = {
          alignment: `${getDegreeReference()} provides excellent preparation for technology and engineering roles, especially those requiring strong analytical and computational skills.`,
          gaps: `You may need to learn domain-specific engineering principles and potentially gain hands-on experience with hardware or systems.`,
          difficulty: 'This is typically a natural transition given your quantitative background.',
          encouragement: `Math and computer science PhDs are highly sought after in technology and engineering for their problem-solving abilities and technical depth.`
        };
        intersectionCareers = ['Software Engineer', 'Data Engineer', 'Systems Engineer', 'Machine Learning Engineer', 'Quantitative Engineer', 'Algorithm Developer', 'Technical Architect'];
      } else {
        narrative = {
          alignment: `${getDegreeReference(false)} has developed strong analytical and problem-solving skills that are valuable in engineering roles.`,
          gaps: `Transitioning to engineering will require developing technical skills and learning engineering principles specific to your area of interest.`,
          difficulty: 'The transition requires dedication but your research background provides transferable skills.',
          encouragement: `Many successful engineers have diverse backgrounds. Your unique perspective can bring innovation to engineering teams.`
        };
        intersectionCareers = ['R&D Engineer', 'Technical Consultant', 'Process Engineer', 'Systems Analyst', 'Product Engineer'];
      }
      break;

    case 'Data/Analytics':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} has provided experience with data analysis, experimental design, and scientific rigor - all crucial for data science roles.`,
          gaps: `You'll need to strengthen programming skills (Python/R), learn machine learning techniques, and understand business applications of data science.`,
          difficulty: 'This is often a natural transition for life science PhDs with analytical backgrounds.',
          encouragement: `Life science PhDs bring domain expertise and experimental rigor that's highly valued in biotech, pharma, and healthcare data roles.`
        };
        intersectionCareers = ['Biostatistician', 'Clinical Data Scientist', 'Bioinformatics Specialist', 'Healthcare Analytics', 'Pharma Data Scientist', 'Genomics Data Analyst', 'Medical AI Researcher'];
      } else if (isPhysicalScience || isMath) {
        narrative = {
          alignment: `${getDegreeReference()} provides excellent quantitative foundations and analytical skills that directly translate to data science.`,
          gaps: `You may need to learn business applications, data visualization tools, and potentially some domain-specific knowledge.`,
          difficulty: 'This transition leverages your existing strengths and is typically straightforward.',
          encouragement: `Your strong mathematical and analytical background gives you a significant advantage in advanced data science and machine learning roles.`
        };
        intersectionCareers = ['Data Scientist', 'Machine Learning Engineer', 'Statistical Analyst', 'Quantitative Analyst', 'Research Data Scientist', 'Algorithm Developer', 'AI Researcher'];
      } else {
        narrative = {
          alignment: `${getDegreeReference(false)} has developed analytical thinking and research skills that are valuable in data roles.`,
          gaps: `You'll need to develop programming skills, statistical knowledge, and learn data science tools and methodologies.`,
          difficulty: 'The transition requires learning new technical skills but your analytical background helps.',
          encouragement: `Many successful data scientists come from diverse backgrounds. Your domain expertise can provide unique insights in data analysis.`
        };
        intersectionCareers = ['Business Analyst', 'Data Analyst', 'Market Research Analyst', 'Operations Research Analyst'];
      }
      break;

    case 'Consulting':
      narrative = {
        alignment: `${getDegreeReference(false)} has developed critical thinking, problem-solving, and communication skills that are highly valued in consulting.`,
        gaps: `You'll need to learn business frameworks, develop presentation skills, and understand client management.`,
        difficulty: stage === 'senior_researcher' ? 'Your extensive research experience and expertise position you well for senior consulting roles.' : 'The transition leverages your analytical skills while requiring business acumen development.',
        encouragement: `PhD-level expertise is highly valued in consulting, especially in technical and scientific domains.`
      };
      intersectionCareers = isLifeScience ? 
        ['Life Sciences Consultant', 'Biotech Strategy Consultant', 'Healthcare Consultant', 'Regulatory Consultant', 'R&D Consultant'] :
        ['Technical Consultant', 'Strategy Consultant', 'Management Consultant', 'Technology Consultant', 'Innovation Consultant'];
      break;

    case 'Healthcare/Biotech':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} directly aligns with healthcare and biotech industry needs, providing deep domain expertise.`,
          gaps: `You may need to learn business aspects, regulatory requirements, and industry-specific processes.`,
          difficulty: 'This is typically a natural transition leveraging your scientific background.',
          encouragement: `Life science PhDs are the backbone of the biotech and healthcare industries. Your expertise is in high demand.`
        };
        intersectionCareers = ['Medical Science Liaison', 'Clinical Research Associate', 'Regulatory Affairs Specialist', 'Biotech R&D Scientist', 'Medical Affairs', 'Clinical Data Manager', 'Drug Development Scientist'];
      } else {
        narrative = {
          alignment: `Your analytical and research skills are valuable in healthcare and biotech, especially in technical and data-driven roles.`,
          gaps: `You'll need to develop domain knowledge in life sciences and understand healthcare/biotech industry dynamics.`,
          difficulty: 'The transition requires learning a new domain but your research skills are transferable.',
          encouragement: `Healthcare and biotech benefit from diverse perspectives. Your quantitative skills can contribute to innovation in these fields.`
        };
        intersectionCareers = ['Healthcare Data Analyst', 'Biotech Business Analyst', 'Medical Device Engineer', 'Healthcare Technology Consultant', 'Digital Health Specialist'];
      }
      break;

    case 'Product/Strategy':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} has given you deep domain expertise in life sciences, which is highly valued in biotech and pharma product management roles.`,
          gaps: `Transitioning to product/strategy requires developing business acumen, market analysis skills, and understanding of product development lifecycles.`,
          difficulty: stage === 'senior_researcher' ? 'Your extensive research experience and domain expertise make you well-suited for senior product roles in life sciences companies.' : 'Your scientific background provides credibility with R&D teams, but you\'ll need to develop commercial skills.',
          encouragement: `Many successful product managers in biotech started as scientists. Your ability to understand complex science and translate it for different audiences is invaluable.`
        };
        intersectionCareers = ['Biotech Product Manager', 'Medical Affairs Specialist', 'Clinical Development Associate', 'Market Access Analyst', 'Scientific Product Marketing', 'Regulatory Strategy Consultant', 'Life Sciences Business Development'];
      } else if (isPhysicalScience || isMath) {
        narrative = {
          alignment: `${getDegreeReference()} has developed strong analytical and quantitative skills that are essential for data-driven product decisions.`,
          gaps: `You'll need to learn business strategy frameworks, market research methodologies, and customer development processes.`,
          difficulty: 'Your analytical background gives you an edge in product analytics and strategic thinking.',
          encouragement: `Technical product managers with deep analytical skills are highly sought after, especially in tech companies dealing with complex problems.`
        };
        intersectionCareers = ['Technical Product Manager', 'Data Product Manager', 'Strategy Analyst', 'Business Intelligence Manager', 'Product Marketing Manager', 'Operations Strategy Consultant', 'Market Research Analyst'];
      } else {
        narrative = {
          alignment: `${getDegreeReference(false)} has developed strategic thinking, project management, and analytical skills valuable in product and strategy roles.`,
          gaps: `You'll need to develop market research skills, business model understanding, and customer-centric thinking.`,
          difficulty: 'The transition leverages your research and analytical skills while requiring new business perspectives.',
          encouragement: `Your ability to synthesize complex information and think systematically are core strengths for strategy roles.`
        };
        intersectionCareers = ['Strategy Consultant', 'Business Analyst', 'Market Research Manager', 'Product Planning Associate', 'Corporate Development Analyst'];
      }
      break;

    case 'Business/Finance':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} provides deep understanding of the life sciences industry, which is valuable for finance roles in biotech, pharma, and healthcare.`,
          gaps: `You'll need to develop financial modeling, accounting principles, and business valuation skills specific to finance roles.`,
          difficulty: stage === 'senior_researcher' ? 'Your industry expertise can open doors to senior finance roles in life sciences companies.' : 'The transition requires significant new skill development but your domain knowledge is an asset.',
          encouragement: `Life sciences companies value finance professionals who understand the science behind their business models.`
        };
        intersectionCareers = ['Biotech Financial Analyst', 'Healthcare Investment Banking', 'Life Sciences Venture Capital', 'Pharma Business Development', 'Medical Economics Researcher', 'Healthcare Consulting'];
      } else if (isPhysicalScience || isMath) {
        narrative = {
          alignment: `${getDegreeReference()} has provided excellent quantitative and analytical foundations that directly apply to finance roles.`,
          gaps: `You may need to learn financial markets, accounting principles, and business finance applications.`,
          difficulty: 'This is typically a natural transition given your strong quantitative background.',
          encouragement: `Quantitative skills are highly valued in finance. Many successful quants and financial analysts have STEM PhDs.`
        };
        intersectionCareers = ['Quantitative Analyst', 'Risk Management Analyst', 'Financial Engineer', 'Investment Research Analyst', 'Data Scientist (Finance)', 'Algorithmic Trading Specialist'];
      } else {
        narrative = {
          alignment: `${getDegreeReference(false)} has developed analytical and research skills that are transferable to finance roles.`,
          gaps: `You'll need to develop financial knowledge, business acumen, and industry-specific skills.`,
          difficulty: 'The transition requires focused learning but your analytical skills provide a foundation.',
          encouragement: `Finance values diverse perspectives and strong analytical thinking from PhD backgrounds.`
        };
        intersectionCareers = ['Business Analyst', 'Financial Analyst', 'Corporate Finance Associate', 'Investment Research'];
      }
      break;

    case 'R&D/Innovation':
      if (isLifeScience) {
        narrative = {
          alignment: `${getDegreeReference()} directly aligns with R&D roles in life sciences, providing both technical expertise and research experience.`,
          gaps: `You may need to learn industry R&D processes, project management, and potentially regulatory requirements.`,
          difficulty: 'This is typically the most natural career transition for life science PhDs.',
          encouragement: `R&D roles in industry often provide better resources and faster impact than academic research while utilizing your core expertise.`
        };
        intersectionCareers = ['Industry Research Scientist', 'R&D Project Manager', 'Principal Investigator (Industry)', 'Innovation Strategist', 'Research Program Director', 'Scientific Director', 'CTO (Biotech)'];
      } else if (isPhysicalScience || isEngineering) {
        narrative = {
          alignment: `${getDegreeReference()} provides deep technical knowledge and research skills that are core requirements for industrial R&D roles.`,
          gaps: `You may need to learn industry-specific applications, product development processes, and commercial R&D priorities.`,
          difficulty: 'This transition leverages your existing strengths while adapting to industry contexts.',
          encouragement: `Industry R&D offers the opportunity to see your research translated into real-world applications and products.`
        };
        intersectionCareers = ['Senior Research Engineer', 'Innovation Manager', 'Technical Program Manager', 'R&D Director', 'Chief Technology Officer', 'Product Development Scientist', 'Technology Transfer Specialist'];
      } else {
        narrative = {
          alignment: isMastersStudent ? 
            `Your Master's research experience and analytical training provide a strong foundation for R&D roles, combining technical knowledge with fresh perspectives.` :
            `Your PhD research experience has developed innovation thinking and project management skills valuable in R&D environments.`,
          gaps: `You'll need to develop technical knowledge specific to your target industry and understand commercial R&D processes.`,
          difficulty: isMastersStudent ? 
            'This transition leverages your research background while building industry-specific expertise.' :
            'The transition requires adapting your research skills to industry contexts and priorities.',
          encouragement: isMastersStudent ?
            `R&D roles value the fresh perspectives and adaptability that Master's-level researchers bring to industry problems.` :
            `R&D roles value fresh perspectives and interdisciplinary thinking that PhD training provides.`
        };
        intersectionCareers = ['Research Program Manager', 'Innovation Analyst', 'Technology Scout', 'R&D Strategy Consultant', 'Grant Writing Specialist'];
      }
      break;

    case 'Entrepreneurship':
      narrative = {
        alignment: `${getDegreeReference(false)} has developed problem-solving abilities, resilience, and deep expertise that are valuable entrepreneurial assets.`,
        gaps: `You'll need to develop business skills including finance, marketing, sales, and operations management.`,
        difficulty: stage === 'senior_researcher' ? 'Your expertise and network position you well for founding or joining startups in your domain.' : 'Entrepreneurship requires diverse skills but your PhD background provides credibility and problem-solving abilities.',
        encouragement: `Many successful entrepreneurs have PhD backgrounds. Your ability to tackle complex problems and persist through challenges are key entrepreneurial traits.`
      };
      
      if (isLifeScience) {
        intersectionCareers = ['Biotech Founder', 'HealthTech Entrepreneur', 'Medical Device Startup', 'Digital Health Founder', 'Biotech Consultant', 'Life Sciences Accelerator', 'Venture Partner (Life Sciences)'];
      } else if (isPhysicalScience || isMath) {
        intersectionCareers = ['Tech Startup Founder', 'Deep Tech Entrepreneur', 'AI/ML Startup', 'Quantitative Trading Firm', 'Technology Consultant', 'Technical Co-founder', 'Innovation Advisor'];
      } else {
        intersectionCareers = ['Knowledge-Based Startup', 'Consulting Firm Founder', 'EdTech Entrepreneur', 'Research Services Company', 'Advisory Services', 'Content Creation Business'];
      }
      break;

    case 'Science Communication':
      narrative = {
        alignment: `${getDegreeReference(false)} has given you deep subject matter expertise and the ability to communicate complex concepts, which are core requirements for science communication roles.`,
        gaps: `You'll need to develop public communication skills, media relations, and potentially digital content creation abilities.`,
        difficulty: 'This transition builds on your communication skills while requiring new audience-focused approaches.',
        encouragement: `The world needs more scientists who can effectively communicate complex topics to diverse audiences. Your expertise gives you credibility and authenticity.`
      };
      intersectionCareers = ['Science Writer', 'Medical Writer', 'Science Journalist', 'Technical Communications Manager', 'Science Museum Educator', 'Science Policy Advisor', 'Research Communications Director'];
      break;

    case 'Policy/Advocacy':
      narrative = {
        alignment: `${getDegreeReference(false)} has provided deep expertise and understanding of research processes that are valuable for evidence-based policy work.`,
        gaps: `You'll need to develop policy analysis skills, stakeholder engagement abilities, and understanding of regulatory and political processes.`,
        difficulty: stage === 'senior_researcher' ? 'Your expertise and potential network position you well for senior policy advisory roles.' : 'The transition requires learning new skills but your research credibility is valuable.',
        encouragement: `PhD-level expertise is highly valued in policy circles. Scientists who can bridge research and policy make crucial contributions to society.`
      };
      
      if (isLifeScience) {
        intersectionCareers = ['Science Policy Advisor', 'Health Policy Analyst', 'Regulatory Affairs Specialist', 'Medical Affairs Director', 'Government Science Advisor', 'Think Tank Researcher', 'Science Advocacy Organization'];
      } else {
        intersectionCareers = ['Technology Policy Analyst', 'Research Policy Advisor', 'Government Technology Consultant', 'Science Policy Researcher', 'Innovation Policy Specialist'];
      }
      break;

    // Add more cases for other interests...
    default:
      narrative = {
        alignment: `${getDegreeReference()} has developed valuable analytical, problem-solving, and research skills.`,
        gaps: `Transitioning to ${interest.toLowerCase().replace('/', ' & ')} will require developing specific domain knowledge and potentially new technical skills.`,
        difficulty: stage === 'senior_researcher' ? 'Your extensive experience provides a strong foundation for senior-level transitions.' : 'The transition is achievable with focused effort and leveraging your existing strengths.',
        encouragement: `${getDegreeReference()} provides a strong foundation for learning new domains and contributing unique perspectives.`
      };
      intersectionCareers = ['Research-Based Roles', 'Technical Specialist', 'Domain Expert', 'Analytical Roles'];
  }

  return { narrative, intersectionCareers };
}

function generateBroadMilestones(interest, stage, timeframe, phdArea = 'general') {
  const timeframeMonths = timeframe === 'short' ? '3-6' : timeframe === 'medium' ? '6-12' : '12+';
  
  // Define PhD area groupings
  const lifeScienceFields = ['biology', 'biochemistry', 'molecular_biology', 'neuroscience', 'genetics', 'microbiology', 'immunology'];
  const physicalScienceFields = ['physics', 'chemistry', 'materials_science'];
  const engineeringFields = ['mechanical_engineering', 'electrical_engineering', 'chemical_engineering', 'biomedical_engineering'];
  const mathFields = ['mathematics', 'statistics', 'computer_science'];

  const isLifeScience = lifeScienceFields.includes(phdArea);
  const isPhysicalScience = physicalScienceFields.includes(phdArea);
  const isEngineering = engineeringFields.includes(phdArea);
  const isMath = mathFields.includes(phdArea);

  // Generate tailored milestones based on interest + PhD area + stage
  let milestones = {
    immediate: { title: 'Foundation Building (0-3 months)', priority: 'high', tasks: [] },
    medium_term: { title: `Skill Development (3-${timeframeMonths.split('-')[1] || '12'} months)`, priority: 'high', tasks: [] },
    long_term: { title: 'Transition Execution (6+ months)', priority: 'medium', tasks: [] }
  };

  // Technology/Engineering specific milestones
  if (interest === 'Technology/Engineering') {
    if (isLifeScience) {
      milestones.immediate.tasks = [
        'Research biotech and medical device companies in your area',
        'Learn programming basics (Python for bioinformatics)',
        'Join biomedical engineering professional groups',
        'Update LinkedIn to highlight quantitative research skills',
        'Connect with biotech professionals on LinkedIn'
      ];
      milestones.medium_term.tasks = [
        'Complete bioinformatics or computational biology courses',
        'Build portfolio projects using biological datasets',
        'Attend biotech industry conferences and meetups',
        'Conduct informational interviews with biomedical engineers',
        'Learn regulatory basics (FDA processes for medical devices)'
      ];
      milestones.long_term.tasks = [
        'Apply for biomedical engineer or R&D engineer positions',
        'Consider roles at biotech startups for faster career growth',
        'Leverage your scientific network for industry connections',
        'Pursue relevant certifications (e.g., clinical research)',
        'Evaluate transition to management track in biotech R&D'
      ];
    } else if (isPhysicalScience || isMath) {
      milestones.immediate.tasks = [
        'Assess programming skills and learn relevant languages',
        'Research engineering roles in your technical domain',
        'Join professional engineering societies',
        'Update resume to emphasize problem-solving projects',
        'Start building a technical portfolio on GitHub'
      ];
      milestones.medium_term.tasks = [
        'Complete advanced programming or engineering courses',
        'Contribute to open-source projects in your field',
        'Attend tech meetups and engineering conferences',
        'Build projects that demonstrate engineering thinking',
        'Develop understanding of software development lifecycle'
      ];
      milestones.long_term.tasks = [
        'Apply for software engineer or technical roles',
        'Consider technical consulting opportunities',
        'Leverage analytical background for data engineering roles',
        'Pursue relevant technical certifications',
        'Evaluate opportunities in deep tech startups'
      ];
    }
  }

  // Data/Analytics specific milestones
  else if (interest === 'Data/Analytics') {
    if (isLifeScience) {
      milestones.immediate.tasks = [
        'Strengthen Python/R programming for data science',
        'Research biotech and pharma data science roles',
        'Join bioinformatics and data science communities',
        'Highlight data analysis experience from research',
        'Learn SQL basics for biological databases'
      ];
      milestones.medium_term.tasks = [
        'Complete machine learning courses with biological focus',
        'Work on bioinformatics projects for portfolio',
        'Attend biodata conferences and networking events',
        'Learn clinical trial data analysis methods',
        'Develop expertise in genomics or proteomics data'
      ];
      milestones.long_term.tasks = [
        'Apply for bioinformatics or clinical data scientist roles',
        'Target pharma companies for drug discovery analytics',
        'Leverage domain expertise for specialized data roles',
        'Consider consulting in biotech data analysis',
        'Pursue advanced analytics certifications'
      ];
    } else if (isPhysicalScience || isMath) {
      milestones.immediate.tasks = [
        'Assess and strengthen statistical programming skills',
        'Research data science roles across industries',
        'Build portfolio showcasing analytical projects',
        'Learn business applications of data science',
        'Join data science communities and meetups'
      ];
      milestones.medium_term.tasks = [
        'Complete advanced machine learning courses',
        'Work on diverse data science projects',
        'Learn big data tools (Spark, Hadoop)',
        'Attend data science conferences',
        'Develop business acumen through coursework'
      ];
      milestones.long_term.tasks = [
        'Apply for data scientist or ML engineer positions',
        'Consider roles in fintech or tech companies',
        'Leverage quantitative background for specialized roles',
        'Pursue industry-recognized data science certifications',
        'Evaluate opportunities in AI/ML research companies'
      ];
    }
  }

  // Product/Strategy specific milestones
  else if (interest === 'Product/Strategy') {
    if (isLifeScience) {
      milestones.immediate.tasks = [
        'Research biotech and pharma product management roles',
        'Learn product management fundamentals',
        'Connect with life sciences product managers',
        'Understand drug development and regulatory processes',
        'Join biotech professional organizations'
      ];
      milestones.medium_term.tasks = [
        'Complete product management courses',
        'Learn market research and competitive analysis',
        'Attend biotech industry conferences',
        'Understand healthcare market dynamics',
        'Build knowledge of commercialization processes'
      ];
      milestones.long_term.tasks = [
        'Apply for associate product manager roles in life sciences',
        'Target medical affairs or market access positions',
        'Leverage scientific credibility for product roles',
        'Consider MBA for advanced strategy positions',
        'Evaluate opportunities in digital health companies'
      ];
    } else {
      milestones.immediate.tasks = [
        'Learn product management and strategy frameworks',
        'Research tech companies and product roles',
        'Build understanding of user experience principles',
        'Connect with product managers in relevant industries',
        'Learn business model fundamentals'
      ];
      milestones.medium_term.tasks = [
        'Complete product management certification courses',
        'Practice market research and competitive analysis',
        'Attend product management meetups and conferences',
        'Build portfolio of strategic thinking examples',
        'Learn agile and product development processes'
      ];
      milestones.long_term.tasks = [
        'Apply for associate product manager positions',
        'Target strategy analyst roles for entry path',
        'Leverage analytical background for data-driven product roles',
        'Consider consulting as bridge to product roles',
        'Evaluate opportunities in tech startups'
      ];
    }
  }

  // Business/Finance specific milestones
  else if (interest === 'Business/Finance') {
    if (isLifeScience) {
      milestones.immediate.tasks = [
        'Learn financial modeling and valuation basics',
        'Research biotech and pharma finance roles',
        'Understand life sciences business models',
        'Connect with finance professionals in healthcare',
        'Learn basics of healthcare economics'
      ];
      milestones.medium_term.tasks = [
        'Complete financial analysis and modeling courses',
        'Learn biotech investment and valuation methods',
        'Attend healthcare finance conferences',
        'Build financial models for biotech case studies',
        'Understand regulatory impact on valuations'
      ];
      milestones.long_term.tasks = [
        'Apply for financial analyst roles in life sciences',
        'Target healthcare investment banking positions',
        'Consider life sciences venture capital opportunities',
        'Leverage domain expertise for specialized finance roles',
        'Evaluate opportunities in biotech consulting'
      ];
    } else if (isPhysicalScience || isMath) {
      milestones.immediate.tasks = [
        'Leverage quantitative skills for finance applications',
        'Learn financial markets and instruments',
        'Research quantitative finance and fintech roles',
        'Build financial modeling skills',
        'Connect with quantitative analysts and traders'
      ];
      milestones.medium_term.tasks = [
        'Complete quantitative finance certifications',
        'Learn programming for financial applications',
        'Practice algorithmic trading concepts',
        'Attend fintech and quantitative finance events',
        'Build portfolio of financial modeling projects'
      ];
      milestones.long_term.tasks = [
        'Apply for quantitative analyst positions',
        'Target fintech companies and trading firms',
        'Leverage mathematical background for risk management',
        'Consider financial engineering roles',
        'Evaluate opportunities in cryptocurrency and blockchain'
      ];
    }
  }

  // Consulting specific milestones
  else if (interest === 'Consulting') {
    milestones.immediate.tasks = [
      'Learn consulting frameworks and case study methods',
      `Research consulting firms with ${isLifeScience ? 'life sciences' : 'technical'} practices`,
      'Practice business case studies and problem-solving',
      'Connect with consultants in relevant practice areas',
      'Develop presentation and communication skills'
    ];
    milestones.medium_term.tasks = [
      'Complete business strategy and consulting courses',
      `Build expertise in ${isLifeScience ? 'healthcare/biotech' : 'technology'} consulting`,
      'Attend consulting firm networking events',
      'Practice case interviews and consulting skills',
      'Develop project management experience'
    ];
    
    if (stage === 'senior_researcher') {
      milestones.long_term.tasks = [
        'Target senior consultant or principal roles',
        'Leverage expertise for specialized consulting positions',
        'Consider boutique firms in your domain',
        'Evaluate opportunities to lead practice development',
        'Network with C-level executives in your field'
      ];
    } else {
      milestones.long_term.tasks = [
        'Apply for entry-level consultant positions',
        'Target firms with relevant practice areas',
        'Consider specialized consulting firms first',
        'Leverage PhD analytical skills for case interviews',
        'Evaluate opportunities in technology or strategy consulting'
      ];
    }
  }

  // Default milestones if no specific match
  else {
    milestones.immediate.tasks = [
      `Research career paths in ${interest.toLowerCase().replace('/', ' & ')}`,
      `Identify skill gaps through job posting analysis in ${interest}`,
      'Begin foundational learning through online resources',
      'Update LinkedIn profile to reflect career transition goals',
      `Start networking with professionals in ${interest.toLowerCase()}`
    ];
    milestones.medium_term.tasks = [
      'Complete relevant online courses and certifications',
      'Build portfolio projects demonstrating new skills',
      'Attend industry events and virtual meetups',
      'Consider informational interviews with industry professionals',
      'Develop a transition timeline and milestones'
    ];
    milestones.long_term.tasks = [
      'Apply for relevant positions or transition opportunities',
      'Leverage your network for referrals and opportunities',
      'Consider contract or part-time work to gain experience',
      'Continue skill development based on market feedback',
      'Evaluate and adjust your transition strategy as needed'
    ];
  }

  // Add comprehensive stage-specific adjustments
  const stageAdjustments = gapPersonalization.stageSpecificAdjustments[stage] || {};
  
  if (stageAdjustments.additionalActions) {
    // Distribute actions across different milestone periods based on their nature
    const immediateActions = stageAdjustments.additionalActions.filter(action => 
      action.includes('Apply for') || action.includes('Connect with') || action.includes('Join')
    );
    const mediumTermActions = stageAdjustments.additionalActions.filter(action => 
      action.includes('Transform') || action.includes('Reframe') || action.includes('Start')
    );
    const longTermActions = stageAdjustments.additionalActions.filter(action => 
      action.includes('Target') || action.includes('Consider') && action.includes('roles')
    );
    
    // Add stage-specific actions to appropriate milestone periods
    if (immediateActions.length > 0) {
      milestones.immediate.tasks.push(...immediateActions.slice(0, 2)); // Limit to keep manageable
    }
    if (mediumTermActions.length > 0) {
      milestones.medium_term.tasks.push(...mediumTermActions.slice(0, 2));
    }
    if (longTermActions.length > 0) {
      milestones.long_term.tasks.push(...longTermActions.slice(0, 1));
    }
    
    // If actions don't match filters, add first 2 to immediate
    const remainingActions = stageAdjustments.additionalActions.filter(action =>
      !immediateActions.includes(action) && !mediumTermActions.includes(action) && !longTermActions.includes(action)
    );
    if (remainingActions.length > 0) {
      milestones.immediate.tasks.push(...remainingActions.slice(0, 2));
    }
  }

  return milestones;
}

function generateSpecificFallbackActions(interest, phdArea) {
  const phdAreaFormatted = phdArea.replace('_', ' ');
  const actions = [];

  // Generate specific actions based on career interest
  switch (interest) {
    case 'Technology/Engineering':
      actions.push(
        `Complete freeCodeCamp's "Responsive Web Design" certification (free, 300 hours)`,
        `Build 3 portfolio projects: a data visualization using your ${phdAreaFormatted} research, a web app solving an industry problem, and an API for ${phdAreaFormatted} calculations`,
        `Join r/cscareerquestions and Stack Overflow communities, contribute by answering questions related to ${phdAreaFormatted}`,
        `Connect with PhD-to-tech professionals on LinkedIn using search "PhD ${phdAreaFormatted} software engineer"`,
        `Apply to 20+ entry-level developer positions, highlighting your analytical and problem-solving skills from ${phdAreaFormatted} research`
      );
      break;
    
    case 'Data/Analytics':
      actions.push(
        `Complete Kaggle Learn micro-courses: Python, Pandas, Machine Learning (all free, ~40 hours total)`,
        `Create 3 data science projects using your ${phdAreaFormatted} datasets: predictive modeling, data visualization dashboard, and statistical analysis report`,
        `Join Kaggle community and r/MachineLearning, participate in competitions using your domain expertise in ${phdAreaFormatted}`,
        `Attend virtual meetups: "Data Science Meetup" and "${phdAreaFormatted} + AI" groups on Meetup.com`,
        `Apply to data analyst roles at companies in ${phdAreaFormatted}-related industries (biotech, research institutions, consulting firms)`
      );
      break;
    
    case 'Consulting':
      actions.push(
        `Study 50 case studies from McKinsey Insights and BCG Insights (free), practice framework application to ${phdAreaFormatted} problems`,
        `Complete Victor Cheng's free case interview videos, then practice 20 cases with friends or Case Interview Buddy platform`,
        `Join Management Consulted community and r/consulting, ask questions about PhD-to-consulting transitions`,
        `Attend virtual consulting firm events: McKinsey, BCG, Bain "PhD Networking Events" (check their career pages monthly)`,
        `Apply to strategy consulting firms emphasizing your ${phdAreaFormatted} expertise for life sciences/tech practices`
      );
      break;
    
    case 'Product/Strategy':
      actions.push(
        `Complete Google's free "Foundations of User Experience (UX) Design" course on Coursera (audit mode, ~20 hours)`,
        `Build product case studies: design a product improvement for ${phdAreaFormatted} researchers, create a go-to-market strategy for a scientific tool`,
        `Join ProductHive Slack community and attend Product School virtual events (many free)`,
        `Network with product managers through LinkedIn using search "product manager PhD" and "scientific product manager"`,
        `Apply to product management associate programs at tech companies, emphasizing your research methodology and user empathy from ${phdAreaFormatted} work`
      );
      break;

    case 'Business/Finance':
      actions.push(
        `Complete Khan Academy's "Finance and capital markets" course (free, self-paced)`,
        `Build financial models: startup valuation for a ${phdAreaFormatted} company, investment analysis for research equipment, personal financial planning template`,
        `Join CFA Institute community (free membership) and r/SecurityAnalysis for market discussions`,
        `Attend virtual finance meetups and webinars on Eventbrite, search "${phdAreaFormatted} investment" and "biotech finance"`,
        `Apply to financial analyst positions at ${phdAreaFormatted}-focused funds, banks with life sciences divisions, or research-intensive companies`
      );
      break;

    case 'Healthcare/Biotech':
      actions.push(
        `Complete FDA's free online training courses related to your ${phdAreaFormatted} specialty (device/drug regulations)`,
        `Volunteer for clinical trials coordination or regulatory document review to gain industry experience`,
        `Join RAPS (Regulatory Affairs Professionals Society) student membership and local chapter events`,
        `Connect with regulatory professionals through LinkedIn, specifically searching "regulatory affairs ${phdAreaFormatted}"`,
        `Apply to CRA, clinical data management, or regulatory affairs positions at biotech companies and CROs`
      );
      break;

    case 'Science Communication':
      actions.push(
        `Start a science blog on Medium or Substack, write 5 articles explaining ${phdAreaFormatted} research for general audiences`,
        `Complete "Science Writing" courses on edX or Coursera (audit mode), practice by rewriting 3 research papers as news articles`,
        `Join Science Writers Society and SciComm Twitter community, engage by sharing simplified versions of recent ${phdAreaFormatted} papers`,
        `Pitch article ideas to The Conversation, Popular Science, or ${phdAreaFormatted}-specific publications`,
        `Apply to science communication roles at universities, research institutions, and science museums emphasizing your ${phdAreaFormatted} expertise`
      );
      break;

    case 'Entrepreneurship':
      actions.push(
        `Complete Y Combinator Startup School (free online program), focus on customer discovery for ${phdAreaFormatted}-related problems`,
        `Conduct 50 customer interviews with ${phdAreaFormatted} researchers or industry professionals to identify pain points`,
        `Join Founder Slack groups and Indie Hackers community, share insights from your ${phdAreaFormatted} research experience`,
        `Attend virtual startup events: Startup Grind, Entrepreneur meetups, and ${phdAreaFormatted} innovation conferences`,
        `Work at an early-stage startup (1-50 employees) for 1-2 years to learn business operations before founding your own company`
      );
      break;

    default:
      actions.push(
        `Complete relevant courses on Coursera (audit mode), edX, or Khan Academy focusing on ${interest.toLowerCase()} fundamentals`,
        `Create 2-3 portfolio projects demonstrating how your ${phdAreaFormatted} skills apply to ${interest.toLowerCase()} challenges`,
        `Join professional associations and online communities specific to ${interest.toLowerCase()}`,
        `Connect with 10+ professionals who transitioned from ${phdAreaFormatted} to ${interest.toLowerCase()} via LinkedIn`,
        `Apply to 15+ entry-level positions in ${interest.toLowerCase()}, customizing your resume to highlight transferable ${phdAreaFormatted} skills`
      );
  }

  return actions;
}

function generatePersonalizedLearning(interest, phdArea) {
  // Get career-specific learning resources
  const careerResources = gapPersonalization.careerSpecificLearningResources[interest] || {
    platforms: ['Coursera', 'edX', 'Udemy'],
    specificCourses: ['Foundational courses in your area of interest'],
    communities: ['Professional networks in your field'],
    certifications: ['Relevant industry certifications']
  };

  // Generate PhD + Career specific action items
  const combinedKey = `${phdArea}_${interest}`;
  const specificActions = gapPersonalization.phdCareerSpecificActions[combinedKey] || generateSpecificFallbackActions(interest, phdArea);

  return {
    generalAreas: [
      `${interest.replace('/', ' & ')} Fundamentals`,
      `Industry-specific tools and technologies`,
      `Business and professional skills`,
      `Networking and career development`,
      `${phdArea.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} to industry skill translation`
    ],
    estimatedCost: {
      estimated_total: 'Free - $200 (optional premium resources)',
      note: 'Start with free resources: YouTube tutorials, Coursera audit tracks, Khan Academy, GitHub learning paths, and company documentation. Paid certifications are optional and only recommended after mastering free fundamentals.'
    },
    timeToComplete: interest === 'Technology/Engineering' ? '4-8 months (intensive)' :
                    interest === 'Data/Analytics' ? '3-6 months (focused learning)' :
                    interest === 'Consulting' ? '2-6 months (case prep + business skills)' :
                    '3-12 months (self-paced)',
    platforms: careerResources.platforms,
    specificCourses: careerResources.specificCourses,
    communities: careerResources.communities,
    certifications: careerResources.certifications,
    actionableSteps: specificActions,
    note: `These recommendations are tailored for ${phdArea.replace('_', ' ')} PhDs transitioning to ${interest.toLowerCase().replace('/', ' & ')}.`,
    upgradeMessage: 'Take our detailed career quiz for even more personalized recommendations and a complete action plan for your top 3 career matches.'
  };
}

function generateSkillDevelopment(interest, phdArea) {
  // General skill recommendations based on interest
  const skillsByInterest = {
    'Technology/Engineering': {
      immediate: ['Programming basics', 'Technical problem solving', 'Systems thinking'],
      medium_term: ['Software development', 'Engineering design', 'Technical project management'],
      advanced: ['Advanced programming', 'Architecture design', 'Team leadership']
    },
    'Data/Analytics': {
      immediate: ['Statistics', 'Data visualization', 'Excel/Spreadsheets'],
      medium_term: ['Python/R programming', 'SQL databases', 'Machine learning basics'],
      advanced: ['Advanced ML/AI', 'Big data tools', 'Data engineering']
    },
    'Consulting': {
      immediate: ['Presentation skills', 'Business frameworks', 'Client communication'],
      medium_term: ['Strategy development', 'Project management', 'Industry knowledge'],
      advanced: ['Leadership', 'Business development', 'Specialized expertise']
    }
  };

  return skillsByInterest[interest] || {
    immediate: ['Research skills', 'Analytical thinking', 'Communication'],
    medium_term: ['Domain expertise', 'Project management', 'Networking'],
    advanced: ['Leadership', 'Strategic thinking', 'Innovation']
  };
}

function generatePersonalizedInsights(interest, phdArea, stage) {
  // Get PhD-specific strengths
  const phdStrengths = gapPersonalization.phdSpecificStrengths[phdArea] || [
    'Strong analytical and problem-solving abilities',
    'Research methodology and critical thinking',
    'Ability to learn complex topics independently'
  ];
  
  // Add stage-specific strength
  const stageStrength = stage === 'senior_researcher' ? 
    'Extensive domain expertise and research leadership experience' :
    stage === 'early_phd' || stage === 'masters_student' ?
    'Fresh perspective and adaptability to new methodologies' :
    'Solid research foundation with growing expertise';
  
  // Get career-specific development areas
  const careerDevelopmentAreas = gapPersonalization.careerSpecificDevelopmentAreas[interest] || [
    'Industry-specific knowledge and practices',
    'Business acumen and commercial awareness',
    'Professional networking in new field',
    'Technical skills specific to target career'
  ];

  // Generate personalized market outlook
  const phdAreaFormatted = phdArea.replace('_', ' ');
  const interestFormatted = interest.toLowerCase().replace('/', ' & ');
  
  let marketOutlook = `${phdAreaFormatted.charAt(0).toUpperCase() + phdAreaFormatted.slice(1)} PhDs are increasingly valuable in ${interestFormatted} roles. `;
  
  if (interest === 'Technology/Engineering') {
    marketOutlook += phdArea.includes('computer') || phdArea.includes('math') ?
      'Your quantitative background aligns perfectly with the growing demand for technical expertise in engineering roles.' :
      'Companies seek professionals who can bridge scientific rigor with engineering innovation.';
  } else if (interest === 'Data/Analytics') {
    marketOutlook += 'The demand for data scientists with domain expertise is at an all-time high, especially those who can interpret complex scientific data.';
  } else if (interest === 'Healthcare/Biotech') {
    marketOutlook += phdArea.includes('biology') || phdArea.includes('chemistry') || phdArea.includes('neuroscience') ?
      'Your scientific background is directly applicable and highly sought after in the rapidly growing biotech sector.' :
      'Healthcare companies value analytical minds who can contribute to evidence-based decision making.';
  } else {
    marketOutlook += 'Organizations increasingly value the analytical rigor and research skills that PhD training provides.';
  }

  return {
    strengths: [...phdStrengths, stageStrength],
    developmentAreas: careerDevelopmentAreas,
    marketOutlook: marketOutlook
  };
}

function getStageDisplayName(stage) {
  const stages = {
    'masters_student': 'Master\'s Student',
    'early_phd': 'Early PhD Student', 
    'late_phd': 'Late PhD Student',
    'recent_postdoc': 'Recent Postdoc',
    'experienced_postdoc': 'Experienced Postdoc',
    'senior_researcher': 'Senior Researcher'
  };
  return stages[stage] || stage;
}

function getTimeframeText(timeframe, stage, interest) {
  const base = timeframe === 'short' ? '3-6 months' : 
               timeframe === 'medium' ? '6-12 months' : 
               '12-18+ months';
  
  if (stage === 'senior_researcher') {
    return `${base} (leveraging extensive experience)`;
  }
  return base;
}