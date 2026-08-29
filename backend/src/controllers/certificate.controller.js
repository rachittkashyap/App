const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { renderCertificatePdf } = require('../services/certificatePdf.service');

// GET /api/certificates/my
async function myCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find({ student: req.user.id }).sort({ issuedAt: -1 });
    success(res, { certificates: certificates.map((c) => c.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

// GET /api/certificates/:certificateId/download  (owner or admin only)
async function downloadCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!certificate) throw new ApiError(404, 'Certificate not found', 'NOT_FOUND');

    const isOwner = certificate.student.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'ADMIN') {
      throw new ApiError(403, 'You do not have access to this certificate', 'FORBIDDEN');
    }

    if (certificate.status === 'REVOKED') {
      throw new ApiError(410, 'This certificate has been revoked', 'REVOKED');
    }

    const template = await CertificateTemplate.getOrCreate();
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificate.certificateId}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateId}.pdf"`);

    await renderCertificatePdf({ certificate, template, verifyUrl, res });
  } catch (err) {
    next(err);
  }
}

// GET /api/certificates/verify/:certificateId  (PUBLIC - no auth)
async function verifyCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId });

    if (!certificate) {
      return success(res, { valid: false, message: 'No certificate found with this ID.' });
    }

    if (certificate.status === 'REVOKED') {
      return success(res, {
        valid: false,
        message: 'This certificate has been revoked and is no longer valid.',
      });
    }

    success(res, {
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        itemTitle: certificate.itemTitle,
        itemType: certificate.itemType,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { myCertificates, downloadCertificate, verifyCertificate };
