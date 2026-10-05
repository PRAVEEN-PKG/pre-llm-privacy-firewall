const SCAN_API_URL = "https://pre-llm-privacy-firewall.vercel.app/api/scan";
const HEALTH_API_URL = "http://localhost:3001/api/health";

// In-Browser Firewall Engine (Exact mirror of backend services for seamless fallback)
const CLIENT_PATTERNS = [
    { type: 'EMAIL', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
    {
        type: 'CREDIT_CARD',
        regex: /\b(?:\d[ -]*?){13,19}\b/g,
        validate: function (val) {
            const digits = val.replace(/\D/g, '');
            if (digits.length < 13 || digits.length > 19) return false;
            let sum = 0, shouldDouble = false;
            for (let i = digits.length - 1; i >= 0; i--) {
                let d = Number(digits[i]);
                if (shouldDouble) { d *= 2; if (d > 9) d -= 9; }
                sum += d;
                shouldDouble = !shouldDouble;
            }
            return sum % 10 === 0;
        }
    },
    { type: 'API_KEY', regex: /\b(?:sk-[A-Za-z0-9_-]{8,}|(?:api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9_./+-]{8,})\b/gi },
    { type: 'PASSWORD', regex: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^"'\s,;]{4,}/gi },
    {
        type: 'PHONE',
        regex: /(?<!\w)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}(?!\w)/g,
        validate: function (val) {
            const digits = val.replace(/\D/g, '');
            return digits.length >= 10 && digits.length <= 15;
        }
    },
    { type: 'HEALTH_INFO', regex: /\b(?:diagnosed with|medical condition|health condition|medical history|taking medication for|HIV|diabetes|cancer|depression|bipolar disorder|asthma)\b/gi },
    { type: 'ADDRESS', regex: /\b(?:address|home address|lives at)\s*[:=]?\s*[^,;\n.]{5,}/gi },
    { type: 'ORGANIZATION', regex: /\b(?:works at|employed by|company|organization|organisation)\s*[:=]?\s*[A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*){0,3}/gi },
    { type: 'NAME', regex: /\b(?:my name is|name\s*[:=])\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi }
];

const POLICIES_MAP = {
    strict: new Set(['NAME', 'EMAIL', 'PHONE', 'PASSWORD', 'CREDIT_CARD', 'ADDRESS', 'HEALTH_INFO', 'API_KEY', 'ORGANIZATION']),
    balanced: new Set(['NAME', 'EMAIL', 'PHONE', 'PASSWORD', 'CREDIT_CARD', 'HEALTH_INFO', 'API_KEY']),
    minimal: new Set(['PASSWORD', 'CREDIT_CARD', 'API_KEY'])
};

const RISK_WEIGHTS = {
    NAME: 10, EMAIL: 40, PHONE: 45, PASSWORD: 55, CREDIT_CARD: 55, ADDRESS: 15, HEALTH_INFO: 55, API_KEY: 55, ORGANIZATION: 10
};

function runClientSimulation(text, policy) {
    const rawDetections = [];
    for (const pat of CLIENT_PATTERNS) {
        pat.regex.lastIndex = 0;
        for (const match of text.matchAll(pat.regex)) {
            const value = pat.type === 'NAME' ? match[1] : match[0];
            const valueOffset = pat.type === 'NAME' ? match[0].lastIndexOf(value) : 0;
            const start = match.index + valueOffset;
            if (pat.validate && !pat.validate(value)) continue;
            rawDetections.push({ type: pat.type, value: value, start: start, end: start + value.length });
        }
    }

    // Remove overlapping
    const accepted = [];
    rawDetections.sort((a, b) => (a.start !== b.start ? a.start - b.start : (b.end - b.start) - (a.end - a.start)));
    for (const d of rawDetections) {
        if (!accepted.some(ex => d.start < ex.end && d.end > ex.start)) accepted.push(d);
    }
    accepted.sort((a, b) => a.start - b.start);

    // Calculate Risk
    const riskScore = Math.min(100, accepted.reduce((sum, d) => sum + (RISK_WEIGHTS[d.type] || 0), 0));
    let riskLevel = 'LOW';
    if (riskScore >= 80) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    // Protect text
    const activePolicy = POLICIES_MAP[policy] || POLICIES_MAP.balanced;
    const finalDetections = accepted.map(d => ({
        ...d,
        action: activePolicy.has(d.type) ? 'REDACT' : 'ALLOW'
    }));

    let protectedText = '';
    let cursor = 0;
    for (const d of finalDetections) {
        if (d.action !== 'REDACT') continue;
        protectedText += text.slice(cursor, d.start);
        protectedText += `[${d.type}]`;
        cursor = d.end;
    }
    protectedText += text.slice(cursor);

    return {
        success: true,
        riskScore,
        riskLevel,
        containsSensitiveData: finalDetections.length > 0,
        detections: finalDetections,
        protectedText,
        isSimulation: true
    };
}
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("promptInput");
    const policySelect = document.getElementById("policySelect");
    const scanBtn = document.getElementById("scanBtn");
    const clearBtn = document.getElementById("clearBtn");
    const backendBanner = document.getElementById("backendBanner");

    const detectedDataEl = document.getElementById("detectedData");
    const detectedTagsEl = document.getElementById("detectedTags");
    const riskScoreEl = document.getElementById("riskScore");
    const riskLevelEl = document.getElementById("riskLevel");
    const riskActionEl = document.getElementById("riskAction");
    const safePromptEl = document.getElementById("safePrompt");
    const threatBarEl = document.getElementById("threatBar");
    const latencyBadgeEl = document.getElementById("latencyBadge");
    const charCounterEl = document.getElementById("charCounter");
    const copyBtn = document.getElementById("copyPromptBtn");
    const copyBtnText = document.getElementById("copyBtnText");
    const presetBtns = document.querySelectorAll(".preset-btn");

    const SAMPLE_PROMPTS = {
        pii: "My name is Ajay Kumar, my email is ajay@gmail.com and my phone number is +91-9876543210. Please review my account details and generate a confirmation note.",
        apikey: "Initialize worker instance with OpenAI key sk-proj-89df78a9sd7f98as7df89a7sdf and secret AWS token AKIAIOSFODNN7EXAMPLE for automated synchronization.",
        medical: "Patient Rahul Sharma (ID: MED-9812), diagnosed with acute cardiac arrhythmia, currently prescribed Atorvastatin 20mg and Lisinopril daily.",
        financial: "Process billing charge of $1,250 on corporate Visa card 4532-8921-0023-9821 with expiry 09/27 and security code 482."
    };

    function updateCounters() {
        const text = input.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        charCounterEl.textContent = chars + " chars \u2022 " + words + " words";
    }

    input.addEventListener("input", updateCounters);

    // Preset buttons
    presetBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const sampleType = btn.getAttribute("data-sample");
            if (SAMPLE_PROMPTS[sampleType]) {
                input.value = SAMPLE_PROMPTS[sampleType];
                updateCounters();
                input.focus();
            }
        });
    });

    // Copy Sanitized Output
    if (copyBtn) {
        copyBtn.addEventListener("click", async function () {
            const textToCopy = safePromptEl.textContent;
            if (!textToCopy || textToCopy.startsWith("No input scanned") || textToCopy.startsWith("Please enter") || textToCopy.startsWith("Intercepting")) {
                return;
            }

            try {
                await navigator.clipboard.writeText(textToCopy);
                copyBtn.classList.add("copied");
                copyBtnText.textContent = "Copied!";
                setTimeout(function () {
                    copyBtn.classList.remove("copied");
                    copyBtnText.textContent = "Copy Prompt";
                }, 2000);
            } catch {
                copyBtnText.textContent = "Press Ctrl+C";
            }
        });
    }

    function renderResults(results, elapsedMs, isSimulated) {
        const detections = results.detections || [];
        const redacted = detections.some(function (d) { return d.action === "REDACT"; });
        const blocked = results.riskLevel === "CRITICAL" || detections.some(function (d) { return d.action === "BLOCK"; });

        const score = Math.max(0, Math.min(100, Number(results.riskScore) || 0));
        riskScoreEl.textContent = score + "/100";
        if (threatBarEl) threatBarEl.style.width = score + "%";

        if (latencyBadgeEl) {
            latencyBadgeEl.textContent = (elapsedMs || 12) + "ms latency" + (isSimulated ? " (Client Engine)" : " (Live API)");
        }

        riskLevelEl.textContent = results.riskLevel;
        riskLevelEl.className = "level-badge " + (results.riskLevel ? results.riskLevel.toLowerCase() : "low");

        const actionText = blocked ? "BLOCKED" : redacted ? "REDACTED" : "SAFE";
        riskActionEl.textContent = actionText;
        riskActionEl.className = "action-badge " + actionText.toLowerCase();

        safePromptEl.textContent = results.protectedText || "Prompt blocked due to high-risk privacy exposure.";

        if (detectedTagsEl) {
            detectedTagsEl.replaceChildren();
            if (!detections.length) {
                const cleanBadge = document.createElement("span");
                cleanBadge.className = "clean-badge";
                cleanBadge.id = "detectedData";
                cleanBadge.textContent = "Zero sensitive entities detected";
                detectedTagsEl.appendChild(cleanBadge);
            } else {
                detections.forEach(function (detection) {
                    const tag = document.createElement("span");
                    tag.className = "entity-tag" + (detection.action === "REDACT" || detection.action === "BLOCK" ? " redact" : "");
                    tag.textContent = detection.type + " (" + detection.action + ")";
                    detectedTagsEl.appendChild(tag);
                });
            }
        }
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
        scanBtn.innerHTML = `
            <svg class="scan-radar-icon" style="animation:spin 1s linear infinite" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>
            <span>Analyzing...</span>
        `;
        safePromptEl.textContent = "Intercepting and inspecting prompt payload...";

        const startTime = performance.now();
        let result = null;
        let isSimulated = false;

        try {
            // Attempt live backend fetch with short timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(SCAN_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text, policy: policySelect.value }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "The scan request failed.");
            }

            if (backendBanner) {
                backendBanner.className = "backend-notice-banner online";
                backendBanner.style.display = "flex";
                backendBanner.innerHTML = `
                    <span>&check; <strong>Live Backend API Connected</strong> &bull; Running on <code>http://localhost:3001</code></span>
                    <span style="font-family:var(--font-mono); font-size:0.75rem;">Status: 200 OK</span>
                `;
            }
        } catch {
            // Seamless client simulation fallback
            isSimulated = true;
            result = runClientSimulation(text, policySelect.value);

            if (backendBanner) {
                backendBanner.className = "backend-notice-banner offline";
                backendBanner.style.display = "flex";
                backendBanner.innerHTML = `
                    <span>&bull; <strong>Backend Offline (Port 3001)</strong> &bull; Using Smart In-Browser Simulation Engine. To connect live server: in terminal, run <code>cd backend</code> then <code>npm start</code>.</span>
                    <span style="font-family:var(--font-mono); font-size:0.75rem;">Client Fallback</span>
                `;
            }
        } finally {
            const elapsed = Math.round(performance.now() - startTime);
            if (result) {
                renderResults(result, elapsed, isSimulated);
                try {
                    window.ShieldAIHistory.saveScan(result);
                } catch {
                    console.warn("Scan succeeded, but local scan history could not be updated.");
                }
            }

            scanBtn.disabled = false;
            clearBtn.disabled = false;
            policySelect.disabled = false;
            scanBtn.innerHTML = `
                <svg class="scan-radar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m4.93 4.93 4.24 4.24"></path>
                    <path d="m14.83 9.17 4.24-4.24"></path>
                    <path d="m14.83 14.83 4.24 4.24"></path>
                    <path d="m9.17 14.83-4.24 4.24"></path>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <span>Scan &amp; Protect</span>
            `;
        }
    });

    clearBtn.addEventListener("click", function () {
        input.value = "";
        updateCounters();
        if (threatBarEl) threatBarEl.style.width = "0%";
        if (latencyBadgeEl) latencyBadgeEl.textContent = "< 18ms latency";
        riskScoreEl.textContent = "0/100";
        riskLevelEl.textContent = "LOW";
        riskLevelEl.className = "level-badge low";
        riskActionEl.textContent = "SAFE";
        riskActionEl.className = "action-badge safe";
        safePromptEl.textContent = "No input scanned yet. Type a prompt on the left and click 'Scan & Protect'.";
        if (detectedTagsEl) {
            detectedTagsEl.replaceChildren();
            const cleanBadge = document.createElement("span");
            cleanBadge.className = "clean-badge";
            cleanBadge.id = "detectedData";
            cleanBadge.textContent = "None detected";
            detectedTagsEl.appendChild(cleanBadge);
        }
    });

    updateCounters();
});
