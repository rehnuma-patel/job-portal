// Demo job listings. 60 jobs are generated from role templates with a fixed seed,
// so every visitor sees the same jobs and links to a job always work.

import { COMPANIES } from './companies.js';
import { createRng } from '../lib/random.js';

export const CATEGORIES = ['Engineering', 'Design', 'Data', 'Marketing', 'Product', 'Sales & Support', 'Security'];
export const WORKPLACES = ['Remote', 'Hybrid', 'On-site'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const LEVELS = [
  { id: 'entry', label: 'Entry level', years: '0–1 years', prefix: 'Junior ', multiplier: 0.55 },
  { id: 'mid', label: 'Mid level', years: '2–4 years', prefix: '', multiplier: 1 },
  { id: 'senior', label: 'Senior', years: '5–8 years', prefix: 'Senior ', multiplier: 1.6 },
  { id: 'lead', label: 'Lead', years: '8+ years', prefix: 'Lead ', multiplier: 2.2 },
];
export const LOCATIONS = ['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Ahmedabad', 'Remote'];
export const levelById = Object.fromEntries(LEVELS.map((level) => [level.id, level]));

const TEMPLATES = [
  {
    title: 'Frontend Developer', category: 'Engineering', team: 'web', salary: 12,
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Git'],
    summary: 'You will build fast, accessible screens that thousands of customers use every day.',
    tasks: ['Build new features in React with clean, reusable components', 'Turn Figma designs into responsive, accessible pages', 'Improve page speed and Core Web Vitals', 'Review code and write unit tests with your teammates'],
    needs: ['Strong JavaScript and React fundamentals', 'Good eye for layout, spacing and responsive design', 'Experience with Git and pull-request reviews'],
  },
  {
    title: 'Backend Engineer', category: 'Engineering', team: 'platform', salary: 14,
    skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'Redis'],
    summary: 'You will design the APIs and data models behind our product.',
    tasks: ['Design and build REST APIs used by web and mobile apps', 'Model data in PostgreSQL and write efficient queries', 'Add monitoring, logging and alerts to services', 'Take part in on-call and fix production issues'],
    needs: ['Experience building APIs with Node.js or a similar language', 'Good knowledge of SQL databases', 'Understanding of caching, queues and background jobs'],
  },
  {
    title: 'Full Stack Developer', category: 'Engineering', team: 'product engineering', salary: 13,
    skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
    summary: 'You will own features from the database all the way to the user interface.',
    tasks: ['Ship features end to end, from API to UI', 'Work closely with designers and product managers', 'Write tests and keep our codebase healthy', 'Deploy and monitor services on AWS'],
    needs: ['Experience with React and a backend framework', 'Comfortable working with NoSQL or SQL databases', 'Clear written communication'],
  },
  {
    title: 'Android Developer', category: 'Engineering', team: 'mobile', salary: 12,
    skills: ['Kotlin', 'Android', 'Jetpack Compose', 'Firebase'],
    summary: 'You will build the Android app that most of our customers use.',
    tasks: ['Build screens with Jetpack Compose', 'Integrate REST APIs and offline storage', 'Improve app start time and crash-free rate', 'Publish releases to the Play Store'],
    needs: ['Experience with Kotlin and modern Android', 'Understanding of app architecture (MVVM)', 'At least one app published on the Play Store'],
  },
  {
    title: 'DevOps Engineer', category: 'Engineering', team: 'infrastructure', salary: 15,
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    summary: 'You will keep our systems fast, secure and always available.',
    tasks: ['Manage cloud infrastructure with Terraform', 'Run and scale services on Kubernetes', 'Build CI/CD pipelines for fast, safe releases', 'Improve monitoring and incident response'],
    needs: ['Hands-on experience with AWS or another cloud', 'Experience with containers and Kubernetes', 'Strong Linux and scripting skills'],
  },
  {
    title: 'QA Automation Engineer', category: 'Engineering', team: 'quality', salary: 9,
    skills: ['Playwright', 'Selenium', 'JavaScript', 'API testing'],
    summary: 'You will make sure every release is stable before it reaches customers.',
    tasks: ['Write automated end-to-end tests', 'Test APIs and track bugs with developers', 'Run regression tests before releases', 'Improve test coverage and test speed'],
    needs: ['Experience with an automation tool like Playwright or Selenium', 'Basic programming in JavaScript or Python', 'Attention to detail'],
  },
  {
    title: 'UI/UX Designer', category: 'Design', team: 'design', salary: 10,
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User research'],
    summary: 'You will design simple, friendly experiences for web and mobile.',
    tasks: ['Create wireframes, flows and high-fidelity designs', 'Run user interviews and usability tests', 'Build clickable prototypes in Figma', 'Work with developers to ship polished UI'],
    needs: ['A portfolio showing your design process', 'Strong Figma skills', 'Understanding of accessibility and responsive design'],
  },
  {
    title: 'Product Designer', category: 'Design', team: 'product design', salary: 14,
    skills: ['Figma', 'Design systems', 'Interaction design', 'Usability testing'],
    summary: 'You will shape how our product looks, feels and works.',
    tasks: ['Own the design of key product areas', 'Grow and maintain our design system', 'Use data and research to guide decisions', 'Present work and give thoughtful feedback'],
    needs: ['Experience designing digital products', 'Strong interaction and visual design skills', 'Experience working with a design system'],
  },
  {
    title: 'Graphic Designer', category: 'Design', team: 'brand', salary: 6,
    skills: ['Illustrator', 'Photoshop', 'Branding', 'Typography'],
    summary: 'You will create the visuals for our campaigns, social media and products.',
    tasks: ['Design social posts, banners and ads', 'Create illustrations and brand assets', 'Prepare files for print and digital', 'Keep every design on brand'],
    needs: ['A strong portfolio', 'Skill with Illustrator and Photoshop', 'Good sense of colour and typography'],
  },
  {
    title: 'Data Analyst', category: 'Data', team: 'analytics', salary: 9,
    skills: ['SQL', 'Excel', 'Power BI', 'Python'],
    summary: 'You will turn data into clear answers that help teams make decisions.',
    tasks: ['Write SQL to answer business questions', 'Build dashboards in Power BI', 'Track key metrics and explain changes', 'Present findings to non-technical teams'],
    needs: ['Strong SQL and Excel skills', 'Experience with a BI tool', 'Clear communication of insights'],
  },
  {
    title: 'Data Scientist', category: 'Data', team: 'data science', salary: 16,
    skills: ['Python', 'Machine learning', 'Statistics', 'Pandas', 'SQL'],
    summary: 'You will build models that predict demand and personalise the product.',
    tasks: ['Explore data and build predictive models', 'Design and analyse A/B tests', 'Work with engineers to put models in production', 'Explain results to stakeholders'],
    needs: ['Strong Python and statistics', 'Experience with scikit-learn or similar', 'A degree in a quantitative field or equal experience'],
  },
  {
    title: 'Machine Learning Engineer', category: 'Data', team: 'AI', salary: 18,
    skills: ['Python', 'PyTorch', 'MLOps', 'Docker', 'LLMs'],
    summary: 'You will build and ship AI features used by real customers.',
    tasks: ['Train, evaluate and deploy ML models', 'Build pipelines for data and model training', 'Monitor model quality in production', 'Prototype features with large language models'],
    needs: ['Experience with PyTorch or TensorFlow', 'Experience deploying models', 'Solid software engineering skills'],
  },
  {
    title: 'Digital Marketing Specialist', category: 'Marketing', team: 'growth', salary: 7,
    skills: ['SEO', 'Google Ads', 'Analytics', 'Email marketing'],
    summary: 'You will plan and run campaigns that bring new customers to us.',
    tasks: ['Run paid campaigns on Google and Meta', 'Improve SEO and landing pages', 'Plan email campaigns and newsletters', 'Report on campaign results and budget'],
    needs: ['Experience running digital campaigns', 'Knowledge of Google Analytics', 'Data-driven mindset'],
  },
  {
    title: 'Content Writer', category: 'Marketing', team: 'content', salary: 5,
    skills: ['Copywriting', 'SEO', 'Research', 'WordPress'],
    summary: 'You will write blogs, guides and product copy that people enjoy reading.',
    tasks: ['Write blog posts, guides and newsletters', 'Research topics and interview experts', 'Optimise articles for search', 'Edit and proofread content from the team'],
    needs: ['Excellent written English', 'Writing samples or a portfolio', 'Basic SEO knowledge'],
  },
  {
    title: 'Social Media Manager', category: 'Marketing', team: 'brand', salary: 6,
    skills: ['Instagram', 'Content calendar', 'Canva', 'Analytics'],
    summary: 'You will grow and engage our community across social platforms.',
    tasks: ['Plan a monthly content calendar', 'Create and schedule posts and reels', 'Reply to comments and messages', 'Track growth and engagement'],
    needs: ['Experience managing brand accounts', 'Creative ideas and good writing', 'Comfortable with Canva or similar tools'],
  },
  {
    title: 'Product Manager', category: 'Product', team: 'product', salary: 20,
    skills: ['Roadmaps', 'User stories', 'Analytics', 'Stakeholder management'],
    summary: 'You will decide what we build next and why.',
    tasks: ['Own the roadmap for a product area', 'Talk to customers and turn needs into specs', 'Work with design and engineering to ship', 'Measure impact and learn from data'],
    needs: ['Experience as a product manager or similar role', 'Strong analytical and communication skills', 'Comfortable making decisions with incomplete data'],
  },
  {
    title: 'Business Analyst', category: 'Product', team: 'operations', salary: 10,
    skills: ['Requirements', 'SQL', 'Jira', 'Process mapping'],
    summary: 'You will connect business teams and engineers to solve the right problems.',
    tasks: ['Gather and document requirements', 'Map processes and find improvements', 'Write user stories in Jira', 'Support testing and launches'],
    needs: ['Experience writing clear requirements', 'Basic SQL', 'Good listening and communication skills'],
  },
  {
    title: 'Customer Success Manager', category: 'Sales & Support', team: 'customer success', salary: 8,
    skills: ['CRM', 'Communication', 'Onboarding', 'Zendesk'],
    summary: 'You will help our customers get the most out of the product.',
    tasks: ['Onboard new business customers', 'Run regular check-ins and training sessions', 'Find upsell opportunities', 'Share customer feedback with the product team'],
    needs: ['Experience in customer-facing roles', 'Excellent spoken and written English', 'Comfortable with CRM tools'],
  },
  {
    title: 'Sales Executive', category: 'Sales & Support', team: 'sales', salary: 6,
    skills: ['B2B sales', 'Negotiation', 'CRM', 'Lead generation'],
    summary: 'You will bring new business customers on board.',
    tasks: ['Find and contact new leads', 'Run product demos', 'Negotiate and close deals', 'Keep the CRM up to date'],
    needs: ['Experience in B2B sales', 'Confident communicator', 'Target-driven attitude'],
  },
  {
    title: 'Security Analyst', category: 'Security', team: 'security', salary: 13,
    skills: ['SIEM', 'Network security', 'Incident response', 'Linux'],
    summary: 'You will protect our systems and customer data from attacks.',
    tasks: ['Monitor alerts and investigate incidents', 'Run vulnerability scans and track fixes', 'Write security guides for engineers', 'Help with audits and compliance'],
    needs: ['Knowledge of networks and common attacks', 'Experience with a SIEM tool', 'Security certification is a plus'],
  },
];

