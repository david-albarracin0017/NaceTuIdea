namespace Backend.Modelles
{
        public class Valoracion
        {
            public Guid Id { get; set; }

            public int Estrellas { get; set; }  // Valor de 1 a 5


            // Relación con el Local
            public Guid LocalId { get; set; }
            public Local Local { get; set; }

            // Relación con el Usuario que valoró
            public Guid UsuarioId { get; set; }
            public User Usuario { get; set; }

            public DateTime Fecha { get; set; } = DateTime.UtcNow;
        }

}
