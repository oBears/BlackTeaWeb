using System;

namespace BlackTeaWeb
{
    /// <summary>
    /// 登陆日志
    /// </summary>
    public class LoginLog
    {
        public string Id { set; get; }
        public LoginStatus Status { set; get; }
        public DateTime CreateTime { set; get; }
    }


    public enum LoginStatus
    {
        /// <summary>
        /// 等待
        /// </summary>
        Pending,
        /// <summary>
        /// 成功
        /// </summary>
        Sucess,
        /// <summary>
        /// 无效
        /// </summary>
        Invalid
    }

   
}
