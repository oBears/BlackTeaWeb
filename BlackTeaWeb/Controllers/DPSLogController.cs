using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class DPSLogController: Controller
    {
        private readonly IMongoDatabase db;
        public DPSLogController()
        {
            db = MongoDbHelper.GetDb();
        }
        public List<string> BossNames()
        {
            return db.GetCollection<DPSLog>("dpsLogs")
                .AsQueryable().Where(x => x.Success)
                .GroupBy(x => x.BossName)
                .Select(x => x.Key).ToList();
        }

        public List<DPSLog> List(DPSLogQuery model)
        {
            IQueryable<DPSLog> query = db.GetCollection<DPSLog>("dpsLogs").AsQueryable();
            if (!string.IsNullOrEmpty(model.BossName))
            {
                query = query.Where(x => x.BossName == model.BossName);
            }
            return query.Where(x => x.Success)
                .OrderBy(x => x.CostTime)
                .Skip((model.PageIndex - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToList();
        }

    }
}
