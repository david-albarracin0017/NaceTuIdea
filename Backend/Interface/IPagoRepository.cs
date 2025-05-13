using Backend.Modelles;

namespace Backend.Interface
{
    public interface IPagoRepository
    {
        Task<IEnumerable<Pago>> GetAllAsync();
        Task<Pago> GetByIdAsync(Guid id);
        Task AddAsync(Pago pago);
        Task UpdateAsync(Pago pago);
        Task DeleteAsync(Guid id);
    }

}
