using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class TimeExtensions
    {

        public static string DateFormat(this long unix, string format="yyyy/MM/dd HH:mm")
        {
            var dto = DateTimeOffset.FromUnixTimeSeconds(unix);
            return dto.ToLocalTime().DateTime.ToString(format);
        }
    }
}
