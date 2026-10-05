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
        emptyMessage.textContent = "No recent activity.";
        activityList.appendChild(emptyMessage);
        document.getElementById("securityStatus").textContent = "Monitoring healthy";
        return;
    }

    records.slice(0, 5).forEach(function (item) {
        const activity = document.createElement("li");
        const timestamp = item.time ? new Date(item.time).toLocaleString() : "Unknown time";
        activity.textContent = timestamp + " — " + item.riskLevel + " risk, " + item.action;
        activityList.appendChild(activity);
    });

    document.getElementById("securityStatus").textContent = critical > 0
        ? "Critical risk activity detected"
        : high > 0 ? "High risk activity detected" : "Monitoring healthy";
}

document.addEventListener("DOMContentLoaded", renderDashboard);
