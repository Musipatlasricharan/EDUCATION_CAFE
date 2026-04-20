import React, { useState, useEffect } from 'react';
import { Lightbulb, Code, LineChart, Cpu, Palette, BookOpen, Award, Users, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';
import './TalentDevelopment.css';

const DEPARTMENTS = [
  { id: 'cs', label: 'Computer Science', icon: Code },
  { id: 'business', label: 'Business & Management', icon: LineChart },
  { id: 'engineering', label: 'Engineering', icon: Cpu },
  { id: 'design', label: 'Design & Arts', icon: Palette },
  { id: 'medical', label: 'Medical & Life Sciences', icon: Heart },
  { id: 'law', label: 'Law & Legal Studies', icon: Shield },
  { id: 'media', label: 'Media & Communications', icon: Users },
  { id: 'humanities', label: 'Humanities & Social Sciences', icon: BookOpen },
];

const TALENT_DATA = {
  cs: {
    coreSkills: [
      { title: 'Full-Stack Web Development', desc: 'Master modern frontend frameworks (React/Vue) and robust backend architectures.', link: 'https://react.dev/learn' },
      { title: 'Cloud Computing & DevOps', desc: 'Learn AWS/Azure, Docker, and CI/CD pipelines to deploy scalable applications.', link: 'https://aws.amazon.com/training/' },
      { title: 'Data Structures & Algorithms', desc: 'Build a strong foundation in problem-solving for technical interviews.', link: 'https://leetcode.com/explore/' }
    ],
    certifications: [
      { title: 'AWS Certified Solutions Architect', provider: 'Amazon Web Services', link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
      { title: 'Google Professional Cloud Developer', provider: 'Google', link: 'https://cloud.google.com/learn/training' },
      { title: 'Meta Front-End Developer', provider: 'Coursera', link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }
    ],
    workshops: [
      { title: 'Advanced React Patterns Workshop', type: 'Live Mentorship', link: 'https://epicreact.dev/' },
      { title: 'System Design Interview Prep', type: 'Interactive Course', link: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers' }
    ]
  },
  business: {
    coreSkills: [
      { title: 'Data-Driven Decision Making', desc: 'Utilize SQL, Excel, and Tableau to extract insights and drive business strategy.', link: 'https://www.tableau.com/learn' },
      { title: 'Agile Product Management', desc: 'Manage product lifecycles using Scrum, user stories, and cross-functional leadership.', link: 'https://www.scrum.org/resources' },
      { title: 'Digital Marketing & SEO', desc: 'Understand growth hacking, search engine optimization, and omni-channel campaigns.', link: 'https://academy.hubspot.com/courses/seo-training' }
    ],
    certifications: [
      { title: 'PMP® Certification', provider: 'Project Management Institute', link: 'https://www.pmi.org/certifications/project-management-pmp' },
      { title: 'Google Analytics Individual Qualification', provider: 'Google', link: 'https://skillshop.exceedlms.com/student/catalog/list?category_ids=6431-google-analytics-academy' },
      { title: 'HubSpot Content Marketing', provider: 'HubSpot Academy', link: 'https://academy.hubspot.com/' }
    ],
    workshops: [
      { title: 'Financial Modeling Bootcamp', type: 'Intensive Workshop', link: 'https://corporatefinanceinstitute.com/' },
      { title: 'Negotiation & Leadership Mastery', type: 'Roleplay Session', link: 'https://online.hbs.edu/courses/negotiation-mastery/' }
    ]
  },
  engineering: {
    isNested: true,
    subRoles: [
      { id: 'cs', label: 'Computer Science' },
      { id: 'mechanical', label: 'Mechanical' },
      { id: 'electrical', label: 'Electrical' },
      { id: 'ece', label: 'Electrical and Computers' },
      { id: 'civil', label: 'Civil' }
    ],
    content: {
      cs: {
        coreSkills: [
          { title: 'Software Engineering Principles', desc: 'Learn SOLID principles, design patterns, and system architectures.', link: 'https://www.coursera.org/specializations/software-design-architecture' },
          { title: 'Database Management Systems', desc: 'Master SQL, NoSQL, and advanced database indexing and sharding.', link: 'https://www.codecademy.com/learn/learn-sql' },
          { title: 'Machine Learning Basics', desc: 'Understand fundamental ML algorithms using Python, Pandas, and Scikit-learn.', link: 'https://www.coursera.org/learn/machine-learning' }
        ],
        certifications: [
          { title: 'AWS Certified Developer', provider: 'Amazon Web Services', link: 'https://aws.amazon.com/certification/certified-developer-associate/' },
          { title: 'Microsoft Certified: Azure Fundamentals', provider: 'Microsoft', link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/' },
          { title: 'Oracle Certified Professional, Java SE Programmer', provider: 'Oracle', link: 'https://education.oracle.com/java' }
        ],
        workshops: [
          { title: 'Competitive Programming Bootcamp', type: 'Intensive Workshop', link: 'https://www.hackerrank.com/' },
          { title: 'Hackathon Survival Guide', type: 'Live Seminar', link: 'https://mlh.io/' }
        ]
      },
      mechanical: {
        coreSkills: [
          { title: 'CAD, CAM & 3D Modeling', desc: 'Proficiency in AutoCAD, SolidWorks, or Fusion 360 for precision drafting.', link: 'https://www.solidworks.com/sw/support/solidworks-tutorials.htm' },
          { title: 'Thermodynamics & Heat Transfer', desc: 'Understand principles of energy conversion and thermal system design.', link: 'https://ocw.mit.edu/courses/mechanical-engineering/' },
          { title: 'Fluid Mechanics & Aerodynamics', desc: 'Analyze fluid behavior, pipe flows, and aerodynamic forces.', link: 'https://www.edx.org/learn/fluid-mechanics' }
        ],
        certifications: [
          { title: 'Certified SolidWorks Professional (CSWP)', provider: 'Dassault Systèmes', link: 'https://www.solidworks.com/certifications/cswp-mechanical-design' },
          { title: 'FE Mechanical Certification', provider: 'NCEES', link: 'https://ncees.org/engineering/fe/' },
          { title: 'Six Sigma Green Belt', provider: 'ASQ', link: 'https://www.asq.org/cert/six-sigma-green-belt' }
        ],
        workshops: [
          { title: 'Advanced CAD Modelling Mastery', type: 'Hands-on Lab', link: 'https://www.coursera.org/specializations/cad-design-digital-manufacturing' },
          { title: 'Robotics and Automation Dynamics', type: 'Virtual Seminar', link: 'https://www.edx.org/learn/robotics' }
        ]
      },
      electrical: {
        coreSkills: [
          { title: 'Circuit Analysis & Design', desc: 'Design, simulate, and build complex electrical circuits using Altium or SPICE.', link: 'https://www.coursera.org/specializations/power-electronics' },
          { title: 'Power Systems & Renewable Energy', desc: 'Analyze power generation grids and integrate solar/wind tech.', link: 'https://www.edx.org/learn/renewable-energy' },
          { title: 'Control Systems Engineering', desc: 'Understand PID controllers, signal processing, and feedback loops.', link: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/' }
        ],
        certifications: [
          { title: 'FE Electrical and Computer', provider: 'NCEES', link: 'https://ncees.org/engineering/fe/' },
          { title: 'Certified Electronics Technician (CET)', provider: 'ETA International', link: 'https://www.eta-i.org/certifications.html' },
          { title: 'LEED Green Associate', provider: 'USGBC', link: 'https://www.usgbc.org/credentials/leed-green-associate' }
        ],
        workshops: [
          { title: 'PCB Design & Fabrication Bootcamp', type: 'Intensive Workshop', link: 'https://www.udemy.com/topic/pcb-design/' },
          { title: 'Smart Grid Technologies Seminar', type: 'Live Mentorship', link: 'https://www.edx.org/learn/smart-grid' }
        ]
      },
      ece: {
        coreSkills: [
          { title: 'Embedded Systems & Microcontrollers', desc: 'Program Arduino, Raspberry Pi, and ARM Cortex processors in C/C++.', link: 'https://www.coursera.org/specializations/embedded-systems' },
          { title: 'VLSI Design & FPGAs', desc: 'Design custom silicon chips using Verilog/VHDL and FPGA boards.', link: 'https://www.edx.org/learn/vlsi' },
          { title: 'Digital Signal Processing (DSP)', desc: 'Process audio, video, and sensory data algorithms.', link: 'https://www.coursera.org/learn/dsp' }
        ],
        certifications: [
          { title: 'ARM Accredited Engineer (AAE)', provider: 'ARM', link: 'https://www.arm.com/resources/education' },
          { title: 'Cisco Certified Network Associate (CCNA)', provider: 'Cisco', link: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html' },
          { title: 'Certified LabVIEW Developer', provider: 'National Instruments', link: 'https://www.ni.com/en-us/training/certification.html' }
        ],
        workshops: [
          { title: 'Embedded C Programming Lab', type: 'Interactive Course', link: 'https://www.udemy.com/course/microcontroller-embedded-c-programming/' },
          { title: 'IoT & Edge Computing Hackathon', type: 'Live Mentorship', link: 'https://hackaday.io/' }
        ]
      },
      civil: {
        coreSkills: [
          { title: 'Structural Analysis & Design', desc: 'Evaluate forces, calculate load bearings, and design safe physical structures.', link: 'https://www.edx.org/learn/civil-engineering' },
          { title: 'AutoCAD Civil 3D', desc: 'Master civil drafting and spatial design for land development projects.', link: 'https://www.autodesk.com/certification/learning-pathways/civil-3d' },
          { title: 'Geotechnical Engineering', desc: 'Understand soil mechanics, foundational supports, and material strength.', link: 'https://ocw.mit.edu/courses/civil-and-environmental-engineering/' }
        ],
        certifications: [
          { title: 'FE Civil Certification', provider: 'NCEES', link: 'https://ncees.org/engineering/fe/' },
          { title: 'Autodesk Certified Professional in Civil 3D', provider: 'Autodesk', link: 'https://www.autodesk.com/certification/all-certifications/civil-3d-infrastructure-design-professional' },
          { title: 'Project Management Professional (PMP)', provider: 'PMI', link: 'https://www.pmi.org/certifications/project-management-pmp' }
        ],
        workshops: [
          { title: 'STAAD.Pro Structural Design Workshop', type: 'Hands-on Lab', link: 'https://www.bentley.com/software/staad-pro/' },
          { title: 'Modern Construction Management', type: 'Virtual Seminar', link: 'https://www.coursera.org/specializations/construction-management' }
        ]
      }
    }
  },
  design: {
    coreSkills: [
      { title: 'UI/UX Design Systems', desc: 'Create cohesive design systems, wireframes, and high-fidelity prototypes in Figma.', link: 'https://www.figma.com/resources/learn-design/' },
      { title: 'Motion Graphics & Animation', desc: 'Bring designs to life using Adobe After Effects and modern web animation libraries.', link: 'https://www.schoolofmotion.com/' },
      { title: 'User Research & Testing', desc: 'Conduct usability studies, A/B testing, and accessibility compliance audits.', link: 'https://www.nngroup.com/training/' }
    ],
    certifications: [
      { title: 'Google UX Design Professional', provider: 'Coursera', link: 'https://www.coursera.org/professional-certificates/google-ux-design' },
      { title: 'Adobe Certified Professional', provider: 'Adobe', link: 'https://certifiedprofessional.adobe.com/' },
      { title: 'NN/g UX Certification', provider: 'Nielsen Norman Group', link: 'https://www.nngroup.com/ux-certification/' }
    ],
    workshops: [
      { title: 'Figma to Code Transition', type: 'Interactive Course', link: 'https://www.codecademy.com/learn/intro-to-ui-ux' },
      { title: 'Inclusive & Accessible Design', type: 'Live Mentorship', link: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/' }
    ]
  },
  medical: {
    coreSkills: [
      { title: 'Clinical Research & Trials', desc: 'Understand methodologies for evaluating medical treatments and drugs.', link: 'https://www.nih.gov/health-information/clinical-trials' },
      { title: 'Healthcare Data Analytics', desc: 'Using informatics to improve patient outcomes and operational efficiency.', link: 'https://www.healthit.gov/topic/health-it-health-care-settings/informatics' },
      { title: 'Medical Ethics & Policy', desc: 'Navigate complex ethical frameworks and global health regulations.', link: 'https://www.ama-assn.org/delivering-care/ethics' }
    ],
    certifications: [
      { title: 'Health Informatics Specialization', provider: 'Johns Hopkins University', link: 'https://www.coursera.org/specializations/health-informatics' },
      { title: 'Biostatistics Certification', provider: 'Harvard Online', link: 'https://online-learning.harvard.edu/subject/biostatistics' },
      { title: 'Certified Public Health (CPH)', provider: 'NBPHE', link: 'https://www.nbphe.org/' }
    ],
    workshops: [
      { title: 'Emergency Management Seminar', type: 'Virtual Simulation', link: 'https://www.fema.gov/training' },
      { title: 'Global Health Systems Workshop', type: 'Live Panel', link: 'https://www.who.int/en' }
    ]
  },
  law: {
    coreSkills: [
      { title: 'Legal Writing & Research', desc: 'Craft persuasive legal documents and master complex citation styles.', link: 'https://www.law.cornell.edu/wex/legal_research' },
      { title: 'Intellectual Property Law', desc: 'Understand patents, copyrights, and trademarks in a digital age.', link: 'https://www.wipo.int/portal/en/index.html' },
      { title: 'Conflict Resolution & Mediation', desc: 'Develop strategies for alternative dispute resolution and negotiation.', link: 'https://www.pon.harvard.edu/' }
    ],
    certifications: [
      { title: 'Contract Law Specialization', provider: 'Yale University', link: 'https://www.coursera.org/learn/contract-law' },
      { title: 'Ethics in Legal Practice', provider: 'Oxford University', link: 'https://www.ox.ac.uk/admissions/graduate/courses/legal-studies' },
      { title: 'Cyber Law Certification', provider: 'Harvard Law School', link: 'https://hls.harvard.edu/' }
    ],
    workshops: [
      { title: 'Moot Court Advocacy', type: 'Interactive Simulation', link: 'https://www.mootcourt.org/' },
      { title: 'Legislative Drafting Workshop', type: 'Live Session', link: 'https://www.un.org/legal/ola/' }
    ]
  },
  media: {
    coreSkills: [
      { title: 'Digital Journalism & Storytelling', desc: 'Master multimedia reporting and ethical news gathering techniques.', link: 'https://www.poynter.org/' },
      { title: 'Crisis Communication', desc: 'Manage organizational reputation during high-pressure events.', link: 'https://www.prsa.org/' },
      { title: 'Social Media Strategy', desc: 'Develop data-driven campaigns for brand growth and engagement.', link: 'https://academy.hubspot.com/courses/social-media' }
    ],
    certifications: [
      { title: 'Google News Initiative Certificate', provider: 'Google', link: 'https://newsinitiative.withgoogle.com/training/' },
      { title: 'Advanced Public Relations', provider: 'Cision Academy', link: 'https://www.cision.com/academy/' },
      { title: 'Digital Media Management', provider: 'Coursera', link: 'https://www.coursera.org/specializations/digital-marketing' }
    ],
    workshops: [
      { title: 'Broadcast Journalism Bootcamp', type: 'Hands-on Lab', link: 'https://www.bbc.com/academy' },
      { title: 'Podcasting & Audio Storytelling', type: 'Live Mentorship', link: 'https://www.npr.org/training' }
    ]
  },
  humanities: {
    coreSkills: [
      { title: 'Critical Thinking & Analysis', desc: 'Analyze complex texts and social phenomena with deep insight.', link: 'https://www.criticalthinking.org/' },
      { title: 'Anthropological Research', desc: 'Understand cultural dynamics and human social evolution.', link: 'https://www.americananthro.org/' },
      { title: 'Public Policy Formulation', desc: 'Develop frameworks for social change and government action.', link: 'https://www.brookings.edu/' }
    ],
    certifications: [
      { title: 'Sociology of Media', provider: 'Stanford Online', link: 'https://online.stanford.edu/' },
      { title: 'Philosophy and Global Health', provider: 'Coursera', link: 'https://www.coursera.org/learn/philosophy-global-health' },
      { title: 'Historical Preservation Certificate', provider: 'National Trust', link: 'https://www.preservationnation.org/' }
    ],
    workshops: [
      { title: 'Social Impact Lab', type: 'Hands-on Workshop', link: 'https://www.socialimpact.com/' },
      { title: 'Ethics of AI Seminar', type: 'Live Discussion', link: 'https://www.oxford-aiethicscentre.org/' }
    ]
  }
};

export default function TalentDevelopment() {
  const [activeDept, setActiveDept] = useState('cs');
  const [activeSubDept, setActiveSubDept] = useState('cs');

  // When changing department, reset subdept if it's nested
  useEffect(() => {
    if (TALENT_DATA[activeDept].isNested) {
      setActiveSubDept(TALENT_DATA[activeDept].subRoles[0].id);
    }
  }, [activeDept]);

  let activeData = TALENT_DATA[activeDept];
  let isNested = false;

  if (activeData.isNested) {
    isNested = true;
    activeData = activeData.content[activeSubDept] || activeData.content['cs'];
  }

  const handleExternalNav = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="talent-container fade-in">
      <div className="talent-hero">
        <h1>Professional Talent Growth</h1>
        <p>
          Elevate your career trajectory with curated skill paths, industry-recognized certificates, 
          and professional mentorship tailored to your department.
        </p>
      </div>

      <div className="department-tabs">
        {DEPARTMENTS.map(dept => {
          const Icon = dept.icon;
          return (
            <button
              key={dept.id}
              className={`tab-btn ${activeDept === dept.id ? 'active' : ''}`}
              onClick={() => setActiveDept(dept.id)}
            >
              <Icon size={18} />
              {dept.label}
            </button>
          );
        })}
      </div>

      {isNested && (
        <div className="sub-department-tabs animate-slide-down">
          {TALENT_DATA[activeDept].subRoles.map(sub => (
            <button
              key={sub.id}
              className={`sub-tab-btn ${activeSubDept === sub.id ? 'active' : ''}`}
              onClick={() => setActiveSubDept(sub.id)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      <div className="talent-grid" key={activeDept + activeSubDept}>
        {/* Core Skills Section */}
        <div className="talent-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <Lightbulb size={24} />
            </div>
            <h2 className="section-title">Core Competencies</h2>
          </div>
          <ul className="suggestion-list">
            {activeData.coreSkills.map((skill, idx) => (
              <li key={idx} className="suggestion-item">
                <CheckCircle2 className="item-icon" size={20} />
                <div className="item-content">
                  <h3>{skill.title}</h3>
                  <p>{skill.desc}</p>
                  <button className="action-btn" onClick={() => handleExternalNav(skill.link)}>
                    Start Learning <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Certifications Section */}
        <div className="talent-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <Award size={24} />
            </div>
            <h2 className="section-title">Verified Certifications</h2>
          </div>
          <ul className="suggestion-list">
            {activeData.certifications.map((cert, idx) => (
              <li key={idx} className="suggestion-item">
                <BookOpen className="item-icon" size={20} />
                <div className="item-content">
                  <h3>{cert.title}</h3>
                  <p>Provider: {cert.provider}</p>
                  <button className="action-btn" onClick={() => handleExternalNav(cert.link)}>
                    View Credential <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Mentorship Section */}
        <div className="talent-section">
          <div className="section-header">
            <div className="icon-wrapper">
              <Users size={24} />
            </div>
            <h2 className="section-title">Workshops & Mentorship</h2>
          </div>
          <ul className="suggestion-list">
            {activeData.workshops.map((workshop, idx) => (
              <li key={idx} className="suggestion-item">
                <Lightbulb className="item-icon" size={20} style={{ color: '#f59e0b' }} />
                <div className="item-content">
                  <h3>{workshop.title}</h3>
                  <p>Format: {workshop.type}</p>
                  <button className="action-btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }} onClick={() => handleExternalNav(workshop.link)}>
                    Enroll Now <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
