const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true },
    detectionCount: { type: Number, required: true, min: 0 },
    policy: { type: String, required: true, enum: ['strict', 'balanced', 'minimal'] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
