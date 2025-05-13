using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Modelles
{
    public class Mensaje
    {
        public Guid Id { get; set; }

        public string Contenido { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(Remitente))]
        public Guid RemitenteId { get; set; }
        public User Remitente { get; set; }

        [ForeignKey(nameof(Destinatario))]
        public Guid DestinatarioId { get; set; }
        public User Destinatario { get; set; }
    }

}
