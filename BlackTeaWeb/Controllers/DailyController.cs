using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BlackTeaWeb.Controllers
{
    public class DailyController : Controller
    {
        public async Task<IActionResult> IndexAsync()
        {
            var sendMessage = new StringBuilder();
            var curDate = DateTime.Now.ToString("yyyy-MM-dd");
            sendMessage.AppendLine($"{curDate} 积分日常");
            var scoreTasks = await GW2Api.GetScoreTasksAsync(curDate);
            sendMessage.AppendLine(scoreTasks);

            sendMessage.AppendLine($"指挥官手册");
            var handbookTasks = await GW2Api.GetHandBookTasksAsync();
            sendMessage.AppendLine(handbookTasks.ClearHTMLTag());

            ViewBag.DailyInfo = sendMessage;

            return View();
        }
    }
}