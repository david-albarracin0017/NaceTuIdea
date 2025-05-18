document.addEventListener("DOMContentLoaded", () => {
    // Utilidad para mostrar errores debajo del campo
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

        setTimeout(() => toast.remove(), 3000);
    }

    let isSubmitting = false;

    // LOGIN
    const loginForm = document.querySelector(".form-box.login form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;
        clearAllErrors(loginForm);

        const emailInput = loginForm.querySelector("input[type='email']");
        const passwordInput = loginForm.querySelector("input[type='password']");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch("https://localhost:7135/api/Access/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {

                if (msg.includes("obligatorio")) {
                    if (!email) setError(emailInput, "Debe ingresar un correo electrónico.");
                    if (!password) setError(passwordInput, "Debe ingresar su contraseña.");
                } else if (msg.includes("formato")) {
                    setError(emailInput, "El formato del correo no es válido.");
                } else if (msg.includes("no existe")) {
                    setError(emailInput, "Correo no registrado.");
                } else if (msg.includes("Contraseña incorrecta")) {
                    setError(passwordInput, "La contraseña no coincide con este correo.");
                } else {
                    setError(emailInput, msg);
                }

                isSubmitting = false;
                return;
            }

            sessionStorage.setItem("token", data.token);
            showSuccessToast(data.message || "Inicio de sesión exitoso.");

            setTimeout(() => {
                window.location.href = ;
            }, 2000);

        } catch (error) {
            setError(emailInput, "Error de red al intentar iniciar sesión.");
            isSubmitting = false;
        }
    });

    // REGISTRO
    const registerForm = document.querySelector(".form-box.register form");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;
        clearAllErrors(registerForm);

        const inputs = registerForm.querySelectorAll("input");
        const nameInput = inputs[0];
        const emailInput = inputs[1];
        const passwordInput = inputs[2];
        const phoneInput = inputs[3];

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const phone = phoneInput.value.trim();

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
                else if (msg.includes("correo") && msg.includes("válido")) setError(emailInput, "Formato de correo inválido.");
                else if (msg.includes("correo") || msg.includes("cuenta")) setError(emailInput, msg);
                else if (msg.includes("contraseña")) setError(passwordInput, msg);
                else if (msg.includes("teléfono")) setError(phoneInput, msg);
                else setError(nameInput, msg);

                isSubmitting = false;
                return;
            }

            showSuccessToast(data.message || "Registro exitoso.");
            registerForm.reset();

            setTimeout(() => {
                document.querySelector(".login-link").click();
                isSubmitting = false;
            }, 1500);

        } catch (error) {
            setError(emailInput, "Error de red al intentar registrarse.");
            isSubmitting = false;
        }
    });
});

