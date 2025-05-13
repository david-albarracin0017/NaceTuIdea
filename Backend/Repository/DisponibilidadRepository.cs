using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class DisponibilidadRepository : IDisponibilidadRepository
    {
        private readonly MyAppContext _context;

        public DisponibilidadRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Disponibilidad>> GetAllAsync()
        {
            return await _context.Disponibilidades.ToListAsync();
        }

        public async Task<Disponibilidad> GetByIdAsync(Guid id)
        {
            return await _context.Disponibilidades.FindAsync(id);
        }

        public async Task<Disponibilidad> AddAsync(Disponibilidad disponibilidad)
        {
            _context.Disponibilidades.Add(disponibilidad);
            await _context.SaveChangesAsync();
            return disponibilidad;
        }

        public async Task<Disponibilidad> UpdateAsync(Disponibilidad disponibilidad)
        {
            _context.Entry(disponibilidad).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return disponibilidad;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var disponibilidad = await _context.Disponibilidades.FindAsync(id);
            if (disponibilidad == null) return false;

            _context.Disponibilidades.Remove(disponibilidad);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
