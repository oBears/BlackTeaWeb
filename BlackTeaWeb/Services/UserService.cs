using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;


namespace BlackTeaWeb
{
    public class UserService
    {
        private readonly MySqlDatabase _db;
        public UserService(MySqlDatabase db)
        {
            _db = db;
        }

        public void AddUser(User user)
        {
            _db.Execute("insert into User(Id,NickName,Role,OpenData)values(@Id,@NickName,@Role,@OpenData)", user);
        }

        public User FindUserById(long id)
        {
            return _db.QueryFirst<User>("select * from User where Id=@id", new { id });
        }

    }
}
