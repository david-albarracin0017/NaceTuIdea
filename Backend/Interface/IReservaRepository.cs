using Backend.Modelles;

namespace Backend.Interface
{
    public interface IReservaRepository
    {
        Task<IEnumerable<Reserva>> GetAllAsync();
        Task<Reserva> GetByIdAsync(Guid id);
        Task<IEnumerable<Reserva>> GetByLocalIdAsync(Guid localId); // Nuevo
        Task AddAsync(Reserva reserva);
        Task UpdateAsync(Reserva reserva);
        Task DeleteAsync(Guid id);
    }

}
