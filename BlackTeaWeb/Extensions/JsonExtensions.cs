using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class JsonExtensions
    {

        public static string GetString(this JObject obj, string key)
        {
            if (obj.TryGetValue(key, out JToken val))
            {
                return val.ToString();
            }
            return string.Empty;
        }
    }
}
