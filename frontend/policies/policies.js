document.addEventListener("DOMContentLoaded", function () {
    const filterChips = document.querySelectorAll(".filter-chip");
    const policyCards = document.querySelectorAll(".policy-card");

    filterChips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            filterChips.forEach(function (c) { c.classList.remove("active"); });
            chip.classList.add("active");

            const filterValue = chip.getAttribute("data-filter");

            policyCards.forEach(function (card) {
                const action = card.getAttribute("data-action");
                if (filterValue === "all" || action === filterValue) {
                    card.classList.remove("hidden");
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });
});
