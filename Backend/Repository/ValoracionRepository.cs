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
                .ToListAsync();
        }

        public async Task<IEnumerable<Valoracion>> GetByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Valoraciones
                .Where(v => v.UsuarioId == usuarioId)
                .ToListAsync();
        }

        public async Task AddAsync(Valoracion valoracion)
        {
            await _context.Valoraciones.AddAsync(valoracion);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Valoracion valoracion)
        {
            _context.Valoraciones.Update(valoracion);
            await _context.SaveChangesAsync();
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
