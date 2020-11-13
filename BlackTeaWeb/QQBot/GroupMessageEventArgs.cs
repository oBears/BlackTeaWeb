using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class GroupMessageEventArgs:MessageEventArgs
    {
        [JsonProperty("group_id")]
        public long GroupId { set; get; }


    }
}
