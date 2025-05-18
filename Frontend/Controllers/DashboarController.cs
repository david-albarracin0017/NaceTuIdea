using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Frontend.Controllers
{
    public class DashboarController : Controller
    {
        // GET: Dashboard/Index
        public ActionResult interfaz()
        {
            // Verificar si existe la cookie de autenticación
            var token = Request.Cookies["AuthToken"]?.Value;

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Principal", "Inicio"); // Redirigir si no hay token
            }

            return View(); // Mostrar el Dashboard
        }

        private bool IsValidToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("TuClaveSecretaSuperSegura1234567890123456789012"); // ¡Usa la misma clave que en tu API!
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}