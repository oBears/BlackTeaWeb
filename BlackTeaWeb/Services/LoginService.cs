using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using BlackTeaWeb.Hubs;

namespace BlackTeaWeb.Services
{
    public class LoginService
    {
        private readonly MySqlDatabase _db;

        public LoginService(MySqlDatabase db)
        {
            _db = db;
        }

        public void AddLog(LoginLog log)
        {
            _db.Execute("insert LoginLog(Id,Status,CreateTime)values(@Id,@Status,@CreateTime)", log);
        }

        public LoginLog GetLogByID(string id)
        {
            return _db.QueryFirst<LoginLog>("select * from LoginLog where Id=@id", new { id });
        }


        public void ModifyLogStatus(string id, LoginStatus status)
        {
            _db.Execute("update LoginLog set Status=@status where Id=@id", new { id, status });
        }
        //public static void LoginInvalid(string id)
        //{
        //    using var db = ServiceLocator.GetService<MySqlDatabase>();
        //    var log = db.QueryFirst<LoginLog>("select * from LoginLog where Id=@id", new { id });
        //    if (log.Status == LoginStatus.Pending)
        //    {
        //        log.Status = LoginStatus.Invalid;
        //        db.Execute("update  LoginLog set Status=@Status where Id=@Id", log);
        //    }
        //    Clients.TryRemove(log.Id, out IClientProxy _);
        //}
       

    }
}
