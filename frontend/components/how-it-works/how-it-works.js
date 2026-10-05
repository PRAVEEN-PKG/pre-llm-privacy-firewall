/* =====================================================
   SHIELDAI - HOW IT WORKS JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET FLOW STEPS
    ========================================== */

    const flowSteps =
        document.querySelectorAll(".flow-step");


    /* =========================================
       CHECK FLOW STEPS
    ========================================== */

    if (!flowSteps.length) {
        return;
    }


    /* =========================================
       STEP HOVER EFFECT
    ========================================== */

    flowSteps.forEach(function (step) {

        step.addEventListener(
            "mouseenter",
            function () {

                this.classList.add("active");

            }
        );


        step.addEventListener(
            "mouseleave",
            function () {

                this.classList.remove("active");

            }
        );

    });


    /* =========================================
       SECURITY RULE
    ========================================== */

    const securityRule =
        document.querySelector(".security-rule");


    if (securityRule) {

        securityRule.addEventListener(
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
        "ShieldAI How It Works section loaded successfully."
    );

});