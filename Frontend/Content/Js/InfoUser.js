async function cargarDatosUsuarioEnPerfil() {
    try {
        // Obtener el token de la cookie directamente
        const token = document.cookie.split('; ')
            .find(row => row.startsWith('jwt_token='))
            ?.split('=')[1];

        if (!token) {
            console.error("No se encontró el token JWT");
            return;
        }

        // Decodificar el token para obtener el userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.nameid || payload.nameidentifier; // Algunos sistemas usan nameid, otros nameidentifier

        // Realizar la solicitud para obtener los datos del usuario
        const userResponse = await fetch(`https://localhost:7135/api/Users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error(`Error HTTP: ${userResponse.status}`);
        }

        const user = await userResponse.json();

        // Actualizar la interfaz
        document.getElementById("profileNombre").textContent = user.name || "N/D";
        document.getElementById("profileCorreo").textContent = user.email || "N/D";
        document.getElementById("profileTelefono").textContent = user.phone || "N/D";
        document.getElementById("profilePropietario").textContent = user.isOwner ? "Sí" : "No";

        // Rellenar formulario del modal
        document.getElementById("nombreInput").value = user.name || "";
        document.getElementById("correoInput").value = user.email || "";
        document.getElementById("telefonoInput").value = user.phone || "";
        document.getElementById("propietarioInput").value = user.isOwner ? "si" : "no";

    } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
        mostrarError("No se pudieron cargar los datos del perfil. Intente recargar la página.");
    }
}

async function actualizarDatosUsuario() {
    try {
        const tokenResponse = await fetch("/Token/Obtener");
        if (!tokenResponse.ok) throw new Error("No se pudo obtener el token");

        const { token } = await tokenResponse.json();
        if (!token) throw new Error("No hay token disponible");

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.nameidentifier;

        const updateData = {
            name: document.getElementById("nombreInput").value,
            email: document.getElementById("correoInput").value,
            phone: document.getElementById("telefonoInput").value,
            isOwner: document.getElementById("propietarioInput").value === "si",
            // La contraseña solo se envía si se ha modificado
            password: document.getElementById("passwordInput").value || undefined
        };

        const response = await fetch(`https://localhost:7135/api/Users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar los datos");
        }

        // Recargar los datos del perfil después de actualizar
        await cargarDatosUsuarioEnPerfil();
        return true;
    } catch (error) {
        console.error("Error al actualizar los datos:", error);
        mostrarError(error.message || "Error al actualizar los datos");
        return false;
    }
}

