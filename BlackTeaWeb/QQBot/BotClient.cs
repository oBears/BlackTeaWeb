using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace BlackTeaWeb
{

    public class BotClient
    {
        private ClientWebSocket ws;
        private string _url;
        private string _wwwroot;
        private string _siteUrl;

        private readonly ConcurrentQueue<string> _sendMessageQueue;
        private readonly ConcurrentQueue<string> _recvMessageQueue;
        public static BotClient Instance = new BotClient();

        private BotClient()
        {
            _sendMessageQueue = new ConcurrentQueue<string>();
            _recvMessageQueue = new ConcurrentQueue<string>();
        }

        public void Init(string url, string wwwroot, string siteUrl)
        {
            _url = url;
            _wwwroot = wwwroot;
            _siteUrl = siteUrl;
            _ = Task.Run(HandleRecvMessageAsync);
            _ = Task.Run(HandleSendMessageAsync);
            _ = Task.Run(ReceiveAsync);
        }

        public async Task WaitConnectedAsync()
        {
            if (ws == null || ws.State == WebSocketState.Closed || ws.State == WebSocketState.Aborted)
            {
                ws = new ClientWebSocket();
                await ws.ConnectAsync(new Uri(_url), CancellationToken.None);
            }

        }

        private async Task ReceiveAsync()
        {
            while (true)
            {
                try
                {
                    if (ws != null && ws.State == WebSocketState.Open)
                    {
                        var buffer = new byte[1024 * 4];
                        //接收到消息
                        var r = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                        var content = new StringBuilder();
                        while (r.MessageType != WebSocketMessageType.Close && r.MessageType == WebSocketMessageType.Text)
                        {
                            content.Append(Encoding.UTF8.GetString(buffer, 0, r.Count));
                            if (r.EndOfMessage)
                            {
                                _recvMessageQueue.Enqueue(content.ToString());
                                content.Clear();
                            }
                            //没接收完继续接受
                            r = await ws.ReceiveAsync(new ArraySegment<byte>(buffer, 0, r.Count), CancellationToken.None);
                        }
                        await ws.CloseAsync(r.CloseStatus.Value, r.CloseStatusDescription, CancellationToken.None);
                        ws.Dispose();
                    }
                }
                catch (Exception)
                {


                }

            }
        }


        private async Task HandleRecvMessageAsync()
        {
            while (true)
            {
                if (_recvMessageQueue.TryDequeue(out string recvMsg))
                {

                    var obj = JObject.Parse(recvMsg);
                    var postType = obj.GetString("post_type");
                    var messageType = obj.GetString("message_type");
                    var noticeType = obj.GetString("notice_type");
                    var subType = obj.GetString("sub_type");
                    var requestType = obj.GetString("request_type");
                    switch (postType)
                    {
                        case "message":
                            if (messageType == "group")
                            {
                                await OnGroupMessageAsync(JsonConvert.DeserializeObject<GroupMessageEventArgs>(recvMsg));
                            }
                            break;
                        case "notice":
                            if (noticeType == "group_upload")
                            {
                                await OnGroupUploadAsync(JsonConvert.DeserializeObject<GroupUploadEventArgs>(recvMsg));
                            }
                            break;
                        case "request":
                            if (requestType == "friend")
                            {
                                //通过好友申请
                                SetFriendAddRequest(obj.GetString("flag"), true);
                            }
                            else if (requestType == "group" && subType == "invite")
                            {
                                //通过加群邀请
                                SetGroupAddRequest(obj.GetString("flag"), subType, "", true); ;
                            }
                            break;
                        default:
                            break;
                    }
                }
                Thread.Sleep(100);

            }
        }
        private async Task HandleSendMessageAsync()
        {
            while (true)
            {
                if (_sendMessageQueue.TryDequeue(out string sendMsg))
                {
                    await WaitConnectedAsync();
                    var buffer = Encoding.UTF8.GetBytes(sendMsg);
                    await ws.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
                Thread.Sleep(100);
            }
        }
     
        public void SendBotMessage(string action, object @params)
        {
            var jsonSetting = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            var jsonStr = JsonConvert.SerializeObject(new { action, @params }, jsonSetting);
            _recvMessageQueue.Enqueue(jsonStr);
        }
        public void SendGroupMessage(long group_id, string message)
        {
            SendBotMessage("send_group_msg", new { group_id, message, auto_escape = false });
        }
        public void SendPrivateMessage(long user_id, string message)
        {
            SendBotMessage("send_private_msg", new { user_id, message, auto_escape = false });
        }
        public void SetFriendAddRequest(string flag, bool approve)
        {
            SendBotMessage("set_friend_add_request", new { flag, approve });
        }
        public void SetGroupAddRequest(string flag, string sub_type, string reason, bool approve)
        {
            SendBotMessage("set_group_add_request", new { flag, sub_type, reason, approve });
        }
        public string At(long qq)
        {
            return $"[CQ:at,qq={qq}]";
        }



        private async Task OnGroupMessageAsync(GroupMessageEventArgs args)
        {
            //处理gw2开头信息
            if (Regex.IsMatch(args.RawMessage, "[^gw2]"))
            {
                var cmd = args.RawMessage.Replace("gw2", string.Empty);
                switch (cmd)
                {
                    case "":
                        break;
                    case "日常":
                        var sendMessage = new StringBuilder();
                        var curDate = DateTime.Now.ToString("yyyy-MM-dd");
                        sendMessage.AppendLine($"指挥官手册 {curDate}");
                        var handbookTasks = await GW2Api.GetHandBookTasksAsync();
                        sendMessage.Append(handbookTasks);
                        sendMessage.AppendLine($"积分日常 {curDate}");
                        var scoreTasks = await GW2Api.GetScoreTasksAsync(curDate);
                        sendMessage.Append(scoreTasks);
                        SendGroupMessage(args.GroupId, sendMessage.ToString());
                        break;
                    default:
                        break;
                }
            }
        }
        private async Task OnGroupUploadAsync(GroupUploadEventArgs args)
        {
            //处理 dps 日志文件
            var fileExt = Path.GetExtension(args.File.Name);
            if (".zevtc,.evtc".Contains(fileExt, StringComparison.OrdinalIgnoreCase))
            {
                var guid = Guid.NewGuid().ToString("N");
                var evtcFileName = Path.Combine(_wwwroot, "files", $"{guid}{fileExt}");
                var htmlFileName = Path.Combine(_wwwroot, "files", $"{guid}.html");
                SendGroupMessage(args.GroupId, $"{At(args.UserId)}正在上传日志文件到服务器");
                await DownloadHelper.DownloadAsync(args.File.Url, evtcFileName);
                SendGroupMessage(args.GroupId, $"{At(args.UserId)}正在解析日志文件");
                ParseHelper.Parse(evtcFileName, htmlFileName);
                SendGroupMessage(args.GroupId, $"{At(args.UserId)}解析完成,点击链接查看, {_siteUrl}/files/{guid}.html");
            }
        }

    }
}
