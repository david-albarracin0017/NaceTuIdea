document.addEventListener("DOMContentLoaded", () => {
    function setError(input, message) {
        clearError(input);
        const error = document.createElement("div");
        error.classList.add("error-message");
        error.textContent = message;
        input.parentElement.appendChild(error);
    }

    function clearError(input) {
        const error = input.parentElement.querySelector(".error-message");
        if (error) error.remove();
    }

    function clearAllErrors(form) {
        form.querySelectorAll(".error-message").forEach(e => e.remove());
    }

    function showSuccessToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast-success";
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.top = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "#4CAF50";
        toast.style.color = "white";
        toast.style.padding = "10px 20px";
        toast.style.borderRadius = "5px";
        toast.style.zIndex = "9999";
        toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    // LOGIN
    const loginForm = document.querySelector(".form-box.login form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearAllErrors(loginForm);

            const emailInput = loginForm.querySelector("input[type='email']");
            const passwordInput = loginForm.querySelector("input[type='password']");

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch("https://localhost:7135/api/Access/Login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const msg = data.message || "Ocurrió un error al iniciar sesión.";
                    if (msg.includes("correo")) setError(emailInput, msg);
                    else if (msg.includes("Contraseña")) setError(passwordInput, msg);
                    else setError(emailInput, msg);
                    return;
                }

                sessionStorage.setItem("token", data.token);
                showSuccessToast(data.message || "Inicio de sesión exitoso.");

                setTimeout(() => {
                    window.location.href = "/Home/Index";
                }, 2000);

            } catch (error) {
                setError(emailInput, "Error de red al intentar iniciar sesión.");
            }
        });
    }

    // REGISTRO
    const registerForm = document.querySelector(".form-box.register form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearAllErrors(registerForm);

            const inputs = registerForm.querySelectorAll("input");
            const nameInput = inputs[0];
            const emailInput = inputs[1];
            const passwordInput = inputs[2];
            const phoneInput = inputs[3];

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const phone = phoneInput.value.trim();

            try {
                const response = await fetch("https://localhost:7135/api/Access/Register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, phone }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const msg = data.message || "Ocurrió un error al registrarse.";
                    if (msg.includes("nombre")) setError(nameInput, msg);
                    else if (msg.includes("correo")) setError(emailInput, msg);
                    else if (msg.includes("contraseña")) setError(passwordInput, msg);
                    else if (msg.includes("teléfono")) setError(phoneInput, msg);
                    else if (msg.includes("cuenta")) setError(emailInput, msg);
                    else setError(emailInput, msg);
                    return;
                }

                showSuccessToast(data.message || "Registro exitoso.");
                registerForm.reset();

            } catch (error) {
                setError(emailInput, "Error de red al intentar registrarse.");
            }
        });
    }
});
