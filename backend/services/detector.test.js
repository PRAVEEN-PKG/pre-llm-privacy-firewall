const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { detectSensitiveData } = require('./detector');
const { protectText } = require('./redactor');
const { calculateRisk } = require('./risk');
const app = require('../app');

test('detects common labeled registration-number formats', () => {
  const text = 'Vehicle registration: MH12AB1234; Reg No: REG-2024-001234; MY REG NO IS 1234567';
  const detections = detectSensitiveData(text).filter(
    (detection) => detection.type === 'REGISTRATION_NUMBER'
  );

  assert.deepEqual(
    detections.map((detection) => detection.value),
    ['MH12AB1234', 'REG-2024-001234', '1234567']
  );
});

test('detects a standalone seven-digit registration number', () => {
  const detection = detectSensitiveData('1234567').find(
    (item) => item.type === 'REGISTRATION_NUMBER'
  );
  assert.equal(detection.value, '1234567');
  assert.equal(protectText('1234567', [detection], 'strict').protectedText, '[REGISTRATION_NUMBER]');
});

test('detects spaced, hyphenated, and Bharat-series vehicle registrations', () => {
  const text = 'MH 12 AB 1234, DL-01-C-1234, and 22BH1234AA';
  const detections = detectSensitiveData(text).filter(
    (detection) => detection.type === 'REGISTRATION_NUMBER'
  );

  assert.deepEqual(
    detections.map((detection) => detection.value),
    ['MH 12 AB 1234', 'DL-01-C-1234', '22BH1234AA']
  );
});

test('detects and redacts names regardless of case and supported label form', () => {
  const prompts = [
    ['My name is Rahul', 'Rahul'],
    ['MY NAME IS RAHUL', 'RAHUL'],
    ['my name is rahul', 'rahul'],
    ['Name: Rahul', 'Rahul'],
    ['NAME: RAHUL', 'RAHUL'],
    ['NAME IS RAHUL', 'RAHUL'],
    ['NAME IS John Smith', 'John Smith'],
    ['MY NAME IS JOHN SMITH', 'JOHN SMITH'],
    ['name - María García -', 'María García'],
    ['NAME: Mohammed Ali', 'Mohammed Ali'],
    ['Name: Wei Zhang', 'Wei Zhang'],
    ['Name: Jean-Luc O’Neill', 'Jean-Luc O’Neill'],
    ['NAME: 李小龍', '李小龍']
  ];

  for (const [text, name] of prompts) {
    const detection = detectSensitiveData(text).find((item) => item.type === 'NAME');
    assert.ok(detection, `expected NAME detection for "${text}"`);
    assert.equal(detection.value, name);
    assert.equal(protectText(text, [detection], 'strict').protectedText, text.replace(name, '[NAME]'));
  }
});

