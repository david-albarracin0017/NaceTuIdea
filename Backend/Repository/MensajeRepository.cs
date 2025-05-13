using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class MensajeRepository : IMensajeRepository
    {
        private readonly MyAppContext _context;

        public MensajeRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Mensaje>> GetAllAsync()
        {
            return await _context.Mensajes
                .Include(m => m.Remitente)
                .Include(m => m.Destinatario)
                .ToListAsync();
        }

        public async Task<Mensaje> GetByIdAsync(Guid id)
        {
            return await _context.Mensajes
                .Include(m => m.Remitente)
                .Include(m => m.Destinatario)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Mensaje> AddAsync(Mensaje mensaje)
        {
            _context.Mensajes.Add(mensaje);
            await _context.SaveChangesAsync();
            return mensaje;
        }

        public async Task<Mensaje> UpdateAsync(Mensaje mensaje)
        {
            _context.Mensajes.Update(mensaje);
            await _context.SaveChangesAsync();
            return mensaje;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var mensaje = await _context.Mensajes.FindAsync(id);
            if (mensaje == null) return false;

            _context.Mensajes.Remove(mensaje);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
