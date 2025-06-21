namespace Backend.Modelles
{
    public class Local
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Costo { get; set; }
        public string Ciudad { get; set; }
        public string Direccion { get; set; }
        public string Tipo { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;


        public List<string> Fotos { get; set; } = new();

        // Propietario
        public Guid PropietarioId { get; set; }
        public User? Propietario { get; set; }

        // Navegación
        public List<Reserva> Reservas { get; set; } = new();
        public List<Valoracion> Valoraciones { get; set; } = new();
        public List<Disponibilidad> Disponibilidades { get; set; } = new();
        public List<Favorito> Favoritos { get; set; } = new(); // Usuarios que lo tienen como favorito
    }


}