const BENEFITS = [
  'Health insurance for you and your family',
  'Flexible working hours',
  'Learning budget of ₹50,000 a year',
  'Home office setup allowance',
  'Paid parental leave',
  '24 days of paid leave',
  'Quarterly team trips',
  'Employee stock options',
  'Free lunch and snacks in the office',
  'Wellness and gym allowance',
];

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const round1 = (n) => Math.round(n * 10) / 10;

function generateJobs(count = 60, seed = 2026) {
  const rng = createRng(seed);
  const jobs = [];
  for (let n = 1; n <= count; n++) {
    const template = TEMPLATES[(n - 1) % TEMPLATES.length];
    const company = rng.pick(COMPANIES);
    const type = rng.next() < 0.66 ? 'Full-time' : rng.pick(['Part-time', 'Contract', 'Internship', 'Internship']);
    const level = type === 'Internship' ? LEVELS[0] : rng.pick([LEVELS[0], LEVELS[1], LEVELS[1], LEVELS[2], LEVELS[2], LEVELS[3]]);
    const roll = rng.next();
    const workplace = company.hq === 'Remote' || roll < 0.3 ? 'Remote' : roll < 0.65 ? 'Hybrid' : 'On-site';
    const location = workplace === 'Remote' ? 'Remote' : company.hq === 'Remote' ? rng.pick(LOCATIONS.slice(0, -1)) : company.hq;

    let base = template.salary * level.multiplier * (0.85 + rng.next() * 0.35);
    if (type === 'Part-time') base *= 0.5;
    if (type === 'Contract') base *= 1.1;
    if (type === 'Internship') base = 1.8 + rng.next() * 2.4; // stipend of ₹15k–35k a month
    const salaryMin = round1(Math.max(1.5, base));
    const salaryMax = round1(salaryMin * (type === 'Internship' ? 1.2 : 1.3 + rng.next() * 0.15));

    const title = type === 'Internship' ? `${template.title} Intern` : `${level.prefix}${template.title}`;
    const postedDaysAgo = Math.floor(rng.next() ** 1.6 * 30);

    jobs.push({
      id: `${slugify(title)}-${company.id}-${n}`,
      title,
      category: template.category,
      companyId: company.id,
      company: company.name,
      location,
      workplace,
      type,
      level: level.id,
      experience: level.years,
      salaryMin,
      salaryMax,
      skills: rng.sample(template.skills, Math.min(template.skills.length, rng.int(3, 5))),
      summary: `${company.name} is looking for a ${title} to join the ${template.team} team. ${template.summary}`,
      responsibilities: template.tasks,
      requirements: template.needs,
      benefits: rng.sample(BENEFITS, rng.int(3, 5)),
      postedDaysAgo,
      applicants: rng.int(4, 240),
      openings: rng.chance(0.25) ? rng.int(2, 4) : 1,
      featured: rng.chance(0.15),
      urgent: rng.chance(0.1),
    });
  }
  return jobs;
}

export const JOBS = generateJobs();
export const jobById = Object.fromEntries(JOBS.map((job) => [job.id, job]));
