
document.addEventListener('DOMContentLoaded', function() {
    // 1. Modal de Actualización
    const updateBtn = document.querySelector('.btn-update');
    const updateModal = document.getElementById('updateModal');
    
    if(updateBtn && updateModal) {
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelUpdate');
        
        // Mostrar modal de actualización
        updateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            updateModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        // Función para cerrar modal
        function closeUpdateModalFunc() {
            updateModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Eventos para cerrar modal
        if(closeModal) closeModal.addEventListener('click', closeUpdateModalFunc);
        if(cancelBtn) cancelBtn.addEventListener('click', closeUpdateModalFunc);
        
        // Cerrar al hacer clic fuera del modal
        updateModal.addEventListener('click', function(e) {
            if(e.target === updateModal) {
                closeUpdateModalFunc();
            }
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', function(e) {
            if(e.key === 'Escape' && updateModal.style.display === 'flex') {
                closeUpdateModalFunc();
            }
        });
    }

    // 2. Modal de Eliminación
    const deleteLink = document.querySelector('.delete-link');
    const deleteModal = document.getElementById('deleteModal');
    
    if(deleteLink && deleteModal) {
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');
        const confirmDeleteInput = document.getElementById('confirmDeleteInput');
        
        // Mostrar modal de eliminación
        deleteLink.addEventListener('click', function(e) {
            e.preventDefault();
            deleteModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        // Validación de texto de confirmación
        if(confirmDeleteInput && confirmDelete) {
            confirmDeleteInput.addEventListener('input', function() {
                const confirmText = this.value.trim();
                confirmDelete.disabled = confirmText !== "CONFIRMAR ELIMINACION";
            });
        }
        
        // Función para cerrar modal
        function closeDeleteModalFunc() {
            deleteModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if(confirmDeleteInput) confirmDeleteInput.value = '';
            if(confirmDelete) confirmDelete.disabled = true;
        }
        
        // Eventos para cerrar modal
        if(closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
        if(cancelDelete) cancelDelete.addEventListener('click', closeDeleteModalFunc);
        
        // Cerrar al hacer clic fuera
        deleteModal.addEventListener('click', function(e) {
            if(e.target === deleteModal) {
                closeDeleteModalFunc();
            }
        });
        
        // Confirmar eliminación
        if(confirmDelete) {
            confirmDelete.addEventListener('click', function() {
                if(confirmDeleteInput && confirmDeleteInput.value.trim() === "CONFIRMAR ELIMINACION") {
                    // Aquí iría la lógica para eliminar la cuenta
                    alert('Cuenta eliminada permanentemente');
                    closeDeleteModalFunc();
                    // Redirigir o hacer logout
                }
            });
        }
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', function(e) {
            if(e.key === 'Escape' && deleteModal.style.display === 'flex') {
                closeDeleteModalFunc();
            }
        });
    }
});

