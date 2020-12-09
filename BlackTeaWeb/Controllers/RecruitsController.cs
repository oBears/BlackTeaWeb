using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class RecruitsController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
