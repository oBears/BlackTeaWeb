using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Models
{
    /// <summary>
    /// 队员信息
    /// </summary>
    public class Teammate
    {
        /// <summary>
        /// 队员QQ
        /// </summary>
        public long QQ { set; get; }
        /// <summary>
        /// 招募者QQ
        /// </summary>
        public long Recruiter { set; get; }
        /// <summary>
        /// 队员说的内容
        /// </summary>
        public string Content { set; get; }
    }
}
