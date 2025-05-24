using Backend.Modelles;

namespace Backend.Interface
{
    public interface ILocalRepository
    {
        Task<IEnumerable<Local>> GetAllAsync();
        Task<Local> GetByIdAsync(Guid id);
        Task<Local> AddAsync(Local local);
        Task UpdateAsync(Local local);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(string nombre, string direccion, Guid propietarioId);
        Task<IEnumerable<Local>> GetByUserIdAsync(Guid userId);


    }
}
