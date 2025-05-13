namespace Backend.Modelles
{
        public class Disponibilidad
        {
            public Guid Id { get; set; }

            public DateTime Fecha { get; set; }
            public bool Disponible { get; set; }

            // Relación con el Local
            public Guid LocalId { get; set; }
            public Local Local { get; set; }
        }

}
