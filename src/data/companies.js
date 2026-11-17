// Fictional companies used by the demo job board.

export const COMPANIES = [
  { id: 'bluepeak', name: 'Bluepeak Analytics', industry: 'Data & AI', size: '201–500', hq: 'Bengaluru', founded: 2016, rating: 4.4, color: '#2563eb', about: 'Bluepeak builds analytics dashboards and forecasting tools that help retailers plan stock and pricing.' },
  { id: 'lumen', name: 'Lumen Health', industry: 'Healthcare', size: '501–1,000', hq: 'Hyderabad', founded: 2014, rating: 4.2, color: '#0d9488', about: 'Lumen Health makes telemedicine software used by clinics to book, run and follow up on video consultations.' },
  { id: 'orbitly', name: 'Orbitly', industry: 'SaaS', size: '51–200', hq: 'Pune', founded: 2019, rating: 4.6, color: '#7c3aed', about: 'Orbitly is a project planning tool for remote teams, with timelines, docs and chat in one place.' },
  { id: 'greenleaf', name: 'Greenleaf Foods', industry: 'E-commerce', size: '1,001–5,000', hq: 'Mumbai', founded: 2012, rating: 3.9, color: '#16a34a', about: 'Greenleaf delivers fresh groceries from local farms to over two million homes across India.' },
  { id: 'pixelforge', name: 'Pixelforge Studio', industry: 'Design & Media', size: '11–50', hq: 'Ahmedabad', founded: 2020, rating: 4.7, color: '#db2777', about: 'Pixelforge is a design studio creating brands, apps and websites for startups around the world.' },
  { id: 'quantra', name: 'Quantra Finance', industry: 'Fintech', size: '201–500', hq: 'Mumbai', founded: 2017, rating: 4.1, color: '#ca8a04', about: 'Quantra offers simple investing and savings accounts with automatic, goal-based plans.' },
  { id: 'nimbus', name: 'Nimbus Cloud', industry: 'Cloud & DevOps', size: '501–1,000', hq: 'Bengaluru', founded: 2013, rating: 4.3, color: '#0284c7', about: 'Nimbus runs managed cloud servers and databases for thousands of growing software companies.' },
  { id: 'sparrow', name: 'Sparrow Logistics', industry: 'Logistics', size: '1,001–5,000', hq: 'Delhi NCR', founded: 2015, rating: 3.8, color: '#ea580c', about: 'Sparrow moves parcels for online stores with same-day delivery in 40 cities.' },
  { id: 'brightpath', name: 'Brightpath Education', industry: 'EdTech', size: '201–500', hq: 'Chennai', founded: 2018, rating: 4.0, color: '#9333ea', about: 'Brightpath offers live coding and design courses with mentors from the industry.' },
  { id: 'cobalt', name: 'Cobalt Security', industry: 'Cybersecurity', size: '51–200', hq: 'Hyderabad', founded: 2018, rating: 4.5, color: '#1e40af', about: 'Cobalt protects company networks with threat detection, audits and security training.' },
  { id: 'mosaic', name: 'Mosaic Media', industry: 'Media', size: '51–200', hq: 'Mumbai', founded: 2011, rating: 3.9, color: '#be123c', about: 'Mosaic is a digital media company producing news, video shows and podcasts.' },
  { id: 'terra', name: 'Terra Energy', industry: 'Clean Energy', size: '501–1,000', hq: 'Pune', founded: 2010, rating: 4.2, color: '#65a30d', about: 'Terra designs and installs solar power systems for homes, schools and factories.' },
  { id: 'velo', name: 'Velo Mobility', industry: 'Mobility', size: '201–500', hq: 'Bengaluru', founded: 2019, rating: 4.1, color: '#0891b2', about: 'Velo runs electric bike and scooter rentals with an app for unlocking, paying and planning trips.' },
  { id: 'kindred', name: 'Kindred Care', industry: 'Healthcare', size: '11–50', hq: 'Remote', founded: 2021, rating: 4.8, color: '#e11d48', about: 'Kindred is a fully remote team building apps that connect families with trusted home carers.' },
  { id: 'atlas', name: 'Atlas Retail', industry: 'Retail', size: '5,001+', hq: 'Delhi NCR', founded: 2008, rating: 3.7, color: '#4338ca', about: 'Atlas runs 300 fashion and lifestyle stores and a fast-growing online shop.' },
  { id: 'zenith', name: 'Zenith Robotics', industry: 'Robotics', size: '51–200', hq: 'Chennai', founded: 2017, rating: 4.4, color: '#475569', about: 'Zenith builds warehouse robots that pick and pack orders alongside people.' },
];

export const companyById = Object.fromEntries(COMPANIES.map((company) => [company.id, company]));

export function companyInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
