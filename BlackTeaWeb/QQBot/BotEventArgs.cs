using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class BotEventArgs
    {
       [JsonProperty("post_type")]
        public string PostType { set; get; }
        [JsonProperty("user_id")]
        public long UserId { set; get; }
        [JsonProperty("self_id")]
        public long SelfId { set; get; }
        public long Time { set; get; }
    }
}
