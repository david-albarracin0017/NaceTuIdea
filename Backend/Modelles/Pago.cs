namespace Backend.Modelles
{
    public class Pago
    {
        public Guid Id { get; set; }

        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public string Metodo { get; set; }  // "Tarjeta", "Transferencia", etc.

        // Relación con la reserva
        public Guid ReservaId { get; set; }
        public Reserva Reserva { get; set; }
    }

}
