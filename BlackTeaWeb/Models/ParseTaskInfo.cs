using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Models
{
    public class ParseTaskInfo
    {
        public string TaskID { set; get; }
        public string FileName { set; get; }
        public string FileURL { set; get; }
        public ParseStatus Status { set; get; }

    }

    public enum ParseStatus
    {
        Pending,
        Downloading,
        Parsing,
        CreateHTML,
        Error,
        Success
    }
}
