const POLICIES = {
  strict: new Set([
    'NAME',
    'EMAIL',
    'PHONE',
    'PASSWORD',
    'CREDIT_CARD',
    'ADDRESS',
    'HEALTH_INFO',
    'API_KEY',
    'ORGANIZATION'
  ]),
  balanced: new Set(['NAME', 'EMAIL', 'PHONE', 'PASSWORD', 'CREDIT_CARD', 'HEALTH_INFO', 'API_KEY']),
  minimal: new Set(['PASSWORD', 'CREDIT_CARD', 'API_KEY'])
};

function protectText(text, detections, policy) {
  const protectedDetections = detections
    .map((detection) => ({
      ...detection,
      action: POLICIES[policy].has(detection.type) ? 'REDACT' : 'ALLOW'
    }))
    .sort((left, right) => left.start - right.start);

  let protectedText = '';
  let cursor = 0;

  for (const detection of protectedDetections) {
    if (detection.action !== 'REDACT') continue;
    protectedText += text.slice(cursor, detection.start);
    protectedText += `[${detection.type}]`;
    cursor = detection.end;
  }

  protectedText += text.slice(cursor);

  return {
    detections: protectedDetections.map(({ type, value, action }) => ({ type, value, action })),
    protectedText
  };
}

module.exports = { protectText };
