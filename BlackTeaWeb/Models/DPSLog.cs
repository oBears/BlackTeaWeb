using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    /// <summary>
    /// DPS日志
    /// </summary>
    public class DPSLog
    {
        public string Id { set; get; }
        /// <summary>
        /// boss编号
        /// </summary>
        public int BossId { set; get; }
        /// <summary>
        /// boss名字
        /// </summary>
        public string BossName { set; get; }
        public long CostTime { set; get; }
        /// <summary>
        /// 是否通过
        /// </summary>
        public bool Success { set; get; }
        /// <summary>
        /// 激战2游戏版本
        /// </summary>
        public string Gw2Build { set; get; }
        /// <summary>
        /// 上传时间
        /// </summary>
        public DateTime UploadTime { set; get; }
        /// <summary>
        /// 上传者游戏名字
        /// </summary>
        public string Uploader { set; get; }
        /// <summary>
        /// 上传者QQ
        /// </summary>
        public long UploaderId { set; get; }
    }
}
