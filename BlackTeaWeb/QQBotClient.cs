using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Websocket.Client;

namespace BlackTeaWeb
{

    public static class QQBotClient
    {
        private static Uri _uri;
        private static string _wwwroot;
        private static string _siteUrl;
        private static IWebsocketClient client;

        public static void Start(string url, string wwwroot, string siteUrl)
        {
            _uri = new Uri(url);
            _wwwroot = wwwroot;
            _siteUrl = siteUrl;
            var factory = new Func<ClientWebSocket>(() =>
            {
                var client = new ClientWebSocket
                {
                    Options =
                    {
                        KeepAliveInterval = TimeSpan.FromSeconds(5),
                    }
                };

                return client;
            });
            client = new WebsocketClient(_uri, factory)
            {
                Name = "BlackTeaWeb",
                ReconnectTimeout = TimeSpan.FromSeconds(30),
                ErrorReconnectTimeout = TimeSpan.FromSeconds(30)
            };
            client.MessageReceived.Subscribe(async msg =>
            {
                var obj = JObject.Parse(msg.Text);
                var postType = obj.Get<string>("post_type");
                switch (postType)
                {
                    case "message":
                        var messageType = obj.Get<string>("message_type");
                        if (messageType == "group")
                        {
                            var groupId = obj.Get<long>("group_id");
                            var rawMessage = obj.Get<string>("raw_message");
                            await OnGroupMessageAsync(groupId, rawMessage);
                        }
                        break;
                    case "notice":
                        var noticeType = obj.Get<string>("notice_type");
                        if (noticeType == "group_upload")
                        {
                            var groupId = obj.Get<long>("group_id");
                            var senderId = obj.Get<long>("user_id");
                            var fileName = obj.Get<string>("file.name");
                            var fileUrl = obj.Get<string>("file.url");
                            await OnGroupUploadAsync(groupId, senderId, fileName, fileUrl);
                        }
                        break;
                    case "request":
                        var requestType = obj.Get<string>("request_type");
                        var subType = obj.Get<string>("sub_type");
                        if (requestType == "friend")
                        {
                            //通过好友申请
                            SetFriendAddRequest(obj.Get<string>("flag"), true);
                        }
                        else if (requestType == "group" && subType == "invite")
                        {
                            //通过加群邀请
                            SetGroupAddRequest(obj.Get<string>("flag"), subType, "", true); ;
                        }
                        break;
                    default:
                        break;
                }
            });
            client.Start();
        }

        public static void SendBotMessage(string action, object @params)
        {
            var jsonSetting = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            var jsonStr = JsonConvert.SerializeObject(new { action, @params }, jsonSetting);
            client.Send(jsonStr);
        }
        public static void SendGroupMessage(long group_id, string message)
        {
            SendBotMessage("send_group_msg", new { group_id, message, auto_escape = false });
        }
        public static void SendPrivateMessage(long user_id, string message)
        {
            SendBotMessage("send_private_msg", new { user_id, message, auto_escape = false });
        }
        public static void SetFriendAddRequest(string flag, bool approve)
        {
            SendBotMessage("set_friend_add_request", new { flag, approve });
        }
        public static void SetGroupAddRequest(string flag, string sub_type, string reason, bool approve)
        {
            SendBotMessage("set_group_add_request", new { flag, sub_type, reason, approve });
        }
        public static string At(long qq)
        {
            return $"[CQ:at,qq={qq}]";
        }
        private static async Task OnGroupMessageAsync(long groupId, string rawMessage)
        {
            //at机器人 回复帮助
            if (rawMessage == "[CQ:at,qq=2778769763]")
            {
                AnswerHelp(groupId);
                return;
            }

            //处理gw2开头信息
            if (Regex.IsMatch(rawMessage, "[^gw2]"))
            {
                var cmd = rawMessage.Replace("gw2", string.Empty);
                switch (cmd)
                {
                    case "":
                        break;
                    case "日常":
                        {
                            var sendMessage = new StringBuilder();
                            var curDate = DateTime.Now.ToString("yyyy-MM-dd");
                            sendMessage.AppendLine($"{curDate} 积分日常");
                            var scoreTasks = await GW2Api.GetScoreTasksAsync(curDate);
                            sendMessage.AppendLine(scoreTasks);

                            sendMessage.AppendLine($"指挥官手册");
                            var handbookTasks = await GW2Api.GetHandBookTasksAsync();
                            sendMessage.AppendLine(handbookTasks);
         
                            SendGroupMessage(groupId, sendMessage.ToString());
                        }
    
                        break;
                    case "菜单":
                        {
                            AnswerHelp(groupId);
                        }
                        break;
                    case "商人":
                        {
                            var sendMessage = new StringBuilder();
                            var codeStr = await GW2Api.GetTraderCodeAsync();
                            sendMessage.AppendLine(codeStr);
                            SendGroupMessage(groupId, sendMessage.ToString());
                        }
                        break;
                    case "懒人":
                        {
                            
                            var sendMessage = new StringBuilder();
                            var codeStr = await GW2Api.GetPVEFast();
                            sendMessage.AppendLine(codeStr);
                            SendGroupMessage(groupId, sendMessage.ToString());
                        }
                        break;
                    case "游戏日常":
                        {
                            var sendMessage = new StringBuilder();
                            var codeStr = await GW2Api.GetGameDaily();
                            sendMessage.AppendLine(codeStr);
                            SendGroupMessage(groupId, sendMessage.ToString());
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        private static void AnswerHelp(long groupId)
        {
            var sendMessage = new StringBuilder();
            sendMessage.AppendLine("1 gw2日常");
            sendMessage.AppendLine("2 gw2商人");
            sendMessage.AppendLine("3 gw2懒人");
            sendMessage.AppendLine("4 gw2游戏日常");
            
            sendMessage.AppendLine("ps.上传日志自动解析");
            SendGroupMessage(groupId, sendMessage.ToString());
        }
        private static async Task OnGroupUploadAsync(long groupId, long senderId, string fileName, string fileUrl)
        {
            //处理 dps 日志文件
            var fileExt = Path.GetExtension(fileName);
            if (".zevtc,.evtc".Contains(fileExt, StringComparison.OrdinalIgnoreCase))
            {
                var guid = Guid.NewGuid().ToString("N");
                var evtcFileName = Path.Combine(_wwwroot, "files", $"{guid}{fileExt}");
                var htmlFileName = Path.Combine(_wwwroot, "files", $"{guid}.html");
                SendGroupMessage(groupId, $"{At(senderId)}正在解析日志文件,请耐心等待！");
                await DownloadHelper.DownloadAsync(fileUrl, evtcFileName);
                ParseHelper.Parse(evtcFileName, htmlFileName);
                SendGroupMessage(groupId, $"{At(senderId)}解析完成,点击链接查看, {_siteUrl}/files/{guid}.html");
                try
                {
                    File.Delete(evtcFileName);
                }
                catch (Exception)
                {

                }

            }
        }

    }
}
