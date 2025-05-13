using Backend.Dtos;
using Backend.Modelles;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Text;
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Backend.Context;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Generators;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessController : Controller
    {
        private readonly MyAppContext _context;
        private readonly IConfiguration _configuration;
        public AccessController(MyAppContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] Register register)
        {
            // Validar campos vacíos
            if (string.IsNullOrWhiteSpace(register.Name) ||
                string.IsNullOrWhiteSpace(register.Email) ||
                string.IsNullOrWhiteSpace(register.Password))
            {
                return BadRequest(new { message = "Todos los campos son obligatorios." });
            }

            // Validar formato de correo
            if (!IsValidEmail(register.Email))
            {
                return BadRequest(new { message = "El correo ingresado no tiene un formato válido." });
            }

            // Validar longitud de la contraseña (mínimo 6 caracteres)
            if (register.Password.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres." });
            }

            // Verificar si el usuario ya existe
            if (await _context.Users.AnyAsync(u => u.Email == register.Email))
            {
                return BadRequest(new { message = "El usuario ya existe." });
            }

            // Crear un nuevo usuario
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = register.Name,
                Email = register.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(register.Password),
                Phone = register.Phone,
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Usuario registrado exitosamente." });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login login)
        {
            // Validar campos vacíos
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest(new { message = "Todos los campos son obligatorios." });
            }

            // Validar formato de correo
            if (!IsValidEmail(login.Email))
            {
                return BadRequest(new { message = "El correo ingresado no tiene un formato válido." });
            }

            // Buscar usuario
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == login.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "El usuario no existe o las credenciales son incorrectas." });
            }

            // Verificar contraseña
            if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
            {
                return Unauthorized(new { message = "Contraseña incorrecta." });
            }

            // Generar el token JWT
            var token = GenerateJwtToken(user);
            return Ok(new { token = token, message = "Inicio de sesión exitoso." });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
        };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Validación de correo usando Regex (básico y efectivo)
        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }
    }
}

