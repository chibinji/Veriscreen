import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export function buildPdf({ title, lines, verifyUrl }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 92).fill('#1b3b2b');
    doc.fillColor('#f3efe9').fontSize(22).text('VeriScreen', 56, 36);
    doc.fontSize(11).fillColor('#c4a484').text('Verified academic record', 56, 64);

    doc.fillColor('#14241c').fontSize(18).text(title, 56, 120);
    doc.moveDown();
    doc.fontSize(12).fillColor('#244033');
    for (const line of lines) {
      doc.text(line, 56, doc.y, { width: 480 });
      doc.moveDown(0.4);
    }

    QRCode.toBuffer(verifyUrl, { margin: 1, width: 180 })
      .then((png) => {
        const y = Math.max(doc.y + 24, 420);
        doc.image(png, 56, y, { width: 140 });
        doc.fillColor('#6b7280').fontSize(10).text('Scan to verify this document', 210, y + 56);
        doc.text(verifyUrl, 210, y + 74, { width: 300 });
        doc.end();
      })
      .catch(reject);
  });
}
