namespace Backend.Dtos
{
    public class MensajeCreateDto
    {
        public string Contenido { get; set; }
        public Guid DestinatarioId { get; set; }
    }

    public class MensajeUpdateDto
    {
        public Guid Id { get; set; }
        public string Contenido { get; set; }
    }
}
