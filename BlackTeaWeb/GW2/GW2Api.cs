using Newtonsoft.Json.Linq;
using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Data;

namespace BlackTeaWeb
{
    /// <summary>
    /// 激战2 相关api
    /// </summary>
    public static class GW2Api
    {
        private static string traderStr;

        private static Dictionary<string, string> mapCodeDic = new Dictionary<string, string>();
        private static Dictionary<string, string> jumpCodeDic = new Dictionary<string, string>();

        private static Dictionary<string, string> dailyCodeDic = new Dictionary<string, string>();

        public static async Task<string> GetHandBookTasksAsync()
        {
            using var cli = new WebClient();
            var response = await cli.DownloadStringTaskAsync("http://do.gw2.kongzhong.com/gw2newcommander/getDefaultInfo");
            var obj = JObject.Parse(response);
            int index = 0;
            var taskNames = from p in obj["tasklist"] select $"{++index} {FixedCodeStr(p)}";
            return string.Join("\r\n", taskNames);
        }
        public static async Task<string> GetScoreTasksAsync(string date)
        {
            using var cli = new WebClient();
            var response = await cli.DownloadStringTaskAsync($"http://do.gw2.kongzhong.com/gw2task/completes?date={date}");
            var obj = JObject.Parse(response);
            int index = 0;
            var taskNames = from p in obj["data"] select $"{++index} {FixedCodeStr(p)}";
            return string.Join("\r\n", taskNames);
        }

        public static async Task<string> GetTraderCodeAsync()
        {
            var dateNow = DateTime.Now;
            var dayOfWeek = DateTime.Now.DayOfWeek;
            int index = (int)dayOfWeek - 1;
            if (dateNow.Hour < 16)
            {
                index -= 1;
            }

            if (index == -1)
            {
                index = 6;
            }

            var obj = JObject.Parse(traderStr);

            var str = (string)obj["data"][index]["detail"];
            var copyStr = $"{DateTime.Now.ToString("yyyy-M-d HH时")} 数据=星期{(index + 1)} {str}";

            return copyStr;
        }

        public static async Task<string> GetPVEFast()
        {
            var date = DateTime.Now.ToString("yyyy-MM-dd");

            using var cli = new WebClient();
            var response = await cli.DownloadStringTaskAsync($"http://do.gw2.kongzhong.com/gw2task/completes?date={date}");
            var obj = JObject.Parse(response);


            var loginStr = "前往类:";

            var jumpStr = "跳跳乐类:";

            var onlineStr = "在线时长类:";

            int login_index = 1;
            int jump_index = 1;
            int online = 1;

            foreach (var data in obj["data"])
            {
                switch ((string)data["task_type"])
                {
                    case "Login":
                        {
                            loginStr += $"\n{(login_index)}.{FixedCodeStr(data)}";
                            login_index++;
                            break;
                        }
                    case "PVE_jump":
                        {
                            jumpStr += $"\n{(jump_index)}.{FixedCodeStr(data)}";
                            jump_index++;
                            break;
                        }
                    case "Online":
                        {
                            onlineStr += $"\n{(online)}.{FixedCodeStr(data)}";
                            online++;
                            break;
                        }
                }
            }

            using var cli2 = new WebClient();
            var response2 = await cli.DownloadStringTaskAsync("http://do.gw2.kongzhong.com/gw2newcommander/getDefaultInfo");
            var obj2 = JObject.Parse(response2);

            foreach (var data in obj2["tasklist"])
            {
                switch ((string)data["task_type"])
                {
                    case "Login":
                        {
                            loginStr += $"\n{(login_index)}.{FixedCodeStr(data)}";
                            login_index++;
                            break;
                        }
                    case "PVE_jump":
                        {
                            jumpStr += $"\n{(jump_index)}.{FixedCodeStr(data)}";
                            jump_index++;
                            break;
                        }
                    case "Online":
                        {
                            onlineStr += $"\n{(online)}.{FixedCodeStr(data)}";
                            online++;
                            break;
                        }
                }
            }

            var retStr = loginStr + "\n" + jumpStr + "\n" + onlineStr;
            return retStr;
        }

        public static void Init(string wwwRoot)
        {
            var traderPath = Path.Combine(wwwRoot, "data/trader.txt");
            traderStr = File.ReadAllText(traderPath);

            var codeExcelPath = Path.Combine(wwwRoot, "data/code.xlsx");
            var mapCode = ExcelTools.ExcelToDataTable(codeExcelPath, "地图传送点", out var firstRow1);
            ParseMapCode(mapCode);

            var jumpCode = ExcelTools.ExcelToDataTable(codeExcelPath, "日常跳跳乐", out var firstRow2);
            ParseJumpCode(jumpCode);

            var gameDailyCode = ExcelTools.ExcelToDataTable(codeExcelPath, "采集&观景类", out var firstRow3);
            ParseGameDailyCode(gameDailyCode);
        }

        private static void ParseMapCode(DataTable data)
        {
            for (int i = 0; i < data.Rows.Count; i++)
            {
                var curDataRow = data.Rows[i];

                var mapName = curDataRow[1].ToString();
                var codeName = curDataRow[2].ToString();

                mapCodeDic.Add(mapName, codeName);
            }
        }

        private static void ParseJumpCode(DataTable data)
        {
            for (int i = 0; i < data.Rows.Count; i++)
            {
                var curDataRow = data.Rows[i];

                var mapName = curDataRow[0].ToString();
                var codeName = curDataRow[3].ToString();

                var jumpName = mapName.Replace("日常", "");
                jumpName = jumpName.Replace("跳跳乐", "");

                jumpCodeDic.Add(jumpName, codeName);
                dailyCodeDic.Add(mapName, codeName);
            }
        }

        private static void ParseGameDailyCode(DataTable data)
        {
            for (int i = 0; i < data.Rows.Count; i++)
            {
                var curDataRow = data.Rows[i];

                var mapName = curDataRow[2].ToString();
                var codeName = curDataRow[5].ToString();

                dailyCodeDic.Add(mapName, codeName);
            }
        }

        private static string FixedCodeStr(JToken data)
        {
            string retStr = (string)data["task_name"];
            switch ((string)data["task_type"])
            {
                case "Login":
                    foreach (var kvp in mapCodeDic)
                    {
                        var mapName = kvp.Key;

                        if (retStr.IndexOf(mapName) >= 0)
                        {
                            retStr = retStr.Replace(mapName, mapName + kvp.Value);
                        }

                    }

                    break;
                case "PVE_jump":
                    {
                        foreach (var kvp in jumpCodeDic)
                        {
                            var mapName = kvp.Key;

                            if (retStr.IndexOf(mapName) >= 0)
                            {
                                retStr = retStr.Replace(mapName, mapName + kvp.Value);
                            }

                        }
                    }
                    break;
            }

            return retStr;
        }
    }
}
