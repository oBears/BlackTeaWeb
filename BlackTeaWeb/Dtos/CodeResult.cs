using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class CodeResult
    {
        public int ErrCode { set; get; }
        public string ErrMsg { set; get; }
        public object Data { set; get; }

    }
}
