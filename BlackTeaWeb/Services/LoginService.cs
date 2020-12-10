using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace BlackTeaWeb.Services
{
    public static class LoginService
    {
        public static ConcurrentDictionary<string, IClientProxy> Clients = new ConcurrentDictionary<string, IClientProxy>();
        public static void AddRecord(LoginRecord record, IClientProxy client)
        {
            MongoDbHelper.GetCollection<LoginRecord>().InsertOne(record);
            Clients.TryAdd(record.Id, client);
        }

        public static void LoginInvalid(string id)
        {
            var collection = MongoDbHelper.GetCollection<LoginRecord>();
            var record = collection.Find(x => x.Id == id).FirstOrDefault();
            if (record.Status == LoginStatus.Pending)
            {
                record.Status = LoginStatus.Invalid;
                collection.ReplaceOne(x => x.Id == id, record);
            }
            Clients.TryRemove(record.Id, out IClientProxy _);
        }
        public static string Login(string id, User user)
        {
            var collection = MongoDbHelper.GetCollection<LoginRecord>();
            var record = collection.Find(x => x.Id == id).FirstOrDefault();
            if (record.Status == LoginStatus.Sucess)
            {
                return "当前登录码已失效,请刷新网页重新获取";
            }
            if (record.Status == LoginStatus.Pending)
            {
                record.Status = LoginStatus.Sucess;
                collection.ReplaceOne(x => x.Id == id, record);
                if (Clients.TryGetValue(record.Id, out IClientProxy client))
                {
                    var token = JWTUtils.Create(user, Constant.TOKEN_KEY);
                    client.SendAsync("loginSuccess", token);
                    return "登录成功";
                }
            }
            return "当前登录码已失效,请刷新网页重新获取";
        }

    }
}
