document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".doc-card");
    cards.forEach(function (card, index) {
        card.style.animationDelay = index * 75 + "ms";
    });
});
