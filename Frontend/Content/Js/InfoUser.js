// perfilUsuario.js - Versión completa
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // 1. Obtener token
        const tokenResponse = await fetch('/Token/Obtener', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!tokenResponse.ok) throw new Error('Error al obtener token');

        const tokenData = await tokenResponse.json();
        if (!tokenData.success) throw new Error('Token no disponible');

        // 2. Extraer ID del usuario desde el token
        const tokenPayload = JSON.parse(atob(tokenData.token.split('.')[1]));
        const userId = tokenPayload.NameIdentifier;
        if (!userId) throw new Error('ID de usuario no encontrado');

        // 3. Cargar datos del usuario
        const userResponse = await fetch(`/api/Users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        if (!userResponse.ok) throw new Error('Error al cargar datos');

        const userData = await userResponse.json();

        // 4. Mostrar datos en la UI
        document.getElementById('profileNombre').textContent = userData.name || 'No disponible';
        document.getElementById('profileCorreo').textContent = userData.email || 'No disponible';
        document.getElementById('profileTelefono').textContent = userData.phone || 'No disponible';
        document.getElementById('nombreInput').value = userData.name || '';
        document.getElementById('correoInput').value = userData.email || '';
        document.getElementById('telefonoInput').value = userData.phone || '';

        // 5. Configurar evento de actualización
        document.getElementById('confirmUpdateBtn').addEventListener('click', async function () {
            try {
                const updateData = {
                    Id: userId,
                    Name: document.getElementById('nombreInput').value,
                    Email: document.getElementById('correoInput').value,
                    Phone: document.getElementById('telefonoInput').value,
                    Password: document.getElementById('passwordInput').value || undefined
                };

                const updateResponse = await fetch(`/api/Users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${tokenData.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData),
                    credentials: 'same-origin'
                });

                if (!updateResponse.ok) throw new Error('Error al actualizar');

                alert('Perfil actualizado correctamente');
                document.getElementById('closeModal').click();
                window.location.reload();

            } catch (error) {
                console.error('Error actualizando:', error);
                alert('Error al actualizar: ' + error.message);
            }
        });

        // 6. Configurar evento de eliminación
        document.getElementById('confirmDelete').addEventListener('click', async function () {
            if (document.getElementById('confirmDeleteInput').value.trim() !== "CONFIRMAR ELIMINACION") {
                alert('Debe escribir exactamente "CONFIRMAR ELIMINACION"');
                return;
            }

            if (!confirm('¿Está seguro de eliminar su cuenta permanentemente?')) return;

            try {
                const deleteResponse = await fetch(`/api/Users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${tokenData.token}`
                    },
                    credentials: 'same-origin'
                });

                if (!deleteResponse.ok) throw new Error('Error al eliminar');

                // Eliminar token
                await fetch('/Token/Eliminar', {
                    method: 'GET',
                    credentials: 'same-origin'
                });

                alert('Cuenta eliminada correctamente');
                window.location.href = '/Inicio/Principal';

            } catch (error) {
                console.error('Error eliminando:', error);
                alert('Error al eliminar cuenta: ' + error.message);
            }
        });

    } catch (error) {
        console.error('Error en perfilUsuario:', error);
        alert('Error al cargar el perfil. Será redirigido al login.');
        window.location.href = '/Inicio/Principal';
    }
});