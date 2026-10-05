/* =====================================================
   SHIELDAI - STATS JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const statCards =
        document.querySelectorAll(".stat-card");

    const riskItems =
        document.querySelectorAll(".risk-level-item");

    const statsMessage =
        document.querySelector(".stats-message");


    /* =========================================
       CHECK ELEMENTS
    ========================================= */

    if (!statCards.length) {
        return;
    }


    /* =========================================
       STAT CARD INTERACTION
    ========================================= */

    statCards.forEach(function (card) {

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
       RISK LEVEL INTERACTION
    ========================================= */

    riskItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                riskItems.forEach(function (otherItem) {

                    otherItem.classList.remove(
                        "active"
                    );

                });

                this.classList.add("active");

            }
        );

    });


    /* =========================================
       SECURITY MESSAGE
    ========================================= */

    if (statsMessage) {

        statsMessage.addEventListener(
            "click",
            function () {

                this.classList.toggle("active");

            }
        );

    }


    console.log(
        "ShieldAI Stats section loaded successfully."
    );

});