import { PersonaType, Difficulty, InterviewFocus, DialogueStyle } from "./types";
import { Code, Users, TrendingUp, MessageSquare, Zap, Heart, ShieldAlert } from "lucide-react";
import React from "react";

export const PERSONA_CONFIG: Record<PersonaType, { name: string; title: string; description: string; color: string }> = {
  HRDirector: {
    name: "Sarah V.",
    title: "HR Director",
    description: "Strict, focuses on culture fit and EQ. Doesn't like fluff.",
    color: "#6C5CE7", // Purple
  },
  TechLead: {
    name: "Vikram S.",
    title: "Senior Tech Lead",
    description: "Aggressive, technical, and fast-paced. Show your depth.",
    color: "#00F5FF", // Cyan
  },
  CEO: {
    name: "Marcus K.",
    title: "Founder & CEO",
    description: "Visionary, high-stakes, and impatient. Be concise and bold.",
    color: "#FF3B3B", // Red
  },
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; xp: number }> = {
  Easy: { label: "Friendly Persona", color: "#4CD137", xp: 100 },
  Medium: { label: "Strict Persona", color: "#FBC531", xp: 250 },
  Hard: { label: "Aggressive Persona", color: "#E84118", xp: 500 },
};

export const FOCUS_CONFIG: Record<InterviewFocus, { label: string; description: string; icon: React.ReactNode }> = {
  Technical: {
    label: "Technical",
    description: "Deep dive into your skills, tools, and problem-solving.",
    icon: <Code size={18} />,
  },
  Behavioral: {
    label: "Behavioral",
    description: "Focuses on soft skills, past experiences, and culture fit.",
    icon: <Users size={18} />,
  },
  Strategic: {
    label: "Strategic",
    description: "High-level thinking, business impact, and long-term vision.",
    icon: <TrendingUp size={18} />,
  },
};

export const STYLE_CONFIG: Record<DialogueStyle, { label: string; description: string; icon: React.ReactNode }> = {
  Professional: {
    label: "Professional",
    description: "Standard corporate tone. Fair but formal.",
    icon: <MessageSquare size={18} />,
  },
  Sarcastic: {
    label: "Sarcastic",
    description: "Witty, slightly mocking, and keeps you on your toes.",
    icon: <Zap size={18} />,
  },
  Supportive: {
    label: "Supportive",
    description: "Encouraging and patient. Good for beginners.",
    icon: <Heart size={18} />,
  },
  Aggressive: {
    label: "Aggressive",
    description: "High pressure, rapid-fire, and very demanding.",
    icon: <ShieldAlert size={18} />,
  },
};

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'Modern' | 'Professional' | 'Creative' | 'Minimal' | 'Fresher' | 'Sales';
  atsScore: number;
  previewColor: string;
  badge?: string;
  isTop2026?: boolean;
  isMostSelected?: boolean;
  content: {
    name: string;
    role: string;
    summary: string;
    skills: string[];
    experience: { company: string; role: string; period: string; description: string }[];
    education: { school: string; degree: string; year: string }[];
    languages?: string[];
  };
}

