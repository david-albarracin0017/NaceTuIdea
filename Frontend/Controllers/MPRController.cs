using Frontend.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    public class MPRController : Controller
    {
        // GET: MPR
        [JwtAuthorize]
        public ActionResult Mensajes()
        {
            return View();
        }

        [JwtAuthorize]
        public ActionResult Reservas()
        {
            return View();
        }
    }
}