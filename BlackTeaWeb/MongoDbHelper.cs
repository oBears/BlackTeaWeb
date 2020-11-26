using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class MongoDbHelper
    {
        private static string _connectionString;

        public static void Init(string connectionString)
        {
            _connectionString = connectionString;
        }
        public static IMongoDatabase GetDb()
        {
            //与Mongodb建立连接
            MongoClient client = new MongoClient(_connectionString);
            //获得数据库,没有则自动创建
            IMongoDatabase db = client.GetDatabase("blackTea");
            return db;
        }

    }
}
