/* =====================================================
   SHIELDAI HERO JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       HERO BUTTONS
    ========================================== */

    const primaryButton =
        document.querySelector(".hero-primary-button");

    const secondaryButton =
        document.querySelector(".hero-secondary-button");


    /* =========================================
       PRIMARY BUTTON
    ========================================== */

    if (primaryButton) {

        primaryButton.addEventListener("click", function () {

            console.log(
                "ShieldAI Scanner button clicked."
            );

        });

    }


    /* =========================================
       SECONDARY BUTTON
    ========================================== */

    if (secondaryButton) {

        secondaryButton.addEventListener("click", function () {

            const target =
                document.querySelector("#how-it-works");

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    }


    /* =========================================
       HERO SECURITY CARD
    ========================================== */

    const securityCard =
        document.querySelector(".security-card");


    if (securityCard) {

        securityCard.addEventListener(
            "mouseenter",
            function () {

                securityCard.style.animationPlayState =
                    "paused";

            }
        );


        securityCard.addEventListener(
            "mouseleave",
            function () {

                securityCard.style.animationPlayState =
                    "running";

            }
        );

    }


    /* =========================================
       HERO LOADED
    ========================================== */

    console.log(
        "ShieldAI Hero loaded successfully."
    );

});