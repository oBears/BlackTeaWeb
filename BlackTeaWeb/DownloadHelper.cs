using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class DownloadHelper
    {

        public static async Task DownloadAsync(string url, string saveFileName)
        {

            using (var client = new WebClient())
            {
               await client.DownloadFileTaskAsync(url, saveFileName);

            }

        }

    }
}
