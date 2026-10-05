const SCAN_API_URL = "https://pre-llm-privacy-firewall.vercel.app/api/scan";

document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("promptInput");
    const policySelect = document.getElementById("policySelect");
    const scanBtn = document.getElementById("scanBtn");
    const clearBtn = document.getElementById("clearBtn");

    const detectedDataEl = document.getElementById("detectedData");
    const riskScoreEl = document.getElementById("riskScore");
    const riskLevelEl = document.getElementById("riskLevel");
    const riskActionEl = document.getElementById("riskAction");
    const safePromptEl = document.getElementById("safePrompt");

    function renderResults(results) {
        const detections = results.detections || [];
        const redacted = detections.some(function (detection) {
            return detection.action === "REDACT";
        });

        detectedDataEl.textContent = detections.length
            ? detections.map(function (detection) {
                return detection.type + " (" + detection.action + ")";
            }).join(", ")
            : "None";
        riskScoreEl.textContent = results.riskScore + "/100";
        riskLevelEl.textContent = results.riskLevel;
        riskActionEl.textContent = redacted ? "REDACTED" : "SAFE";
        safePromptEl.textContent = results.protectedText;

        riskLevelEl.style.color = results.riskLevel === "CRITICAL" || results.riskLevel === "HIGH"
            ? "#fca5a5"
            : results.riskLevel === "MEDIUM" ? "#fcd34d" : "#86efac";
        riskActionEl.style.color = redacted ? "#fcd34d" : "#86efac";
    }

    scanBtn.addEventListener("click", async function () {
        const text = input.value.trim();

        if (!text) {
            safePromptEl.textContent = "Please enter a prompt to scan.";
            return;
        }

        scanBtn.disabled = true;
        clearBtn.disabled = true;
        policySelect.disabled = true;
        scanBtn.textContent = "Scanning...";
        safePromptEl.textContent = "Scanning prompt...";

        try {
            const response = await fetch(SCAN_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text,
                    policy: policySelect.value
                })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "The scan request failed.");
            }

            renderResults(result);
            try {
                window.ShieldAIHistory.saveScan(result);
            } catch {
                console.warn("Scan succeeded, but local scan history could not be updated.");
            }
        } catch (error) {
            safePromptEl.textContent = error.message === "Failed to fetch"
                ? "Could not connect to the backend. Make sure it is running at http://localhost:3001."
                : error.message;
        } finally {
            scanBtn.disabled = false;
            clearBtn.disabled = false;
            policySelect.disabled = false;
            scanBtn.textContent = "Scan & Protect";
        }
    });

    clearBtn.addEventListener("click", function () {
        input.value = "";
        detectedDataEl.textContent = "None";
        riskScoreEl.textContent = "0/100";
        riskLevelEl.textContent = "LOW";
        riskLevelEl.style.color = "#86efac";
        riskActionEl.textContent = "SAFE";
        riskActionEl.style.color = "#86efac";
        safePromptEl.textContent = "No input scanned yet.";
    });
});
