/* =====================================================
   SHIELDAI PROBLEM SECTION JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET PROBLEM ELEMENTS
    ========================================== */

    const problemCards =
        document.querySelectorAll(".problem-card");

    const problemMessage =
        document.querySelector(".problem-message");


    /* =========================================
       CHECK PROBLEM SECTION
    ========================================== */

    if (!problemCards.length) {
        return;
    }


    /* =========================================
       CARD HOVER EFFECT
    ========================================== */

    problemCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            this.classList.add("active");

        });


        card.addEventListener("mouseleave", function () {

            this.classList.remove("active");

        });

    });


    /* =========================================
       BOTTOM MESSAGE
    ========================================== */

    if (problemMessage) {

        problemMessage.addEventListener(
            "click",
            function () {

                this.classList.toggle("active");

            }
        );

    }


    /* =========================================
       CONSOLE MESSAGE
    ========================================== */

    console.log(
        "ShieldAI Problem section loaded successfully."
    );

});