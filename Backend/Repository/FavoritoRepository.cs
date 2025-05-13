using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class FavoritoRepository : IFavoritoRepository
    {
        private readonly MyAppContext _context;

        public FavoritoRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Favorito>> GetAllAsync()
        {
            return await _context.Favoritos.ToListAsync();
        }

        public async Task<Favorito> GetByIdAsync(Guid id)
        {
            return await _context.Favoritos.FindAsync(id);
        }

        public async Task<IEnumerable<Favorito>> GetByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Favoritos.Where(f => f.UsuarioId == usuarioId).ToListAsync();
        }

        public async Task<IEnumerable<Favorito>> GetByLocalIdAsync(Guid localId)
        {
            return await _context.Favoritos.Where(f => f.LocalId == localId).ToListAsync();
        }

        public async Task<Favorito> AddAsync(Favorito favorito)
        {
            _context.Favoritos.Add(favorito);
            await _context.SaveChangesAsync();
            return favorito;
        }

        public async Task<Favorito> UpdateAsync(Favorito favorito)
        {
            _context.Entry(favorito).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return favorito;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var favorito = await _context.Favoritos.FindAsync(id);
            if (favorito == null) return false;

            _context.Favoritos.Remove(favorito);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
