using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class NotificacionRepository : INotificacionRepository
    {
        private readonly MyAppContext _context;

        public NotificacionRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Notificacion>> GetAllAsync()
        {
            return await _context.Notificaciones
                .Include(n => n.Usuario)
                .ToListAsync();
        }

        public async Task<Notificacion> GetByIdAsync(Guid id)
        {
            return await _context.Notificaciones
                .Include(n => n.Usuario)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task AddAsync(Notificacion notificacion)
        {
            await _context.Notificaciones.AddAsync(notificacion);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Notificacion notificacion)
        {
            _context.Notificaciones.Update(notificacion);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var notificacion = await _context.Notificaciones.FindAsync(id);
            if (notificacion != null)
            {
                _context.Notificaciones.Remove(notificacion);
                await _context.SaveChangesAsync();
            }
        }
    }

}
