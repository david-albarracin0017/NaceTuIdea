namespace Backend.Modelles
{
    public class Reserva
    {
        public Guid Id { get; set; }

        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }

        // Relación con el Local
        public Guid LocalId { get; set; }
        public Local Local { get; set; }

        // Relación con el Usuario que reservó
        public Guid UsuarioId { get; set; }
        public User Usuario { get; set; }
        public List<Pago> Pagos { get; set; } = new();

    }

}
