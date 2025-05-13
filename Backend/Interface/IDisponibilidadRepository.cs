using Backend.Modelles;

namespace Backend.Interface
{
    public interface IDisponibilidadRepository
    {
        Task<IEnumerable<Disponibilidad>> GetAllAsync();
        Task<Disponibilidad> GetByIdAsync(Guid id);
        Task<Disponibilidad> AddAsync(Disponibilidad disponibilidad);
        Task<Disponibilidad> UpdateAsync(Disponibilidad disponibilidad);
        Task<bool> DeleteAsync(Guid id);
    }

}
