using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class RecruitsController : Controller
    {
        [Permission]
        public IActionResult Index()
        {
            var senderId = User.GetId();

            var selfRecruitInfo = GW2Recruit.GetRecruitInfoByQQ(senderId);

            var lst = new List<RecruitTeammateInfo>();
            if (selfRecruitInfo != null)
                lst = selfRecruitInfo.confirmedLst;
            ViewBag.teamInfo = lst;

            return View();
        }
    }
}
