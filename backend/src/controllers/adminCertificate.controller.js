const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { logAudit } = require('../utils/auditLog');

// GET /api/admin/certificates?search=&status=&page=&limit=
async function listCertificates(req, res, next) {
  try {
    const { search = '', status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ studentName: regex }, { itemTitle: regex }, { certificateId: regex }];
    }
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [certificates, total] = await Promise.all([
      Certificate.find(query).sort({ issuedAt: -1 }).skip(skip).limit(limitNum),
      Certificate.countDocuments(query),
    ]);

    success(res, {
      certificates: certificates.map((c) => c.toSafeJSON()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/certificates/:id/revoke
async function revokeCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) throw new ApiError(404, 'Certificate not found', 'NOT_FOUND');

    certificate.status = 'REVOKED';
    certificate.revokedAt = new Date();
    await certificate.save();

    logAudit({
      adminId: req.user.id,
      action: 'REVOKE_CERTIFICATE',
      targetType: 'Certificate',
      targetId: certificate._id,
      details: `Revoked certificate ${certificate.certificateId} (${certificate.studentName})`,
    });

    success(res, { certificate: certificate.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/certificates/:id/reinstate
async function reinstateCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) throw new ApiError(404, 'Certificate not found', 'NOT_FOUND');

    certificate.status = 'ISSUED';
    certificate.revokedAt = undefined;
    await certificate.save();

    logAudit({
      adminId: req.user.id,
      action: 'REINSTATE_CERTIFICATE',
      targetType: 'Certificate',
      targetId: certificate._id,
      details: `Reinstated certificate ${certificate.certificateId} (${certificate.studentName})`,
    });

    success(res, { certificate: certificate.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/certificate-template
async function getTemplate(req, res, next) {
  try {
    const template = await CertificateTemplate.getOrCreate();
    success(res, { template });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/certificate-template
async function updateTemplate(req, res, next) {
  try {
    const { organizationName, titleText, bodyText, signatureName, signatureTitle, accentColor } = req.body;

    const template = await CertificateTemplate.getOrCreate();
    if (organizationName !== undefined) template.organizationName = organizationName;
    if (titleText !== undefined) template.titleText = titleText;
    if (bodyText !== undefined) template.bodyText = bodyText;
    if (signatureName !== undefined) template.signatureName = signatureName;
    if (signatureTitle !== undefined) template.signatureTitle = signatureTitle;
    if (accentColor !== undefined) template.accentColor = accentColor;

    await template.save();
    success(res, { template });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCertificates,
  revokeCertificate,
  reinstateCertificate,
  getTemplate,
  updateTemplate,
};
