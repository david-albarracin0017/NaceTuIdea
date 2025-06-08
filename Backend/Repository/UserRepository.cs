using Backend.Context;
using Backend.Interface;
using Backend.Modelles;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly MyAppContext _context;

        public UserRepository(MyAppContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
        public async Task UpdatePartialAsync(Guid id, Dictionary<string, object> updates)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return;

            foreach (var update in updates)
            {
                switch (update.Key.ToLower())
                {
                    case "name":
                        user.Name = (string)update.Value;
                        break;
                    case "email":
                        user.Email = (string)update.Value;
                        break;
                    case "password":
                        user.Password = (string)update.Value;
                        break;
                    case "phone":
                        user.Phone = (string)update.Value;
                        break;
                    case "propierty":
                        user.Propierty = (bool)update.Value;
                        break;
                }
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}
