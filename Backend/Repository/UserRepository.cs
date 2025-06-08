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
            if (user == null) throw new Exception("Usuario no encontrado");

            try
            {
                foreach (var update in updates)
                {
                    switch (update.Key.ToLower())
                    {
                        case "name":
                            user.Name = update.Value?.ToString();
                            break;
                        case "email":
                            user.Email = update.Value?.ToString();
                            break;
                        case "password":
                            var plainPassword = update.Value?.ToString();
                            if (!string.IsNullOrEmpty(plainPassword))
                            {
                                user.Password = BCrypt.Net.BCrypt.HashPassword(plainPassword);
                            }
                            break;
                        case "phone":
                            user.Phone = update.Value?.ToString();
                            break;
                        case "propierty":
                            if (bool.TryParse(update.Value?.ToString(), out bool propiertyValue))
                                user.Propierty = propiertyValue;
                            else
                                throw new Exception("Valor inválido para Propierty. Debe ser true/false");
                            break;
                        default:
                            throw new Exception($"Campo no reconocido para actualización: {update.Key}");
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al actualizar usuario: {ex.Message}");
            }
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
