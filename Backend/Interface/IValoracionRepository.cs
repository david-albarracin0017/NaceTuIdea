using Backend.Modelles;

namespace Backend.Interface
{
    public interface IValoracionRepository
    {
        Task<IEnumerable<Valoracion>> GetAllAsync();
        Task<Valoracion> GetByIdAsync(Guid id);
        Task<IEnumerable<Valoracion>> GetByLocalIdAsync(Guid localId);
        Task<IEnumerable<Valoracion>> GetByUsuarioIdAsync(Guid usuarioId);
        Task<Valoracion> GetByUsuarioAndLocalAsync(Guid usuarioId, Guid localId);
        Task<double> GetPromedioByLocalAsync(Guid localId);
        Task<int> GetCountByLocalAsync(Guid localId);
        Task AddAsync(Valoracion valoracion);
        Task UpdateAsync(Valoracion valoracion);
        Task DeleteAsync(Guid id);
    }

}
