using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class NoticeEventArgs:BotEventArgs
    {

        [JsonProperty("notice_type")]
        public string NoticeType { set; get; }



    }
}
