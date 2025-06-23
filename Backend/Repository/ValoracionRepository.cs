using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class ValoracionRepository : IValoracionRepository
    {
        private readonly MyAppContext _context;

        public ValoracionRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Valoracion>> GetAllAsync()
        {
            return await _context.Valoraciones
                .Include(v => v.Local)
                .Include(v => v.Usuario)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<Valoracion> GetByIdAsync(Guid id)
        {
            return await _context.Valoraciones
                .Include(v => v.Local)
                .Include(v => v.Usuario)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<IEnumerable<Valoracion>> GetByLocalIdAsync(Guid localId)
        {
            return await _context.Valoraciones
                .Where(v => v.LocalId == localId)
                .Include(v => v.Usuario)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Valoracion>> GetByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Valoraciones
                .Where(v => v.UsuarioId == usuarioId)
                .Include(v => v.Local)
                .OrderByDescending(v => v.Fecha)
                .ToListAsync();
        }

        public async Task<Valoracion> GetByUsuarioAndLocalAsync(Guid usuarioId, Guid localId)
        {
            return await _context.Valoraciones
                .FirstOrDefaultAsync(v => v.UsuarioId == usuarioId && v.LocalId == localId);
        }

        public async Task<double> GetPromedioByLocalAsync(Guid localId)
        {
            var promedio = await _context.Valoraciones
                .Where(v => v.LocalId == localId)
                .AverageAsync(v => (double?)v.Estrellas) ?? 0.0;

            return Math.Round(promedio, 1);
        }

        public async Task<int> GetCountByLocalAsync(Guid localId)
        {
            return await _context.Valoraciones
                .CountAsync(v => v.LocalId == localId);
        }

        public async Task AddAsync(Valoracion valoracion)
        {
            valoracion.Id = Guid.NewGuid();
            valoracion.Fecha = DateTime.UtcNow;

            await _context.Valoraciones.AddAsync(valoracion);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Valoracion valoracion)
        {
            var existing = await _context.Valoraciones.FindAsync(valoracion.Id);
            if (existing != null)
            {
                existing.Estrellas = valoracion.Estrellas;
                _context.Valoraciones.Update(existing);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var valoracion = await _context.Valoraciones.FindAsync(id);
            if (valoracion != null)
            {
                _context.Valoraciones.Remove(valoracion);
                await _context.SaveChangesAsync();
            }
        }
    }
}