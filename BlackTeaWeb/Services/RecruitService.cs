using BlackTeaWeb.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Services
{
    public class RecruitService
    {
        private readonly MySqlDatabase _db;
        public RecruitService(MySqlDatabase db)
        {
            _db = db;
        }
        public List<Recruit> GetRecruits()
        {
            return _db.Query<Recruit>("select * from Recruit").ToList();
        }
        public List<dynamic> GetRecruitTeammatCounts()
        {
            return _db.Query("select Recruiter,count(1) TeammateCount from Teammate group by Recruiter").ToList();
        }
        public List<Teammate> GetTeammates(long recruiter)
        {
            return _db.Query<Teammate>("select * from Teammate where Recruiter=@recruiter", new { recruiter }).ToList();
        }
        public bool AddTeammate(Teammate teammate)
        {
            return _db.Execute("insert into Teammate(QQ,Recruiter,Content)values(@QQ,@Recruiter,@Content)", teammate) > 0;
        }

        public bool RemoveTeammate(long recruiter, long qq)
        {
            return _db.Execute("delete from Teammate where Recruiter=@Recruiter and QQ=@qq", new { recruiter, qq }) > 0;

        }
        public void AddRecruit(Recruit recruit)
        {
            _db.Execute("insert into Recruit(Recruiter,Desc,RequiredCount,CreateTime)values(@Recruiter,@Desc,@RequiredCount,@CreateTime)", recruit);
        }
        public void UpdateRecruit(Recruit recruit)
        {
            _db.Execute("update Recruit set Desc=@Desc,RequiredCount=@RequiredCount,CreateTime=@CreateTime where Recruiter=@Recruiter", recruit);
        }

        public bool ExisitsRecruit(long recruiter)
        {
            return _db.ExecuteScalar<int>("select count(1) from Recruit where Recruiter=@recruiter", new { recruiter }) > 0;
        }

        public void AddOrUpadateRecruit(Recruit recruit)
        {

            if (ExisitsRecruit(recruit.Recruiter))
            {
                UpdateRecruit(recruit);
            }
            else
            {
                AddRecruit(recruit);
            }
        }

        public int GetRecruitCount()
        {
            return _db.ExecuteScalar<int>("select count(1) from Recruit");
        }


        public int GetTodayRecruitCount()
        {
            return _db.ExecuteScalar<int>("select count(1) from Recruit where CreateTime>@today", new { today = DateTime.Today });
        }


    }
}
