// interfazmode.js

(function () {
    // Este bloque corre inmediatamente antes de que se pinte el DOM
    if (localStorage.getItem("modoOscuro") === "true") {
        document.addEventListener("DOMContentLoaded", () => {
            document.body.classList.add("dark");
        });
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const sidebar = body.querySelector(".siderbar");
    const toggle = body.querySelector(".toggle");
    const searchbtn = body.querySelector(".search-box");
    const modeSwitch = body.querySelector(".toggle-switch");
    const modeText = body.querySelector(".mode-text");

    // Establece el texto inicial
    const isDark = body.classList.contains("dark");
    if (modeText) {
        modeText.innerText = isDark ? "Light Mode" : "Dark Mode";
    }

    // Toggle sidebar
    toggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("close");
    });

    // Toggle modo oscuro
    modeSwitch?.addEventListener("click", () => {
        const isNowDark = body.classList.toggle("dark");
        localStorage.setItem("modoOscuro", isNowDark);
        if (modeText) {
            modeText.innerText = isNowDark ? "Light Mode" : "Dark Mode";
        }
    });
});

