using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace BlackTeaWeb
{
    public class RecruitInfo
    {
        public int id;

        public long senderId;

        public string desc;

        public override string ToString()
        {
            return $"【{id}】发布者:{senderId} [{desc}]";
        }
    }

    public static class GW2Recruit
    {
        private static List<RecruitInfo> recruitLst;
        private static int generateId;

        public static void Init()
        {
            recruitLst = new List<RecruitInfo>();
        }

        public static string GetRecruitLst()
        {

            var db = MongoDbHelper.GetDb();
            var recruits = db.GetCollection<RecruitInfo>("recruits").AsQueryable().ToList();
            string retStr = "目前列表:\r\n";
            retStr += string.Join("\r\n", recruits);
            return retStr;
        }

        public static void InsertRecruit(long senderId, string rawMessage)
        {
            var splits = rawMessage.Split('|');
            if (splits.Length > 1)
            {
                var desc = splits[1];
                //recruitLst.Add(new RecruitInfo() { senderId = senderId, desc = desc, id = generateId++ });

                var db = MongoDbHelper.GetDb();
                db.GetCollection<RecruitInfo>("recruits")
                    .InsertOne(new RecruitInfo() { senderId = senderId, desc = desc, id = generateId++ });
            }
        }

        public static RecruitInfo GetRecruitInfo(int id)
        {

            var db = MongoDbHelper.GetDb();
           ;

            //return recruitLst.Find((info) => { return info.id == id; });

            return db.GetCollection<RecruitInfo>("recruits").Find(x => x.id == id).FirstOrDefault();
        }
    }
}