export const TEMPLATES: Template[] = [
  {
    id: 'minimal-ats-safe',
    name: 'The Essential',
    description: 'The gold standard for ATS parsing. Zero distractions, maximum readability.',
    type: 'Minimal',
    atsScore: 100,
    previewColor: 'from-slate-400 to-slate-500',
    badge: 'ATS Perfect',
    isTop2026: true,
    content: {
      name: 'John Doe',
      role: 'Software Engineer',
      summary: 'Results-driven Software Engineer with 5+ years of experience in full-stack development and cloud architecture.',
      skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'PostgreSQL'],
      experience: [
        { company: 'Tech Corp', role: 'Senior Developer', period: '2021 - Present', description: 'Architected scalable microservices and improved system performance by 30%.' },
        { company: 'Web Solutions', role: 'Full Stack Developer', period: '2018 - 2021', description: 'Developed responsive web applications and integrated third-party APIs.' }
      ],
      education: [
        { school: 'University of Technology', degree: 'BS in Computer Science', year: '2018' }
      ]
    }
  },
  {
    id: 'modern-clean-v2',
    name: 'The Modernist',
    description: 'A stylish yet clean layout that balances aesthetics with machine readability.',
    type: 'Modern',
    atsScore: 98,
    previewColor: 'from-blue-500 to-indigo-600',
    isMostSelected: true,
    content: {
      name: 'Jane Smith',
      role: 'Product Designer',
      summary: 'User-centric Product Designer with a track record of creating intuitive digital experiences.',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems'],
      experience: [
        { company: 'Design Hub', role: 'Senior Designer', period: '2022 - Present', description: 'Led the redesign of a flagship mobile app, increasing user engagement by 20%.' },
        { company: 'Creative Agency', role: 'UI Designer', period: '2019 - 2022', description: 'Collaborated with cross-functional teams to deliver high-quality design assets.' }
      ],
      education: [
        { school: 'Art Institute', degree: 'BFA in Graphic Design', year: '2019' }
      ]
    }
  },
  {
    id: 'professional-corporate',
    name: 'The Executive',
    description: 'Designed for corporate leadership and high-level management roles.',
    type: 'Professional',
    atsScore: 99,
    previewColor: 'from-slate-800 to-slate-900',
    isTop2026: true,
    content: {
      name: 'Robert Brown',
      role: 'Operations Manager',
      summary: 'Strategic Operations Manager with 10+ years of experience in optimizing business processes.',
      skills: ['Operations Management', 'Strategic Planning', 'Budgeting', 'Team Leadership', 'Six Sigma'],
      experience: [
        { company: 'Global Logistics', role: 'Director of Operations', period: '2015 - Present', description: 'Streamlined supply chain operations, reducing costs by 15% annually.' },
        { company: 'Manufacturing Co', role: 'Operations Lead', period: '2010 - 2015', description: 'Managed a team of 50+ employees and improved production efficiency by 25%.' }
      ],
      education: [
        { school: 'Business School', degree: 'MBA in Operations', year: '2010' }
      ]
    }
  },
  {
    id: 'fresher-skills',
    name: 'The Entry Point',
    description: 'Focuses on skills and education for those just starting their career journey.',
    type: 'Fresher',
    atsScore: 97,
    previewColor: 'from-emerald-500 to-teal-600',
    badge: 'Best for Freshers',
    content: {
      name: 'Emily White',
      role: 'Junior Web Developer',
      summary: 'Highly motivated Junior Web Developer with a strong foundation in modern web technologies.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      experience: [
        { company: 'Internship Inc', role: 'Web Development Intern', period: '2023 - 2024', description: 'Assisted in building responsive websites and debugging front-end issues.' }
      ],
      education: [
        { school: 'State University', degree: 'BS in Information Technology', year: '2023' }
      ]
    }
  },
  {
    id: 'sales-results',
    name: 'The Closer',
    description: 'Results-driven layout that highlights achievements and revenue impact.',
    type: 'Sales',
    atsScore: 98,
    previewColor: 'from-orange-500 to-red-600',
    content: {
      name: 'Michael Green',
      role: 'Account Executive',
      summary: 'Top-performing Sales Professional with a consistent record of exceeding revenue targets.',
      skills: ['Sales Strategy', 'Negotiation', 'CRM', 'Lead Generation', 'Client Relations'],
      experience: [
        { company: 'Sales Force', role: 'Senior Account Executive', period: '2021 - Present', description: 'Consistently exceeded sales quotas by 20% and landed 5 major enterprise accounts.' },
        { company: 'Growth Co', role: 'Sales Representative', period: '2018 - 2021', description: 'Developed new business opportunities and increased territory revenue by 40%.' }
      ],
      education: [
        { school: 'University of Commerce', degree: 'BA in Business Administration', year: '2018' }
      ]
    }
  },
  {
    id: 'minimal-tech-lead',
    name: 'The Architect',
    description: 'A structured, high-density layout for senior technical leaders.',
    type: 'Minimal',
    atsScore: 99,
    previewColor: 'from-slate-600 to-slate-700',
    content: {
      name: 'David Chen',
      role: 'Principal Engineer',
      summary: 'Visionary technical leader with 15 years of experience in distributed systems.',
      skills: ['System Design', 'Kubernetes', 'Go', 'Distributed Systems', 'Mentorship'],
      experience: [
        { company: 'Cloud Scale', role: 'Principal Architect', period: '2019 - Present', description: 'Led the migration of legacy monolith to microservices architecture.' }
      ],
      education: [
        { school: 'MIT', degree: 'MS in Computer Science', year: '2009' }
      ]
    }
  },
  {
    id: 'modern-marketing',
    name: 'The Growth Hacker',
    description: 'Dynamic layout for marketing and growth professionals.',
    type: 'Modern',
    atsScore: 96,
    previewColor: 'from-pink-500 to-rose-600',
    content: {
      name: 'Sarah Miller',
      role: 'Growth Marketing Manager',
      summary: 'Data-driven marketer specializing in acquisition and retention strategies.',
      skills: ['SEO', 'SEM', 'Content Strategy', 'Analytics', 'A/B Testing'],
      experience: [
        { company: 'Startup X', role: 'Growth Lead', period: '2020 - Present', description: 'Increased organic traffic by 300% in 12 months.' }
      ],
      education: [
        { school: 'NYU', degree: 'BS in Marketing', year: '2018' }
      ]
    }
  },
  {
    id: 'professional-legal',
    name: 'The Counselor',
    description: 'Formal and authoritative layout for legal and compliance professionals.',
    type: 'Professional',
    atsScore: 99,
    previewColor: 'from-blue-900 to-slate-900',
    content: {
      name: 'Elizabeth Vance',
      role: 'Senior Legal Counsel',
      summary: 'Experienced attorney specializing in corporate law and intellectual property.',
      skills: ['Corporate Law', 'Contract Negotiation', 'Compliance', 'IP Strategy', 'Litigation'],
      experience: [
        { company: 'Law Firm LLP', role: 'Partner', period: '2012 - Present', description: 'Managed high-stakes litigation and multi-million dollar acquisitions.' }
      ],
      education: [
        { school: 'Harvard Law', degree: 'Juris Doctor', year: '2012' }
      ]
    }
  },
  {
    id: 'fresher-design',
    name: 'The Creative Spark',
    description: 'Portfolio-focused layout for new design graduates.',
    type: 'Fresher',
    atsScore: 95,
    previewColor: 'from-purple-400 to-indigo-500',
    content: {
      name: 'Leo Kim',
      role: 'Junior UI Designer',
      summary: 'Passionate UI designer with a focus on clean, accessible interfaces.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Typography', 'Color Theory'],
      experience: [
        { company: 'Design Studio', role: 'Design Intern', period: '2023 - 2024', description: 'Contributed to the design of 5+ client websites.' }
      ],
      education: [
        { school: 'RISD', degree: 'BFA in Graphic Design', year: '2023' }
      ]
    }
  },
  {
    id: 'sales-enterprise',
    name: 'The Enterprise Closer',
    description: 'High-impact layout for enterprise-level sales executives.',
    type: 'Sales',
    atsScore: 98,
    previewColor: 'from-amber-600 to-orange-700',
    content: {
      name: 'James Wilson',
      role: 'Enterprise Sales Director',
      summary: 'Strategic sales leader with a focus on Fortune 500 accounts.',
      skills: ['Enterprise Sales', 'Strategic Partnerships', 'Revenue Growth', 'Team Management', 'CRM'],
      experience: [
        { company: 'Global Tech', role: 'Sales Director', period: '2018 - Present', description: 'Closed $50M in new business over 3 years.' }
      ],
      education: [
        { school: 'Stanford GSB', degree: 'MBA', year: '2015' }
      ]
    }
  },
  {
    id: 'minimal-data-science',
    name: 'The Analyst',
    description: 'Clean, data-focused layout for analysts and scientists.',
    type: 'Minimal',
    atsScore: 100,
    previewColor: 'from-cyan-600 to-blue-700',
    content: {
      name: 'Anna Petrova',
      role: 'Data Scientist',
      summary: 'Expert in machine learning and statistical modeling.',
      skills: ['Python', 'R', 'SQL', 'TensorFlow', 'Tableau'],
      experience: [
        { company: 'Data Insights', role: 'Senior Scientist', period: '2020 - Present', description: 'Developed predictive models that saved $2M in operational costs.' }
      ],
      education: [
        { school: 'UC Berkeley', degree: 'PhD in Statistics', year: '2019' }
      ]
    }
  },
  {
    id: 'modern-pm',
    name: 'The Product Visionary',
    description: 'Balanced layout for product managers and owners.',
    type: 'Modern',
    atsScore: 97,
    previewColor: 'from-violet-500 to-purple-600',
    content: {
      name: 'Tom Harris',
      role: 'Senior Product Manager',
      summary: 'Strategic PM with a focus on user-centric product development.',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Data Analysis'],
      experience: [
        { company: 'App Innovators', role: 'Product Lead', period: '2019 - Present', description: 'Launched 3 new products with 1M+ active users.' }
      ],
      education: [
        { school: 'Kellogg', degree: 'MBA', year: '2017' }
      ]
    }
  },
  {
    id: 'professional-finance',
    name: 'The Controller',
    description: 'Precise and professional layout for finance and accounting.',
    type: 'Professional',
    atsScore: 99,
    previewColor: 'from-slate-700 to-slate-800',
    content: {
      name: 'Linda Martinez',
      role: 'Financial Controller',
      summary: 'Detail-oriented finance professional with 12 years of experience.',
      skills: ['Financial Reporting', 'Auditing', 'Budgeting', 'Tax Compliance', 'ERP Systems'],
      experience: [
        { company: 'Global Finance', role: 'Controller', period: '2016 - Present', description: 'Managed $100M annual budget with 100% audit accuracy.' }
      ],
      education: [
        { school: 'Wharton', degree: 'BS in Economics', year: '2010' }
      ]
    }
  },
  {
    id: 'fresher-cs',
    name: 'The New Grad',
    description: 'Project-focused layout for recent computer science graduates.',
    type: 'Fresher',
    atsScore: 98,
    previewColor: 'from-sky-500 to-blue-600',
    content: {
      name: 'Kevin Zhang',
      role: 'Software Engineer I',
      summary: 'Recent CS grad with strong algorithmic foundations and project experience.',
      skills: ['Java', 'C++', 'Python', 'Data Structures', 'Algorithms'],
      experience: [
        { company: 'University Lab', role: 'Research Assistant', period: '2023 - 2024', description: 'Implemented high-performance computing algorithms.' }
      ],
      education: [
        { school: 'Georgia Tech', degree: 'BS in Computer Science', year: '2024' }
      ]
    }
  },
  {
    id: 'sales-real-estate',
    name: 'The Agent',
    description: 'Relationship-focused layout for real estate and high-ticket sales.',
    type: 'Sales',
    atsScore: 96,
    previewColor: 'from-amber-500 to-yellow-600',
    content: {
      name: 'Sophia Rossi',
      role: 'Real Estate Broker',
      summary: 'Top-producing broker with a focus on luxury residential properties.',
      skills: ['Negotiation', 'Market Analysis', 'Client Relations', 'Marketing', 'Contract Law'],
      experience: [
        { company: 'Luxury Homes', role: 'Senior Broker', period: '2015 - Present', description: 'Closed $200M in total sales volume.' }
      ],
      education: [
        { school: 'UCLA', degree: 'BA in Communications', year: '2012' }
      ]
    }
  },
  {
    id: 'minimal-hr',
    name: 'The People Lead',
    description: 'Clean and approachable layout for HR and recruitment.',
    type: 'Minimal',
    atsScore: 99,
    previewColor: 'from-rose-400 to-pink-500',
    content: {
      name: 'Rachel Adams',
      role: 'HR Director',
      summary: 'Strategic HR leader with a focus on talent development and culture.',
      skills: ['Talent Acquisition', 'Employee Relations', 'HRIS', 'Performance Management', 'Diversity & Inclusion'],
      experience: [
        { company: 'People First', role: 'HR Director', period: '2018 - Present', description: 'Reduced employee turnover by 25% through engagement initiatives.' }
      ],
      education: [
        { school: 'Cornell', degree: 'MS in HR Management', year: '2014' }
      ]
    }
  },
  {
    id: 'modern-content',
    name: 'The Storyteller',
    description: 'Creative layout for content creators and copywriters.',
    type: 'Modern',
    atsScore: 95,
    previewColor: 'from-orange-400 to-amber-500',
    content: {
      name: 'Oliver Thorne',
      role: 'Senior Copywriter',
      summary: 'Award-winning copywriter with a knack for brand storytelling.',
      skills: ['Copywriting', 'Content Strategy', 'Brand Identity', 'Social Media', 'Editing'],
      experience: [
        { company: 'Ad Agency', role: 'Creative Lead', period: '2017 - Present', description: 'Developed campaigns for 10+ Fortune 500 brands.' }
      ],
      education: [
        { school: 'Columbia', degree: 'BA in English', year: '2015' }
      ]
    }
  },
  {
    id: 'professional-consultant',
    name: 'The Strategist',
    description: 'Impact-focused layout for management consultants.',
    type: 'Professional',
    atsScore: 99,
    previewColor: 'from-indigo-800 to-blue-900',
    content: {
      name: 'Marcus Thorne',
      role: 'Management Consultant',
      summary: 'Strategic consultant with a focus on digital transformation.',
      skills: ['Business Strategy', 'Digital Transformation', 'Change Management', 'Financial Modeling', 'Stakeholder Management'],
      experience: [
        { company: 'Big 4 Consulting', role: 'Senior Manager', period: '2016 - Present', description: 'Led transformation projects for 5 global clients.' }
      ],
      education: [
        { school: 'INSEAD', degree: 'MBA', year: '2016' }
      ]
    }
  },
  {
    id: 'fresher-marketing',
    name: 'The Brand Builder',
    description: 'Skills-focused layout for marketing freshers.',
    type: 'Fresher',
    atsScore: 97,
    previewColor: 'from-cyan-400 to-sky-500',
    content: {
      name: 'Chloe Evans',
      role: 'Marketing Associate',
      summary: 'Eager marketing graduate with a focus on digital trends.',
      skills: ['Social Media', 'Content Creation', 'SEO Basics', 'Canva', 'Analytics'],
      experience: [
        { company: 'Local Biz', role: 'Marketing Intern', period: '2023 - 2024', description: 'Managed social media accounts and increased followers by 50%.' }
      ],
      education: [
        { school: 'UT Austin', degree: 'BS in Advertising', year: '2023' }
      ]
    }
  },
  {
    id: 'sales-bd',
    name: 'The Hunter',
    description: 'Aggressive layout for business development and lead gen.',
    type: 'Sales',
    atsScore: 98,
    previewColor: 'from-red-600 to-rose-700',
    content: {
      name: 'Ryan Miller',
      role: 'Business Development Manager',
      summary: 'High-energy BD professional with a focus on outbound sales.',
      skills: ['Lead Generation', 'Cold Calling', 'Sales Pipeline', 'Negotiation', 'Market Research'],
      experience: [
        { company: 'Growth Engine', role: 'BD Lead', period: '2020 - Present', description: 'Generated $5M in new business pipeline.' }
      ],
      education: [
        { school: 'Ohio State', degree: 'BA in Marketing', year: '2019' }
      ]
    }
  },
  {
    id: 'minimal-academic',
    name: 'The Scholar',
    description: 'Traditional layout for academic and research roles.',
    type: 'Minimal',
    atsScore: 100,
    previewColor: 'from-slate-500 to-slate-600',
    content: {
      name: 'Dr. Elena Fischer',
      role: 'Research Scientist',
      summary: 'Dedicated researcher with 20+ publications in peer-reviewed journals.',
      skills: ['Research Methodology', 'Data Analysis', 'Grant Writing', 'Public Speaking', 'Scientific Writing'],
      experience: [
        { company: 'National Lab', role: 'Senior Researcher', period: '2015 - Present', description: 'Led 3 major research grants totaling $10M.' }
      ],
      education: [
        { school: 'Oxford', degree: 'PhD in Biology', year: '2014' }
      ]
    }
  },
  {
    id: 'modern-startup',
    name: 'The Unicorn',
    description: 'Bold layout for startup and tech-focused roles.',
    type: 'Modern',
    atsScore: 96,
    previewColor: 'from-fuchsia-500 to-purple-600',
    content: {
      name: 'Alex Rivera',
      role: 'Full Stack Engineer',
      summary: 'Agile developer with a passion for building scalable products.',
      skills: ['Next.js', 'GraphQL', 'Docker', 'Tailwind CSS', 'Firebase'],
      experience: [
        { company: 'Unicorn Startup', role: 'Lead Dev', period: '2021 - Present', description: 'Scaled user base from 10k to 1M.' }
      ],
      education: [
        { school: 'Waterloo', degree: 'BS in Software Engineering', year: '2020' }
      ]
    }
  },
  {
    id: 'professional-executive',
    name: 'The C-Suite',
    description: 'Prestigious layout for executive leadership.',
    type: 'Professional',
    atsScore: 99,
    previewColor: 'from-slate-900 to-black',
    content: {
      name: 'William Sterling',
      role: 'Chief Executive Officer',
      summary: 'Transformational leader with a record of driving shareholder value.',
      skills: ['Executive Leadership', 'M&A', 'Strategic Vision', 'Public Relations', 'Financial Oversight'],
      experience: [
        { company: 'Fortune 500 Co', role: 'CEO', period: '2010 - Present', description: 'Increased market cap by 200% over 10 years.' }
      ],
      education: [
        { school: 'Harvard Business School', degree: 'MBA', year: '1995' }
      ]
    }
  },
  {
    id: 'fresher-sales',
    name: 'The Sales Trainee',
    description: 'Potential-focused layout for sales entry roles.',
    type: 'Fresher',
    atsScore: 97,
    previewColor: 'from-orange-300 to-amber-400',
    content: {
      name: 'Noah Brown',
      role: 'Sales Associate',
      summary: 'Energetic graduate with strong communication and persuasion skills.',
      skills: ['Communication', 'Persuasion', 'Active Listening', 'Customer Service', 'Resilience'],
      experience: [
        { company: 'Retail Store', role: 'Sales Intern', period: '2023 - 2024', description: 'Consistently met weekly sales targets.' }
      ],
      education: [
        { school: 'Arizona State', degree: 'BA in Business', year: '2023' }
      ]
    }
  },
  {
    id: 'sales-saas',
    name: 'The SaaS Closer',
    description: 'Metric-heavy layout for SaaS sales professionals.',
    type: 'Sales',
    atsScore: 98,
    previewColor: 'from-blue-600 to-indigo-700',
    content: {
      name: 'Isabella Garcia',
      role: 'SaaS Account Executive',
      summary: 'Expert in high-velocity SaaS sales and complex deal cycles.',
      skills: ['SaaS Sales', 'Solution Selling', 'Pipeline Management', 'Forecasting', 'Demos'],
      experience: [
        { company: 'Cloud Tech', role: 'Senior AE', period: '2019 - Present', description: 'Achieved 150% of quota in 2023.' }
      ],
      education: [
        { school: 'UC San Diego', degree: 'BA in Economics', year: '2017' }
      ]
    }
  },
  {
    id: 'creative-portfolio',
    name: 'The Visionary',
    description: 'A bold, creative layout for designers and artists.',
    type: 'Creative',
    atsScore: 92,
    previewColor: 'from-pink-500 via-purple-500 to-indigo-500',
    content: {
      name: 'Maya Chen',
      role: 'Art Director',
      summary: 'Award-winning art director with a focus on visual storytelling.',
      skills: ['Art Direction', 'Visual Design', 'Branding', 'Motion Graphics', 'Team Leadership'],
      experience: [
        { company: 'Creative Studio', role: 'Art Director', period: '2019 - Present', description: 'Led the creative direction for 20+ global brands.' }
      ],
      education: [
        { school: 'Parsons', degree: 'BFA in Fine Arts', year: '2015' }
      ]
    }
  }
];

export const QUESTIONS = [
  "Tell me about yourself.",
  "Why should we hire you?",
  "What is your greatest weakness?",
  "Describe a time you failed and how you handled it.",
  "Where do you see yourself in 5 years?",
  "Why do you want to work at this company?",
  "How do you handle conflict in a team?",
  "What is your proudest professional achievement?",
];
