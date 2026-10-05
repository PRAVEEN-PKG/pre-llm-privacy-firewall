(function () {
    const STORAGE_KEY = "shieldai-scan-history";
    const DETECTION_TYPES = [
        "NAME",
        "EMAIL",
        "PHONE",
        "PASSWORD",
        "CREDIT_CARD",
        "ADDRESS",
        "HEALTH_INFO",
        "API_KEY",
        "ORGANIZATION"
    ];
    const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const ACTIONS = ["MASKED", "SAFE", "BLOCKED"];

    function getDetectionTypes(value) {
        const text = Array.isArray(value) ? value.join(" ") : String(value || "");
        return DETECTION_TYPES.filter(function (type) {
            return new RegExp("\\b" + type + "\\b", "i").test(text);
        });
    }

    function sanitizeEntry(entry) {
        const riskScore = Number(entry.riskScore);
        const riskLevel = RISK_LEVELS.includes(entry.riskLevel) ? entry.riskLevel : "LOW";
        const action = ACTIONS.includes(entry.action) ? entry.action : "SAFE";
        const timestamp = Date.parse(entry.time);

        return {
            time: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "",
            prompt: "Prompt contents not stored",
            detectedData: getDetectionTypes(entry.detectedData).join(", ") || "None",
            riskScore: Number.isFinite(riskScore) ? Math.max(0, Math.min(100, riskScore)) : 0,
            riskLevel: riskLevel,
            action: action
        };
    }

    function getSafeHistory() {
        let storedHistory = [];
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (Array.isArray(parsed)) storedHistory = parsed;
        } catch {
            storedHistory = [];
        }

        const history = storedHistory
            .filter(function (entry) {
                return entry && typeof entry === "object" && !Array.isArray(entry);
            })
            .map(sanitizeEntry)
            .slice(0, 50);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return history;
    }

    function saveScan(result) {
        const history = getSafeHistory();
        const detections = Array.isArray(result.detections) ? result.detections : [];
        const detectionTypes = getDetectionTypes(detections.map(function (detection) {
            return detection.type;
        }));
        const score = Number(result.riskScore);
        const riskLevel = RISK_LEVELS.includes(result.riskLevel) ? result.riskLevel : "LOW";
        const action = detections.some(function (detection) {
            return detection.action === "REDACT";
        }) ? "MASKED" : "SAFE";

        history.unshift({
            time: new Date().toISOString(),
            prompt: "Prompt contents not stored",
            detectedData: detectionTypes.join(", ") || "None",
            riskScore: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
            riskLevel: riskLevel,
            action: action
        });

        const limitedHistory = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
        return limitedHistory;
    }

    window.ShieldAIHistory = {
        getSafeHistory: getSafeHistory,
        saveScan: saveScan
    };
})();
