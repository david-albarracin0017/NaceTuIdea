namespace Backend.Dtos
{
    public class ValoracionDTO
    {
        public Guid Id { get; set; }
        public int Estrellas { get; set; }
        public Guid LocalId { get; set; }
        public Guid UsuarioId { get; set; }
        public DateTime Fecha { get; set; }
    }
}
