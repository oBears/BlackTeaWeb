using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class User
    {
        public long Id { set; get; }
        public string NickName { set; get; }
        public string Role { set; get; }
        /// <summary>
        /// 公开数据
        /// </summary>
        public bool OpenData { set; get; }
    }

    public class RoleType
    {
        /// <summary>
        /// 管理员
        /// </summary>
        public const string ADMIN = "admin";
        /// <summary>
        /// 会员
        /// </summary>
        public const string MEMBER = "member";
    }
}
