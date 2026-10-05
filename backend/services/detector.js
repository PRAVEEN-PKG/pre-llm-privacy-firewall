const patterns = [
  {
    type: 'EMAIL',
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  },
  {
    type: 'CREDIT_CARD',
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    validate: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits);
    }
  },
  {
    type: 'API_KEY',
    regex: /\b(?:sk-[A-Za-z0-9_-]{8,}|(?:api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9_./+-]{8,})\b/gi
  },
  {
    type: 'PASSWORD',
    regex: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^"'\s,;]{4,}/gi
  },
  {
    type: 'PHONE',
    regex: /(?<!\w)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}(?!\w)/g,
    validate: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }
  },
  {
    type: 'REGISTRATION_NUMBER',
    regex: /\b(?:registration(?:\s*(?:number|no\.?|#))?|reg(?:istration)?\s*(?:no\.?|number|#)|vehicle\s+(?:registration|reg)(?:\s*(?:number|no\.?|#))?)\s*(?:is\s+|[:=#-]\s*|\s+)([A-Z0-9][A-Z0-9/-]{3,19})\b/gi,
    capture: 1
  },
  {
    type: 'REGISTRATION_NUMBER',
    regex: /\b(?:[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}|\d{2}\s?BH\s?\d{4}\s?[A-Z]{1,2})\b/gi
  },
  {
    type: 'REGISTRATION_NUMBER',
    regex: /\b\d{7}\b/g
  },
  {
    type: 'HEALTH_INFO',
    regex: /\b(?:diagnosed with|medical condition|health condition|medical history|taking medication for|HIV|diabetes|cancer|depression|bipolar disorder|asthma)\b/gi
  },
  {
    type: 'ADDRESS',
    regex: /\b(?:address|home address|lives at)\s*[:=]?\s*[^,;\n.]{5,}/gi
  },
  {
    type: 'ORGANIZATION',
    regex: /\b(?:works at|employed by|company|organization|organisation)\s*[:=]?\s*[A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*){0,3}/gi
  },
  {
    type: 'NAME',
    regex: /\b(?:(?:my\s+)?name\s*(?:is\b|[:=]|-\s*)|i\s+am|i['’]m)\s*([\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*(?:\s+[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*){0,4})(?=\s*(?:[-,;.!?\n]|$))/giu
  }
];

function passesLuhn(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function detectSensitiveData(text) {
  const detections = [];

  for (const { type, regex, validate, capture } of patterns) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      const value = capture ? match[capture] : type === 'NAME' ? match[1] : match[0];
      const valueOffset = capture || type === 'NAME' ? match[0].lastIndexOf(value) : 0;
      const start = match.index + valueOffset;

      if (validate && !validate(value)) continue;

      detections.push({
        type,
        value,
        start,
        end: start + value.length
      });
    }
  }

  return removeOverlappingDetections(detections)
    .sort((left, right) => left.start - right.start);
}

function removeOverlappingDetections(detections) {
  const accepted = [];

  for (const detection of detections.sort((left, right) => {
    const startDifference = left.start - right.start;
    if (startDifference !== 0) return startDifference;
    return (right.end - right.start) - (left.end - left.start);
  })) {
    const overlaps = accepted.some(
      (existing) => detection.start < existing.end && detection.end > existing.start
    );
    if (!overlaps) accepted.push(detection);
  }

  return accepted;
}

module.exports = { detectSensitiveData };
