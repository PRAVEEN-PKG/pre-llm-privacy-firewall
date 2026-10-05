/* =====================================================
   SHIELDAI NAVBAR JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET NAVBAR ELEMENTS
    ========================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");


    /* =========================================
       CHECK ELEMENTS
    ========================================== */

    if (!menuToggle || !navMenu) {
        return;
    }


    /* =========================================
       MOBILE MENU TOGGLE
    ========================================== */

    menuToggle.addEventListener("click", function () {

        const isOpen = navMenu.classList.toggle("show");

        menuToggle.classList.toggle("active", isOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    /* =========================================
       NAVIGATION LINKS
    ========================================== */

    const navLinks = navMenu.querySelectorAll(".nav-link");


    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            /* Close mobile menu */

            navMenu.classList.remove("show");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            /* Change active link */

            navLinks.forEach(function (item) {

                item.classList.remove("active");

            });

            this.classList.add("active");

        });

    });


    /* =========================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ========================================== */

    document.addEventListener("click", function (event) {

        const navbar = document.querySelector(".navbar");

        if (!navbar) {
            return;
        }


        if (!navbar.contains(event.target)) {

            navMenu.classList.remove("show");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* =========================================
       CLOSE MENU WITH ESCAPE KEY
    ========================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            navMenu.classList.remove("show");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

});