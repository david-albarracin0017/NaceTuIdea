namespace Backend.Modelles
{
    public class PasswordResetToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Token { get; set; }
        public DateTime Expiration { get; set; }

        public User User { get; set; }  // Relación
    }
}
