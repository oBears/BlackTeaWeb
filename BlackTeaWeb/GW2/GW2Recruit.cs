using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace BlackTeaWeb
{
    public class RecruitInfo
    {
        public ObjectId id;
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
            try
            {
                var db = MongoDbHelper.GetDb();
                var recruits = db.GetCollection<RecruitInfo>("recruits").AsQueryable().ToList();

                var filterLst = new List<RecruitInfo>();
                foreach (var info in recruits)
                {
                    if (info.senderId == 420975789)
                    {
                        filterLst.Add(info);
                    }
                    else
                    {
                        if (DateTime.Today.Ticks < info.timestamp)
                        {
                            filterLst.Add(info);
                        }
                    }
                }

                if (filterLst.Count > 20)
                {
                    filterLst = GetRandomListItemListNoSync(filterLst, 20, new Random());
                }

                string retStr = "当天列表(>20为随机):\r\n";
                retStr += string.Join("\r\n", filterLst);
                return retStr;

            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            return "";
        }

        public static List<int> GetRandomIndex(int idxCount, int count, Random random)
        {
            List<int> lst = new List<int>();
            for (int i = 0; i < idxCount; i++)
            {
                lst.Add(i);
            }

            if (count > lst.Count)
            {
                return lst;
            }

            List<int> retLst = new List<int>();
            for (int i = 0; i < count; i++)
            {
                int idx = random.Next(lst.Count);
                retLst.Add(lst[idx]);
                lst.RemoveAt(idx);
            }

            return retLst;
        }


        public static List<T> GetRandomListItemListNoSync<T>(List<T> objectList, int count, Random random)
        {
            var idxLst = GetRandomIndex(objectList.Count, count, random);
            List<T> retLst = new List<T>();
            for (int i = 0; i < idxLst.Count; i++)
            {
                var idx = idxLst[i];
                retLst.Add(objectList[idx]);
            }

            return retLst;
        }

        public static RecruitInfo IsRecruiting(long senderId)
        {
            try
            {
                var db = MongoDbHelper.GetDb();

                return db.GetCollection<RecruitInfo>("recruits").Find(x => x.senderId == senderId).FirstOrDefault();
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            return null;
        }

        public static void InsertRecruit(long senderId, string rawMessage)
        {
            try
            {
                if (rawMessage.Length > 40)
                {
                    rawMessage = rawMessage.Substring(0, 40);
                }

                var curRecruiting = IsRecruiting(senderId);
                if (curRecruiting == null)
                {
                    var db = MongoDbHelper.GetDb();
                    db.GetCollection<RecruitInfo>("recruits")
                        .InsertOne(new RecruitInfo() { senderId = senderId, desc = rawMessage, timestamp = DateTime.Now.Ticks });
                }
                else
                {
                    var db = MongoDbHelper.GetDb();
                    var filter = Builders<RecruitInfo>.Filter;
                    var update = Builders<RecruitInfo>.Update;

                    db.GetCollection<RecruitInfo>("recruits").UpdateOne(filter.Eq("id", curRecruiting.id), update.Set("desc", rawMessage).Set("timestamp", DateTime.Now.Ticks));
                }

            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

        }

        public static RecruitInfo GetRecruitInfo(long id)
        {
            try
            {
                var db = MongoDbHelper.GetDb();

                //return recruitLst.Find((info) => { return info.id == id; });

                return db.GetCollection<RecruitInfo>("recruits").Find(x => x.timestamp == id).FirstOrDefault();
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            return null;
        }
    }
}
