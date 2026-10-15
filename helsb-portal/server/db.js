import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'helsb_db',
};

export const pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10 });

const SCHEMA = `
CREATE TABLE IF NOT EXISTS officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(160) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) DEFAULT 'OFFICER'
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(40) NOT NULL UNIQUE,
  veriscreen_application_id BIGINT NULL,
  student_id VARCHAR(32) NOT NULL,
  student_name VARCHAR(160),
  nrc VARCHAR(40),
  programme VARCHAR(160),
  faculty VARCHAR(160),
  university_code VARCHAR(20),
  school_code VARCHAR(20),
  school_name VARCHAR(160),
  screening_percent INT DEFAULT 50,
  screening_approved TINYINT(1) DEFAULT 0,
  status VARCHAR(40) NOT NULL,
  document_ids VARCHAR(500),
  notes VARCHAR(500),
  submitted_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  reviewed_by VARCHAR(160)
);

CREATE TABLE IF NOT EXISTS status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  from_status VARCHAR(40),
  to_status VARCHAR(40) NOT NULL,
  changed_by VARCHAR(160),
  comment VARCHAR(500),
  changed_at DATETIME NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id)
);
`;

export async function initDatabase() {
  const bootstrap = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await bootstrap.end();
  for (const statement of SCHEMA.split(';').map((sql) => sql.trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  await seedIfEmpty();
}

async function seedIfEmpty() {
  const [officers] = await pool.query('SELECT COUNT(*) AS total FROM officers');
  if (officers[0].total === 0) {
    const passwordHash = bcrypt.hashSync('password123', 10);
    const people = [
      ['mwaka.chanda@helsb.zm', 'Mwaka Chanda'],
      ['chanda.phiri@helsb.zm', 'Chanda Phiri'],
    ];
    for (const [username, fullName] of people) {
      await pool.query(
        'INSERT INTO officers (username, full_name, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, fullName, passwordHash, 'OFFICER'],
      );
    }
  }

  const [apps] = await pool.query('SELECT COUNT(*) AS total FROM applications');
  if (apps[0].total > 0) return;

  const rows = [
    ['2021465934', 'Samuel Chibinji Mwanza', '123456/10/1', 'UNZA', 'NAS', 'School of Natural and Applied Sciences', 'Computer Science', 100, 'VS-2026-RES-000001,VS-2026-REG-000001', 'Final-year Computer Science student with an approved HELSB loan.', 'CONFIRMED', 'HELSB-2026-000001'],
    ['2022030346', 'Nosiku Mukuka', '234567/11/1', 'UNZA', 'NAS', 'School of Natural and Applied Sciences', 'Information Technology', 75, 'VS-2026-RES-000002,VS-2026-REG-000002', 'IT student. Fees fully paid. HELSB loan at 75%.', 'UNDER_REVIEW', 'HELSB-2026-000002'],
    ['2020123456', 'Grace Banda', '345678/12/1', 'UNZA', 'HUM', 'School of Humanities', 'Economics', 50, 'VS-2026-RES-000003,VS-2026-PAY-000003', 'Economics student. New loan application at 50%.', 'PENDING', 'HELSB-2026-000003'],
    ['2019876543', 'Peter Zulu', '456789/13/1', 'UNZA', 'ENG', 'School of Engineering', 'Electrical Engineering', 75, 'VS-2026-RES-000004,VS-2026-REG-000004', 'Electrical Engineering student with a 75% student loan.', 'CONFIRMED', 'HELSB-2026-000004'],
    ['2018456123', 'Mutale Banda', '567890/14/1', 'UNZA', 'NAS', 'School of Natural and Applied Sciences', 'Physics', 50, 'Academic Transcript,Registration Record', 'Second-year Physics student. New 50% loan request.', 'PENDING', 'HELSB-2026-000006'],
    ['2017567890', 'Thandiwe Phiri', '678901/15/1', 'UNZA', 'HUM', 'School of Humanities', 'Political Science', 75, 'Academic Transcript,NRC Copy', 'Political Science student with a 75% student loan.', 'PENDING', 'HELSB-2026-000007'],
    ['2016345123', 'Chilufya Tembo', '789012/16/1', 'UNZA', 'LAW', 'School of Law', 'Bachelor of Laws', 50, 'Academic Transcript,Registration Record,NRC Copy', 'LLB student. New screening request at 50%.', 'PENDING', 'HELSB-2026-000008'],
    ['2015234789', 'Mwansa Kalumba', '890123/17/1', 'UNZA', 'MED', 'School of Medicine', 'MBChB', 100, 'Academic Transcript,Registration Record', 'Medicine student on a 100% HELSB loan.', 'PENDING', 'HELSB-2026-000009'],
    ['2014123654', 'Lweendo Siame', '901234/18/1', 'UNZA', 'NUR', 'School of Nursing Sciences', 'Nursing', 75, 'Academic Transcript,Registration Record', 'Nursing student with a 75% student loan.', 'PENDING', 'HELSB-2026-000010'],
    ['2013012789', 'Chileshe Mwamba', '012345/19/1', 'UNZA', 'ENG', 'School of Engineering', 'Civil Engineering', 100, 'Academic Transcript,Fee Statement', 'Civil Engineering student on a 100% loan.', 'PENDING', 'HELSB-2026-000011'],
    ['2012789012', 'Natasha Mulenga', '112233/20/1', 'UNZA', 'AGR', 'School of Agriculture', 'Agronomy', 50, 'Academic Transcript,Registration Record', 'Agronomy student. New 50% loan application.', 'PENDING', 'HELSB-2026-000012'],
    ['2011678945', 'Kondwani Zimba', '223344/21/1', 'UNZA', 'MIN', 'School of Mines', 'Mining Engineering', 75, 'Academic Transcript,Registration Record', 'Mining Engineering student with a 75% loan.', 'PENDING', 'HELSB-2026-000013'],
    ['2010567834', 'Bupe Mwila', '334455/22/1', 'UNZA', 'VET', 'School of Veterinary Medicine', 'Veterinary Medicine', 100, 'Academic Transcript,Registration Record', 'Veterinary Medicine student on a 100% loan.', 'PENDING', 'HELSB-2026-000014'],
    ['2009456723', 'Namukolo Daka', '445566/23/1', 'UNZA', 'EDU', 'School of Education', 'Mathematics Education', 50, 'Academic Transcript,NRC Copy', 'Mathematics Education student. New 50% loan request.', 'PENDING', 'HELSB-2026-000015'],
    ['2008345612', 'Joseph Kasanda', '556677/24/1', 'UNZA', 'HS', 'School of Health Sciences', 'Pharmacy', 75, 'Academic Transcript,Registration Record', 'Pharmacy student with a 75% student loan.', 'PENDING', 'HELSB-2026-000016'],
    ['2007234501', 'Mary Lungu', '667788/25/1', 'UNZA', 'PH', 'School of Public Health', 'Public Health', 100, 'Academic Transcript,Registration Record', 'Public Health student on a 100% HELSB loan.', 'PENDING', 'HELSB-2026-000017'],
  ];

  for (const row of rows) {
    const status = row[10];
    const [result] = await pool.query(
      `INSERT INTO applications
        (student_id, student_name, nrc, university_code, school_code, school_name, programme,
         screening_percent, screening_approved, document_ids, notes, status, application_number, faculty, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], status === 'CONFIRMED' ? 1 : 0, row[8], row[9], status, row[11], row[5]],
    );
    await pool.query(
      `INSERT INTO status_history (application_id, from_status, to_status, changed_by, comment, changed_at)
       VALUES (?, NULL, ?, 'VeriScreen', 'Application received from VeriScreen', NOW())`,
      [result.insertId, status],
    );
  }
}

export async function findOfficer(username) {
  const [rows] = await pool.query('SELECT * FROM officers WHERE LOWER(username) = LOWER(?)', [username]);
  return rows[0] || null;
}
