using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace BlackTeaWeb
{
    public class RecruitInfo
    {
        public long senderId;

        public string desc;
        public long timestamp;
        public override string ToString()
        {
            return $"【{timestamp}】发布者:{senderId} [{desc}]";
        }
    }

    public static class GW2Recruit
    {
        private static string webRoot;

        public static void Init(string webRoot)
        {
            GW2Recruit.webRoot = webRoot;
        }

        public static string GetRecruitLst()
        {

            var db = MongoDbHelper.GetDb();
            var recruits = db.GetCollection<RecruitInfo>("recruits").AsQueryable().ToList();
            string retStr = "目前列表:\r\n";
            retStr += string.Join("\r\n", recruits);
            return retStr;
        }

        public static bool IsRecruiting(long senderId)
        {
            var db = MongoDbHelper.GetDb();

            return db.GetCollection<RecruitInfo>("recruits").Find(x => x.senderId == senderId).CountDocuments() > 0;
        }

        public static void InsertRecruit(long senderId, string rawMessage)
        {
            if (rawMessage.Length > 40)
            {
                rawMessage = rawMessage.Substring(0, 40);
            }

            var db = MongoDbHelper.GetDb();
            db.GetCollection<RecruitInfo>("recruits")
                .InsertOne(new RecruitInfo() { senderId = senderId, desc = rawMessage,  timestamp = DateTime.Now.Ticks });
        }

        public static RecruitInfo GetRecruitInfo(int id)
        {

            var db = MongoDbHelper.GetDb();

            //return recruitLst.Find((info) => { return info.id == id; });

            return db.GetCollection<RecruitInfo>("recruits").Find(x => x.timestamp == id).FirstOrDefault();
        }
    }
}
