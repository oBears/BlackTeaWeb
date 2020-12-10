using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly IMongoDatabase db;
        public HomeController()
        {
            db = MongoDbHelper.GetDb();
        }
        [Permission(RoleType.ADMIN)]
        public IActionResult Index(string bossName)
        {
            ViewBag.BossNames = db.GetCollection<DPSLog>("dpsLogs").AsQueryable().Where(x => x.Success).GroupBy(x => x.BossName).Select(x => x.Key).ToList();
            IQueryable<DPSLog> query = db.GetCollection<DPSLog>("dpsLogs").AsQueryable();
            if (!string.IsNullOrEmpty(bossName))
            {
                query = query.Where(x => x.BossName == bossName);
            }
            var logs = query.Where(x => x.Success).OrderBy(x => x.CostTime).Take(100).ToList();
            return View(logs);
        }

    }
}
