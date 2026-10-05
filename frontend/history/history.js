const STORAGE_KEY = "shieldai-scan-history";

function getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function renderHistory(list) {
    const tbody = document.getElementById("historyTableBody");

    if (!list.length) {
        tbody.innerHTML = "<tr><td colspan='6'>No scan history available.</td></tr>";
        return;
    }

    tbody.innerHTML = list.map(function (item) {
        const badgeClass = (item.riskLevel || "LOW").toLowerCase();
        return "<tr>" +
            "<td>" + new Date(item.time).toLocaleString() + "</td>" +
            "<td>" + (item.prompt || "-") + "</td>" +
            "<td>" + (item.detectedData || "None") + "</td>" +
            "<td>" + (item.riskScore || 0) + "/100</td>" +
            "<td><span class='badge " + badgeClass + "'>" + (item.riskLevel || "LOW") + "</span></td>" +
            "<td>" + (item.action || "SAFE") + "</td>" +
            "</tr>";
    }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    function applyFilters() {
        const text = (searchInput.value || "").toLowerCase();
        const level = filterSelect.value;
        const items = getHistory().filter(function (item) {
            const matchesText = !text || item.prompt.toLowerCase().includes(text) || (item.detectedData || "").toLowerCase().includes(text);
            const matchesLevel = level === "all" || (item.riskLevel || "LOW") === level;
            return matchesText && matchesLevel;
        });
        renderHistory(items);
    }

    searchInput.addEventListener("input", applyFilters);
    filterSelect.addEventListener("change", applyFilters);
    clearHistoryBtn.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory([]);
    });

    renderHistory(getHistory());
});
