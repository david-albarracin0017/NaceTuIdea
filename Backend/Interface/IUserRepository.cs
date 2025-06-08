using Backend.Modelles;

namespace Backend.Interface
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> GetByIdAsync(Guid id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task UpdatePartialAsync(Guid id, Dictionary<string, object> updates);
        Task DeleteAsync(Guid id);
    }
}
