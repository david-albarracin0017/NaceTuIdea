using Backend.Modelles;

namespace Backend.Interface
{
    public interface IMensajeRepository
    {
        Task<IEnumerable<Mensaje>> GetAllAsync();
        Task<Mensaje> GetByIdAsync(Guid id);
        Task<Mensaje> AddAsync(Mensaje mensaje);
        Task<Mensaje> UpdateAsync(Mensaje mensaje);
        Task<bool> DeleteAsync(Guid id);
    }
}
