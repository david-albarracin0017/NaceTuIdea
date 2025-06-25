using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class LocalRepository : ILocalRepository
    {
        private readonly MyAppContext _context;

        public LocalRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Local>> GetAllAsync()
        {
            return await _context.Locales
                .OrderByDescending(l => l.FechaCreacion)
                .ToListAsync();
        }


        public async Task<Local> GetByIdAsync(Guid id)
        {
            return await _context.Locales.FindAsync(id);
        }

        public async Task<Local> AddAsync(Local local)
        {
            _context.Locales.Add(local);
            await _context.SaveChangesAsync();
            return local;
        }

        public async Task UpdateAsync(Local local)
        {
            var existente = await _context.Locales.FindAsync(local.Id);
            if (existente == null)
                throw new Exception("Local no encontrado.");

            existente.Name = local.Name;
            existente.Description = local.Description;
            existente.Costo = local.Costo;
            existente.Ciudad = local.Ciudad;
            existente.Direccion = local.Direccion;
            existente.Tipo = local.Tipo;
            existente.Fotos = local.Fotos;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var local = await _context.Locales
                .Include(l => l.Favoritos)
                .Include(l => l.Valoraciones)
                .Include(l => l.Disponibilidades) // aunque no la uses aún
                .FirstOrDefaultAsync(l => l.Id == id);

            if (local == null) return false;

            // Eliminar relaciones primero
            if (local.Favoritos?.Any() == true)
                _context.Favoritos.RemoveRange(local.Favoritos);

            if (local.Valoraciones?.Any() == true)
                _context.Valoraciones.RemoveRange(local.Valoraciones);

            if (local.Disponibilidades?.Any() == true)
                _context.Disponibilidades.RemoveRange(local.Disponibilidades);

            _context.Locales.Remove(local);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> ExistsAsync(string nombre, string direccion, Guid propietarioId)
        {
            return await _context.Locales.AnyAsync(l =>
                l.Name == nombre &&
                l.Direccion == direccion &&
                l.PropietarioId == propietarioId);
        }

        public async Task<IEnumerable<Local>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Locales
                .Where(l => l.PropietarioId == userId)
                .ToListAsync();
        }
        public async Task<IEnumerable<Local>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _context.Locales
                .Where(local => ids.Contains(local.Id))
                .ToListAsync();
        }

    }
}