using BlackTeaWeb.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BlackTeaWeb.Controllers
{
    public class TasksController
    {

        public async Task CreateParseTaskAsync(ParseTaskInfo taskInfo)
        {
            var newFileName = $"{taskInfo.TaskID}{Path.GetExtension(taskInfo.FileName)}";
            var fullFileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", newFileName);
            var htmlFileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", $"{taskInfo.TaskID}.html");
            await DownloadHelper.DownloadAsync(taskInfo.FileURL, fullFileName);
            ParseHelper.Parse(fullFileName, htmlFileName);
        }

    }
}
