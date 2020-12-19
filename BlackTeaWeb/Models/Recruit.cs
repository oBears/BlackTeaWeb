using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Models
{
    /// <summary>
    /// 招募信息
    /// </summary>
    public class Recruit
    {
        /// <summary>
        /// 招募者QQ（发起招募的人）
        /// </summary>
        public long Recruiter { set; get; }
        /// <summary>
        /// 招募描述
        /// </summary>
        public string Desc { set; get; }
        /// <summary>
        /// 招募人数
        /// </summary>
        public int RequiredCount { set; get; }
        /// <summary>
        /// 招募时间
        /// </summary>
        public DateTime CreateTime { set; get; }
        public string TimeStr
        {
            get
            {

                var pastDay = DateTime.Now.Day - CreateTime.Day;
                return pastDay == 0 ? "今天" : $"{pastDay}天前";
            }
        }

        public int TeammateCount { set; get; }
    }
}
