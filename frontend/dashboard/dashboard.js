function renderDashboard() {
    const records = window.ShieldAIHistory.getSafeHistory();
    const totalScans = records.length;
    const protectedPrompts = records.filter(function (item) {
        return item.action !== "BLOCKED";
    }).length;
    const blockedRequests = records.filter(function (item) {
        return item.action === "BLOCKED";
    }).length;

    const avgRiskScore = totalScans ? Math.round(records.reduce(function (sum, item) {
        return sum + Number(item.riskScore || 0);
    }, 0) / totalScans) : 0;

    const low = records.filter(function (item) { return (item.riskLevel || "LOW") === "LOW"; }).length;
    const medium = records.filter(function (item) { return (item.riskLevel || "LOW") === "MEDIUM"; }).length;
    const high = records.filter(function (item) { return (item.riskLevel || "LOW") === "HIGH"; }).length;
    const critical = records.filter(function (item) { return (item.riskLevel || "LOW") === "CRITICAL"; }).length;

    document.getElementById("totalScans").textContent = totalScans;
    document.getElementById("protectedPrompts").textContent = protectedPrompts;
    document.getElementById("blockedRequests").textContent = blockedRequests;
    document.getElementById("avgRiskScore").textContent = avgRiskScore + "/100";

    const max = Math.max(low, medium, high, critical, 1);
    document.getElementById("lowBar").style.width = (low / max * 100) + "%";
    document.getElementById("mediumBar").style.width = (medium / max * 100) + "%";
    document.getElementById("highBar").style.width = (high / max * 100) + "%";
    document.getElementById("criticalBar").style.width = (critical / max * 100) + "%";
    document.getElementById("lowCount").textContent = low;
    document.getElementById("mediumCount").textContent = medium;
    document.getElementById("highCount").textContent = high;
    document.getElementById("criticalCount").textContent = critical;

    const activityList = document.getElementById("recentActivity");
    activityList.replaceChildren();

    if (!records.length) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No recent activity recorded yet. Run a prompt scan to generate live telemetry.";
        activityList.appendChild(emptyMessage);
        document.getElementById("securityStatus").textContent = "Monitoring healthy \u2022 Zero active exposures";
        return;
    }

    records.slice(0, 6).forEach(function (item) {
        const activity = document.createElement("li");
        const timeStr = item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Just now";
        const isBlocked = item.action === "BLOCKED";
        const isRedacted = item.action === "MASKED" || item.action === "REDACTED";
        const dotColor = isBlocked ? "#f87171" : isRedacted ? "#fbbf24" : "#34d399";

        activity.innerHTML = `
            <span style="width:8px; height:8px; border-radius:50%; background:${dotColor}; box-shadow:0 0 6px ${dotColor}; flex-shrink:0;"></span>
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); min-width:65px;">${timeStr}</span>
            <span style="flex:1; font-weight:500; color:#f1f5f9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${item.detectedData && item.detectedData !== 'None' ? item.detectedData : 'Clean prompt'}
            </span>
            <span style="font-family:var(--font-mono); font-size:0.72rem; padding:2px 8px; border-radius:4px; font-weight:700; background:rgba(255,255,255,0.06); color:${dotColor};">
                ${item.action} (${item.riskScore})
            </span>
        `;
        activityList.appendChild(activity);
    });

    document.getElementById("securityStatus").textContent = critical > 0
        ? "CRITICAL ALERT: Prompt breach attempts blocked"
        : high > 0 ? "WARNING: High-risk PII exposure mitigated" : "Monitoring healthy \u2022 Zero active exposures";
}

document.addEventListener("DOMContentLoaded", renderDashboard);
