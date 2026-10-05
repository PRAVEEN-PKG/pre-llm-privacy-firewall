document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".policy-card");
    cards.forEach(function (card, index) {
        card.style.animationDelay = index * 90 + "ms";
    });
});
