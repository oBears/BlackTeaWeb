using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class BaseController : Controller
    {


        public CodeResult Success(object data)
        {
            return new CodeResult()
            {
                ErrCode = 0,
                Data = data
            };
        }
        public CodeResult Fail(int errCode, string errMsg)
        {
            return new CodeResult()
            {
                ErrCode = errCode,
                ErrMsg = errMsg
            };
        }
    }
}
