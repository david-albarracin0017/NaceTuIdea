using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Frontend.Controllers
{
    public class RecuperarController : Controller
    {
        // GET: Recuperar
        public ActionResult recuperar()
        {
            return View();
        }
        public ActionResult resetear(string token)
        {
            ViewBag.Token = token;
            return View();
        }

    }
}