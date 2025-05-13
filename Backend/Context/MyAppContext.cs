using Microsoft.EntityFrameworkCore;
using Backend.Modelles;

namespace Backend.Context
{
    public class MyAppContext : DbContext
    {
        public MyAppContext(DbContextOptions<MyAppContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Local> Locales { get; set; }
        public DbSet<Reserva> Reservas { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }
        public DbSet<Valoracion> Valoraciones { get; set; }
        public DbSet<Mensaje> Mensajes { get; set; }
        public DbSet<Favorito> Favoritos { get; set; }
        public DbSet<Disponibilidad> Disponibilidades { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User → Reservas (1:N)
            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Usuario)
                .WithMany(u => u.Reservas)
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // User → Notificaciones (1:N)
            modelBuilder.Entity<Notificacion>()
                .HasOne(n => n.Usuario)
                .WithMany(u => u.Notificaciones)
                .HasForeignKey(n => n.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // User → Locales (1:N) (Propietario)
            modelBuilder.Entity<Local>()
                .HasOne(l => l.Propietario)
                .WithMany(u => u.Locales)
                .HasForeignKey(l => l.PropietarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // User → Favoritos (1:N)
            modelBuilder.Entity<Favorito>()
                .HasOne(f => f.Usuario)
                .WithMany(u => u.Favoritos)
                .HasForeignKey(f => f.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reserva → Local (1:N)
            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Local)
                .WithMany(l => l.Reservas)
                .HasForeignKey(r => r.LocalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Pago → Reserva (1:N)
            modelBuilder.Entity<Pago>()
                .HasOne(p => p.Reserva)
                .WithMany(r => r.Pagos)
                .HasForeignKey(p => p.ReservaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Valoracion → Local (1:N)
            modelBuilder.Entity<Valoracion>()
                .HasOne(v => v.Local)
                .WithMany(l => l.Valoraciones)
                .HasForeignKey(v => v.LocalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Valoracion → Usuario (1:N)
            modelBuilder.Entity<Valoracion>()
                .HasOne(v => v.Usuario)
                .WithMany()
                .HasForeignKey(v => v.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // Favorito → Local (1:N)
            modelBuilder.Entity<Favorito>()
                .HasOne(f => f.Local)
                .WithMany(l => l.Favoritos)
                .HasForeignKey(f => f.LocalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Disponibilidad → Local (1:N)
            modelBuilder.Entity<Disponibilidad>()
                .HasOne(d => d.Local)
                .WithMany(l => l.Disponibilidades)
                .HasForeignKey(d => d.LocalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Mensaje → Remitente (1:N)
            modelBuilder.Entity<Mensaje>()
                .HasOne(m => m.Remitente)
                .WithMany(u => u.MensajesEnviados)
                .HasForeignKey(m => m.RemitenteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Mensaje → Destinatario (1:N)
            modelBuilder.Entity<Mensaje>()
                .HasOne(m => m.Destinatario)
                .WithMany(u => u.MensajesRecibidos)
                .HasForeignKey(m => m.DestinatarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configurar globalmente todos los decimal como (18,2)
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var properties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(decimal) || p.PropertyType == typeof(decimal?));

                foreach (var property in properties)
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .Property(property.Name)
                        .HasPrecision(18, 2);
                }
            }
        }
        public async Task<bool> SaveAsync()
        {
            return await SaveChangesAsync() > 0;
        }
    }

}
