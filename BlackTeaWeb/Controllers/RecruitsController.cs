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
            ViewBag.recruiting = selfRecruitInfo != null;

            return View();
        }

        public bool DeleteTeammate(string senderIdStr, string deleteIdStr)
        {
            var senderId = long.Parse(senderIdStr);
            var deleteId = long.Parse(deleteIdStr);

            return GW2Recruit.DeleteTeammate(senderId, deleteId);
        }

        public bool TeammateJoin(string infoStr, string senderStr, string contenStr)
        {
            var infoId = long.Parse(infoStr);
            var deleteId = long.Parse(senderStr);

            return GW2Recruit.TeammateJoin(infoId, deleteId, contenStr);
        }

        public bool AddRecruit(string countStr, string senderStr, string desc)
        {
            var senderId = long.Parse(senderStr);
            var count = 1;
            int.TryParse(countStr, out count);

            return GW2Recruit.InsertRecruit(senderId, count, desc);
        }
    }
}
