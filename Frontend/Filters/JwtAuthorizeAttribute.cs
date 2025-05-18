using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Web;
using Microsoft.IdentityModel.Tokens;
using System.Web.Mvc;

namespace Frontend.Filters
{
    public class JwtAuthorizeAttribute : AuthorizeAttribute
    {
        // Hardcodeamos las configuraciones, ya que no usarás web.config
        private readonly string _secretKey = "TuClaveSecretaSuperSegura1234567890123456789012";
        private readonly string _issuer = "https://localhost:7135";
        private readonly string _audience = "https://localhost:7135";

        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var request = filterContext.HttpContext.Request;
            var cookie = request.Cookies["jwt_token"];

            if (cookie == null || string.IsNullOrEmpty(cookie.Value))
            {
                DenyAccess(filterContext);
                return;
            }

            var token = cookie.Value;

            if (!ValidateToken(token, out ClaimsPrincipal principal))
            {
                DenyAccess(filterContext);
                return;
            }

            // Establece el usuario actual en el contexto
            filterContext.HttpContext.User = principal;
            // No llamamos a base.OnAuthorization para evitar la lógica por defecto de AuthorizeAttribute
        }

        private void DenyAccess(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.Request.IsAjaxRequest())
            {
                filterContext.Result = new JsonResult
                {
                    Data = new { success = false, message = "No autorizado" },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            else
            {
                filterContext.Result = new RedirectResult("/Inicio/Principal");
            }
        }

        private bool ValidateToken(string token, out ClaimsPrincipal principal)
        {
            principal = null;

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var key = Encoding.UTF8.GetBytes(_secretKey);

                var parameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,

                    ValidateAudience = true,
                    ValidAudience = _audience,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                principal = tokenHandler.ValidateToken(token, parameters, out SecurityToken validatedToken);

                // Validación explícita del algoritmo
                if (!(validatedToken is JwtSecurityToken jwtToken) ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}