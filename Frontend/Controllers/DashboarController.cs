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
        public ActionResult Interfaz()
        {
            var token = Request.Cookies["AuthToken"]?.Value;
            System.Diagnostics.Debug.WriteLine($"Token recibido: {token}");

            if (string.IsNullOrEmpty(token))
            {
                System.Diagnostics.Debug.WriteLine("Redirigiendo a login - Token vacío");
                return RedirectToAction("Principal", "Inicio");
            }

            return View();
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