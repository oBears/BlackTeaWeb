using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class JsonExtensions
    {

        public static T Get<T>(this JObject obj, string path)
        {
            var token = obj.SelectToken(path);
            if (token != null)
            {
                return token.ToObject<T>();
            }

            return default(T);
        }
    }
}
