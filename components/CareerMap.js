import React, { useState, useEffect } from 'react';
import careerData from '../data/careerTimelineData_PhDOptimized.json';
import careerTrajectories from '../data/careerTrajectories.json';
import DynamicCareerTimeline from './DynamicCareerTimeline';

const CareerMap = ({ careerPath = 'data_scientist', showPivots = true, interactive = true }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [trajectory, setTrajectory] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Function to generate PhD-optimized getting started content for each career path
  const generateGettingStartedContent = (career, careerPath) => {
    const careerConfigs = {
      data_scientist: {
        education: "PhD in quantitative sciences (Physics, Chemistry, Biology, Engineering, Mathematics, Statistics, Computer Science) or equivalent research experience with demonstrated analytical problem-solving capabilities",
        certifications: [
          { name: "AWS Certified Machine Learning - Specialty", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/" },
          { name: "Google Cloud Professional Data Engineer", url: "https://cloud.google.com/certification/data-engineer" },
          { name: "Microsoft Azure Data Scientist Associate", url: "https://docs.microsoft.com/en-us/learn/certifications/azure-data-scientist/" },
          { name: "Coursera Data Science Specialization", url: "https://www.coursera.org/specializations/jhu-data-science" },
          { name: "Kaggle Learn Micro-Courses", url: "https://www.kaggle.com/learn" }
        ],
        daily_overview: `Transform complex research problems into actionable business insights using advanced statistical modeling, machine learning algorithms, and data visualization techniques. Leverage your doctoral training in hypothesis testing, experimental design, and quantitative analysis to drive strategic decision-making across product development, customer analytics, and operational optimization.`,
        preparation_steps: [
          "Reframe your dissertation research as 'data-driven solutions' and 'predictive modeling expertise' for industry audiences",
          "Build a GitHub portfolio showcasing end-to-end data science projects with business impact metrics and ROI calculations",
          "Master industry-standard tools: Python/R ecosystems, SQL databases, cloud platforms (AWS/GCP/Azure), and business intelligence software",
          "Translate academic publications into business case studies demonstrating problem-solving methodology and quantitative results",
          "Network strategically with PhD professionals in target companies through LinkedIn, industry conferences, and data science meetups",
          "Practice explaining complex statistical concepts to non-technical stakeholders using business language and visual storytelling",
          "Develop domain expertise in target industries (healthcare, finance, tech, consulting) by studying their specific data challenges and KPIs"
        ],
        typical_day: [
          "Design experiments and analyze results - similar to your research methodology but focused on user behavior or business metrics",
          "Clean and explore datasets - like preparing experimental data but from business systems",
          "Build predictive models using statistical techniques you know (regression, classification) applied to business problems",
          "Create visualizations to communicate insights to stakeholders - like presenting research findings but for business impact",
          "Collaborate with cross-functional teams - your experience working with diverse research collaborators applies directly",
          "Document analysis methods and results - your technical writing skills are highly valued",
          "Stay current with new analytical methods - your ability to learn and apply cutting-edge techniques is a major asset"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Kaggle Competitions Portfolio Building", url: "https://www.kaggle.com/competitions" },
          { name: "Towards Data Science Publication Platform", url: "https://towardsdatascience.com/" },
          { name: "MIT Professional Education Data Science", url: "https://professional.mit.edu/course-catalog/data-science" },
          { name: "Stanford Online Machine Learning Course", url: "https://www.coursera.org/learn/machine-learning" },
          { name: "Google AI Education", url: "https://ai.google/education/" },
          { name: "PyData Conference Series", url: "https://pydata.org/events/" },
          { name: "KDD Conference (Data Science)", url: "https://www.kdd.org/" }
        ],
        key_skills: [
          "Advanced Statistical Modeling", "Machine Learning & AI", "Programming (Python/R/SQL)", 
          "Business Intelligence & Analytics", "Data Visualization & Storytelling", "Experimental Design & A/B Testing",
          "Research Methodology Translation", "Cross-functional Leadership", "Strategic Problem Solving"
        ]
      },
      
      software_engineering: {
        education: "PhD in Computer Science, Engineering, Physics, Mathematics, or related quantitative field with strong programming foundation",
        certifications: [
          { name: "AWS Certified Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
          { name: "Google Cloud Professional Cloud Architect", url: "https://cloud.google.com/certification/cloud-architect" },
          { name: "Microsoft Azure Developer Associate", url: "https://docs.microsoft.com/en-us/learn/certifications/azure-developer/" },
          { name: "Meta Frontend Developer Professional Certificate", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
          { name: "System Design Interview Prep", url: "https://www.educative.io/courses/grokking-the-system-design-interview" }
        ],
        daily_overview: `Design and build scalable software systems that solve complex technical challenges. Apply your PhD training in algorithmic thinking, mathematical modeling, and systematic problem-solving to develop efficient, maintainable code architectures that power modern applications and platforms.`,
        preparation_steps: [
          "Translate your algorithmic research into 'software architecture design' and 'scalable system development' for industry contexts",
          "Build a GitHub portfolio with diverse projects: web applications, APIs, data processing pipelines, and system design examples",
          "Master industry tech stacks: cloud platforms, databases, frameworks, DevOps tools, and collaborative development workflows",
          "Convert academic coding projects into production-ready applications demonstrating best practices and performance optimization",
          "Network with PhD engineers through tech meetups, open source contributions, and engineering-focused LinkedIn communities",
          "Practice system design interviews and coding challenges that emphasize algorithmic thinking and optimization",
          "Study software engineering principles: clean code, testing methodologies, agile development, and scalability patterns"
        ],
        typical_day: [
          "Design system architectures and algorithms - similar to designing experimental frameworks but for software solutions",
          "Write and optimize code - like developing analysis scripts but for production systems serving millions of users",
          "Debug complex technical issues - using your systematic troubleshooting skills from research debugging",
          "Review code and mentor team members - your analytical evaluation skills translate directly to code quality assessment",
          "Collaborate on technical specifications - like writing research protocols but for software requirements and APIs",
          "Research new technologies and frameworks - your ability to quickly master new tools is highly valued in fast-moving tech",
          "Optimize system performance - applying your mathematical optimization knowledge to computational efficiency challenges"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "LeetCode Algorithm Practice", url: "https://leetcode.com/" },
          { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
          { name: "Coursera Software Engineering Courses", url: "https://www.coursera.org/specializations/software-design-architecture" },
          { name: "FreeCodeCamp Full Stack Development", url: "https://www.freecodecamp.org/" },
          { name: "Stack Overflow Developer Community", url: "https://stackoverflow.com/" },
          { name: "GitHub Open Source Projects", url: "https://github.com/explore" },
          { name: "IEEE Computer Society", url: "https://www.computer.org/" }
        ],
        key_skills: [
          "Algorithm Design & Optimization", "Software Architecture", "Programming Languages (Python/Java/JavaScript)", 
          "Database Design & Management", "Cloud Computing & DevOps", "System Design & Scalability",
          "Mathematical Problem Solving", "Technical Leadership", "Code Quality & Testing"
        ]
      },

      research_scientist: {
        education: "PhD in relevant scientific discipline with strong publication record and demonstrated expertise in experimental design and analysis",
        certifications: [
          { name: "Project Management Professional (PMP)", url: "https://www.pmi.org/certifications/project-management-pmp" },
          { name: "Good Clinical Practice (GCP)", url: "https://www.fda.gov/training-and-continuing-education/good-clinical-practice-gcp-training" },
          { name: "Regulatory Affairs Professionals Society (RAPS)", url: "https://www.raps.org/education" },
          { name: "Statistical Analysis System (SAS) Certification", url: "https://www.sas.com/en_us/certification.html" },
          { name: "NIH Grant Writing Workshop", url: "https://grants.nih.gov/training/index.htm" }
        ],
        daily_overview: `Lead innovative research projects that bridge academic rigor with industry applications. Apply your doctoral expertise in experimental design, data analysis, and scientific methodology to drive breakthrough discoveries while managing cross-functional teams and securing research funding.`,
        preparation_steps: [
          "Position your academic research as 'applied innovation' and 'translational science' that drives business value and competitive advantage",
          "Develop a track record of successful project management by highlighting grant applications, lab management, and publication timelines",
          "Master industry research tools: electronic lab notebooks, project management software, and collaborative research platforms",
          "Build relationships with industry research leaders through scientific conferences, collaborative publications, and strategic networking",
          "Practice presenting research in business contexts, emphasizing ROI, market impact, and strategic value to stakeholders",
          "Develop expertise in intellectual property, technology transfer, and the commercialization pathway for research discoveries",
          "Study target company research portfolios and align your expertise with their strategic research priorities and pipeline needs"
        ],
        typical_day: [
          "Design and execute complex research studies - direct application of your PhD experimental expertise to industry innovation",
          "Analyze experimental data and draw conclusions - using your statistical analysis skills to drive research decisions",
          "Manage research teams and coordinate projects - your experience supervising students translates to industry team leadership",
          "Present findings to scientific and business stakeholders - like conference presentations but with commercial impact focus",
          "Write grant proposals and research reports - your academic writing skills are essential for securing research funding",
          "Collaborate with cross-functional teams - working with business development, regulatory, and product teams using your collaborative skills",
          "Stay current with scientific literature - your expertise in evaluating and integrating new research findings is highly valued"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Industrial Research Institute", url: "https://www.iriweb.org/" },
          { name: "Research & Development Magazine", url: "https://www.rdmag.com/" },
          { name: "Nature Biotechnology Industry Insights", url: "https://www.nature.com/nbt/" },
          { name: "Science Translational Medicine", url: "https://www.science.org/journal/stm" },
          { name: "Technology Transfer Professionals", url: "https://www.autm.net/" },
          { name: "Corporate R&D Leadership Forum", url: "https://www.rdleadershipnetwork.org/" },
          { name: "Biotechnology Innovation Organization", url: "https://www.bio.org/" }
        ],
        key_skills: [
          "Advanced Research Methodology", "Experimental Design & Analysis", "Grant Writing & Funding", 
          "Scientific Project Management", "Technology Transfer", "Cross-functional Collaboration",
          "Intellectual Property Strategy", "Scientific Communication", "Innovation Leadership"
        ]
      },

      management_consultant: {
        education: "PhD in any field with demonstrated analytical rigor, strategic thinking, and complex problem-solving capabilities",
        certifications: [
          { name: "McKinsey Forward Program", url: "https://www.mckinsey.com/careers/mckinsey-forward" },
          { name: "BCG Platinion Digital Consulting", url: "https://www.bcgplatinion.com/" },
          { name: "Bain Capability Network", url: "https://www.bain.com/careers/capability-building/" },
          { name: "Certified Management Consultant (CMC)", url: "https://www.imcusa.org/page/CMCCertification" },
          { name: "Strategic Planning Professional Certificate", url: "https://www.coursera.org/specializations/strategic-leadership" }
        ],
        daily_overview: `Solve complex business challenges for Fortune 500 companies using structured analytical frameworks and strategic thinking. Leverage your PhD training in hypothesis-driven research, quantitative analysis, and systematic problem decomposition to deliver high-impact solutions for executives and drive organizational transformation.`,
        preparation_steps: [
          "Reframe your research projects as 'strategic analysis' and 'data-driven business solutions' using consulting terminology and frameworks",
          "Build case study portfolio demonstrating structured problem-solving methodology with clear business impact and measurable outcomes",
          "Master consulting frameworks: MECE analysis, hypothesis-driven problem solving, financial modeling, and strategic planning methodologies",
          "Practice case interview preparation focusing on business problem decomposition and quantitative analysis under time pressure",
          "Network strategically with PhD alumni in top-tier consulting firms through LinkedIn, alumni networks, and industry events",
          "Develop business acumen by studying successful corporate strategies, market dynamics, and competitive analysis methodologies",
          "Learn consulting presentation skills: executive communication, data visualization, and compelling narrative construction for C-suite audiences"
        ],
        typical_day: [
          "Structure complex business problems - like designing research questions but for strategic business challenges",
          "Analyze market data and competitive intelligence - similar to literature reviews but focused on business landscapes",
          "Develop strategic recommendations - using your hypothesis-testing skills to evaluate business options and scenarios",
          "Present to senior executives and stakeholders - like dissertation defenses but for strategic decision-making and implementation",
          "Lead project workstreams - your experience managing research timelines translates directly to consulting project leadership",
          "Conduct stakeholder interviews and workshops - your data collection and synthesis skills apply to business intelligence gathering",
          "Create actionable implementation plans - translating your systematic research approach to business transformation roadmaps"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Case Interview Practice", url: "https://www.caseinterview.com/" },
          { name: "McKinsey Insights", url: "https://www.mckinsey.com/insights" },
          { name: "BCG Insights", url: "https://www.bcg.com/insights" },
          { name: "Bain Insights", url: "https://www.bain.com/insights/" },
          { name: "Harvard Business Review Strategy", url: "https://hbr.org/topic/strategy" },
          { name: "Consulting Preparation Resources", url: "https://www.preplounge.com/" },
          { name: "Strategic Management Society", url: "https://www.strategicmanagement.net/" }
        ],
        key_skills: [
          "Strategic Analysis & Planning", "Business Case Development", "Financial Modeling & Analysis", 
          "Executive Communication", "Project Leadership", "Market Research & Intelligence",
          "Change Management", "Stakeholder Engagement", "Data-Driven Decision Making"
        ]
      },

      ai_ml_engineer: {
        education: "PhD in Computer Science, Mathematics, Physics, Statistics, or Engineering with strong mathematical foundation and programming experience",
        certifications: [
          { name: "TensorFlow Developer Certificate", url: "https://www.tensorflow.org/certificate" },
          { name: "AWS Certified Machine Learning - Specialty", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/" },
          { name: "Google Cloud Professional ML Engineer", url: "https://cloud.google.com/certification/machine-learning-engineer" },
          { name: "NVIDIA Deep Learning Institute", url: "https://www.nvidia.com/en-us/training/" },
          { name: "MLOps Specialization", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops" }
        ],
        daily_overview: `Design and implement cutting-edge machine learning systems that solve real-world problems at scale. Apply your PhD training in mathematical modeling, algorithm development, and systematic experimentation to build AI solutions that power products used by millions of users.`,
        preparation_steps: [
          "Translate your mathematical research into 'machine learning engineering' and 'AI system architecture' for industry applications",
          "Build an impressive GitHub portfolio with end-to-end ML projects: data pipelines, model training, deployment, and monitoring systems",
          "Master the complete ML engineering stack: MLOps tools, cloud platforms, containerization, and production deployment frameworks",
          "Convert theoretical research into practical AI applications demonstrating scalability, performance optimization, and business impact",
          "Network with ML engineers through AI conferences, open source contributions, and specialized LinkedIn ML engineering communities",
          "Practice ML system design interviews focusing on scalability challenges, model optimization, and production considerations",
          "Study real-world ML systems: recommendation engines, computer vision applications, and natural language processing implementations"
        ],
        typical_day: [
          "Design machine learning architectures - similar to designing experimental frameworks but for AI systems serving millions",
          "Implement and optimize ML algorithms - like developing computational models but for production environments with performance constraints",
          "Debug model performance issues - using your systematic analytical approach to identify and resolve complex AI system problems",
          "Collaborate with data scientists and product teams - your interdisciplinary research experience translates directly",
          "Deploy models to production systems - applying your understanding of complex systems to scalable AI infrastructure",
          "Monitor model performance and retrain systems - like ongoing experimental validation but for continuous AI improvement",
          "Research and implement new ML techniques - your ability to rapidly understand and apply cutting-edge methods is invaluable"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Papers With Code", url: "https://paperswithcode.com/" },
          { name: "Google AI Research", url: "https://ai.google/research/" },
          { name: "OpenAI Research Publications", url: "https://openai.com/research/" },
          { name: "MLOps Community", url: "https://mlops.community/" },
          { name: "Towards AI Publication", url: "https://pub.towardsai.net/" },
          { name: "AI Engineering Conference", url: "https://ai-engineering.org/" },
          { name: "NeurIPS Conference", url: "https://neurips.cc/" }
        ],
        key_skills: [
          "Deep Learning & Neural Networks", "MLOps & Model Deployment", "Python & ML Frameworks (TensorFlow/PyTorch)", 
          "Cloud Computing & Scalability", "Mathematical Optimization", "Computer Vision & NLP",
          "Algorithm Implementation", "Performance Optimization", "AI System Architecture"
        ]
      },

      ux_researcher: {
        education: "PhD in Psychology, Cognitive Science, Human-Computer Interaction, or related field with experience in human behavior research",
        certifications: [
          { name: "Google UX Design Professional Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
          { name: "Nielsen Norman Group UX Certification", url: "https://www.nngroup.com/ux-certification/" },
          { name: "Human Factors International Certification", url: "https://www.humanfactors.com/training/" },
          { name: "Interaction Design Foundation Courses", url: "https://www.interaction-design.org/" },
          { name: "UserTesting Professional Certification", url: "https://www.usertesting.com/university" }
        ],
        daily_overview: `Conduct rigorous user research studies to understand human behavior and improve digital product experiences. Apply your PhD expertise in experimental design, statistical analysis, and behavioral research to generate actionable insights that drive product decisions and enhance user satisfaction.`,
        preparation_steps: [
          "Reframe your behavioral research as 'user experience insights' and 'human-centered design methodology' for product development contexts",
          "Build a portfolio showcasing user research projects with clear methodology, findings, and product impact recommendations",
          "Master UX research tools: user testing platforms, survey design, analytics software, and qualitative analysis frameworks",
          "Translate academic research methods into industry user research: usability testing, interviews, surveys, and ethnographic studies",
          "Network with UX researchers through design meetups, research conferences, and UX-focused professional LinkedIn communities",
          "Practice presenting research findings to product teams using actionable insights and design recommendations",
          "Study product development processes and understand how user research integrates with design and engineering workflows"
        ],
        typical_day: [
          "Design user research studies - direct application of your experimental design expertise to understand user behavior",
          "Conduct user interviews and usability testing - like participant studies but focused on product interaction and experience",
          "Analyze behavioral data and identify patterns - using your statistical analysis skills to extract actionable user insights",
          "Present research findings to product teams - like conference presentations but focused on design and product decisions",
          "Collaborate with designers and product managers - your interdisciplinary research experience applies directly",
          "Develop user personas and journey maps - synthesizing research data into frameworks that guide product development",
          "Stay current with UX research methods - your ability to evaluate and apply new research techniques is highly valued"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "UX Research Collective", url: "https://uxresearch.org/" },
          { name: "User Experience Professionals Association", url: "https://uxpa.org/" },
          { name: "ResearchOps Community", url: "https://researchops.community/" },
          { name: "Mixed Methods Research Community", url: "https://mmira.wildapricot.org/" },
          { name: "Design Research Society", url: "https://www.designresearchsociety.org/" },
          { name: "UX Magazine", url: "https://uxmag.com/" },
          { name: "CHI Conference (Human-Computer Interaction)", url: "https://chi2024.acm.org/" }
        ],
        key_skills: [
          "User Research Methodology", "Experimental Design & Analysis", "Qualitative & Quantitative Research", 
          "Data Analysis & Synthesis", "Human-Computer Interaction", "Usability Testing",
          "Research Communication", "Cross-functional Collaboration", "Behavioral Analysis"
        ]
      },

      quantitative_analyst: {
        education: "PhD in Mathematics, Physics, Statistics, Engineering, Economics, or Finance with strong quantitative modeling and programming skills",
        certifications: [
          { name: "CFA (Chartered Financial Analyst)", url: "https://www.cfainstitute.org/en/programs/cfa" },
          { name: "FRM (Financial Risk Manager)", url: "https://www.garp.org/frm" },
          { name: "CQF (Certificate in Quantitative Finance)", url: "https://www.cqf.com/" },
          { name: "Bloomberg Market Concepts", url: "https://portal.bloombergforeducation.com/bmc" },
          { name: "Python for Finance Specialization", url: "https://www.coursera.org/specializations/python-trading" }
        ],
        daily_overview: `Develop sophisticated mathematical models to analyze financial markets, assess risk, and optimize trading strategies. Apply your PhD expertise in statistical modeling, mathematical optimization, and computational analysis to generate alpha and manage risk in fast-paced financial environments.`,
        preparation_steps: [
          "Translate your mathematical research into 'quantitative modeling' and 'algorithmic trading strategies' for financial industry contexts",
          "Build a portfolio of financial modeling projects demonstrating risk analysis, portfolio optimization, and trading algorithm development",
          "Master financial programming tools: Python/R for finance, SQL databases, Bloomberg Terminal, and quantitative analysis platforms",
          "Study financial markets, instruments, and trading mechanisms to understand how mathematical models apply to real market dynamics",
          "Network with quantitative professionals through finance meetups, CFA society events, and quantitative finance LinkedIn groups",
          "Practice explaining complex mathematical concepts to traders and portfolio managers using financial language and market examples",
          "Develop expertise in specific areas: derivatives pricing, risk management, algorithmic trading, or portfolio optimization"
        ],
        typical_day: [
          "Develop pricing models and risk metrics - like creating mathematical models but for financial instruments and market behavior",
          "Analyze market data and identify trading opportunities - using your statistical analysis skills to find patterns in financial time series",
          "Implement algorithmic trading strategies - applying your programming and optimization expertise to automated trading systems",
          "Present model results to traders and portfolio managers - like research presentations but focused on investment decisions",
          "Collaborate with technology and trading teams - your experience with interdisciplinary projects translates directly",
          "Monitor model performance and adjust parameters - using your experimental validation skills for continuous model improvement",
          "Research new quantitative techniques - your ability to understand and implement cutting-edge mathematical methods is essential"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Quantitative Finance Stack Exchange", url: "https://quant.stackexchange.com/" },
          { name: "QuantStart Quantitative Trading", url: "https://www.quantstart.com/" },
          { name: "Wilmott Quantitative Finance Community", url: "https://www.wilmott.com/" },
          { name: "Journal of Computational Finance", url: "https://www.risk.net/journal-of-computational-finance" },
          { name: "CFA Institute Research", url: "https://www.cfainstitute.org/en/research" },
          { name: "Risk Magazine", url: "https://www.risk.net/" },
          { name: "International Association of Financial Engineers", url: "https://www.iafe.org/" }
        ],
        key_skills: [
          "Mathematical Modeling & Optimization", "Financial Risk Analysis", "Algorithmic Trading", 
          "Statistical Analysis & Time Series", "Programming (Python/R/C++)", "Derivatives Pricing",
          "Portfolio Optimization", "Market Microstructure", "Quantitative Research"
        ]
      },

      medical_science_liaison: {
        education: "PhD in Life Sciences, Medicine, Pharmacy, or related biomedical field with strong scientific communication and clinical research background",
        certifications: [
          { name: "Medical Science Liaison Certification (MSL-BC)", url: "https://www.msls.org/certification" },
          { name: "Good Clinical Practice (GCP)", url: "https://www.fda.gov/training-and-continuing-education/good-clinical-practice-gcp-training" },
          { name: "Medical Affairs Professional Society (MAPS)", url: "https://www.medicalaffairs.org/" },
          { name: "Clinical Research Training", url: "https://www.acrpnet.org/education/" },
          { name: "Pharmaceutical Medicine Certificate", url: "https://www.pharmacomedicine.org/" }
        ],
        daily_overview: `Serve as the scientific bridge between pharmaceutical companies and healthcare professionals, providing expert medical and scientific information. Apply your PhD expertise in clinical research, data interpretation, and scientific communication to support drug development, medical education, and evidence-based healthcare decisions.`,
        preparation_steps: [
          "Position your biomedical research as 'clinical evidence generation' and 'therapeutic area expertise' for pharmaceutical industry contexts",
          "Build a portfolio demonstrating scientific communication skills through publications, presentations, and educational materials",
          "Master medical affairs tools: clinical data analysis, regulatory submission processes, and medical information management systems",
          "Develop therapeutic area specialization by studying disease pathways, treatment protocols, and emerging therapies in your field",
          "Network with MSLs and medical affairs professionals through pharmaceutical industry conferences and LinkedIn medical affairs groups",
          "Practice explaining complex scientific data to diverse healthcare audiences using clear, evidence-based communication",
          "Study pharmaceutical industry operations: drug development lifecycle, regulatory pathways, and market access strategies"
        ],
        typical_day: [
          "Present clinical data to healthcare professionals - like scientific presentations but focused on therapeutic applications and patient outcomes",
          "Review and interpret clinical study results - using your research analysis skills to evaluate therapeutic efficacy and safety",
          "Develop medical education materials - applying your teaching experience to create evidence-based educational content",
          "Support clinical trial design and execution - your experimental design expertise directly applies to protocol development",
          "Collaborate with regulatory and commercial teams - your interdisciplinary research experience translates to cross-functional healthcare teams",
          "Respond to medical information requests - using your literature review skills to provide evidence-based answers to clinical questions",
          "Stay current with medical literature - your expertise in evaluating scientific evidence is essential for therapeutic area leadership"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Medical Science Liaison Society", url: "https://www.msls.org/" },
          { name: "Medical Affairs Professional Society", url: "https://www.medicalaffairs.org/" },
          { name: "International Society for Medical Publication Professionals", url: "https://www.ismpp.org/" },
          { name: "Drug Information Association", url: "https://www.diaglobal.org/" },
          { name: "PharmaVoice Industry Magazine", url: "https://www.pharmavoice.com/" },
          { name: "Applied Clinical Trials", url: "https://www.appliedclinicaltrialsonline.com/" },
          { name: "Biotechnology Innovation Organization", url: "https://www.bio.org/" }
        ],
        key_skills: [
          "Clinical Research & Analysis", "Scientific Communication", "Therapeutic Area Expertise", 
          "Medical Writing & Education", "Regulatory Knowledge", "Cross-functional Collaboration",
          "Evidence-Based Medicine", "Stakeholder Engagement", "Healthcare Industry Knowledge"
        ]
      },

      bioinformatics_scientist: {
        education: "PhD in Bioinformatics, Computational Biology, Computer Science, or Life Sciences with strong programming and data analysis skills",
        certifications: [
          { name: "Bioinformatics Specialization (UC San Diego)", url: "https://www.coursera.org/specializations/bioinformatics" },
          { name: "AWS Certified Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
          { name: "Google Cloud Professional Data Engineer", url: "https://cloud.google.com/certification/data-engineer" },
          { name: "Illumina BaseSpace Sequence Hub Training", url: "https://www.illumina.com/science/sequencing-method-explorer.html" },
          { name: "Galaxy Project Training", url: "https://training.galaxyproject.org/" }
        ],
        daily_overview: `Develop computational solutions to analyze complex biological data and drive biomedical discoveries. Apply your PhD training in algorithm development, statistical analysis, and biological systems to create bioinformatics pipelines that accelerate drug discovery, personalized medicine, and scientific research.`,
        preparation_steps: [
          "Translate your computational biology research into 'bioinformatics pipeline development' and 'genomic data analysis' for industry applications",
          "Build a GitHub portfolio showcasing end-to-end bioinformatics projects: sequence analysis, variant calling, and machine learning applications",
          "Master industry bioinformatics tools: cloud computing platforms, containerization (Docker/Singularity), and workflow management systems",
          "Convert academic computational projects into scalable, production-ready bioinformatics solutions with clear documentation",
          "Network with bioinformatics professionals through computational biology conferences, open source contributions, and specialized LinkedIn communities",
          "Practice explaining complex algorithmic approaches to wet-lab scientists and clinical researchers using accessible language",
          "Develop expertise in specific applications: genomics, proteomics, drug discovery, or clinical bioinformatics"
        ],
        typical_day: [
          "Design bioinformatics workflows and algorithms - similar to developing computational models but for biological data analysis",
          "Analyze genomic and proteomic datasets - using your data analysis skills on complex biological information",
          "Develop and optimize analysis pipelines - applying your programming expertise to scalable biological data processing",
          "Collaborate with wet-lab scientists and clinicians - your interdisciplinary research experience translates directly",
          "Interpret biological significance of computational results - connecting your analytical findings to biological mechanisms and therapeutic implications",
          "Maintain and improve bioinformatics infrastructure - using your systems thinking to optimize computational resources and workflows",
          "Stay current with computational biology methods - your ability to rapidly adopt new algorithms and techniques is highly valued"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Bioinformatics.org Community", url: "https://www.bioinformatics.org/" },
          { name: "International Society for Computational Biology", url: "https://www.iscb.org/" },
          { name: "Galaxy Project Community", url: "https://galaxyproject.org/" },
          { name: "Bioconductor Project", url: "https://www.bioconductor.org/" },
          { name: "Nature Biotechnology", url: "https://www.nature.com/nbt/" },
          { name: "PLOS Computational Biology", url: "https://journals.plos.org/ploscompbiol/" },
          { name: "Bioinformatics Oxford Academic", url: "https://academic.oup.com/bioinformatics" }
        ],
        key_skills: [
          "Computational Biology & Genomics", "Bioinformatics Pipeline Development", "Programming (Python/R/Perl)", 
          "Statistical Analysis & Machine Learning", "Database Management", "Cloud Computing",
          "Algorithm Development", "Scientific Data Visualization", "Interdisciplinary Collaboration"
        ]
      },

      technical_consulting: {
        education: "PhD in Engineering, Computer Science, Physics, or related technical field with demonstrated expertise in complex problem-solving and client-facing communication",
        certifications: [
          { name: "Project Management Professional (PMP)", url: "https://www.pmi.org/certifications/project-management-pmp" },
          { name: "Certified Management Consultant (CMC)", url: "https://www.imcusa.org/page/CMCCertification" },
          { name: "AWS Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
          { name: "Lean Six Sigma Black Belt", url: "https://www.iassc.org/six-sigma-certification/" },
          { name: "ITIL Foundation", url: "https://www.axelos.com/certifications/itil-service-management" }
        ],
        daily_overview: `Provide specialized technical expertise to solve complex engineering and technology challenges for diverse clients. Apply your PhD training in analytical problem-solving, technical communication, and systematic methodology to deliver innovative solutions across industries and drive digital transformation initiatives.`,
        preparation_steps: [
          "Reframe your technical research as 'specialized consulting expertise' and 'technology solution architecture' for diverse industry applications",
          "Build a portfolio of technical consulting case studies demonstrating problem analysis, solution design, and measurable client outcomes",
          "Master consulting methodologies: technical due diligence, system architecture design, and technology assessment frameworks",
          "Develop broad technical knowledge across multiple domains to serve diverse client needs and industry challenges",
          "Network with technical consultants through engineering professional societies, consulting firms, and industry-specific LinkedIn groups",
          "Practice translating complex technical concepts into business value propositions and executive-level recommendations",
          "Study various industries to understand how technology drives business transformation and competitive advantage"
        ],
        typical_day: [
          "Analyze complex technical problems - like troubleshooting research equipment but for diverse client technology challenges",
          "Design technical solutions and architectures - using your systems thinking to create scalable, efficient technology implementations",
          "Present technical recommendations to clients - like research presentations but focused on business impact and implementation strategy",
          "Collaborate with client technical teams - your experience working with diverse research collaborators applies directly",
          "Conduct technology assessments and audits - applying your analytical evaluation skills to existing systems and processes",
          "Lead technical project implementations - your project management experience from research translates to client engagements",
          "Stay current with emerging technologies - your ability to quickly understand and evaluate new technical developments is essential"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Institute of Management Consultants", url: "https://www.imcusa.org/" },
          { name: "Association of Technology Management and Applied Engineering", url: "https://www.atmae.org/" },
          { name: "IEEE Technology and Engineering Management Society", url: "https://www.ieee-tems.org/" },
          { name: "Harvard Business Review Technology", url: "https://hbr.org/topic/technology" },
          { name: "MIT Technology Review", url: "https://www.technologyreview.com/" },
          { name: "Consulting Engineering Companies", url: "https://www.acec.org/" },
          { name: "Society of Professional Engineering Consultants", url: "https://www.spec.org/" }
        ],
        key_skills: [
          "Technical Problem Solving", "System Architecture & Design", "Technology Assessment", 
          "Client Relationship Management", "Technical Communication", "Project Leadership",
          "Multi-disciplinary Engineering", "Digital Transformation", "Business-Technology Alignment"
        ]
      },

      science_policy_analyst: {
        education: "PhD in any scientific field with demonstrated understanding of policy processes, regulatory frameworks, and science-society interactions",
        certifications: [
          { name: "Science Policy Certificate (AAAS)", url: "https://www.aaas.org/programs/science-technology-policy-fellowships" },
          { name: "Public Policy Analysis Certificate", url: "https://www.georgetown.edu/academics/programs/public-policy/" },
          { name: "Regulatory Affairs Professionals Society (RAPS)", url: "https://www.raps.org/education" },
          { name: "Congressional Fellowship Programs", url: "https://www.aaas.org/programs/science-technology-policy-fellowships/congressional-fellowships" },
          { name: "National Science Policy Network", url: "https://sciencepolicynetwork.org/" }
        ],
        daily_overview: `Analyze scientific evidence to inform government policy decisions and regulatory frameworks. Apply your PhD training in research evaluation, critical analysis, and evidence synthesis to bridge the gap between scientific research and public policy, ensuring evidence-based decision-making in government and advocacy organizations.`,
        preparation_steps: [
          "Translate your research expertise into 'policy analysis' and 'evidence-based decision support' for government and advocacy contexts",
          "Build a portfolio of policy briefs and analysis demonstrating your ability to synthesize complex scientific information for policymakers",
          "Master policy analysis tools: regulatory databases, legislative research platforms, and stakeholder engagement frameworks",
          "Study the policy process: how legislation is developed, regulatory pathways, and the role of scientific evidence in government decisions",
          "Network with science policy professionals through AAAS fellowships, policy conferences, and science policy LinkedIn communities",
          "Practice communicating complex scientific concepts to policymakers using clear, actionable policy language and recommendations",
          "Develop expertise in specific policy areas: healthcare, environment, technology, or science funding and research policy"
        ],
        typical_day: [
          "Analyze scientific literature for policy implications - like literature reviews but focused on regulatory and legislative applications",
          "Write policy briefs and position papers - using your technical writing skills to create evidence-based policy recommendations",
          "Brief policymakers and government officials - like research presentations but focused on policy decisions and societal impact",
          "Collaborate with advocacy groups and government agencies - your experience with diverse stakeholders translates directly",
          "Monitor legislative developments and regulatory changes - applying your research skills to track policy trends and impacts",
          "Coordinate with scientific communities - serving as a bridge between researchers and policymakers using your scientific credibility",
          "Evaluate policy proposals and regulations - using your critical analysis skills to assess scientific accuracy and feasibility"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "American Association for the Advancement of Science", url: "https://www.aaas.org/programs/science-technology-policy" },
          { name: "National Science Policy Network", url: "https://sciencepolicynetwork.org/" },
          { name: "Federation of American Scientists", url: "https://fas.org/" },
          { name: "Science Policy Research and Practice", url: "https://www.tandfonline.com/journals/uspp20" },
          { name: "Issues in Science and Technology", url: "https://issues.org/" },
          { name: "Congressional Research Service", url: "https://crsreports.congress.gov/" },
          { name: "National Academies of Sciences Policy Work", url: "https://www.nationalacademies.org/our-work/policy-and-global-affairs" }
        ],
        key_skills: [
          "Policy Analysis & Development", "Scientific Evidence Synthesis", "Regulatory Knowledge", 
          "Stakeholder Engagement", "Technical Writing & Communication", "Government Relations",
          "Legislative Process Understanding", "Public Administration", "Strategic Advocacy"
        ]
      },

      intellectual_property_analyst: {
        education: "PhD in Engineering, Chemistry, Physics, Biology, or Computer Science with strong analytical skills and attention to technical detail",
        certifications: [
          { name: "Patent Bar Examination (USPTO)", url: "https://www.uspto.gov/learning-and-resources/patent-and-trademark-practitioners/becoming-patent-practitioner" },
          { name: "Certified Licensing Professional (CLP)", url: "https://www.lesi.org/education/certification-programs" },
          { name: "IP Law Certificate Programs", url: "https://www.law.berkeley.edu/academics/llm-jsd-programs/llm-programs/ip-law/" },
          { name: "Patent Analytics Certification", url: "https://www.questel.com/patent-analytics-training/" },
          { name: "Technology Transfer Professionals", url: "https://www.autm.net/about-autm/autm-education/" }
        ],
        daily_overview: `Evaluate and protect intellectual property assets by conducting patent searches, analyzing technical innovations, and supporting IP strategy decisions. Apply your PhD expertise in technical analysis, literature research, and systematic evaluation to assess patentability, conduct freedom-to-operate analysis, and support technology commercialization efforts.`,
        preparation_steps: [
          "Position your technical research as 'intellectual property evaluation' and 'technology assessment expertise' for legal and business contexts",
          "Build a portfolio demonstrating patent analysis skills through prior art searches, technical evaluations, and IP landscape analysis",
          "Master IP analysis tools: patent databases (USPTO, Google Patents), analysis software, and legal research platforms",
          "Study patent law fundamentals, claim construction, and the intersection of technical innovation with legal protection strategies",
          "Network with IP professionals through patent law associations, technology transfer offices, and intellectual property LinkedIn communities",
          "Practice explaining complex technical concepts in patent language and legal frameworks for diverse stakeholder audiences",
          "Develop expertise in specific technology areas: biotechnology patents, software IP, or engineering innovations relevant to your background"
        ],
        typical_day: [
          "Conduct patent searches and prior art analysis - like literature reviews but focused on technical innovations and legal protection",
          "Analyze technical inventions for patentability - using your technical expertise to evaluate novelty and non-obviousness",
          "Write patent applications and technical descriptions - applying your technical writing skills to legal documentation requirements",
          "Support IP litigation and due diligence - your analytical evaluation skills translate to technical evidence assessment",
          "Collaborate with inventors and legal teams - your experience bridging technical and non-technical audiences applies directly",
          "Monitor competitive patent landscapes - using your research skills to track technological developments and IP strategy",
          "Evaluate technology transfer opportunities - applying your understanding of innovation to commercialization and licensing decisions"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Intellectual Property Owners Association", url: "https://ipo.org/" },
          { name: "Licensing Executives Society International", url: "https://www.lesi.org/" },
          { name: "Association of University Technology Managers", url: "https://www.autm.net/" },
          { name: "USPTO Patent Training", url: "https://www.uspto.gov/learning-and-resources" },
          { name: "World Intellectual Property Organization", url: "https://www.wipo.int/portal/en/" },
          { name: "IP Watchdog", url: "https://www.ipwatchdog.com/" },
          { name: "Intellectual Property Magazine", url: "https://www.intellectualpropertymagazine.com/" }
        ],
        key_skills: [
          "Patent Analysis & Research", "Technical Writing & Documentation", "Legal Research & Analysis", 
          "Technology Assessment", "IP Strategy Development", "Technical Communication",
          "Due Diligence & Risk Assessment", "Technology Transfer", "Innovation Evaluation"
        ]
      },

      regulatory_affairs_specialist: {
        education: "PhD in Life Sciences, Chemistry, Engineering, or related field with understanding of regulatory science and compliance frameworks",
        certifications: [
          { name: "Regulatory Affairs Professionals Society (RAPS)", url: "https://www.raps.org/education" },
          { name: "FDA Regulatory Science Certificate", url: "https://www.fda.gov/training-and-continuing-education" },
          { name: "Good Clinical Practice (GCP)", url: "https://www.fda.gov/training-and-continuing-education/good-clinical-practice-gcp-training" },
          { name: "ICH Guidelines Training", url: "https://www.ich.org/page/training" },
          { name: "EMA Regulatory Training", url: "https://www.ema.europa.eu/en/human-regulatory/overview/training-regulatory-science" }
        ],
        daily_overview: `Ensure compliance with government regulations for new drugs, devices, or technologies throughout development and commercialization. Apply your PhD training in scientific analysis, technical documentation, and systematic evaluation to navigate complex regulatory pathways and secure approvals for innovative products.`,
        preparation_steps: [
          "Position your scientific research as 'regulatory science expertise' and 'compliance strategy development' for pharmaceutical and medical device industries",
          "Build knowledge of regulatory frameworks by studying FDA guidance documents, EMA guidelines, and successful regulatory submissions",
          "Master regulatory tools: submission management systems, regulatory databases, and compliance tracking platforms",
          "Study drug/device development processes and understand how regulatory strategy integrates with research, development, and commercialization",
          "Network with regulatory professionals through RAPS conferences, pharmaceutical industry events, and regulatory affairs LinkedIn communities",
          "Practice writing regulatory documents and submissions using precise scientific language and regulatory formatting requirements",
          "Develop expertise in specific regulatory areas: clinical trials, manufacturing, post-market surveillance, or international harmonization"
        ],
        typical_day: [
          "Review scientific data for regulatory submissions - like peer review but focused on regulatory compliance and approval pathways",
          "Write regulatory documents and reports - using your technical writing skills for FDA submissions and regulatory communications",
          "Interact with regulatory agencies - like academic presentations but focused on product approval and compliance demonstration",
          "Collaborate with clinical and manufacturing teams - your interdisciplinary project experience translates to cross-functional regulatory strategy",
          "Assess regulatory risks and develop compliance strategies - applying your analytical skills to navigate complex regulatory requirements",
          "Monitor regulatory changes and guidance updates - using your literature monitoring skills for evolving compliance landscapes",
          "Support product launches and post-market activities - ensuring ongoing compliance using your systematic approach to complex processes"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Regulatory Affairs Professionals Society", url: "https://www.raps.org/" },
          { name: "FDA Center for Drug Evaluation and Research", url: "https://www.fda.gov/about-fda/fda-organization/center-drug-evaluation-and-research-cder" },
          { name: "Drug Information Association", url: "https://www.diaglobal.org/" },
          { name: "International Council for Harmonisation", url: "https://www.ich.org/" },
          { name: "Regulatory Focus Magazine", url: "https://www.raps.org/news-and-articles/news-articles/regulatory-focus" },
          { name: "Applied Clinical Trials", url: "https://www.appliedclinicaltrialsonline.com/" },
          { name: "Pharmaceutical Research and Manufacturers Association", url: "https://www.phrma.org/" }
        ],
        key_skills: [
          "Regulatory Science & Compliance", "Technical Writing & Documentation", "Risk Assessment & Management", 
          "Scientific Data Analysis", "Cross-functional Collaboration", "Project Management",
          "Government Relations", "Quality Assurance", "Strategic Planning"
        ]
      },

      venture_capital_analyst: {
        education: "PhD in any field with demonstrated analytical rigor, financial acumen, and deep technical expertise in emerging technology areas",
        certifications: [
          { name: "CFA (Chartered Financial Analyst)", url: "https://www.cfainstitute.org/en/programs/cfa" },
          { name: "Venture Capital Institute Certification", url: "https://www.vcic.org/" },
          { name: "Private Equity and Venture Capital Certificate", url: "https://www.wharton.upenn.edu/executive-education/private-equity-venture-capital/" },
          { name: "Financial Modeling Institute", url: "https://www.fminstitute.com/" },
          { name: "National Venture Capital Association", url: "https://nvca.org/education/" }
        ],
        daily_overview: `Evaluate early-stage technology companies and emerging innovations for investment opportunities. Apply your PhD expertise in technical due diligence, quantitative analysis, and research methodology to assess market potential, technology feasibility, and competitive positioning of startup ventures and growth companies.`,
        preparation_steps: [
          "Position your research expertise as 'technology assessment' and 'market analysis' capabilities for venture capital investment contexts",
          "Build a portfolio of investment analysis demonstrating your ability to evaluate technology startups, market opportunities, and competitive landscapes",
          "Master financial analysis tools: valuation models, market sizing, competitive intelligence platforms, and venture capital database systems",
          "Study venture capital industry: investment processes, due diligence frameworks, and successful technology investment patterns",
          "Network with VC professionals through startup events, investor meetups, and venture capital focused LinkedIn communities",
          "Practice presenting investment recommendations using compelling narratives that combine technical analysis with business impact",
          "Develop expertise in emerging technology sectors: biotech, AI/ML, cleantech, or other areas aligned with your PhD background"
        ],
        typical_day: [
          "Conduct technical due diligence on startups - like peer review but focused on technology feasibility and market potential",
          "Analyze market opportunities and competitive landscapes - using your research skills to evaluate business prospects and positioning",
          "Build financial models and valuations - applying your quantitative analysis expertise to investment decision frameworks",
          "Present investment recommendations to partners - like research presentations but focused on risk assessment and return potential",
          "Support portfolio companies with strategic advice - your problem-solving experience translates to startup guidance and mentoring",
          "Monitor industry trends and emerging technologies - using your literature review skills to identify investment themes and opportunities",
          "Network with entrepreneurs and industry experts - leveraging your scientific credibility to source deals and build relationships"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "National Venture Capital Association", url: "https://nvca.org/" },
          { name: "Venture Capital Institute", url: "https://www.vcic.org/" },
          { name: "TechCrunch Startup Coverage", url: "https://techcrunch.com/" },
          { name: "PitchBook Venture Capital Data", url: "https://pitchbook.com/" },
          { name: "CB Insights Market Intelligence", url: "https://www.cbinsights.com/" },
          { name: "First Round Review", url: "https://review.firstround.com/" },
          { name: "Bessemer Venture Partners Insights", url: "https://www.bvp.com/atlas" }
        ],
        key_skills: [
          "Investment Analysis & Due Diligence", "Financial Modeling & Valuation", "Technology Assessment", 
          "Market Research & Intelligence", "Strategic Analysis", "Risk Assessment",
          "Startup Ecosystem Knowledge", "Network Building", "Presentation & Communication"
        ]
      },

      scientific_writer: {
        education: "PhD in any scientific field with demonstrated excellence in scientific communication, publication, and technical writing",
        certifications: [
          { name: "American Medical Writers Association (AMWA)", url: "https://www.amwa.org/page/certifications" },
          { name: "Board of Editors in the Life Sciences (BELS)", url: "https://www.bels.org/certification/" },
          { name: "Council of Science Editors Certification", url: "https://www.councilscienceeditors.org/" },
          { name: "Medical Writing Certification (EMWA)", url: "https://www.emwa.org/certification/" },
          { name: "Technical Communication Certificate", url: "https://www.stc.org/certification/" }
        ],
        daily_overview: `Create compelling scientific content that bridges complex research with diverse audiences including researchers, clinicians, and the general public. Apply your PhD expertise in research methodology, critical analysis, and academic writing to produce high-quality publications, grant proposals, and educational materials that advance scientific knowledge and public understanding.`,
        preparation_steps: [
          "Position your academic writing as 'scientific communication expertise' and 'research translation' for publishing and pharmaceutical industries",
          "Build a portfolio showcasing diverse writing samples: peer-reviewed publications, grant proposals, lay summaries, and educational content",
          "Master scientific writing tools: reference management systems, collaborative writing platforms, and publication submission processes",
          "Study different scientific writing formats: regulatory documents, medical communications, and popular science writing styles",
          "Network with scientific writers through professional associations, publishing conferences, and medical writing LinkedIn communities",
          "Practice adapting your writing style for different audiences: technical experts, healthcare professionals, and general audiences",
          "Develop expertise in specific therapeutic areas or scientific domains relevant to target publications and clients"
        ],
        typical_day: [
          "Write and edit scientific manuscripts - direct application of your academic writing expertise to diverse publication formats",
          "Research and synthesize scientific literature - using your literature review skills to create comprehensive, evidence-based content",
          "Collaborate with researchers and clinicians - your experience with scientific collaboration translates to editorial and writing partnerships",
          "Develop grant proposals and funding applications - applying your grant writing experience to support research funding efforts",
          "Create educational and promotional materials - using your teaching skills to make complex science accessible to diverse audiences",
          "Review and fact-check scientific content - your peer review experience translates to editorial quality assurance and accuracy verification",
          "Stay current with scientific developments - your expertise in evaluating research findings is essential for accurate, up-to-date content"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "American Medical Writers Association", url: "https://www.amwa.org/" },
          { name: "European Medical Writers Association", url: "https://www.emwa.org/" },
          { name: "Council of Science Editors", url: "https://www.councilscienceeditors.org/" },
          { name: "International Society for Medical Publication Professionals", url: "https://www.ismpp.org/" },
          { name: "Society for Technical Communication", url: "https://www.stc.org/" },
          { name: "The Writer's Market", url: "https://www.writersmarket.com/" },
          { name: "Nature Careers Writing Advice", url: "https://www.nature.com/naturecareers/science-careers/writing" }
        ],
        key_skills: [
          "Scientific Writing & Editing", "Research Synthesis & Analysis", "Grant Writing", 
          "Technical Communication", "Publication Process Management", "Editorial Review",
          "Audience Adaptation", "Content Strategy", "Scientific Accuracy & Integrity"
        ]
      },

      biostatistician: {
        education: "PhD in Statistics, Biostatistics, Mathematics, or related quantitative field with experience in biological or medical research applications",
        certifications: [
          { name: "SAS Certified Statistical Business Analyst", url: "https://www.sas.com/en_us/certification.html" },
          { name: "American Statistical Association Certification", url: "https://www.amstat.org/education/certification" },
          { name: "Clinical Data Management Certification", url: "https://www.scdm.org/certification/" },
          { name: "Good Clinical Practice (GCP)", url: "https://www.fda.gov/training-and-continuing-education/good-clinical-practice-gcp-training" },
          { name: "R Programming for Data Science", url: "https://www.coursera.org/specializations/data-science-statistics-machine-learning" }
        ],
        daily_overview: `Design and analyze clinical trials and biomedical research studies to support drug development and medical research. Apply your PhD expertise in experimental design, statistical modeling, and hypothesis testing to ensure rigorous analysis of clinical data that drives evidence-based healthcare decisions and regulatory approvals.`,
        preparation_steps: [
          "Translate your statistical research into 'clinical trial design' and 'biomedical data analysis' for pharmaceutical and healthcare contexts",
          "Build a portfolio demonstrating biostatistical analysis skills through clinical study designs, survival analysis, and regulatory submissions",
          "Master biostatistical software: SAS, R, STATA, and clinical trial management systems used in pharmaceutical development",
          "Study clinical trial methodology, regulatory requirements, and the role of statistics in drug development and medical research",
          "Network with biostatisticians through pharmaceutical conferences, ASA meetings, and clinical research LinkedIn communities",
          "Practice explaining statistical concepts to clinical researchers and regulatory audiences using medical terminology and clinical context",
          "Develop expertise in specific areas: adaptive trial design, real-world evidence, or therapeutic area specialization"
        ],
        typical_day: [
          "Design clinical trial protocols and statistical analysis plans - direct application of your experimental design expertise to medical research",
          "Analyze clinical trial data and safety information - using your statistical analysis skills on patient data and treatment outcomes",
          "Write statistical sections of regulatory submissions - applying your technical writing skills to FDA and EMA documentation",
          "Collaborate with clinical teams and investigators - your interdisciplinary research experience translates to medical research partnerships",
          "Interpret statistical results for clinical significance - connecting your analytical findings to medical decision-making and patient outcomes",
          "Support data monitoring and interim analyses - using your quality control experience to ensure data integrity and patient safety",
          "Stay current with biostatistical methods - your ability to evaluate and implement new statistical techniques is highly valued in evolving clinical research"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "American Statistical Association", url: "https://www.amstat.org/" },
          { name: "International Biometric Society", url: "https://www.biometricsociety.org/" },
          { name: "Society for Clinical Data Management", url: "https://www.scdm.org/" },
          { name: "Drug Information Association", url: "https://www.diaglobal.org/" },
          { name: "Statistics in Medicine Journal", url: "https://onlinelibrary.wiley.com/journal/10970258" },
          { name: "Clinical Trials Journal", url: "https://journals.sagepub.com/home/ctj" },
          { name: "Pharmaceutical Statistics", url: "https://onlinelibrary.wiley.com/journal/15391612" }
        ],
        key_skills: [
          "Clinical Trial Design & Analysis", "Statistical Modeling & Hypothesis Testing", "Regulatory Statistics", 
          "SAS/R Programming", "Data Management & Quality Control", "Medical Research Methodology",
          "Survival Analysis & Longitudinal Data", "Biomedical Data Interpretation", "Cross-functional Collaboration"
        ]
      },

      clinical_research_associate: {
        education: "PhD in Life Sciences, Medicine, Public Health, or related biomedical field with experience in clinical research methodology and regulatory compliance",
        certifications: [
          { name: "Clinical Research Associate Certification (ACRP)", url: "https://www.acrpnet.org/certification/" },
          { name: "Good Clinical Practice (GCP)", url: "https://www.fda.gov/training-and-continuing-education/good-clinical-practice-gcp-training" },
          { name: "Society for Clinical Data Management (SCDM)", url: "https://www.scdm.org/certification/" },
          { name: "International Conference on Harmonisation (ICH)", url: "https://www.ich.org/page/training" },
          { name: "Clinical Trial Management Certificate", url: "https://www.acrpnet.org/education/" }
        ],
        daily_overview: `Oversee clinical trials and ensure compliance with protocols, regulations, and safety standards. Apply your PhD expertise in experimental design, data quality control, and research ethics to monitor clinical studies that test new treatments and contribute to evidence-based medicine.`,
        preparation_steps: [
          "Position your clinical research experience as 'clinical trial management' and 'regulatory compliance expertise' for pharmaceutical industry contexts",
          "Build knowledge of clinical trial regulations by studying FDA guidelines, ICH-GCP standards, and successful clinical development programs",
          "Master clinical research tools: electronic data capture systems, trial management platforms, and regulatory submission processes",
          "Study clinical development processes from protocol design through regulatory submission and understand CRA responsibilities",
          "Network with clinical research professionals through ACRP conferences, pharmaceutical industry events, and clinical research LinkedIn communities",
          "Practice site management and investigator relations using your project coordination and relationship management skills",
          "Develop expertise in specific therapeutic areas: oncology, rare diseases, medical devices, or other areas aligned with your research background"
        ],
        typical_day: [
          "Monitor clinical trial sites and ensure protocol compliance - like supervising research protocols but for patient safety and regulatory requirements",
          "Review clinical data for accuracy and completeness - using your data quality control skills from research to ensure trial integrity",
          "Train and support clinical site staff - applying your teaching and mentoring experience to clinical research teams",
          "Conduct site visits and audits - your attention to detail and systematic evaluation skills translate to clinical quality assurance",
          "Collaborate with investigators and study coordinators - your experience managing research collaborations applies directly",
          "Document and report protocol deviations - using your technical writing skills for regulatory reporting and compliance documentation",
          "Support regulatory inspections and submissions - leveraging your expertise in presenting research data to regulatory audiences"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Association of Clinical Research Professionals", url: "https://www.acrpnet.org/" },
          { name: "Society for Clinical Data Management", url: "https://www.scdm.org/" },
          { name: "Drug Information Association", url: "https://www.diaglobal.org/" },
          { name: "Clinical Research Organization Directory", url: "https://www.crolist.com/" },
          { name: "Applied Clinical Trials Magazine", url: "https://www.appliedclinicaltrialsonline.com/" },
          { name: "Clinical Trial Network", url: "https://www.clinicaltrialnetwork.org/" },
          { name: "FDA Clinical Trials Database", url: "https://clinicaltrials.gov/" }
        ],
        key_skills: [
          "Clinical Trial Management", "Regulatory Compliance", "Data Quality Assurance", 
          "Protocol Development & Monitoring", "Site Management", "Cross-functional Collaboration",
          "Medical Research Ethics", "Documentation & Reporting", "Project Coordination"
        ]
      },

      technology_transfer_officer: {
        education: "PhD in any technical field with understanding of innovation commercialization, intellectual property, and business development processes",
        certifications: [
          { name: "Association of University Technology Managers (AUTM)", url: "https://www.autm.net/about-autm/autm-education/" },
          { name: "Certified Licensing Professional (CLP)", url: "https://www.lesi.org/education/certification-programs" },
          { name: "Intellectual Property Management Certificate", url: "https://www.wipo.int/academy/en/courses/" },
          { name: "Technology Commercialization Certificate", url: "https://www.ic2.utexas.edu/technology-commercialization/" },
          { name: "Innovation Management Certification", url: "https://www.pdma.org/page/Certification" }
        ],
        daily_overview: `Bridge the gap between academic research and commercial applications by identifying, protecting, and licensing university innovations. Apply your PhD expertise in technology assessment, research evaluation, and stakeholder management to transform scientific discoveries into market-ready technologies and startup ventures.`,
        preparation_steps: [
          "Position your research experience as 'innovation assessment' and 'technology commercialization expertise' for university and industry contexts",
          "Build understanding of the innovation ecosystem: patent processes, licensing strategies, startup formation, and venture capital funding",
          "Master technology transfer tools: invention disclosure systems, patent databases, market analysis platforms, and licensing agreement templates",
          "Study successful technology transfer cases and understand the pathway from laboratory discovery to commercial product",
          "Network with technology transfer professionals through AUTM conferences, entrepreneurship events, and innovation-focused LinkedIn communities",
          "Practice evaluating commercial potential of research discoveries using market analysis and competitive intelligence frameworks",
          "Develop expertise in specific technology sectors: life sciences, engineering, IT, or other areas relevant to your research background"
        ],
        typical_day: [
          "Evaluate invention disclosures for commercial potential - like peer review but focused on market viability and competitive advantage",
          "Conduct market analysis and competitive intelligence - using your research skills to assess commercial opportunities and positioning",
          "Negotiate licensing agreements and partnerships - applying your project management skills to complex business relationships",
          "Support startup formation and entrepreneur development - your mentoring experience translates to supporting faculty entrepreneurs",
          "Collaborate with researchers, legal teams, and industry partners - your interdisciplinary experience applies to innovation ecosystems",
          "Develop commercialization strategies - using your strategic thinking to create pathways from research to market impact",
          "Monitor industry trends and partnership opportunities - leveraging your literature review skills for business development and strategy"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Association of University Technology Managers", url: "https://www.autm.net/" },
          { name: "Licensing Executives Society International", url: "https://www.lesi.org/" },
          { name: "National Business Incubation Association", url: "https://www.nbia.org/" },
          { name: "Technology Transfer Tactics", url: "https://techtransfer.universityventures.com/" },
          { name: "Innovation Management Review", url: "https://www.innovation-portal.info/" },
          { name: "World Intellectual Property Organization Academy", url: "https://www.wipo.int/academy/en/" },
          { name: "Kauffman Foundation Entrepreneurship", url: "https://www.kauffman.org/" }
        ],
        key_skills: [
          "Technology Assessment & Commercialization", "Intellectual Property Management", "Business Development", 
          "Market Analysis & Strategy", "Contract Negotiation", "Project Management",
          "Startup & Entrepreneurship Support", "Innovation Strategy", "Cross-functional Collaboration"
        ]
      },

      cybersecurity_analyst: {
        education: "PhD in Computer Science, Engineering, Mathematics, or related field with understanding of security principles, network systems, and analytical problem-solving",
        certifications: [
          { name: "Certified Information Systems Security Professional (CISSP)", url: "https://www.isc2.org/Certifications/CISSP" },
          { name: "Certified Ethical Hacker (CEH)", url: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/" },
          { name: "SANS Security Essentials", url: "https://www.sans.org/cyber-security-courses/security-essentials-bootcamp/" },
          { name: "AWS Certified Security - Specialty", url: "https://aws.amazon.com/certification/certified-security-specialty/" },
          { name: "CompTIA Security+", url: "https://www.comptia.org/certifications/security" }
        ],
        daily_overview: `Protect organizational systems and data by analyzing security threats, implementing defensive measures, and responding to cyber incidents. Apply your PhD training in systematic analysis, pattern recognition, and methodical problem-solving to identify vulnerabilities, assess risks, and develop comprehensive security strategies.`,
        preparation_steps: [
          "Translate your analytical research into 'cybersecurity analysis' and 'threat assessment expertise' for information security contexts",
          "Build a home lab demonstrating security skills: network analysis, penetration testing, incident response, and security tool proficiency",
          "Master cybersecurity tools: SIEM platforms, vulnerability scanners, network analyzers, and security orchestration systems",
          "Study cybersecurity frameworks: NIST, ISO 27001, and industry-specific security standards and compliance requirements",
          "Network with cybersecurity professionals through security conferences, local CISSP chapters, and cybersecurity LinkedIn communities",
          "Practice explaining technical security concepts to business stakeholders using risk management language and business impact analysis",
          "Develop expertise in specific security areas: cloud security, application security, or incident response relevant to your technical background"
        ],
        typical_day: [
          "Analyze security logs and threat intelligence - like analyzing experimental data but focused on identifying attack patterns and anomalies",
          "Investigate security incidents and breaches - using your systematic debugging skills to understand attack vectors and impact assessment",
          "Develop security policies and procedures - applying your technical documentation skills to create comprehensive security frameworks",
          "Conduct vulnerability assessments and penetration testing - your systematic evaluation approach translates to security testing methodologies",
          "Collaborate with IT and business teams - your interdisciplinary project experience applies to cross-functional security initiatives",
          "Monitor emerging threats and security trends - using your literature review skills to stay current with evolving cyber threat landscape",
          "Present security findings to management - like research presentations but focused on risk assessment and security investment recommendations"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Information Systems Security Association", url: "https://www.issa.org/" },
          { name: "SANS Institute Training", url: "https://www.sans.org/" },
          { name: "ISACA Cybersecurity Resources", url: "https://www.isaca.org/" },
          { name: "National Institute of Standards and Technology", url: "https://www.nist.gov/cyberframework" },
          { name: "Krebs on Security", url: "https://krebsonsecurity.com/" },
          { name: "Dark Reading Security News", url: "https://www.darkreading.com/" },
          { name: "IEEE Security & Privacy", url: "https://www.computer.org/csdl/magazine/sp" }
        ],
        key_skills: [
          "Threat Analysis & Risk Assessment", "Security Architecture & Design", "Incident Response & Forensics", 
          "Network Security & Monitoring", "Vulnerability Assessment", "Security Policy Development",
          "Analytical Problem Solving", "Technical Communication", "Cross-functional Security Leadership"
        ]
      },

      biostatistician: {
        education: "PhD in Statistics, Biostatistics, Epidemiology, or related quantitative field with strong statistical modeling and data analysis background",
        certifications: [
          { name: "SAS Certified Statistical Business Analyst", url: "https://www.sas.com/en_us/certification/credentials/advanced-analytics/sba-stat.html" },
          { name: "R Programming for Data Science Certification", url: "https://www.coursera.org/specializations/r" },
          { name: "Clinical Trials Statistical Analysis Certificate", url: "https://www.coursera.org/learn/clinical-trials" },
          { name: "Regulatory Affairs Professional Society (RAPS)", url: "https://www.raps.org/education" },
          { name: "American Statistical Association Certification", url: "https://www.amstat.org/" }
        ],
        daily_overview: `Apply advanced statistical methods to analyze clinical trial data, regulatory submissions, and biomedical research studies. Use your PhD expertise in experimental design, statistical modeling, and data interpretation to support drug development, medical device approval, and healthcare decision-making in pharmaceutical and biotech environments.`,
        preparation_steps: [
          "Position your statistical modeling expertise as 'clinical biostatistics' and 'regulatory statistics' for pharmaceutical contexts",
          "Learn regulatory submission requirements: FDA guidelines, ICH standards, and good clinical practice (GCP) protocols",
          "Master industry-standard software: SAS, R for clinical trials, and regulatory submission platforms like eCTD",
          "Study clinical trial design: randomization, stratification, interim analysis, and adaptive trial methodologies",
          "Network with biostatisticians through American Statistical Association meetings and pharmaceutical industry conferences",
          "Practice translating statistical results into regulatory language and clinical interpretations for non-statistical stakeholders",
          "Develop expertise in specific therapeutic areas: oncology, cardiovascular, or rare diseases relevant to your research background"
        ],
        typical_day: [
          "Design and analyze clinical trials - similar to experimental design in your research but focused on patient safety and efficacy",
          "Write statistical analysis plans - like writing methods sections but for regulatory compliance and FDA submission requirements",
          "Review and interpret trial data - applying your data analysis skills to patient outcomes and safety monitoring",
          "Collaborate with clinical teams and regulatory affairs - your interdisciplinary experience translates to cross-functional healthcare teams",
          "Prepare regulatory submissions and reports - using your scientific writing skills for FDA communications and study reports",
          "Provide statistical consultation to research teams - like being a methods expert but for clinical development programs",
          "Monitor trial safety and efficacy endpoints - applying your quality control experience to patient safety and regulatory oversight"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "American Statistical Association", url: "https://www.amstat.org/" },
          { name: "Society for Clinical Trials", url: "https://www.sctweb.org/" },
          { name: "FDA Statistical Guidance Documents", url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents" },
          { name: "International Conference on Harmonisation", url: "https://www.ich.org/" },
          { name: "Clinical Trials Arena", url: "https://www.clinicaltrialsarena.com/" },
          { name: "Pharmaceutical Statistics Journal", url: "https://onlinelibrary.wiley.com/journal/15391612" },
          { name: "DIA Global Forum", url: "https://www.diaglobal.org/" }
        ],
        key_skills: [
          "Clinical Trial Design & Analysis", "Regulatory Statistics & FDA Submissions", "Statistical Programming (SAS/R)", 
          "Biomedical Data Analysis", "Risk Assessment & Safety Monitoring", "Cross-functional Collaboration",
          "Statistical Consulting & Communication", "Quality Assurance & Validation", "Healthcare Research Methods"
        ]
      },

      software_engineering: {
        education: "PhD in Computer Science, Engineering, Mathematics, Physics, or related field with programming experience and computational problem-solving skills",
        certifications: [
          { name: "AWS Certified Developer - Associate", url: "https://aws.amazon.com/certification/certified-developer-associate/" },
          { name: "Google Cloud Professional Developer", url: "https://cloud.google.com/certification/cloud-developer" },
          { name: "Microsoft Azure Developer Associate", url: "https://docs.microsoft.com/en-us/learn/certifications/azure-developer/" },
          { name: "Meta Front-End Developer Certificate", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
          { name: "Docker Certified Associate", url: "https://training.mirantis.com/certification/dca-certification-exam/" }
        ],
        daily_overview: `Design, develop, and maintain software applications and systems using programming languages, frameworks, and modern development tools. Apply your PhD training in computational thinking, algorithm design, and systematic problem-solving to build scalable, efficient software solutions for web, mobile, or enterprise applications.`,
        preparation_steps: [
          "Translate your computational research into 'software engineering expertise' and 'full-stack development skills' for technology roles",
          "Build a professional portfolio showcasing diverse projects: web applications, APIs, data processing systems, and open-source contributions",
          "Master modern development stack: React/Vue.js for frontend, Node.js/Python/Java for backend, and cloud deployment platforms",
          "Learn software engineering best practices: version control (Git), testing frameworks, CI/CD pipelines, and agile development methodologies",
          "Network with engineers through tech meetups, hackathons, GitHub communities, and local software development groups",
          "Practice system design and technical interviews focusing on algorithms, data structures, and architecture patterns",
          "Develop expertise in specific domains: fintech, healthcare tech, or scientific computing relevant to your research background"
        ],
        typical_day: [
          "Write and review code for applications and systems - like developing analysis scripts but for production software used by thousands of users",
          "Debug and troubleshoot software issues - using your systematic problem-solving approach to identify and fix complex technical problems",
          "Collaborate with product teams and designers - your interdisciplinary project experience translates to cross-functional development teams",
          "Design software architecture and APIs - applying your systems thinking to create scalable, maintainable software infrastructure",
          "Participate in code reviews and technical discussions - like peer review but focused on code quality, security, and performance optimization",
          "Deploy and monitor applications in cloud environments - using your technical troubleshooting skills for production system management",
          "Stay current with new technologies and frameworks - your continuous learning mindset is essential for evolving technology landscape"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Stack Overflow Developer Community", url: "https://stackoverflow.com/" },
          { name: "GitHub Open Source Projects", url: "https://github.com/explore" },
          { name: "freeCodeCamp Full Stack Curriculum", url: "https://www.freecodecamp.org/" },
          { name: "LeetCode Algorithm Practice", url: "https://leetcode.com/" },
          { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
          { name: "IEEE Computer Society", url: "https://www.computer.org/" },
          { name: "ACM Digital Library", url: "https://dl.acm.org/" }
        ],
        key_skills: [
          "Programming Languages & Frameworks", "Software Architecture & Design", "Database Design & Management", 
          "Cloud Computing & DevOps", "API Development & Integration", "Version Control & Collaboration",
          "Testing & Quality Assurance", "Problem Solving & Debugging", "Agile Development & Project Management"
        ]
      },

      science_policy_analyst: {
        education: "PhD in any scientific field with understanding of research methodology, policy analysis, and science-society interactions",
        certifications: [
          { name: "AAAS Science & Technology Policy Fellowship", url: "https://www.aaas.org/programs/science-technology-policy-fellowships" },
          { name: "Georgetown Public Policy Institute Certificate", url: "https://sfs.georgetown.edu/academics/executive-education/" },
          { name: "Harvard Kennedy School Executive Education", url: "https://www.hks.harvard.edu/executive-education" },
          { name: "Policy Analysis Professional Development", url: "https://www.appam.org/" },
          { name: "Science Communication Certification", url: "https://www.coursera.org/learn/science-communication" }
        ],
        daily_overview: `Analyze scientific research and translate findings into policy recommendations that guide government decisions, funding priorities, and regulatory frameworks. Apply your PhD expertise in research evaluation, evidence synthesis, and analytical thinking to bridge the gap between scientific knowledge and public policy implementation.`,
        preparation_steps: [
          "Reframe your research expertise as 'policy analysis' and 'evidence-based decision making' for government and think tank contexts",
          "Learn policy analysis frameworks: cost-benefit analysis, stakeholder mapping, and policy evaluation methodologies",
          "Study the policy-making process: how legislation is created, regulatory procedures, and government science advisory structures",
          "Practice writing policy briefs and memos that translate complex scientific concepts into actionable policy recommendations",
          "Network with policy professionals through AAAS meetings, think tank events, and government science policy conferences",
          "Develop understanding of specific policy areas: climate change, healthcare, emerging technologies, or research funding relevant to your field",
          "Build experience through fellowships, internships, or volunteer work with science policy organizations and government agencies"
        ],
        typical_day: [
          "Research and analyze scientific literature for policy implications - like literature reviews but focused on policy relevance and societal impact",
          "Write policy briefs and recommendations - using your technical writing skills to communicate complex science for policymaker audiences",
          "Attend hearings and stakeholder meetings - your presentation experience translates to policy briefings and advisory committee participation",
          "Collaborate with scientists, lawyers, and policymakers - your interdisciplinary project experience applies to cross-sector policy teams",
          "Evaluate the societal impact of proposed policies - applying your analytical skills to assess policy effectiveness and unintended consequences",
          "Track legislative developments and regulatory changes - using your research skills to monitor policy landscape and emerging issues",
          "Present findings to government officials and advocacy groups - like conference presentations but for policy influence and decision-making"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "American Association for the Advancement of Science", url: "https://www.aaas.org/" },
          { name: "Science Policy Research Institute", url: "https://sciencepolicy.org/" },
          { name: "Congressional Research Service Reports", url: "https://crsreports.congress.gov/" },
          { name: "National Academy of Sciences Policy Reports", url: "https://www.nationalacademies.org/" },
          { name: "Brookings Institution Science Policy", url: "https://www.brookings.edu/" },
          { name: "American Enterprise Institute", url: "https://www.aei.org/" },
          { name: "Federation of American Scientists", url: "https://fas.org/" }
        ],
        key_skills: [
          "Policy Analysis & Development", "Science Communication & Translation", "Stakeholder Engagement & Advocacy", 
          "Research Evaluation & Evidence Synthesis", "Legislative & Regulatory Process", "Cross-sector Collaboration",
          "Public Speaking & Presentation", "Grant Writing & Funding Strategy", "Strategic Planning & Implementation"
        ]
      },
      
      product_manager: {
        education: "PhD in any field with demonstrated project management, strategic thinking, and cross-functional collaboration experience",
        certifications: [
          { name: "Google Product Management Certificate", url: "https://www.coursera.org/professional-certificates/google-product-management" },
          { name: "Meta Product Manager Professional Certificate", url: "https://www.coursera.org/professional-certificates/meta-product-manager" },
          { name: "Product Management Professional (PMP)", url: "https://www.pmi.org/certifications/product-management-professional-pmp" },
          { name: "Stanford Product Management Course", url: "https://online.stanford.edu/courses/som-y0016-product-management" },
          { name: "Pragmatic Marketing Certification", url: "https://www.pragmaticinstitute.com/product-management/" }
        ],
        daily_overview: `Lead cross-functional teams to define, develop, and launch innovative products that solve real customer problems. Apply your PhD training in strategic thinking, data analysis, and stakeholder management to drive product strategy, prioritize features, and coordinate technical teams toward successful product outcomes.`,
        preparation_steps: [
          "Reframe your research project management as 'product strategy' and 'cross-functional team leadership' for industry contexts",
          "Build a portfolio of case studies showing how you identified problems, developed solutions, and measured success metrics",
          "Learn product management frameworks: OKRs, agile methodologies, user story mapping, and product roadmap development",
          "Practice translating technical complexity into customer value propositions and business impact statements",
          "Network with PhD alumni in product roles through LinkedIn, ProductHunt meetups, and industry conferences",
          "Develop business acumen by studying successful product launches, market analysis, and competitive intelligence",
          "Master product management tools: Jira, Figma, analytics platforms, and user research methodologies"
        ],
        typical_day: [
          "Define product requirements and user stories - like designing research protocols but for customer problems",
          "Analyze user data and feedback - similar to analyzing experimental results but focused on product usage patterns",
          "Coordinate with engineering teams - your experience managing research collaborations translates directly",
          "Present product strategy to stakeholders - like defending your thesis but for business outcomes and market opportunities",
          "Prioritize feature development - using your analytical skills to balance technical feasibility with customer impact",
          "Conduct user research and interviews - your experience with data collection and analysis is highly valuable",
          "Track product metrics and KPIs - applying your quantitative analysis skills to business performance measurement"
        ],
        recommended_resources: [
          { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
          { name: "Mind the Product Conference", url: "https://www.mindtheproduct.com/" },
          { name: "Product School Free Courses", url: "https://productschool.com/free-product-management-course/" },
          { name: "First Round Review Product Articles", url: "https://review.firstround.com/topics/product-management" },
          { name: "Product Management Stack", url: "https://theproductmanagementstack.com/" },
          { name: "Reforge Product Management Programs", url: "https://www.reforge.com/" },
          { name: "Product Coalition Medium Publication", url: "https://productcoalition.com/" },
          { name: "ProductHunt Maker Community", url: "https://www.producthunt.com/makers" }
        ],
        key_skills: [
          "Strategic Product Planning", "Cross-functional Leadership", "Data-Driven Decision Making",
          "User Research & Analytics", "Agile Project Management", "Technical Communication",
          "Market Research & Competitive Analysis", "Stakeholder Management", "Business Strategy"
        ]
      }
    };

    // Get specific config or fallback to generic PhD content
    const config = careerConfigs[careerPath] || {
      education: `PhD in relevant STEM field with demonstrated expertise in research methodology, analytical thinking, and problem-solving`,
      certifications: [
        { name: "Versatile PhD Professional Development", url: "https://versatilephd.com/" },
        { name: "Coursera Professional Certificates", url: "https://www.coursera.org/professional-certificates" },
        { name: "LinkedIn Learning Career Paths", url: "https://www.linkedin.com/learning/" },
        { name: "Industry-Specific Certifications", url: "https://www.edx.org/professional-education" }
      ],
      daily_overview: `Apply your doctoral training in analytical thinking, research methodology, and complex problem-solving to drive innovation and strategic decision-making in industry settings. Your PhD expertise in deep analysis, critical evaluation, and systematic approaches translates directly to high-value business applications.`,
      preparation_steps: [
        `Translate your research expertise into industry language relevant to ${career.name.toLowerCase()} roles`,
        "Build a professional portfolio showcasing problem-solving methodology and quantitative results",
        "Master industry-standard tools and platforms commonly used in this field",
        "Network with PhD professionals who have successfully transitioned to similar roles",
        "Practice communicating complex concepts to diverse audiences using business-focused language",
        "Study target companies and their specific challenges to demonstrate industry knowledge",
        "Develop domain expertise by understanding how this role creates business value and drives outcomes"
      ],
      typical_day: [
        "Apply research methodology to solve complex business problems - your systematic approach is highly valued",
        "Analyze data and information to drive decision-making - similar to your experimental analysis but for business metrics",
        "Collaborate with diverse teams - your experience with interdisciplinary research translates directly",
        "Present findings and recommendations - like conference presentations but focused on business impact",
        "Lead projects and initiatives - your dissertation management skills apply to business project leadership",
        "Stay current with industry developments - your ability to master new fields quickly is a major competitive advantage",
        "Mentor team members and share expertise - your teaching and knowledge transfer skills are highly sought after"
      ],
      recommended_resources: [
        { name: "STEMPeers Professional Network", url: "https://www.linkedin.com/company/stempeerscsg/posts/?feedView=all" },
        { name: "Industry-Specific Learning Platforms", url: "https://www.coursera.org/" },
        { name: "Professional Development Communities", url: "https://www.meetup.com/" },
        { name: "Nature Careers Industry Guide", url: "https://www.nature.com/naturecareers/" },
        { name: "Harvard Business Review Career Insights", url: "https://hbr.org/topic/careers" },
        { name: "IEEE Professional Development", url: "https://www.ieee.org/membership/join/" }
      ],
      key_skills: [
        "Research Methodology", "Analytical Problem Solving", "Project Management",
        "Technical Communication", "Cross-functional Collaboration", "Strategic Thinking",
        "Data Analysis", "Innovation & Creativity", "Leadership & Mentoring"
      ]
    };

    return {
      ...config,
      timeline_to_entry: config.timeline_to_entry || "3-6 months focused preparation and networking",
      entry_level_positions: config.entry_level_positions || career.main_path.slice(0, 2).map(stage => stage.title),
      salary_expectations: career.main_path[0]?.salary
    };
  };

  useEffect(() => {
    // Convert new PhD-optimized data to rich trajectory format
    const newCareer = careerData?.career_timelines?.[careerPath] || careerData?.career_timelines?.data_scientist;
    if (newCareer) {
      const convertedTrajectory = {
        name: newCareer.name,
        timeline_years: `${Math.max(...newCareer.main_path.map(p => p.cumulativeYears))} years`,
        stages: newCareer.main_path,
        pivot_opportunities: newCareer.pivot_opportunities || [],
        getting_started: generateGettingStartedContent(newCareer, careerPath),
        newCareerData: newCareer // Keep reference to new data structure
      };
      setTrajectory(convertedTrajectory);
    }
  }, [careerPath]);

  if (!trajectory) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Career Data...</h2>
          <p className="text-gray-600">
            Career path data is being loaded. If this persists, the career path &quot;{careerPath}&quot; may not be available.
          </p>
        </div>
      </div>
    );
  }

  const colors = careerTrajectories.visualization_settings?.stage_colors || {
    'entry': '#10B981',
    'mid': '#3B82F6', 
    'senior': '#8B5CF6',
    'lead': '#F59E0B'
  };
  const skillColors = careerTrajectories.visualization_settings?.skill_categories || {
    'technical': '#EF4444',
    'leadership': '#8B5CF6',
    'business': '#10B981',
    'communication': '#F59E0B'
  };

  const getSkillCategory = (skill) => {
    const techKeywords = ['programming', 'data', 'technical', 'system', 'algorithm', 'software', 'code', 'engineering'];
    const leadershipKeywords = ['leadership', 'management', 'team', 'mentor', 'strategy', 'vision', 'organizational'];
    const businessKeywords = ['business', 'market', 'revenue', 'customer', 'product', 'financial', 'competitive'];
    const communicationKeywords = ['communication', 'presentation', 'client', 'stakeholder', 'writing', 'relationship'];
    
    const lowerSkill = skill.toLowerCase();
    
    if (techKeywords.some(keyword => lowerSkill.includes(keyword))) return 'technical';
    if (leadershipKeywords.some(keyword => lowerSkill.includes(keyword))) return 'leadership';
    if (businessKeywords.some(keyword => lowerSkill.includes(keyword))) return 'business';
    if (communicationKeywords.some(keyword => lowerSkill.includes(keyword))) return 'communication';
    
    return 'technical'; // default
  };

  const StageCard = ({ stage, index, isSelected }) => (
    <div 
      className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => interactive && setSelectedStage(isSelected ? null : index)}
    >
      {/* Stage Header */}
      <div 
        className="p-4 rounded-t-lg text-white font-semibold"
        style={{ backgroundColor: colors[stage.level] }}
      >
        <h3 className="text-lg font-bold">{stage.title}</h3>
        <div className="text-sm opacity-90">
          {stage.years_experience} years experience • {stage.typical_duration}
        </div>
      </div>

      {/* Stage Content */}
      <div className="p-4">
        {/* Positions */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Typical Positions</h4>
          <div className="space-y-1">
            {stage.positions.map((position, idx) => (
              <div key={idx} className="text-sm bg-gray-50 px-2 py-1 rounded">
                {position}
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="mb-3">
          <span className="font-semibold text-green-600">{stage.salary_range}</span>
        </div>

        {/* Core Skills Preview */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {stage.core_skills.slice(0, 3).map((skill, idx) => (
              <span 
                key={idx}
                className="text-xs px-2 py-1 rounded text-white"
                style={{ backgroundColor: skillColors[getSkillCategory(skill)] }}
              >
                {skill}
              </span>
            ))}
            {stage.core_skills.length > 3 && (
              <span className="text-xs text-gray-500">+{stage.core_skills.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Expand/Collapse Indicator */}
        {interactive && (
          <div className="text-center text-gray-400 text-sm">
            {isSelected ? '▲ Click to collapse' : '▼ Click to expand'}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isSelected && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* All Core Skills */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Core Skills</h4>
            <div className="flex flex-wrap gap-2">
              {stage.core_skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="text-sm px-3 py-1 rounded text-white cursor-pointer transition-opacity hover:opacity-80"
                  style={{ backgroundColor: skillColors[getSkillCategory(skill)] }}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Developing Skills */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Developing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {stage.developing_skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="text-sm px-3 py-1 rounded border-2 border-dashed"
                  style={{ 
                    borderColor: skillColors[getSkillCategory(skill)],
                    color: skillColors[getSkillCategory(skill)]
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Key Achievements</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {stage.key_achievements.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Connection Arrow */}
      {index < trajectory.stages.length - 1 && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl z-10">
          →
        </div>
      )}
    </div>
  );

  const PivotOpportunity = ({ pivot, fromStage }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 m-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-yellow-800">Pivot to {pivot.to_career.replace('_', ' ').toUpperCase()}</h4>
        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
          {pivot.timeline}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        From: {fromStage.title}
      </div>
      <div className="flex flex-wrap gap-1">
        {pivot.transition_skills.map((skill, idx) => (
          <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  const SkillLegend = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold mb-3">Skill Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(skillColors).map(([category, color]) => (
          <div key={category} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const TimelineOverview = () => (
    <div className="mb-6">
      <DynamicCareerTimeline 
        careerKey={careerPath} 
        interactive={interactive}
        showPivots={showPivots}
      />
    </div>
  );

  const AlternativePaths = () => {
    const alternativePaths = trajectory.alternative_paths || [];
    
    if (alternativePaths.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Alternative Career Paths</h3>
          <p className="text-gray-600 text-sm">
            Alternative paths and specializations are being developed for this career. 
            Check back soon for more options!
          </p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Alternative Career Paths</h3>
        <div className="space-y-3">
          {alternativePaths.map((path, index) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-purple-700">{path.path_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{path.description}</p>
              <div className="flex flex-wrap gap-2">
                {path.typical_roles.map((role, idx) => (
                  <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HowToGetStarted = () => {
    const gettingStarted = trajectory.getting_started;
    
    if (!gettingStarted) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
            🚀 How to Get Started as a {trajectory.name}
          </h3>
          <p className="text-blue-700 text-sm">
            Getting started guidance for this career path is being developed. 
            Check back soon for detailed prerequisites, preparation steps, and daily activities information!
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
          🚀 How to Get Started as a {trajectory.name}
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Prerequisites */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              📚 Prerequisites
            </h4>
            <div className="space-y-2">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Education</h5>
                <p className="text-sm text-gray-600">{gettingStarted.education}</p>
              </div>
              {gettingStarted.certifications && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Certifications</h5>
                  <div className="flex flex-wrap gap-1">
                    {gettingStarted.certifications.map((cert, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {typeof cert === 'object' && cert.url ? (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {cert.name}
                          </a>
                        ) : (
                          cert
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {gettingStarted.key_skills && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Essential Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {gettingStarted.key_skills.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Steps */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              🎯 How to Prepare
            </h4>
            <div className="space-y-3">
              {gettingStarted.preparation_steps?.map((step, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            
            {gettingStarted.recommended_resources && (
              <div className="mt-4 pt-3 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Resources</h5>
                <div className="space-y-1">
                  {gettingStarted.recommended_resources.map((resource, idx) => (
                    <div key={idx} className="text-xs text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {typeof resource === 'object' && resource.url ? (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {resource.name}
                        </a>
                      ) : (
                        resource
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Activities */}
          <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              ⏰ Daily Activities
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">{gettingStarted.daily_overview}</p>
              {gettingStarted.typical_day && (
                <div className="space-y-2">
                  {gettingStarted.typical_day.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                      <p className="text-xs text-gray-600">{activity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Next Steps */}
        {gettingStarted.timeline_to_entry && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              ⏱️ Expected Timeline to Entry
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Time to first role:</span> {gettingStarted.timeline_to_entry}
                </p>
                {gettingStarted.entry_level_positions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Common entry positions:</p>
                    <div className="flex flex-wrap gap-1">
                      {gettingStarted.entry_level_positions.map((position, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {gettingStarted.salary_expectations && (
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Entry-level salary range:</span> {gettingStarted.salary_expectations}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {trajectory.name} Career Path
        </h1>
        <p className="text-gray-600">
          Interactive career progression map with timelines and pivot opportunities
        </p>
      </div>


      {/* Timeline Overview */}
      <TimelineOverview />


      {/* Enhanced Pivot Opportunities */}
      {showPivots && (
        <div className="mb-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Strategic Career Pivots</h2>
          <p className="text-gray-600 text-center mb-8 max-w-4xl mx-auto">
            With {trajectory.pivot_opportunities?.length || 0} distinct pivot paths, {trajectory.name}s have exceptional flexibility to transition 
            into specialized roles while leveraging their PhD analytical foundation and research expertise.
          </p>
          
          {trajectory.pivot_opportunities && trajectory.pivot_opportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trajectory.pivot_opportunities.map((pivot, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg border-l-4" style={{ borderLeftColor: pivot.color }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{pivot.branchName}</h4>
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      {pivot.transitionSuccess} success
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Pivot from:</span> {trajectory.stages[pivot.branchFromIndex]?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      At {trajectory.stages[pivot.branchFromIndex]?.cumulativeYears} years experience
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700 text-sm">Career Progression Path:</h5>
                    {pivot.stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{stage.title}</span>
                          <span className="text-sm text-gray-600">{stage.cumulativeYears}y</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">{stage.salary}</span>
                          {stage.remoteFriendly && (
                            <span className="text-xs text-green-600">🏠 Remote OK</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      💡 Leverages PhD analytical skills and research methodology
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">Pivot Opportunities Coming Soon</h3>
              <p className="text-yellow-700 text-sm">
                Advanced career transition analysis in progress for this path.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative Paths */}
      <AlternativePaths />

      {/* How to Get Started */}
      <div className="mb-8">
        <HowToGetStarted />
      </div>

      {/* Skill Tooltip */}
      {hoveredSkill && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded shadow-lg z-50">
          <div className="text-sm font-medium">{hoveredSkill}</div>
          <div className="text-xs opacity-75">Category: {getSkillCategory(hoveredSkill)}</div>
        </div>
      )}

    </div>
  );
};

export default CareerMap;

// Additional utility component for embedding in other pages
export const MiniCareerMap = ({ careerPath, maxStages = 4 }) => {
  const trajectory = careerTrajectories.trajectories[careerPath];
  
  if (!trajectory) return null;
  
  const colors = careerTrajectories.visualization_settings?.stage_colors || {
    'entry': '#10B981',
    'mid': '#3B82F6', 
    'senior': '#8B5CF6',
    'lead': '#F59E0B'
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">{trajectory.name}</h3>
      <div className="flex space-x-2 overflow-x-auto">
        {trajectory.stages.slice(0, maxStages).map((stage, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-32 p-2 rounded text-center text-sm"
            style={{ backgroundColor: colors[stage.level] + '20', borderColor: colors[stage.level] }}
          >
            <div className="font-medium" style={{ color: colors[stage.level] }}>
              {stage.title}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {stage.years_experience}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Timeline: {trajectory.timeline_years}
      </div>
    </div>
  );
};