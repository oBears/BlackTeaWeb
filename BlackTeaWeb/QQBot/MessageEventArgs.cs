using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class MessageEventArgs:BotEventArgs
    {
        [JsonProperty("message_id")]
        public string MessageId { set; get; }
        [JsonProperty("message_type")]
        public string MessageType { set; get; }
        public string Message { set; get; }
        [JsonProperty("raw_message")]
        public string RawMessage { set; get; }
        [JsonProperty("sub_type")]
        public string SubType { set; get; }


    }
}
