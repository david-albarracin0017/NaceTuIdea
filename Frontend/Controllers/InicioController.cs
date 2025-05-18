using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    public class InicioController : Controller
    {
        // GET: Inicio
        public ActionResult Principal()
        {
            return View();
        }
        public ActionResult Acerca()
        {
            return View();
        }
        public ActionResult Contacto()
        {
            return View();
        }
        // En InicioController.cs
        [HttpPost]
        public ActionResult SaveToken(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return Json(new { success = false, message = "Token inválido." });
            }

            // Crear cookie HTTP-only segura
            Response.Cookies.Set(new HttpCookie("AuthToken", token)
            {
                HttpOnly = true,
                Secure = true, // Solo en HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.Now.AddDays(1)
            });

            return Json(new { success = true });
        }
    }
}