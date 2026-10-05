/* =====================================================
   SHIELDAI - FEATURES JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const featureCards =
        document.querySelectorAll(".feature-card");

    if (!featureCards.length) {
        return;
    }


    /* =========================================
       FEATURE CARD HOVER
    ========================================= */

    featureCards.forEach(function (card) {

        card.addEventListener(
            "mouseenter",
            function () {

                this.classList.add("active");

            }
        );


        card.addEventListener(
            "mouseleave",
            function () {

                this.classList.remove("active");

            }
        );

    });


    /* =========================================
       BOTTOM SECURITY MESSAGE
    ========================================= */

    const featuresBottom =
        document.querySelector(".features-bottom");

    if (featuresBottom) {

        featuresBottom.addEventListener(
            "click",
            function () {

                this.classList.toggle("active");

            }
        );

    }


    console.log(
        "ShieldAI Features section loaded successfully."
    );

});