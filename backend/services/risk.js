const RISK_WEIGHTS = {
  NAME: 10,
  EMAIL: 40,
  PHONE: 45,
  PASSWORD: 55,
  CREDIT_CARD: 55,
  ADDRESS: 15,
  HEALTH_INFO: 55,
  API_KEY: 55,
  ORGANIZATION: 10,
  REGISTRATION_NUMBER: 40
};

function calculateRisk(detections) {
  const riskScore = Math.min(
    100,
    detections.reduce((total, detection) => total + (RISK_WEIGHTS[detection.type] || 0), 0)
  );

  let riskLevel = 'LOW';
  if (riskScore >= 80) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MEDIUM';

  return { riskScore, riskLevel };
}

module.exports = { calculateRisk };