test('live scan API detects and redacts uppercase NAME IS input', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'NAME IS RAHUL', policy: 'strict' })
    });
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(result.detections[0].type, 'NAME');
    assert.equal(result.detections[0].value, 'RAHUL');
    assert.equal(result.detections[0].action, 'REDACT');
    assert.equal(result.protectedText, 'NAME IS [NAME]');
    assert.equal(result.protectedText.includes('RAHUL'), false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('redacts registration numbers under every policy and scores them', () => {
  const text = 'My registration number is MH12AB1234.';
  const detections = detectSensitiveData(text);

  assert.deepEqual(calculateRisk(detections), { riskScore: 40, riskLevel: 'MEDIUM' });

  for (const policy of ['strict', 'balanced', 'minimal']) {
    const result = protectText(text, detections, policy);
    assert.equal(result.protectedText, 'My registration number is [REGISTRATION_NUMBER].');
    assert.equal(result.protectedText.includes('MH12AB1234'), false);
  }
});

test('client fallback detects and redacts registrations under every policy', () => {
  const scannerPath = path.join(__dirname, '../../frontend/scanner/scanner.js');
  const scannerSource = fs.readFileSync(scannerPath, 'utf8');
  const context = vm.createContext({
    document: { addEventListener() {} }
  });
  vm.runInContext(scannerSource, context);

  for (const policy of ['strict', 'balanced', 'minimal']) {
    const result = context.runClientSimulation(
      'MY REG NO IS 1234567',
      policy
    );

    assert.equal(result.detections[0].type, 'REGISTRATION_NUMBER');
    assert.equal(result.protectedText, 'MY REG NO IS [REGISTRATION_NUMBER]');
    assert.equal(result.protectedText.includes('1234567'), false);
  }
});

test('client fallback detects and redacts names regardless of case', () => {
  const scannerPath = path.join(__dirname, '../../frontend/scanner/scanner.js');
  const context = vm.createContext({
    document: { addEventListener() {} }
  });
  vm.runInContext(fs.readFileSync(scannerPath, 'utf8'), context);

  for (const text of [
    'My name is Rahul',
    'MY NAME IS RAHUL',
    'my name is rahul',
    'Name: Rahul',
    'NAME: RAHUL',
    'NAME IS RAHUL',
    'NAME IS John Smith',
    'MY NAME IS JOHN SMITH',
    'name - María García -',
    'NAME: Mohammed Ali',
    'Name: Wei Zhang',
    'Name: Jean-Luc O’Neill',
    'NAME: 李小龍'
  ]) {
    const result = context.runClientSimulation(text, 'strict');
    const detection = result.detections.find((item) => item.type === 'NAME');
    assert.ok(detection, `expected NAME detection for "${text}"`);
    assert.equal(result.protectedText, text.replace(detection.value, '[NAME]'));
    assert.equal(result.protectedText.includes(detection.value), false);
  }
});

test('home-page demo simulation redacts registration identifiers and international names', () => {
  let onReady;
  const elements = {};
  const makeElement = () => ({
    addEventListener() {},
    appendChild() {},
    classList: { add() {}, remove() {} },
    style: {}
  });

  for (const id of [
    'demoPrompt',
    'demoScanButton',
    'demoClearButton',
    'demoCharCount',
    'demoPlaceholder',
    'demoResult',
    'demoRiskScore',
    'demoRiskProgress',
    'demoRiskBadge',
    'demoDetectionStatus',
    'demoDetectedList',
    'demoSafePrompt'
  ]) {
    elements[id] = makeElement();
  }

  elements.demoScanButton.addEventListener = (event, callback) => {
    if (event === 'click') elements.scan = callback;
  };
  elements.demoSafePrompt.textContent = '';

  const context = vm.createContext({
    document: {
      addEventListener(event, callback) {
        if (event === 'DOMContentLoaded') onReady = callback;
      },
      getElementById(id) {
        return elements[id];
      },
      createElement() {
        return makeElement();
      }
    },
    window: { innerWidth: 1200 }
  });
  const demoPath = path.join(__dirname, '../../frontend/components/demo/demo.js');
  vm.runInContext(fs.readFileSync(demoPath, 'utf8'), context);
  onReady();

  for (const [text, expected, original] of [
    ['MY REG NO IS 1234567', 'MY REG NO IS [REGISTRATION_NUMBER]', '1234567'],
    ['NAME IS John Smith', 'NAME IS [NAME]', 'John Smith'],
    ['name - María García -', 'name - [NAME] -', 'María García'],
    ['NAME: 李小龍', 'NAME: [NAME]', '李小龍']
  ]) {
    elements.demoPrompt.value = text;
    elements.scan();
    assert.equal(elements.demoSafePrompt.textContent, expected);
    assert.equal(elements.demoSafePrompt.textContent.includes(original), false);
  }
});

test('history retains the new registration detection type', () => {
  const values = new Map();
  const context = vm.createContext({
    localStorage: {
      getItem(key) {
        return values.get(key) || null;
      },
      setItem(key, value) {
        values.set(key, value);
      }
    },
    window: {}
  });
  const historyPath = path.join(__dirname, '../../frontend/history-store.js');
  vm.runInContext(fs.readFileSync(historyPath, 'utf8'), context);

  context.window.ShieldAIHistory.saveScan({
    detections: [{ type: 'REGISTRATION_NUMBER', action: 'REDACT' }],
    riskScore: 40,
    riskLevel: 'MEDIUM'
  });

  assert.equal(
    context.window.ShieldAIHistory.getSafeHistory()[0].detectedData,
    'REGISTRATION_NUMBER'
  );
});

test('preserves detection for existing sensitive-data categories', () => {
  const text = 'My name is Ajay Kumar, email ajay@example.com, phone +91-9876543210, password: hunter2, card 4532015112830366, address: 12 Main Street, diagnosed with diabetes, api_key=abcdefgh12345678, works at Acme Corp.';
  const types = new Set(detectSensitiveData(text).map((detection) => detection.type));

  for (const type of [
    'NAME',
    'EMAIL',
    'PHONE',
    'PASSWORD',
    'CREDIT_CARD',
    'ADDRESS',
    'HEALTH_INFO',
    'API_KEY',
    'ORGANIZATION'
  ]) {
    assert.equal(types.has(type), true, `expected to detect ${type}`);
  }
});
