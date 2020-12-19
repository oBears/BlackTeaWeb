using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class DPSLogService
    {
        private readonly MySqlDatabase _db;
        public DPSLogService(MySqlDatabase db)
        {
            _db = db;
        }
        public void Add(DPSLog log)
        {
            _db.Execute("insert into DPSLog(Id,BossId,BossName,Success,CostTime,Uploader,UploderId,UploadTime,Gw2Build)values(@Id,@BossId,@BossName,@Success,@CostTime,@Uploader,@UploaderId,@UploadTime)",log);
        }

        public List<string> GetBossNames()
        {
            return _db.Query<string>("select BossName from DPSLog where Success=1 group by BossName").ToList();
        }
        public List<DPSLog> GetList(DPSLogQuery query)
        {
            var sql = "select * from DPSLog where Success=1";
            if (!string.IsNullOrEmpty(query.BossName))
            {
                sql += " and BossName=@BossName";
            }
            sql += " order by CostTime asc limit @SkipCount,@TakeCount";
            return _db.Query<DPSLog>(sql, query)
                  .ToList();

        }

    }
}
