function renderHistory(list) {
    const tbody = document.getElementById("historyTableBody");
    tbody.replaceChildren();

    if (!list.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "No scan history available.";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    list.forEach(function (item) {
        const row = document.createElement("tr");
        const values = [
            item.time ? new Date(item.time).toLocaleString() : "-",
            "Prompt contents not stored",
            item.detectedData,
            item.riskScore + "/100",
            item.riskLevel,
            item.action
        ];

        values.forEach(function (value, index) {
            const cell = document.createElement("td");
            if (index === 4) {
                const badge = document.createElement("span");
                badge.classList.add("badge", item.riskLevel.toLowerCase());
                badge.textContent = value;
                cell.appendChild(badge);
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });
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

    searchInput.addEventListener("input", applyFilters);
    filterSelect.addEventListener("change", applyFilters);
    clearHistoryBtn.addEventListener("click", function () {
        localStorage.removeItem("shieldai-scan-history");
        renderHistory([]);
    });

    renderHistory(window.ShieldAIHistory.getSafeHistory());
});
