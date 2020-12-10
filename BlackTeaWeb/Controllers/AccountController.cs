using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult LoginAsync()
        {
            return View();
        }

        public IActionResult Logout()
        {
            Response.Cookies.Delete(Constant.TOKEN_NAME);
            return Redirect("/");
        }
    }
}
