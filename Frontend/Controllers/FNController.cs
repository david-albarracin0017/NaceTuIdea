using Frontend.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    public class FNController : Controller
    {
        // GET: FN
        [JwtAuthorize]
        public ActionResult Favoritos()
        {
            return View();
        }

        [JwtAuthorize]
        public ActionResult Notificaciones()
        {
            return View();
        }
    }
}