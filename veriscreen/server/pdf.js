import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const GREEN = '#1f7a34';
const GREEN_TEXT = '#1f7a34';
const RED = '#c62828';
const LINE = '#d5d5d5';
const HEADER = '#efefef';
const NOTE = '#d9edf7';
const INK = '#222222';

function pageDoc() {
  return new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
}

function collect(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function text(doc, value, x, y, options) {
  doc.fillColor(options.color || INK).font(options.font || 'Helvetica').fontSize(options.size || 9);
  doc.text(String(value ?? ''), x, y, {
    width: options.width,
    height: options.height || 12,
    align: options.align || 'left',
    lineBreak: false,
    ellipsis: true,
  });
}

function rule(doc, x, y, width) {
  doc.moveTo(x, y).lineTo(x + width, y).strokeColor(LINE).lineWidth(0.6).stroke();
}

function issuedLabel(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function qrPng(verifyUrl, issuedAt) {
  const issued = issuedAt instanceof Date ? issuedAt : new Date(issuedAt || Date.now());
  const stamp = Number.isNaN(issued.getTime()) ? new Date().toISOString() : issued.toISOString();
  const joiner = verifyUrl.includes('?') ? '&' : '?';
  return QRCode.toBuffer(`${verifyUrl}${joiner}issued=${encodeURIComponent(stamp)}`, { margin: 0, width: 96 });
}

function footer(doc, verifyUrl, png, issuedAt) {
  const qr = 46;
  const y = doc.page.height - 18 - qr - 14;
  doc.rect(0, doc.page.height - 18, doc.page.width, 18).fill(GREEN);
  if (png) doc.image(png, 28, y, { width: qr });
  text(doc, 'Issued ' + issuedLabel(issuedAt), 84, y + 28, { size: 8, color: '#333333', width: 320 });
  text(doc, 'VeriScreen  |  ' + verifyUrl, 84, y + 12, { size: 8, color: '#666666', width: 680 });
}

export async function buildPaymentHistoryPdf(data) {
  const doc = pageDoc();
  const done = collect(doc);
  const png = await qrPng(data.verifyUrl, data.issuedAt);
  const left = 28;
  const width = doc.page.width - 56;
  const name = String(data.studentName || '').toUpperCase();

  text(doc, data.studentId, left, 24, { size: 10, width: 140 });
  text(doc, name, left, 22, { size: 12, width, align: 'center', font: 'Helvetica-Bold' });
  const badge = 'Payment History';
  const badgeWidth = 118;
  doc.roundedRect(left + width - badgeWidth, 18, badgeWidth, 20, 3).fill(GREEN);
  text(doc, badge, left + width - badgeWidth, 23, {
    size: 9, color: '#ffffff', width: badgeWidth, align: 'center', font: 'Helvetica-Bold',
  });

  const columns = [150, 170, width - 320];
  let x = left;
  let y = 58;
  doc.rect(left, y, width, 22).fill(HEADER);
  ['Year of Study', 'Session', 'Payment details'].forEach((label, index) => {
    text(doc, label, x + 6, y + 6, { size: 10, color: GREEN_TEXT, width: columns[index] - 8, font: 'Helvetica-Bold' });
    x += columns[index];
  });

  y = 88;
  text(doc, data.yearOfStudy, left + 6, y, { size: 10, width: 140 });
  text(doc, data.session, left + 156, y, { size: 10, width: 160 });

  const detailX = left + 326;
  if (!data.payments.length) {
    text(doc, 'No payments received!', detailX, y, { size: 11, color: RED, width: 280, font: 'Helvetica-Bold' });
    y += 22;
  }

  const feeCols = [220, 80, 90, 90];
  doc.rect(detailX, y, feeCols.reduce((sum, item) => sum + item, 0), 18).fill(HEADER);
  ['Fee description', 'Currency', 'Amount', 'Paid'].forEach((label, index) => {
    const cellX = detailX + feeCols.slice(0, index).reduce((sum, item) => sum + item, 0);
    text(doc, label, cellX + 4, y + 4, { size: 9, color: GREEN_TEXT, width: feeCols[index] - 8, font: 'Helvetica-Bold' });
  });
  y += 18;

  const payments = data.payments.length ? data.payments : [];
  for (const row of payments) {
    rule(doc, detailX, y + 16, feeCols.reduce((sum, item) => sum + item, 0));
    const values = [row.description, row.currency, row.amount, row.paid];
    values.forEach((value, index) => {
      const cellX = detailX + feeCols.slice(0, index).reduce((sum, item) => sum + item, 0);
      text(doc, value, cellX + 4, y + 3, {
        size: 9,
        width: feeCols[index] - 8,
        align: index >= 2 ? 'right' : 'left',
      });
    });
    y += 16;
  }

  y += 4;
  text(doc, 'Totals', detailX + 4, y, { size: 9, width: 200, font: 'Helvetica-Bold' });
  text(doc, data.totalAmount, detailX + 300, y, { size: 9, width: 86, align: 'right', font: 'Helvetica-Bold' });
  text(doc, data.totalPaid, detailX + 390, y, { size: 9, width: 86, align: 'right', font: 'Helvetica-Bold' });
  y += 18;
  text(doc, 'Balance', detailX + 4, y, { size: 9, width: 200, font: 'Helvetica-Bold' });
  text(doc, data.balance, detailX + 390, y, { size: 9, width: 86, align: 'right', font: 'Helvetica-Bold' });

  footer(doc, data.verifyUrl, png, data.issuedAt);
  doc.end();
  return done;
}

export async function buildResultsPdf(data) {
  const doc = pageDoc();
  const done = collect(doc);
  const png = await qrPng(data.verifyUrl, data.issuedAt);
  const left = 28;
  const width = doc.page.width - 56;
  let y = 22;

  text(doc, 'Name', left, y, { size: 8, color: GREEN_TEXT, width: 280, font: 'Helvetica-Bold' });
  text(doc, 'Computer number', left + 300, y, { size: 8, color: GREEN_TEXT, width: 180, font: 'Helvetica-Bold' });
  text(doc, 'Gender', left + 520, y, { size: 8, color: GREEN_TEXT, width: 120, font: 'Helvetica-Bold' });
  y += 14;
  text(doc, String(data.studentName || '').toUpperCase(), left, y, { size: 11, width: 280, font: 'Helvetica-Bold' });
  text(doc, data.computerNumber || '—', left + 300, y, { size: 11, width: 180, font: 'Helvetica-Bold' });
  text(doc, data.gender || '—', left + 520, y, { size: 11, width: 120, font: 'Helvetica-Bold' });
  y += 22;

  const bar = (label) => {
    doc.rect(left, y, width, 18).fill(GREEN);
    text(doc, label, left + 8, y + 4, { size: 10, color: '#ffffff', width: width - 16, font: 'Helvetica-Bold' });
    y += 26;
  };

  bar('Continuous Assessment Results [Current Academic Year]');
  text(doc, data.continuousAssessmentNote, left + 8, y, { size: 9, color: '#666666', width: width - 16 });
  y += 28;
  bar('Examination Results & GPA Computation');

  doc.rect(left, y, width, 22).fill(NOTE);
  text(doc, data.gpaNote, left + 8, y + 6, { size: 9, color: '#24556b', width: width - 16 });
  y += 32;

  const cols = [90, 210, 80, 250, 55, 100];
  const headers = ['ACADEMIC YEAR', 'PROGRAMME', 'YEAR OF STUDY', 'COURSE', 'GRADE', 'COMMENT'];
  doc.rect(left, y, width, 28).fill(HEADER);
  headers.forEach((label, index) => {
    const cellX = left + cols.slice(0, index).reduce((sum, item) => sum + item, 0);
    text(doc, label, cellX + 4, y + 4, {
      size: 8, color: GREEN_TEXT, width: cols[index] - 8, font: 'Helvetica-Bold', height: 20,
    });
  });
  y += 30;

  for (const group of data.groups) {
    group.courses.forEach((course, index) => {
      if (y > doc.page.height - 70) {
        doc.addPage();
        y = 28;
      }
      rule(doc, left, y + 16, width);
      const values = [
        index === 0 ? group.academicYear : '',
        index === 0 ? group.programme : '',
        index === 0 ? group.yearOfStudy : '',
        course.course,
        course.grade,
        index === 0 ? group.comment : '',
      ];
      values.forEach((value, cell) => {
        const cellX = left + cols.slice(0, cell).reduce((sum, item) => sum + item, 0);
        text(doc, value, cellX + 4, y + 3, {
          size: 8,
          width: cols[cell] - 8,
          color: cell === 5 && String(value).includes('NOT') ? RED : INK,
          font: cell === 5 ? 'Helvetica-Bold' : 'Helvetica',
        });
      });
      y += 16;
    });
  }

  if (!data.groups.length) {
    text(doc, 'No examination results are recorded for this student.', left + 4, y + 6, { size: 9, width });
  }

  footer(doc, data.verifyUrl, png, data.issuedAt);
  doc.end();
  return done;
}

export async function buildConfirmationPdf(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 42 });
  const done = collect(doc);
  const png = await qrPng(data.verifyUrl, data.issuedAt);
  const left = 42;
  const width = doc.page.width - 84;
  const now = new Date();
  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const issued = now.toISOString().slice(0, 10);

  text(doc, clock, left, 36, { size: 10, font: 'Courier', width: 80 });
  text(doc, 'UNIVERSITY OF ZAMBIA - CONFIRMATION OF', left, 28, {
    size: 11, font: 'Courier-Bold', width, align: 'center',
  });
  text(doc, 'REGISTRATION', left, 44, {
    size: 11, font: 'Courier-Bold', width, align: 'center',
  });
  text(doc, issued, left + width - 80, 36, { size: 10, font: 'Courier', width: 80, align: 'right' });

  let y = 68;
  doc.moveTo(left, y).lineTo(left + width, y).dash(1, { space: 2 }).strokeColor('#222222').stroke();
  doc.undash();
  y += 16;
  text(doc, data.session, left, y, { size: 11, font: 'Courier-Bold', width, align: 'center' });
  y += 28;

  const pair = (label, value, x, y, valueWidth) => {
    doc.font('Courier-Bold').fontSize(9).fillColor('#222222').text(label, x, y, { lineBreak: false });
    doc.font('Courier').fontSize(9).text(String(value || '—'), x + doc.widthOfString(label) + 8, y, {
      width: valueWidth,
      lineBreak: false,
    });
  };

  pair('NUMBER:', data.studentId, left, y, 120);
  pair('NAME:', data.studentName, left + 230, y, 250);
  y += 20;
  pair('NRC:', data.nrc, left, y, 140);
  pair('YEAR OF STUDY:', data.yearOfStudy, left + 230, y, 120);
  y += 20;
  pair('PROGRAMME:', data.programme, left, y, 200);
  pair('REGISTRATION:', data.registration, left + 300, y, 140);
  y += 20;
  pair('SCHOOL:', data.school, left, y, 360);
  y += 20;
  pair('SESSION RECORD:', data.registeredOn, left, y, 220);

  y += 10;
  text(doc, 'ACCOMMODATION:', left, y, { size: 10, font: 'Courier-Bold', width });
  y += 16;
  text(doc, 'Status: Accommodation status unavailable', left, y, { size: 10, font: 'Courier-Bold', width });
  y += 24;
  doc.font('Courier-Bold').fontSize(10).fillColor('#222222');
  doc.text('COURSES: ' + (data.courses || 'No courses are recorded'), left, y, { width, lineGap: 2 });
  y = doc.y + 14;
  doc.moveTo(left, y).lineTo(left + width, y).dash(1, { space: 2 }).strokeColor('#222222').stroke();
  doc.undash();

  doc.image(png, left, y + 16, { width: 64 });
  text(doc, 'Issued ' + issuedLabel(data.issuedAt), left, y + 84, { size: 8, font: 'Courier', width: 240 });
  text(doc, data.verifyUrl, left + 76, y + 38, { size: 8, font: 'Courier', width: width - 80, color: '#444444' });
  doc.end();
  return done;
}

