using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;


namespace BlackTeaWeb.Services
{
    public static class UserService
    {

        public static void AddUser(User user)
        {
            MongoDbHelper.GetCollection<User>().InsertOne(user);
        }

        public static User FindUserById(long userId)
        {
            return MongoDbHelper.GetCollection<User>().Find(x => x.Id == userId).FirstOrDefault();
        }

    }
}
