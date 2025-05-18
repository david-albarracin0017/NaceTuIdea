// Mostrar los datos del usuario en el modal
function cargarDatosUsuarioEnModal() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    document.getElementById("nombreInput").value = usuario.nombre || "";
    document.getElementById("correoInput").value = usuario.correo || "";
    document.getElementById("passwordInput").value = ""; // Por seguridad
    document.getElementById("telefonoInput").value = usuario.telefono || "";
    document.getElementById("propietarioInput").value = usuario.esPropietario ? "si" : "no";
}

// Confirmar y enviar cambios al backend
document.getElementById("confirmUpdate").addEventListener("click", async () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioActual) return;

    const datosActualizados = {
        id: usuarioActual.id,
        nombre: document.getElementById("nombreInput").value.trim(),
        correo: document.getElementById("correoInput").value.trim(),
        contraseña: document.getElementById("passwordInput").value.trim() || null,
        telefono: document.getElementById("telefonoInput").value.trim(),
        esPropietario: document.getElementById("propietarioInput").value === "si"
    };

    try {
        const response = await fetch(`https://localhost:7135/api/Users/${usuarioActual.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            localStorage.setItem("usuario", JSON.stringify(datosActualizados));
            showSuccessToast("Información actualizada correctamente.");
        } else {
            const error = await response.text();
            showErrorToast("Error al actualizar: " + error);
        }
    } catch (error) {
        showErrorToast("Error de red al actualizar.");
    }
});

