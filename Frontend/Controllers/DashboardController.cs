using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Frontend.Filters;

namespace Frontend.Controllers
{
    public class DashboardController : Controller
    {
        // GET: Dashboard
        public ActionResult Dashb()
        {
            return View();
        }

        [JwtAuthorize]
        public ActionResult Perfil()
        {
            return View();
        }
        public ActionResult Local()
        {
            return View();
        }
    }
}