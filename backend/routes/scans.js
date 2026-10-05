const express = require('express');
const { getScans } = require('../models/scanStore');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const scans = await getScans();
    res.json({ success: true, scans });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
