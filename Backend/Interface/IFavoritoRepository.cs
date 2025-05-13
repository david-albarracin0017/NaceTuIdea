using Backend.Modelles;

namespace Backend.Interface
{
    public interface IFavoritoRepository
    {
        Task<IEnumerable<Favorito>> GetAllAsync();
        Task<Favorito> GetByIdAsync(Guid id);
        Task<IEnumerable<Favorito>> GetByUsuarioIdAsync(Guid usuarioId);
        Task<IEnumerable<Favorito>> GetByLocalIdAsync(Guid localId);
        Task<Favorito> AddAsync(Favorito favorito);
        Task<Favorito> UpdateAsync(Favorito favorito);
        Task<bool> DeleteAsync(Guid id);
    }

}
