using System;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
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

            var cookie = new HttpCookie("jwt_token", token);
            cookie.HttpOnly = true;
            cookie.Secure = Request.IsSecureConnection; // solo HTTPS
            cookie.Expires = DateTime.Now.AddHours(1); // duración del token

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
                var cookie = new HttpCookie("jwt_token");
                cookie.Expires = DateTime.Now.AddDays(-1); // Eliminar
                Response.Cookies.Add(cookie);
            }

            return new HttpStatusCodeResult(200, "Token eliminado");
        }
    }

}