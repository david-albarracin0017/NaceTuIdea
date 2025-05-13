using Backend.Modelles;

namespace Backend.Interface
{
    public interface INotificacionRepository
    {
        Task<IEnumerable<Notificacion>> GetAllAsync();
        Task<Notificacion> GetByIdAsync(Guid id);
        Task AddAsync(Notificacion notificacion);
        Task UpdateAsync(Notificacion notificacion);
        Task DeleteAsync(Guid id);
    }

}
