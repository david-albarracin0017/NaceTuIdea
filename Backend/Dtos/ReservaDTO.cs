namespace Backend.Dtos
{
    public class ReservaDTO
    {
        public Guid UsuarioId { get; set; }
        public Guid LocalId { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }

}
