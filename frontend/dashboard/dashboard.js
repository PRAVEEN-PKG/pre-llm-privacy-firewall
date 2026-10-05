const STORAGE_KEY = "shieldai-scan-history";

function getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function renderDashboard() {
    const records = getHistory();
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

    document.getElementById("totalScans").textContent = totalScans;
    document.getElementById("protectedPrompts").textContent = protectedPrompts;
    document.getElementById("blockedRequests").textContent = blockedRequests;
    document.getElementById("avgRiskScore").textContent = avgRiskScore + "/100";

    const max = Math.max(low, medium, high, 1);
    document.getElementById("lowBar").style.width = (low / max * 100) + "%";
    document.getElementById("mediumBar").style.width = (medium / max * 100) + "%";
    document.getElementById("highBar").style.width = (high / max * 100) + "%";
    document.getElementById("lowCount").textContent = low;
    document.getElementById("mediumCount").textContent = medium;
    document.getElementById("highCount").textContent = high;

    const activityList = document.getElementById("recentActivity");
    if (!records.length) {
        activityList.innerHTML = "<li>No recent activity.</li>";
        document.getElementById("securityStatus").textContent = "Monitoring healthy";
        return;
    }

    activityList.innerHTML = records.slice(0, 5).map(function (item) {
        return "<li>" + new Date(item.time).toLocaleString() + " — " + item.riskLevel + " risk, " + item.action + "</li>";
    }).join("");

    document.getElementById("securityStatus").textContent = high > 0 ? "High risk activity detected" : "Monitoring healthy";
}

document.addEventListener("DOMContentLoaded", renderDashboard);
