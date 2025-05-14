document.addEventListener("DOMContentLoaded", () => {
    // Utilidad para mostrar errores
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

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000); // 3 segundos
    }


    // LOGIN
    const loginForm = document.querySelector(".form-box.login form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAllErrors(loginForm);

        const emailInput = loginForm.querySelector("input[type='email']");
        const passwordInput = loginForm.querySelector("input[type='password']");

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("https://localhost:7135/api/Access/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.message || "Error desconocido.";
                if (msg.includes("correo")) setError(emailInput, msg);
                else if (msg.includes("Contraseña")) setError(passwordInput, msg);
                else setError(emailInput, msg); // general
                return;
            }

            sessionStorage.setItem("token", data.token);
            showSuccessToast(data.message || "Inicio de sesión exitoso.");

            // Redirecciona después de 2 segundos
            setTimeout(() => {
                window.location.href = "/Home/Index";
            }, 2000);

        } catch (error) {
            setError(emailInput, "Error de red al intentar iniciar sesión.");
        }
    });

    // REGISTRO
    const registerForm = document.querySelector(".form-box.register form");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAllErrors(registerForm);

        const inputs = registerForm.querySelectorAll("input");
        const nameInput = inputs[0];
        const emailInput = inputs[1];
        const passwordInput = inputs[2];
        const phoneInput = inputs[3];

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const phone = phoneInput.value;

        try {
            const response = await fetch("https://localhost:7135/api/Access/Register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.message || "Error desconocido.";
                if (msg.includes("nombre")) setError(nameInput, msg);
                else if (msg.includes("correo")) setError(emailInput, msg);
                else if (msg.includes("contraseña")) setError(passwordInput, msg);
                else if (msg.includes("teléfono")) setError(phoneInput, msg);
                else if (msg.includes("cuenta")) setError(emailInput, msg);
                return;
            }

            showSuccessToast(data.message || "Registro exitoso.");
            registerForm.reset();

            // Cambia a formulario de login (si lo deseas)
            // document.querySelector(".login-link").click();

        } catch (error) {
            setError(emailInput, "Error de red al intentar registrarse.");
        }
    });
});