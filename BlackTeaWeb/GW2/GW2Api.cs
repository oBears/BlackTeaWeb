using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    /// <summary>
    /// 激战2 相关api
    /// </summary>
    public static class GW2Api
    {
        public static async Task<string> GetHandBookTasksAsync()
        {
            using var cli = new WebClient();
            var response = await cli.DownloadStringTaskAsync("http://do.gw2.kongzhong.com/gw2newcommander/getDefaultInfo");
            var obj = JObject.Parse(response);
            var taskNames = from p in obj["tasklist"] select (string)p["task_name"];
            return string.Join("\r\n", taskNames);
        }
        public static async Task<string> GetScoreTasksAsync(string date)
        {
            using var cli = new WebClient();
            var response = await cli.DownloadStringTaskAsync($"http://do.gw2.kongzhong.com/gw2task/completes?date={date}");
            var obj = JObject.Parse(response);
            var taskNames = from p in obj["data"] select (string)p["task_name"];
            return string.Join("\r\n", taskNames);
        }

        
    }
}
