using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
   
    public class ReservaRepository : IReservaRepository
    {
        private readonly MyAppContext _context;

        public ReservaRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reserva>> GetAllAsync()
        {
            return await _context.Reservas
                .Include(r => r.Local)
                .Include(r => r.Usuario)
                .Include(r => r.Pagos)
                .ToListAsync();
        }

        public async Task<Reserva> GetByIdAsync(Guid id)
        {
            return await _context.Reservas
                .Include(r => r.Local)
                .Include(r => r.Usuario)
                .Include(r => r.Pagos)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Reserva>> GetByLocalIdAsync(Guid localId)
        {
            return await _context.Reservas
                .Where(r => r.LocalId == localId)
                .ToListAsync();
        }

        public async Task AddAsync(Reserva reserva)
        {
            await _context.Reservas.AddAsync(reserva);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Reserva reserva)
        {
            _context.Reservas.Update(reserva);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva != null)
            {
                _context.Reservas.Remove(reserva);
                await _context.SaveChangesAsync();
            }
        }
    }
}
