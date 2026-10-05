const STORAGE_KEY = "shieldai-scan-history";

function detectSensitiveData(prompt) {
    const results = [];

    if (/(?:my name is|i am|name is)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/i.test(prompt)) {
        results.push("NAME");
    }

    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(prompt)) {
        results.push("EMAIL");
    }

    if (/(?:phone|mobile|contact).*\b\d{10}\b/i.test(prompt)) {
        results.push("PHONE");
    }

    if (/\b(?:password|pwd|secret|api[_ -]?key)\b[:=]?\s*[A-Za-z0-9._-]+/i.test(prompt)) {
        results.push("API KEY");
    }

    return results;
}

function computeRiskScore(detectedData) {
    const count = detectedData.length;
    if (count === 0) return 0;
    return Math.min(100, count * 22 + 10);
}

function computeRiskLevel(score) {
    if (score >= 70) return "HIGH";
    if (score >= 35) return "MEDIUM";
    return "LOW";
}

function sanitizePrompt(prompt, detectedData) {
    let safePrompt = prompt;

    const nameMatch = safePrompt.match(/(?:my name is|i am|name is)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/i);
    if (nameMatch && detectedData.includes("NAME")) {
        safePrompt = safePrompt.replace(nameMatch[0], "My name is [NAME]");
    }

    const emailMatch = safePrompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch && detectedData.includes("EMAIL")) {
        safePrompt = safePrompt.replace(emailMatch[0], "[EMAIL]");
    }

    return safePrompt;
}

function saveScanToHistory(entry) {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    current.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 50)));
}

document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("promptInput");
    const scanBtn = document.getElementById("scanBtn");
    const clearBtn = document.getElementById("clearBtn");

    const detectedDataEl = document.getElementById("detectedData");
    const riskScoreEl = document.getElementById("riskScore");
    const riskLevelEl = document.getElementById("riskLevel");
    const riskActionEl = document.getElementById("riskAction");
    const safePromptEl = document.getElementById("safePrompt");

    function renderResults(results) {
        const detectedData = Array.from(new Set(results.detectedData));
        const riskScore = results.riskScore;
        const riskLevel = results.riskLevel;
        const action = riskScore > 0 ? "MASKED" : "SAFE";

        detectedDataEl.textContent = detectedData.length ? detectedData.join(", ") : "None";
        riskScoreEl.textContent = riskScore + "/100";
        riskLevelEl.textContent = riskLevel;
        riskActionEl.textContent = action;
        safePromptEl.textContent = results.safePrompt;

        riskLevelEl.style.color = riskLevel === "HIGH" ? "#fca5a5" : riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac";
        riskActionEl.style.color = action === "MASKED" ? "#fcd34d" : "#86efac";
    }

    scanBtn.addEventListener("click", function () {
        const prompt = input.value.trim();

        if (!prompt) {
            renderResults({ detectedData: [], riskScore: 0, riskLevel: "LOW", safePrompt: "Please enter a prompt to scan." });
            return;
        }

        const detectedData = detectSensitiveData(prompt);
        const riskScore = computeRiskScore(detectedData);
        const riskLevel = computeRiskLevel(riskScore);
        const safePrompt = sanitizePrompt(prompt, detectedData);

        renderResults({ detectedData, riskScore, riskLevel, safePrompt });

        saveScanToHistory({
            time: new Date().toISOString(),
            prompt: prompt,
            detectedData: detectedData.join(", ") || "None",
            riskScore: riskScore,
            riskLevel: riskLevel,
            action: riskLevel === "LOW" ? "SAFE" : "MASKED"
        });
    });

    clearBtn.addEventListener("click", function () {
        input.value = "";
        renderResults({ detectedData: [], riskScore: 0, riskLevel: "LOW", safePrompt: "No input scanned yet." });
    });
});