export async function buildRecordPdf(data) {
  const doc = pageDoc();
  const done = collect(doc);
  const png = await qrPng(data.verifyUrl, data.issuedAt);
  const left = 28;
  const width = doc.page.width - 56;
  doc.rect(left, 24, width, 18).fill(GREEN);
  text(doc, data.title, left + 8, 28, { size: 10, color: '#ffffff', width: width - 16, font: 'Helvetica-Bold' });
  text(doc, data.studentId + '    ' + String(data.studentName || '').toUpperCase(), left, 52, {
    size: 11, width, font: 'Helvetica-Bold',
  });
  text(doc, data.subtitle || '', left, 70, { size: 9, color: '#444444', width });

  let y = 96;
  const columns = data.columns || [];
  const colWidth = columns.length ? Math.floor(width / columns.length) : width;
  doc.rect(left, y, width, 18).fill(HEADER);
  columns.forEach((label, index) => {
    text(doc, label, left + index * colWidth + 4, y + 4, {
      size: 8, color: GREEN_TEXT, width: colWidth - 8, font: 'Helvetica-Bold',
    });
  });
  y += 20;
  for (const row of data.rows || []) {
    if (y > doc.page.height - 70) {
      doc.addPage();
      y = 28;
    }
    rule(doc, left, y + 16, width);
    row.forEach((value, index) => {
      text(doc, value, left + index * colWidth + 4, y + 3, { size: 8, width: colWidth - 8 });
    });
    y += 16;
  }
  if (!data.rows?.length) {
    text(doc, 'No records are stored for this student.', left + 4, y + 6, { size: 9, width });
  }
  footer(doc, data.verifyUrl, png, data.issuedAt);
  doc.end();
  return done;
}
