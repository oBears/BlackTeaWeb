using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class DPSLogController : Controller
    {
        private readonly DPSLogService  _dpsLogService;
        public DPSLogController(DPSLogService dpsLogService)
        {
            _dpsLogService = dpsLogService;
        }
        public List<string> BossNames()
        {
            return _dpsLogService.GetBossNames();
        }

        public List<DPSLog> List(DPSLogQuery query)
        {
            return _dpsLogService.GetList(query);

        }

    }
}
