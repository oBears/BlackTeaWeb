using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class JWTUtils
    {
        /// <summary>
        /// 创建token
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="data"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public static string Create<T>(T data, string key)
        {
            var jwt = new JsonWebToken<T>
            {
                Header = "{ \"type\":\"JWT\",\"alg\":\"MD5\" }".ToEncodeBase64(),
                Payload = JsonConvert.SerializeObject(data).ToEncodeBase64()
            };
            jwt.Sign = $"{jwt.Header}.{jwt.Payload}".ToMD5(key);
            return jwt.ToString();
        }
        /// <summary>
        /// 解密token
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="token"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public static JsonWebToken<T> Decode<T>(string token, string key)
        {
            var jwt = new JsonWebToken<T>();
            if (string.IsNullOrEmpty(token))
                return jwt;
            var parts = token.Split('.');
            if (parts.Length != 3)
                return jwt;
            jwt.Header = parts[0];
            jwt.Payload = parts[1];
            jwt.Sign = parts[2];
            var newSign = $"{jwt.Header}.{jwt.Payload}".ToMD5(key);
            jwt.IsValid = newSign == jwt.Sign;
            jwt.Data = JsonConvert.DeserializeObject<T>(jwt.Payload.ToDecodeBase64());
            return jwt;
        }
    }
}
