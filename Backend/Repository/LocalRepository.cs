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
            return await _context.Locales.ToListAsync();
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
            _context.Entry(local).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var local = await _context.Locales.FindAsync(id);
            if (local == null) return false;

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

    }

}
