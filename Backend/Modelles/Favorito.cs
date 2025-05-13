namespace Backend.Modelles
{
    public class Favorito
    {
        public Guid Id { get; set; }

        // Relación con el Usuario
        public Guid UsuarioId { get; set; }
        public User Usuario { get; set; }

        // Relación con el Local
        public Guid LocalId { get; set; }
        public Local Local { get; set; }
    }

}
