/* =====================================================
   SHIELDAI - DEMO JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const demoPrompt =
        document.getElementById("demoPrompt");

    const demoScanButton =
        document.getElementById("demoScanButton");

    const demoClearButton =
        document.getElementById("demoClearButton");

    const demoCharCount =
        document.getElementById("demoCharCount");

    const demoPlaceholder =
        document.getElementById("demoPlaceholder");

    const demoResult =
        document.getElementById("demoResult");

    const demoRiskScore =
        document.getElementById("demoRiskScore");

    const demoRiskProgress =
        document.getElementById("demoRiskProgress");

    const demoRiskBadge =
        document.getElementById("demoRiskBadge");

    const demoDetectionStatus =
        document.getElementById("demoDetectionStatus");

    const demoDetectedList =
        document.getElementById("demoDetectedList");

    const demoSafePrompt =
        document.getElementById("demoSafePrompt");


    /* =========================================
       CHECK ELEMENTS
    ========================================= */

    if (!demoPrompt || !demoScanButton) {
        return;
    }


    /* =========================================
       CHARACTER COUNT
    ========================================= */

    demoPrompt.addEventListener(
        "input",
        function () {

            const length =
                this.value.length;

            demoCharCount.textContent =
                length + " characters";

        }
    );


    /* =========================================
       DETECTION RULES
    ========================================= */

    function detectSensitiveData(text) {

        const detected = [];

        let risk = 0;

        let safeText = text;


        /* EMAIL */

        const emailRegex =
            /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

        if (emailRegex.test(text)) {

            detected.push({
                type: "EMAIL",
                risk: 15
            });

            risk += 15;

            safeText =
                safeText.replace(
                    emailRegex,
                    "[EMAIL]"
                );

        }


        /* PHONE */

        const phoneRegex =
            /(?:\+91[\s-]?)?[6-9]\d{9}\b/g;

        if (phoneRegex.test(text)) {

            detected.push({
                type: "PHONE",
                risk: 15
            });

            risk += 15;

            safeText =
                safeText.replace(
                    phoneRegex,
                    "[PHONE]"
                );

        }


        /* PASSWORD */

        const passwordRegex =
            /\b(password|passwd|pwd)\s*[:=]\s*\S+/gi;

        if (passwordRegex.test(text)) {

            detected.push({
                type: "PASSWORD",
                risk: 30
            });

            risk += 30;

            safeText =
                safeText.replace(
                    passwordRegex,
                    "password: [PASSWORD]"
                );

        }


        /* API KEY */

        const apiKeyRegex =
            /\b(api[_ -]?key|apikey|token)\s*[:=]\s*[A-Za-z0-9_\-]+/gi;

        if (apiKeyRegex.test(text)) {

            detected.push({
                type: "API KEY",
                risk: 35
            });

            risk += 35;

            safeText =
                safeText.replace(
                    apiKeyRegex,
                    "api_key: [API_KEY]"
                );

        }


        /* NAME */

        const nameRegex =
            /\b(?:my name is|i am|i'm)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/i;

        const nameMatch =
            text.match(nameRegex);

        if (nameMatch) {

            detected.push({
                type: "NAME",
                risk: 10
            });

            risk += 10;

            safeText =
                safeText.replace(
                    nameMatch[0],
                    "[NAME]"
                );

        }


        /* =========================================
           CAP RISK TO 100
        ========================================= */

        risk =
            Math.min(risk, 100);


        return {
            detected: detected,
            risk: risk,
            safeText: safeText
        };

    }


    /* =========================================
       RISK LEVEL
    ========================================= */

    function getRiskLevel(risk) {

        if (risk <= 30) {

            return "LOW RISK";

        }

        if (risk <= 60) {

            return "MEDIUM RISK";

        }

        if (risk <= 80) {

            return "HIGH RISK";

        }

        return "CRITICAL RISK";

    }


    /* =========================================
       SCAN BUTTON
    ========================================= */

    demoScanButton.addEventListener(
        "click",
        function () {

            const text =
                demoPrompt.value.trim();


            /* Empty prompt */

            if (!text) {

                demoPrompt.focus();

                demoPrompt.style.borderColor =
                    "rgba(239, 68, 68, 0.6)";

                setTimeout(function () {

                    demoPrompt.style.borderColor =
                        "";

                }, 1500);

                return;

            }


            /* Detect */

            const result =
                detectSensitiveData(text);


            const risk =
                result.risk;

            const level =
                getRiskLevel(risk);


            /* Show result */

            demoPlaceholder.classList.add(
                "hidden"
            );

            demoResult.classList.remove(
                "hidden"
            );


            /* Risk score */

            demoRiskScore.textContent =
                risk;

            demoRiskProgress.style.width =
                risk + "%";


            /* Risk badge */

            demoRiskBadge.textContent =
                level;


            /* Detection status */

            if (result.detected.length > 0) {

                demoDetectionStatus.textContent =
                    "Sensitive Data Detected";

            } else {

                demoDetectionStatus.textContent =
                    "No Sensitive Data";

            }


            /* =========================================
               DETECTED ITEMS
            ========================================= */

            demoDetectedList.innerHTML = "";


            if (result.detected.length === 0) {

                const noData =
                    document.createElement("span");

                noData.className =
                    "demo-no-data";

                noData.textContent =
                    "No sensitive data detected.";

                demoDetectedList.appendChild(
                    noData
                );

            } else {

                result.detected.forEach(
                    function (item) {

                        const itemElement =
                            document.createElement("span");

                        itemElement.className =
                            "demo-detected-item";

                        itemElement.textContent =
                            item.type +
                            " +" +
                            item.risk;

                        demoDetectedList.appendChild(
                            itemElement
                        );

                    }
                );

            }


            /* =========================================
               SAFE PROMPT
            ========================================= */

            demoSafePrompt.textContent =
                result.safeText;


            /* =========================================
               SCROLL RESULT ON MOBILE
            ========================================= */

            if (
                window.innerWidth <= 950
            ) {

                setTimeout(function () {

                    demoResult.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }, 200);

            }

        }
    );


    /* =========================================
       CLEAR BUTTON
    ========================================= */

    if (demoClearButton) {

        demoClearButton.addEventListener(
            "click",
            function () {

                demoPrompt.value = "";

                demoCharCount.textContent =
                    "0 characters";

                demoPlaceholder.classList.remove(
                    "hidden"
                );

                demoResult.classList.add(
                    "hidden"
                );

                demoRiskScore.textContent =
                    "0";

                demoRiskProgress.style.width =
                    "0%";

                demoRiskBadge.textContent =
                    "LOW RISK";

                demoDetectionStatus.textContent =
                    "Protected";

                demoDetectedList.innerHTML =
                    '<span class="demo-no-data">' +
                    'No sensitive data detected.' +
                    '</span>';

                demoSafePrompt.textContent =
                    "Your protected prompt will appear here.";

                demoPrompt.focus();

            }
        );

    }


    console.log(
        "ShieldAI Demo section loaded successfully."
    );

});