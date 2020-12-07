using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MongoDB.Driver;

namespace BlackTeaWeb.Pages
{
    public class IndexModel : PageModel
    {
        public List<DPSLog> Logs { set; get; }

        private readonly IMongoDatabase db;

        [BindProperty(SupportsGet = true)]
        public string BossName { get; set; }
        public List<string> BossNames { set; get; }
        public IndexModel()
        {
            db = MongoDbHelper.GetDb();
        }

        public void OnGet()
        {
            BossNames = db.GetCollection<DPSLog>("dpsLogs").AsQueryable()
                .GroupBy(x => x.BossName)
                .Select(x => x.Key).ToList();
            IQueryable<DPSLog> query = db.GetCollection<DPSLog>("dpsLogs").AsQueryable();

            if (!string.IsNullOrEmpty(BossName))
            {
                query = query.Where(x => x.BossName == BossName);
            }
            Logs = query.Where(x => x.Success).OrderBy(x => x.CostTime).Take(100).ToList();
        }
    }
}
