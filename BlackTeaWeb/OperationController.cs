using GW2EIEvtcParser;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class OperationController : ParserController
    {
        public OperationController(string location, string status) : base(new Version(1, 1, 1))
        {
            Status = status;
            InputFile = location;
        }
        public string Status { get; protected set; }
        public string InputFile { get; }
        public string Elapsed { get; set; } = "";

        public override void Reset()
        {
            base.Reset();
            Elapsed = "";
        }

        public void FinalizeStatus(string prefix)
        {
            StatusList.Insert(0, Elapsed);
            Status = StatusList.LastOrDefault() ?? "";

        }
    }
}
