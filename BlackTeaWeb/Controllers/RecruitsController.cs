using BlackTeaWeb.Models;
using BlackTeaWeb.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class RecruitsController : Controller
    {
        private readonly RecruitService _recruitService;
        public RecruitsController(RecruitService recruitService)
        {
            _recruitService = recruitService;
        }

        [Permission]
        public IActionResult Index()
        {
            return View();
        }
        public void AddTeammate(Teammate teammate)
        {
            _recruitService.AddTeammate(teammate);
        }
        public void RemoveTeammate(long recruiter, long qq)
        {
            _recruitService.RemoveTeammate(recruiter, qq);
        }

        [Permission]
        public bool SaveRecruit([FromBody] Recruit recruit)
        {
            recruit.Recruiter = User.GetId();
            recruit.CreateTime = DateTime.Now;
            _recruitService.AddOrUpadateRecruit(recruit);
            return true;
        }
        [Permission]
        public List<Recruit> GetRecruits()
        {
            var curId = User.GetId();
            var recruits = _recruitService.GetRecruits()
                .OrderBy(x=>x.Recruiter==curId)
                .ToList();
            var teamCounts = _recruitService.GetRecruitTeammatCounts();
            foreach (var item in recruits)
            {
                var teamCount = teamCounts.FirstOrDefault(x => x.Recruiter == item.Recruiter);
                if (teamCount != null)
                {
                    item.TeammateCount = teamCount.TeammateCount;
                }
            }
            return recruits;
        }
        [Permission]
        public List<Teammate> GetTeammates(long recruiter)
        {
            return _recruitService.GetTeammates(recruiter);
        }

    }
}
