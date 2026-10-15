export const UNIVERSITIES = [
  {
    code: 'UNZA',
    name: 'University of Zambia',
    abbreviation: 'UNZA',
    schools: [
      { code: 'HUM', name: 'School of Humanities', programmes: [['ECO', 'Economics'], ['DEV', 'Development Studies'], ['POL', 'Political Science'], ['HIS', 'History'], ['PHI', 'Philosophy']] },
      { code: 'NAS', name: 'School of Natural and Applied Sciences', programmes: [['CSC', 'Computer Science'], ['ICT', 'Information Technology'], ['PHY', 'Physics'], ['CHE', 'Chemistry'], ['MAT', 'Mathematics'], ['BIO', 'Biological Sciences']] },
      { code: 'LAW', name: 'School of Law', programmes: [['LLB', 'Bachelor of Laws']] },
      { code: 'VET', name: 'School of Veterinary Medicine', programmes: [['DVM', 'Veterinary Medicine']] },
      { code: 'AGR', name: 'School of Agriculture', programmes: [['AGR', 'Agronomy'], ['ANS', 'Animal Science'], ['AEC', 'Agricultural Economics']] },
      { code: 'EDU', name: 'School of Education', programmes: [['AED', 'Adult Education'], ['EAD', 'Educational Administration'], ['MED', 'Mathematics Education']] },
      { code: 'ENG', name: 'School of Engineering', programmes: [['EEE', 'Electrical Engineering'], ['CVE', 'Civil Engineering'], ['MEE', 'Mechanical Engineering'], ['AGE', 'Agricultural Engineering']] },
      { code: 'MIN', name: 'School of Mines', programmes: [['MIN', 'Mining Engineering'], ['GEO', 'Geology'], ['MET', 'Metallurgy']] },
      { code: 'MED', name: 'School of Medicine', programmes: [['MBC', 'MBChB'], ['HBI', 'Human Biology']] },
      { code: 'HS', name: 'School of Health Sciences', programmes: [['BMS', 'Biomedical Sciences'], ['PHT', 'Physiotherapy'], ['PHA', 'Pharmacy']] },
      { code: 'PH', name: 'School of Public Health', programmes: [['PH', 'Public Health'], ['EH', 'Environmental Health']] },
      { code: 'NUR', name: 'School of Nursing Sciences', programmes: [['NUR', 'Nursing'], ['MID', 'Midwifery']] },
    ],
  },
  { code: 'CBU', name: 'Copperbelt University', abbreviation: 'CBU', schools: [['BUS', 'School of Business'], ['ENG', 'School of Engineering'], ['NAS', 'School of Natural Sciences']] },
  { code: 'MUL', name: 'Mulungushi University', abbreviation: 'MU', schools: [['BUS', 'School of Business Studies'], ['AGR', 'School of Agriculture and Natural Resources'], ['SCI', 'School of Science, Engineering and Technology']] },
  { code: 'CHAU', name: 'Chalimbana University', abbreviation: 'CHAU', schools: [['EDU', 'School of Education'], ['BUS', 'School of Business']] },
  { code: 'KMU', name: 'Kapasa Makasa University', abbreviation: 'KMU', schools: [['SCI', 'School of Science and Technology'], ['AGR', 'School of Agriculture']] },
  { code: 'KNU', name: 'Kwame Nkrumah University', abbreviation: 'KNU', schools: [['EDU', 'School of Education'], ['NAS', 'School of Natural Sciences']] },
  { code: 'PU', name: 'Palabana University', abbreviation: 'PU', schools: [['AGR', 'School of Agriculture'], ['VET', 'School of Veterinary Medicine']] },
  { code: 'MUK', name: 'Mukuba University', abbreviation: 'MU', schools: [['EDU', 'School of Education'], ['NAS', 'School of Natural Sciences']] },
  { code: 'LMMU', name: 'Levy Mwanawasa Medical University', abbreviation: 'LMMU', schools: [['MED', 'School of Medicine'], ['HS', 'School of Health Sciences'], ['NUR', 'School of Nursing']] },
  { code: 'ZUT', name: 'Zambia University College of Technology', abbreviation: 'ZUT', schools: [['ICT', 'School of Information and Communication Technology'], ['ENG', 'School of Engineering']] },
].map((university) => ({
  ...university,
  schools: university.schools.map((school) => (
    Array.isArray(school)
      ? { code: school[0], name: school[1], programmes: [] }
      : { ...school, programmes: school.programmes.map(([code, name]) => ({ code, name })) }
  )),
}));

export function findUniversity(code) {
  return UNIVERSITIES.find((item) => item.code.toLowerCase() === String(code || '').toLowerCase()) || null;
}

export function findSchool(university, code) {
  return university.schools.find((item) => item.code.toLowerCase() === String(code || '').toLowerCase()) || null;
}
