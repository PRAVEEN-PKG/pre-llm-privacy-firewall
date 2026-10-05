document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach(function (card, index) {
        card.style.animationDelay = index * 80 + "ms";
    });
});
