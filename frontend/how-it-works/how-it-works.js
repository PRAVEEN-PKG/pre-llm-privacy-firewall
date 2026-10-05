document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".flow-step");
    cards.forEach(function (card, index) {
        card.style.animationDelay = index * 80 + "ms";
        card.classList.add("reveal");
    });
});
