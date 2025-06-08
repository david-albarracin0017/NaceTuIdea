let isSubmitting = false;

document.addEventListener("DOMContentLoaded", async () => {
    const tokenResponse = await fetch("/Token/Obtener");
    const tokenData = await tokenResponse.json();
    const token = tokenData.token;
    if (!token) return alert("No se encontró token. Inicia sesión.");

    const userIdResponse = await fetch("/Token/GetUserId");
    if (!userIdResponse.ok) return alert("Error al obtener el ID del usuario.");
    const userId = await userIdResponse.text();

    async function cargarDatosUsuario() {
        try {
            const response = await fetch(`https://localhost:7135/api/Users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("No se pudo obtener los datos del usuario");
            const user = await response.json();

            document.getElementById("profileNombre").textContent = user.name;
            document.getElementById("profileCorreo").textContent = user.email;
            document.getElementById("profileTelefono").textContent = user.phone;
            document.getElementById("profilePropietario").textContent = user.esPropietario ? "Sí" : "No";

            document.getElementById("nombreInput").value = user.name;
            document.getElementById("correoInput").value = user.email;
            document.getElementById("telefonoInput").value = user.phone;
            document.getElementById("propietarioInput").value = user.esPropietario ? "si" : "no";
        } catch (err) {
            console.error(err);
            alert("Error al cargar datos del usuario");
        }
    }

    cargarDatosUsuario();

    // Validaciones visuales
    function setFieldError(inputElement, message) {
        clearFieldError(inputElement);
        const error = document.createElement("div");
        error.className = "error-message";
        error.textContent = message;
        inputElement.classList.add("input-error");
        inputElement.parentElement.appendChild(error);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove("input-error");
        const existingError = inputElement.parentElement.querySelector(".error-message");
        if (existingError) existingError.remove();
    }

    function clearAllUpdateFormErrors() {
        document.querySelectorAll("#updateModal input").forEach(input => clearFieldError(input));
    }

    // Actualización
    document.getElementById("confirmUpdateBtn").addEventListener("click", async () => {
        clearAllUpdateFormErrors();

        const nombreInput = document.getElementById("nombreInput");
        const correoInput = document.getElementById("correoInput");
        const telefonoInput = document.getElementById("telefonoInput");
        const passwordInput = document.getElementById("passwordInput");
        const propietarioInput = document.getElementById("propietarioInput");

        const nombre = nombreInput.value.trim();
        const correo = correoInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const password = passwordInput.value.trim();
        const esPropietario = propietarioInput.value === "si";

        let hasError = false;

        if (!nombre) {
            setFieldError(nombreInput, "El nombre es obligatorio.");
            hasError = true;
        }

        const correoRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!correoRegex.test(correo)) {
            setFieldError(correoInput, "El formato del correo no es válido.");
            hasError = true;
        }

        const telefonoRegex = /^\d{7,15}$/;
        if (!telefonoRegex.test(telefono)) {
            setFieldError(telefonoInput, "El teléfono debe tener entre 7 y 15 dígitos.");
            hasError = true;
        }

        if (password !== "" && password.length < 6) {
            setFieldError(passwordInput, "La contraseña debe tener al menos 6 caracteres.");
            hasError = true;
        }

        if (hasError) return;

        const updates = {};
        if (nombre !== document.getElementById("profileNombre").textContent) {
            updates["Name"] = nombre;
        }
        if (correo !== document.getElementById("profileCorreo").textContent) {
            updates["Email"] = correo;
        }
        if (telefono !== document.getElementById("profileTelefono").textContent) {
            updates["Phone"] = telefono;
        }
        if (esPropietario !== (document.getElementById("profilePropietario").textContent === "Sí")) {
            updates["Propierty"] = esPropietario; // Cambiado a "Propierty"
        }
        if (password !== "") {
            updates["Password"] = password;
        }

        if (Object.keys(updates).length === 0) {
            alert("No hay cambios para guardar.");
            return;
        }

        try {
            const response = await fetch(`https://localhost:7135/api/Users/partial/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error("Error al actualizar el usuario");
            alert("Usuario actualizado correctamente.");
            document.getElementById("updateModal").style.display = "none";
            cargarDatosUsuario();
        } catch (err) {
            console.error(err);
            alert("Error al actualizar el usuario");
        }
    });

    // Eliminación
    document.getElementById("confirmDelete").addEventListener("click", async () => {
        try {
            const response = await fetch(`https://localhost:7135/api/Users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al eliminar la cuenta");
            await fetch("/Token/Eliminar");
            alert("Cuenta eliminada correctamente");
            window.location.href = "/Inicio/Principal";
        } catch (err) {
            console.error(err);
            alert("Error al eliminar la cuenta");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                await fetch("/Token/Eliminar");
                sessionStorage.removeItem("token"); // por si acaso
                window.location.href = "/Inicio/Principal"; // o "/Login"
            } catch (err) {
                console.error("Error al cerrar sesión:", err);
                alert("Ocurrió un error al cerrar sesión");
            }
        });
    }
});
