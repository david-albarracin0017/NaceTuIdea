let isSubmitting = false;

document.addEventListener("DOMContentLoaded", async () => {
    const tokenResponse = await fetch("/Token/Obtener");
    const tokenData = await tokenResponse.json();
    const token = tokenData.token;
    if (!token) return alert("No se encontró token. Inicia sesión.");

    const userIdResponse = await fetch("/Token/GetUserId");
    if (!userIdResponse.ok) return alert("Error al obtener el ID del usuario.");
    const userId = await userIdResponse.text();

    // Configurar eventos de los modales
    setupModalEvents();

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
            showErrorMessage("Error al cargar datos del usuario");
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
        if (isSubmitting) return;
        isSubmitting = true;

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

        if (hasError) {
            isSubmitting = false;
            return;
        }

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
            updates["Propierty"] = esPropietario;
        }
        if (password !== "") {
            updates["Password"] = password;
        }

        if (Object.keys(updates).length === 0) {
            showErrorMessage("No hay cambios para guardar.");
            isSubmitting = false;
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

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorMessage = "Error al actualizar el usuario";

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("Detalles del error:", errorData);
                    errorMessage = errorData.message || errorMessage;
                } else {
                    const text = await response.text();
                    console.error("Respuesta no JSON:", text);
                    errorMessage = text;
                }

                throw new Error(errorMessage);
            }

            showSuccessMessage("Su Informacion se actualizo correctamente.");
            document.getElementById("updateModal").style.display = "none";
            cargarDatosUsuario();

        } catch (err) {
            console.error("Error completo:", err);
            showErrorMessage(`Error al actualizar: ${err.message}`);
        } finally {
            isSubmitting = false;
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
            showSuccessMessage("Cuenta eliminada correctamente");
            setTimeout(() => {
                window.location.href = "/Inicio/Principal";
            }, 1500);
        } catch (err) {
            console.error(err);
            showErrorMessage("Error al eliminar la cuenta");
        }
    });

    // Configuración de eventos del modal
    function setupModalEvents() {
        // Botón para abrir modal de actualización
        document.getElementById("updateBtn").addEventListener("click", () => {
            document.getElementById("updateModal").style.display = "flex";
        });

        // Botón para abrir modal de eliminación
        document.getElementById("deleteLink").addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("deleteModal").style.display = "flex";
        });

        // Cerrar modales
        document.getElementById("closeModal").addEventListener("click", () => {
            document.getElementById("updateModal").style.display = "none";
        });

        document.getElementById("closeDeleteModal").addEventListener("click", () => {
            document.getElementById("deleteModal").style.display = "none";
        });

        document.getElementById("cancelUpdate").addEventListener("click", () => {
            document.getElementById("updateModal").style.display = "none";
        });

        document.getElementById("cancelDelete").addEventListener("click", () => {
            document.getElementById("deleteModal").style.display = "none";
        });

        // Validación de texto para eliminación
        document.getElementById("confirmDeleteInput").addEventListener("input", (e) => {
            const confirmText = e.target.value.trim();
            const deleteBtn = document.getElementById("confirmDelete");
            deleteBtn.disabled = confirmText !== "CONFIRMAR ELIMINACION";
        });

        // Toggle para mostrar/ocultar contraseña
        document.querySelectorAll(".toggle-password, .password-toggle").forEach(icon => {
            icon.addEventListener("click", function () {
                const input = this.parentElement.querySelector("input") ||
                    this.closest(".profile-field").querySelector(".field-value");

                if (input.type === "password") {
                    input.type = "text";
                    this.setAttribute("name", "eye-off-outline");
                } else if (input.tagName === "DIV") {
                    // Manejar el caso del campo de contraseña en el perfil
                    const hiddenValue = input.textContent.includes("••••••••") ? "tucontraseña" : "••••••••";
                    input.textContent = hiddenValue + " " + input.innerHTML.split(" ")[1];
                } else {
                    input.type = "password";
                    this.setAttribute("name", "eye-outline");
                }
            });
        });
    }
});

// Función para mostrar mensajes flotantes
function showFloatingMessage(type, msg) {
    try {
        const notification = document.getElementById('floatingNotification');

        if (!notification) {
            console.error('Elemento de notificación no encontrado en el DOM');
            alert(msg);
            return;
        }

        // Configurar el icono según el tipo de mensaje
        const icon = notification.querySelector('ion-icon');
        if (icon) {
            icon.setAttribute('name', type === 'success' ? 'checkmark-circle' : 'close-circle');
        }

        // Configurar el mensaje
        const messageSpan = notification.querySelector('.notification-message');
        if (messageSpan) {
            messageSpan.textContent = msg;
        }

        // Establecer clase según el tipo
        notification.className = 'floating-notification';
        if (type !== 'success') {
            notification.classList.add('error');
        }

        // Mostrar la notificación
        notification.style.display = 'flex';
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);

        // Ocultar después de 3 segundos (5 para errores)
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, type === 'success' ? 3000 : 5000);

    } catch (error) {
        console.error('Error al mostrar notificación flotante:', error);
        alert(msg);
    }
}

// Versiones específicas para éxito y error
function showSuccessMessage(msg) {
    showFloatingMessage('success', msg);
}

function showErrorMessage(msg) {
    showFloatingMessage('error', msg);
}
