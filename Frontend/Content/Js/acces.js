document.addEventListener("DOMContentLoaded", () => {

    // FUNCIONES DE VALIDACIÓN
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^\d{7,15}$/;
        return phoneRegex.test(phone);
    }

    function isValidName(name) {
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
        return nameRegex.test(name);
    }

    // UTILIDADES DE UI
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

    // -------------------------
    // LOGIN
    // -------------------------
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

        if (password.length < 6) {
            setError(passwordInput, "La contraseña debe contener al menos 6 caracteres.");
            isSubmitting = false;
            return;
        }

        try {
            const response = await fetch("https://localhost:7135/api/Access/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            console.log("response.status:", response.status);
            console.log("data:", data);

            const msg = (data.message || "Error desconocido.").trim().toLowerCase();

            if (!response.ok) {
                if (msg.includes("obligatorio")) {
                    if (!email) setError(emailInput, "Debe ingresar un correo electrónico.");
                    if (!password) setError(passwordInput, "Debe ingresar su contraseña.");
                } else if (msg.includes("formato")) {
                    setError(emailInput, "El formato del correo no es válido.");
                } else if (msg.includes("no existe") || msg.includes("credenciales")) {
                    setError(emailInput, "Correo no registrado o incorrecto.");
                } else if (msg.includes("contraseña")) {
                    setError(passwordInput, "La contraseña no coincide con este correo.");
                } else {
                    setError(emailInput, data.message || "Error desconocido.");
                }
                isSubmitting = false;
                return;
            }

            sessionStorage.setItem("token", data.token);
            await fetch("/Token/Guardar", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ token: data.token })
            });

            showSuccessToast(data.message || "Inicio de sesión exitoso.");
            setTimeout(() => window.location.href = "/Dashboard/Dashb", 2000);

        } catch (error) {
            setError(emailInput, "Error de red al intentar iniciar sesión.");
            isSubmitting = false;
        }
    });

    // -------------------------
    // REGISTRO
    // -------------------------
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

        let hasError = false;

        if (!name) {
            setError(nameInput, "El nombre es obligatorio.");
            hasError = true;
        } else if (!isValidName(name)) {
            setError(nameInput, "El nombre solo debe contener letras y espacios.");
            hasError = true;
        }

        if (!email) {
            setError(emailInput, "El correo es obligatorio.");
            hasError = true;
        } else if (!isValidEmail(email)) {
            setError(emailInput, "Formato de correo no válido.");
            hasError = true;
        }

        if (password.length < 6) {
            setError(passwordInput, "La contraseña debe tener al menos 6 caracteres.");
            hasError = true;
        }

        if (!isValidPhone(phone)) {
            setError(phoneInput, "Número de teléfono inválido. Solo dígitos, entre 7 y 15 caracteres.");
            hasError = true;
        }

        if (hasError) {
            isSubmitting = false;
            return;
        }

        try {
            const response = await fetch("https://localhost:7135/api/Access/Register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
            });

            let data = {};
            let msg = "";
            let rawText = "";

            try {
                rawText = await response.text(); // capturamos texto por si no es JSON
                data = JSON.parse(rawText);     // intentamos parsear
                msg = (data.message || "").toLowerCase();
            } catch (parseError) {
                console.error("Error al parsear la respuesta JSON:", parseError);
                console.warn("Respuesta cruda:", rawText);
                msg = rawText.toLowerCase(); // Usamos el texto crudo como mensaje fallback
            }

            console.log("Mensaje del backend:", msg);

            if (!response.ok) {
                if (!msg) {
                    setError(nameInput, "Error del servidor. Intenta más tarde.");
                } else if (msg.includes("nombre")) {
                    setError(nameInput, msg);
                } else if (msg.includes("formato") && msg.includes("correo")) {
                    setError(emailInput, "Formato de correo inválido.");
                } else if (msg.includes("correo") || msg.includes("cuenta")) {
                    setError(emailInput, msg);
                } else if (msg.includes("contraseña")) {
                    setError(passwordInput, msg);
                } else if (msg.includes("teléfono") || msg.includes("número")) {
                    setError(phoneInput, msg);
                } else if (msg.includes("campos") || msg.includes("completar")) {
                    if (!name) setError(nameInput, "Nombre obligatorio.");
                    if (!email) setError(emailInput, "Correo obligatorio.");
                    if (!password) setError(passwordInput, "Contraseña obligatoria.");
                    if (!phone) setError(phoneInput, "Teléfono obligatorio.");
                } else {
                    setError(nameInput, msg); // mensaje genérico como fallback
                }

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
            console.error("Error de red:", error);
            setError(emailInput, "Error de red al intentar registrarse.");
            isSubmitting = false;
        }
    });
});


