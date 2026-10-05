function renderHistory(list) {
    const tbody = document.getElementById("historyTableBody");
    tbody.replaceChildren();

    if (!list.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.className = "empty-table-state";
        cell.textContent = "No scan history recorded yet. Run a prompt scan in the live scanner.";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    list.forEach(function (item) {
        const row = document.createElement("tr");
        
        // 1. Time
        const timeCell = document.createElement("td");
        timeCell.textContent = item.time ? new Date(item.time).toLocaleString() : "-";
        row.appendChild(timeCell);

        // 2. Prompt Data
        const promptCell = document.createElement("td");
        promptCell.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--text-dim); font-size:0.8rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Zero-Retention Sanitized
        </span>`;
        row.appendChild(promptCell);

        // 3. Detected Data
        const detectedCell = document.createElement("td");
        if (!item.detectedData || item.detectedData === "None") {
            detectedCell.innerHTML = `<span style="color:#34d399; font-size:0.82rem;">&check; Zero PII detected</span>`;
        } else {
            const tags = item.detectedData.split(", ").map(function (d) {
                return `<span style="display:inline-block; font-family:var(--font-mono); font-size:0.72rem; padding:2px 7px; border-radius:4px; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.25); color:#fcd34d; margin:2px 3px 2px 0;">${d}</span>`;
            }).join("");
            detectedCell.innerHTML = tags;
        }
        row.appendChild(detectedCell);

        // 4. Risk Score
        const scoreCell = document.createElement("td");
        scoreCell.style.fontFamily = "var(--font-mono)";
        scoreCell.style.fontWeight = "700";
        scoreCell.textContent = (item.riskScore || 0) + "/100";
        row.appendChild(scoreCell);

        // 5. Risk Level
        const levelCell = document.createElement("td");
        const levelBadge = document.createElement("span");
        const level = (item.riskLevel || "LOW").toLowerCase();
        levelBadge.className = "badge " + level;
        levelBadge.textContent = item.riskLevel || "LOW";
        levelCell.appendChild(levelBadge);
        row.appendChild(levelCell);

        // 6. Action
        const actionCell = document.createElement("td");
        const isBlocked = item.action === "BLOCKED";
        const isMasked = item.action === "MASKED" || item.action === "REDACTED";
        const actionColor = isBlocked ? "#f87171" : isMasked ? "#fbbf24" : "#34d399";
        const actionBg = isBlocked ? "rgba(244,63,94,0.1)" : isMasked ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)";
        const actionBorder = isBlocked ? "rgba(244,63,94,0.25)" : isMasked ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)";
        
        actionCell.innerHTML = `<span style="display:inline-block; font-family:var(--font-mono); font-size:0.72rem; font-weight:700; padding:3px 9px; border-radius:4px; color:${actionColor}; background:${actionBg}; border:1px solid ${actionBorder};">
            ${item.action || "SAFE"}
        </span>`;
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    function applyFilters() {
        const text = (searchInput.value || "").toLowerCase();
        const level = filterSelect.value;
        const items = window.ShieldAIHistory.getSafeHistory().filter(function (item) {
            const matchesText = !text || item.detectedData.toLowerCase().includes(text);
            const matchesLevel = level === "all" || (item.riskLevel || "LOW") === level;
            return matchesText && matchesLevel;
        });
        renderHistory(items);
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (filterSelect) filterSelect.addEventListener("change", applyFilters);
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to clear your local audit trail history?")) {
                localStorage.removeItem("shieldai-scan-history");
                renderHistory([]);
            }
        });
    }

    renderHistory(window.ShieldAIHistory.getSafeHistory());
});
