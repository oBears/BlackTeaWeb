using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class GroupUploadEventArgs: NoticeEventArgs
    {
        [JsonProperty("group_id")]
        public long GroupId { set; get; }
        public GroupUploadFile File { set; get; }
    }
    public class GroupUploadFile
    {
        public string Id { set; get; }
        public string Name { set; get; }
        public string Size { set; get; }
        public string Busid { set; get; }
        public string Url { set; get; }
    }
}
