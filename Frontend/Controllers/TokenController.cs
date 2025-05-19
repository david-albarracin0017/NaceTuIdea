using System;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Linq;
    using System.Security.Claims;
    using System.Web;
    using System.Web.Mvc;

    public class TokenController : Controller
    {
        // POST: /Token/Guardar
        [HttpPost]
        public ActionResult Guardar(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return new HttpStatusCodeResult(400, "Token no válido");
            }

            var cookie = new HttpCookie("jwt_token", token)
            {
                HttpOnly = true,
                Secure = Request.IsSecureConnection,
                Expires = DateTime.Now.AddHours(1)
            };

            Response.Cookies.Add(cookie);

            return new HttpStatusCodeResult(200, "Token guardado");
        }

        // GET: /Token/Obtener
        [HttpGet]
        public JsonResult Obtener()
        {
            var token = Request.Cookies["jwt_token"]?.Value;
            if (string.IsNullOrEmpty(token))
            {
                return Json(new { success = false, token = "" }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, token = token }, JsonRequestBehavior.AllowGet);
        }

        // GET: /Token/Eliminar
        [HttpGet]
        public ActionResult Eliminar()
        {
            if (Request.Cookies["jwt_token"] != null)
            {
                var cookie = new HttpCookie("jwt_token")
                {
                    Expires = DateTime.Now.AddDays(-1) // Eliminar
                };
                Response.Cookies.Add(cookie);
            }

            return new HttpStatusCodeResult(200, "Token eliminado");
        }

        // GET: /Token/GetUserId
        [HttpGet]
        public ActionResult GetUserId()
        {
            var token = Request.Cookies["jwt_token"]?.Value;
            if (string.IsNullOrEmpty(token))
            {
                return new HttpStatusCodeResult(401, "Token no encontrado");
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                // Ajusta esto si tu claim se llama diferente, por ejemplo: "sub", "id", etc.
                var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return new HttpStatusCodeResult(400, "ID de usuario no encontrado en el token");

                return Content(userId);
            }
            catch (Exception ex)
            {
                return new HttpStatusCodeResult(400, "Error al leer el token: " + ex.Message);
            }
        }
    }
}
