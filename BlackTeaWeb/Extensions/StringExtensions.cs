using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}
