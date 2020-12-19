using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class PageQuery
    {

        public int PageIndex { set; get; }
        public int PageSize { set; get; }

        public int SkipCount
        {

            get
            {
                return (PageIndex - 1) * PageSize;
            }

        }

        public int TakeCount
        {
            get
            {
                return PageSize;
            }
        }

    }
}
