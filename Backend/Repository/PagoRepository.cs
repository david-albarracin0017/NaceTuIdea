using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class PagoRepository : IPagoRepository
    {
        private readonly MyAppContext _context;

        public PagoRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pago>> GetAllAsync()
        {
            return await _context.Pagos
                .Include(p => p.Reserva)
                .ToListAsync();
        }

        public async Task<Pago> GetByIdAsync(Guid id)
        {
            return await _context.Pagos
                .Include(p => p.Reserva)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Pago pago)
        {
            await _context.Pagos.AddAsync(pago);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Pago pago)
        {
            _context.Pagos.Update(pago);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var pago = await _context.Pagos.FindAsync(id);
            if (pago != null)
            {
                _context.Pagos.Remove(pago);
                await _context.SaveChangesAsync();
            }
        }
    }
}
