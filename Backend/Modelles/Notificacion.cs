namespace Backend.Modelles
{
    public class Notificacion
    {
        public Guid Id { get; set; }

        public string Titulo { get; set; }    // Breve título de la notificación
        public string Mensaje { get; set; }   // Contenido de la notificación

        public bool Leido { get; set; } = false;   // Si el usuario ya la vio

        public DateTime Fecha { get; set; } = DateTime.UtcNow;  // Fecha de creación

        // Relación con el Usuario que recibe la notificación
        public Guid UsuarioId { get; set; }
        public User Usuario { get; set; }
    }

}
