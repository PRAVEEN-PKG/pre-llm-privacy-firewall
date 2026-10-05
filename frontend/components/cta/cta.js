/* =====================================================
   SHIELDAI - CTA JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const ctaCard =
        document.querySelector(".cta-card");

    const ctaPrimaryButton =
        document.querySelector(".cta-primary-button");

    const ctaSecondaryButton =
        document.querySelector(".cta-secondary-button");


    /* =========================================
       CHECK CTA
    ========================================= */

    if (!ctaCard) {
        return;
    }


    /* =========================================
       CTA CARD HOVER
    ========================================= */

    ctaCard.addEventListener(
        "mouseenter",
        function () {

            this.classList.add("active");

        }
    );


    ctaCard.addEventListener(
        "mouseleave",
        function () {

            this.classList.remove("active");

        }
    );


    /* =========================================
       PRIMARY BUTTON
    ========================================= */

    if (ctaPrimaryButton) {

        ctaPrimaryButton.addEventListener(
            "click",
            function () {

                console.log(
                    "ShieldAI Scanner opened from CTA."
                );

            }
        );

    }


    /* =========================================
       DOCUMENTATION BUTTON
    ========================================= */

    if (ctaSecondaryButton) {

        ctaSecondaryButton.addEventListener(
            "click",
            function () {

                console.log(
                    "ShieldAI Documentation opened."
                );

            }
        );

    }


    /* =========================================
       CTA TRUST ITEMS
    ========================================= */

    const trustItems =
        document.querySelectorAll(
            ".cta-trust-item"
        );

    trustItems.forEach(function (item) {

        item.addEventListener(
            "mouseenter",
            function () {

                this.classList.add("active");

            }
        );


        item.addEventListener(
            "mouseleave",
            function () {

                this.classList.remove("active");

            }
        );

    });


    console.log(
        "ShieldAI CTA section loaded successfully."
    );

});