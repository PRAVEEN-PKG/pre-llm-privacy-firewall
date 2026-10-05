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

        /* REGISTRATION NUMBER */

        const registrationPatterns = [
            {
                regex: /\b(?:registration(?:\s*(?:number|no\.?|#))?|reg(?:istration)?\s*(?:no\.?|number|#)|vehicle\s+(?:registration|reg)(?:\s*(?:number|no\.?|#))?)\s*(?:is\s+|[:=#-]\s*|\s+)([A-Z0-9][A-Z0-9/-]{3,19})\b/gi,
                capture: 1
            },
            {
                regex: /\b(?:[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}|\d{2}\s?BH\s?\d{4}\s?[A-Z]{1,2})\b/gi
            },
            {
                regex: /\b\d{7}\b/g
            }
        ];
        const registrationDetections = [];

        registrationPatterns.forEach(function (pattern) {
            pattern.regex.lastIndex = 0;
            for (const match of text.matchAll(pattern.regex)) {
                const value = pattern.capture ? match[pattern.capture] : match[0];
                const valueOffset = pattern.capture ? match[0].lastIndexOf(value) : 0;
                const start = match.index + valueOffset;

                registrationDetections.push({
                    start: start,
                    end: start + value.length
                });
            }
        });

        registrationDetections.sort(function (left, right) {
            return left.start - right.start || right.end - left.end;
        });

        let registrationCursor = 0;
        let protectedRegistrations = "";
        const acceptedRegistrations = [];

        registrationDetections.forEach(function (registration) {
            if (acceptedRegistrations.some(function (existing) {
                return registration.start < existing.end && registration.end > existing.start;
            })) {
                return;
            }

            acceptedRegistrations.push(registration);
            protectedRegistrations += text.slice(registrationCursor, registration.start);
            protectedRegistrations += "[REGISTRATION_NUMBER]";
            registrationCursor = registration.end;

            detected.push({
                type: "REGISTRATION_NUMBER",
                risk: 40
            });
            risk += 40;
        });

        if (acceptedRegistrations.length > 0) {
            safeText =
                protectedRegistrations +
                text.slice(registrationCursor);
        }

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
            /\b(?:(?:my\s+)?name\s*(?:is\b|[:=]|-\s*)|i\s+am|i['’]m)\s*([\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*(?:\s+[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*){0,4})(?=\s*(?:[-,;.!?\n]|$))/iu;

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
                    nameMatch[0].replace(nameMatch[1], "[NAME]")
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