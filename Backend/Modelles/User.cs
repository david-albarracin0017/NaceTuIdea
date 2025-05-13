namespace Backend.Modelles
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public bool Propierty { get; set; } // Indica si es propietario

        // Navegación
        public List<Reserva> Reservas { get; set; } = new();
        public List<Notificacion> Notificaciones { get; set; } = new();
        public List<Local> Locales { get; set; } = new();  // Locales que posee
        public List<Valoracion> Valoraciones { get; set; } = new();  // Valoraciones que hizo
        public List<Favorito> Favoritos { get; set; } = new();  // Locales favoritos (relación N:N)

        // Para mensajes
        public List<Mensaje> MensajesEnviados { get; set; } = new();
        public List<Mensaje> MensajesRecibidos { get; set; } = new();
    }

}
