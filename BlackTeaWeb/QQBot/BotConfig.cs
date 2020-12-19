using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{

    public class BotConfig
    {
        public string ServerIP { get; set; }
        public int BotSocketPort { get; set; }
        public int BotHttpPort { get; set; }
        public string BotAccessToken { get; set; }
        public int WebPort { get; set; }
        public string WebRoot { set; get; }

        public string GetBotSocketURL()
        {
            return $"ws://{ServerIP}:{BotSocketPort}?access_token={BotAccessToken}";
        }

        public string GetBotHttpURL(string path = "")
        {
            return $"http://{ServerIP}:{BotHttpPort}/{path}?access_token={BotAccessToken}";
        }

        public string GetWebURL(string path)
        {
            return $"http://{ServerIP}:{WebPort}/{path}";

        }
    }

}
