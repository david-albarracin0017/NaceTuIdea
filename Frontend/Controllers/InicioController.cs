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
    }
}