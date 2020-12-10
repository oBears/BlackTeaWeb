using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class StringExtensions
    {

        public static string ClearHTMLTag(this string htmlStr)
        {
            return Regex.Replace(htmlStr, @"<(.[^>]*)>", "", RegexOptions.IgnoreCase);
        }

        public static string ToEncodeBase64(this string str)
        {
            return ToEncodeBase64(str, Encoding.UTF8);
        }
        public static string ToEncodeBase64(this string str, Encoding encoding)
        {
            return Convert.ToBase64String(encoding.GetBytes(str));
        }
        public static string ToDecodeBase64(this string str)
        {
            return ToDecodeBase64(str, Encoding.UTF8);
        }
        public static string ToDecodeBase64(this string str, Encoding encoding)
        {
            return encoding.GetString(Convert.FromBase64String(str));
        }
        public static string ToMD5(this string str, string salt = "")
        {
            using (var md5 = MD5.Create())
            {
                var bytes = md5.ComputeHash(Encoding.UTF8.GetBytes(str + salt));
                var result = new StringBuilder();
                foreach (byte b in bytes)
                    result.Append(b.ToString("X2"));
                return result.ToString();
            }
        }
    }
}
