/* =====================================================
   SHIELDAI - FOOTER JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const footerYear =
        document.getElementById("footerYear");

    const footerStatus =
        document.querySelector(".footer-status");

    const footerLinks =
        document.querySelectorAll(".footer-column a");


    /* =========================================
       CURRENT YEAR
    ========================================= */

    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }


    /* =========================================
       FOOTER STATUS
    ========================================= */

    if (footerStatus) {

        footerStatus.addEventListener(
            "click",
            function () {

                this.classList.toggle("active");

            }
        );

    }


    /* =========================================
       FOOTER LINK EFFECT
    ========================================= */

    footerLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                console.log(
                    "ShieldAI footer link:",
                    this.textContent.trim()
                );

            }
        );

    });


    console.log(
        "ShieldAI Footer loaded successfully."
    );

});