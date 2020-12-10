using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlackTeaWeb
{
    public class LoginRecord
    {
     
        public string Id { set; get; }
        public LoginStatus Status { set; get; }
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime LoginTime { set; get; }
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime CreateTime { set; get; }
    }


    public enum LoginStatus
    {
        Pending,
        Sucess,
        Invalid
    }

   
}
