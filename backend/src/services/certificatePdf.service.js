const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Renders the certificate as a PDF and pipes it directly to the given
// writable stream (typically the HTTP response). Returns a promise that
// resolves once writing is finished.
async function renderCertificatePdf({ certificate, template, verifyUrl, res }) {
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
  const qrImage = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrImage, 'base64');

  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const accent = template.accentColor || '#4f46e5';

  // Outer border
  doc
    .lineWidth(4)
    .strokeColor(accent)
    .rect(24, 24, pageWidth - 48, pageHeight - 48)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor('#d1d5db')
    .rect(34, 34, pageWidth - 68, pageHeight - 68)
    .stroke();

  doc
    .fontSize(12)
    .fillColor('#6b7280')
    .font('Helvetica')
    .text(template.organizationName || 'Training Platform', 0, 60, { align: 'center' });

  doc
    .fontSize(32)
    .fillColor(accent)
    .font('Helvetica-Bold')
    .text(template.titleText || 'Certificate of Completion', 0, 100, { align: 'center' });

  doc
    .fontSize(14)
    .fillColor('#374151')
    .font('Helvetica')
    .text('This is to certify that', 0, 170, { align: 'center' });

  doc
    .fontSize(28)
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .text(certificate.studentName, 0, 200, { align: 'center' });

  const bodyText = (template.bodyText || 'has successfully completed {{itemTitle}}.')
    .replace('{{studentName}}', certificate.studentName)
    .replace('{{itemTitle}}', certificate.itemTitle);

  doc
    .fontSize(15)
    .fillColor('#374151')
    .font('Helvetica')
    .text(bodyText, 100, 250, { align: 'center', width: pageWidth - 200 });

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc
    .fontSize(11)
    .fillColor('#6b7280')
    .text(`Issued on ${issuedDate}`, 0, pageHeight - 140, { align: 'center' });

  // Signature block (bottom-left)
  if (template.signatureName) {
    doc
      .fontSize(13)
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .text(template.signatureName, 80, pageHeight - 110);
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(template.signatureTitle || '', 80, pageHeight - 92);
    doc
      .moveTo(80, pageHeight - 118)
      .lineTo(260, pageHeight - 118)
      .strokeColor('#9ca3af')
      .stroke();
  }

  // QR code + certificate ID (bottom-right)
  doc.image(qrBuffer, pageWidth - 170, pageHeight - 150, { width: 90 });
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .text(certificate.certificateId, pageWidth - 180, pageHeight - 55, { width: 110, align: 'center' });

  doc.end();
}

module.exports = { renderCertificatePdf };
