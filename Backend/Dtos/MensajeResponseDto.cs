namespace Backend.Dtos
{
    public class MensajeResponseDto
    {
        public Guid Id { get; set; }
        public string Contenido { get; set; }
        public DateTime Fecha { get; set; }
        public Guid RemitenteId { get; set; }
        public string RemitenteNombre { get; set; } // Solo el nombre en lugar del objeto completo
        public Guid DestinatarioId { get; set; }
        public string DestinatarioNombre { get; set; } // Solo el nombre en lugar del objeto completo
    }
}
