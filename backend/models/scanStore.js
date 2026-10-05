const mongoose = require('mongoose');
const Scan = require('./Scan');

const MAX_IN_MEMORY_SCANS = 100;
const memoryScans = [];

function toPublicScan(scan) {
  return {
    id: scan.id,
    riskScore: scan.riskScore,
    riskLevel: scan.riskLevel,
    detectionCount: scan.detectionCount,
    policy: scan.policy,
    createdAt: scan.createdAt.toISOString()
  };
}

async function saveScan(scan) {
  if (mongoose.connection.readyState === 1) {
    const savedScan = await Scan.create(scan);
    return toPublicScan(savedScan);
  }

  const memoryScan = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...scan,
    createdAt: new Date()
  };
  memoryScans.unshift(memoryScan);
  memoryScans.length = Math.min(memoryScans.length, MAX_IN_MEMORY_SCANS);
  return toPublicScan(memoryScan);
}

async function getScans() {
  if (mongoose.connection.readyState === 1) {
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(MAX_IN_MEMORY_SCANS).lean();
    return scans.map((scan) => toPublicScan({
      ...scan,
      id: scan._id.toString(),
      createdAt: scan.createdAt
    }));
  }

  return memoryScans.map(toPublicScan);
}

module.exports = { getScans, saveScan };
