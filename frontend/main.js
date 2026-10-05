document.addEventListener("DOMContentLoaded", function () {
    // Mobile navigation toggle
    const navToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            const isOpen = navMenu.classList.toggle("show");
            navToggle.classList.toggle("active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () {
                navMenu.classList.remove("show");
                navToggle.classList.remove("active");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Dynamic copyright year
    const yearNodes = document.querySelectorAll(".year");
    yearNodes.forEach(function (node) {
        node.textContent = new Date().getFullYear();
    });

    // Real-time Gateway Health Check
    async function checkBackendHealth() {
        const statusPills = document.querySelectorAll(".system-status");
        if (!statusPills.length) return;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1800);
            const res = await fetch("http://localhost:3001/api/health", { 
                method: "GET",
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                statusPills.forEach(function (pill) {
                    pill.innerHTML = `
                        <span class="status-indicator-dot" style="background:#10b981; box-shadow:0 0 8px #10b981;"></span>
                        <span style="color:#6ee7b7;">BACKEND ONLINE &bull; PORT 3001</span>
                    `;
                    pill.style.borderColor = "rgba(16, 185, 129, 0.3)";
                    pill.style.background = "rgba(16, 185, 129, 0.08)";
                });
            } else {
                throw new Error("Bad response");
            }
        } catch {
            statusPills.forEach(function (pill) {
                pill.innerHTML = `
                    <span class="status-indicator-dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span>
                    <span style="color:#fcd34d;">SIMULATION MODE &bull; OFFLINE</span>
                `;
                pill.style.borderColor = "rgba(245, 158, 11, 0.3)";
                pill.style.background = "rgba(245, 158, 11, 0.08)";
            });
        }
    }

    checkBackendHealth();
});