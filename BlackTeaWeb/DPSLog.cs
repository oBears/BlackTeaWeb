using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class DPSLog
    {
        public string Id { set; get; }
        public int BossId { set; get; }
        public string BossName { set; get; }
        public string Uploader { set; get; }
        public long CostTime { set; get; }
        public string DurationString { set; get; }
        public bool Success { set; get; }
        public string Gw2Build { set; get; }
        public long UploadTime { set; get; }
    }
}
