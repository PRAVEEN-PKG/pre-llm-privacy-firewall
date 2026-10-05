const express = require('express');
const { detectSensitiveData } = require('../services/detector');
const { protectText } = require('../services/redactor');
const { calculateRisk } = require('../services/risk');
const { saveScan } = require('../models/scanStore');

const router = express.Router();
const ALLOWED_POLICIES = new Set(['strict', 'balanced', 'minimal']);
const MAX_TEXT_LENGTH = 20000;

router.post('/', async (req, res, next) => {
  try {
    const { text, policy = 'strict' } = req.body || {};

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The "text" field must be a non-empty string.'
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `The "text" field must be ${MAX_TEXT_LENGTH} characters or fewer.`
      });
    }

    if (typeof policy !== 'string' || !ALLOWED_POLICIES.has(policy)) {
      return res.status(400).json({
        success: false,
        error: 'The "policy" field must be strict, balanced, or minimal.'
      });
    }

    const rawDetections = detectSensitiveData(text);
    const { riskScore, riskLevel } = calculateRisk(rawDetections);
    const { detections, protectedText } = protectText(text, rawDetections, policy);

    await saveScan({
      riskScore,
      riskLevel,
      detectionCount: detections.length,
      policy
    });

    return res.json({
      success: true,
      riskScore,
      riskLevel,
      containsSensitiveData: detections.length > 0,
      detections,
      protectedText
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
