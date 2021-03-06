﻿using BlackTeaWeb.Hubs;
using BlackTeaWeb.Services;
using GW2EIEvtcParser;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Websocket.Client;

namespace BlackTeaWeb
{

    public static class QQBotClient
    {
        private static Uri _wsUri;
        private static IWebsocketClient client;
        private static BotConfig botConfig;

        private static Dictionary<long, int> group2helpIdDic = new Dictionary<long, int>();
        private static Dictionary<long, int> group2ConnectDic = new Dictionary<long, int>();


        public static void Start(BotConfig config)
        {
            botConfig = config;
            _wsUri = new Uri(config.GetBotSocketURL());
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
            client = new WebsocketClient(_wsUri, factory)
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
                            var senderId = obj.Get<long>("user_id");
                            await OnGroupMessageAsync(groupId, senderId, rawMessage);
                        }
                        else if (messageType == "private")
                        {
                            var rawMessage = obj.Get<string>("raw_message");
                            var senderId = obj.Get<long>("user_id");
                            var senderName = obj.Get<string>("sender.nickname");
                            OnPrivateMessage(senderId, senderName, rawMessage);
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


        private static object SendBotMessageAndReturn(string action, object data)
        {
            using var cli = new WebClient();
            var jsonSetting = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            cli.Headers[HttpRequestHeader.ContentType] = "application/json";
            var requestUrl = botConfig.GetBotHttpURL(action);
            var response = data == null ? cli.DownloadString(requestUrl) : cli.UploadString(requestUrl, JsonConvert.SerializeObject(data, jsonSetting));
            var qqBotHttpResponse = JsonConvert.DeserializeObject<QQBotHttpResponse>(response);
            if (qqBotHttpResponse.RetCode > 1)
                throw new Exception($"QQBot请求出错,状态码：{qqBotHttpResponse.RetCode}");
            return qqBotHttpResponse.Data;
        }
        private static void SendBotMessage(string action, object data = null)
        {
            SendBotMessageAndReturn(action, data);
        }
        private static JArray GetArrayBotMesssage(string action, object data = null)
        {
            return JArray.FromObject(SendBotMessageAndReturn(action, data));
        }
        private static JObject GetObjectBotMesssage(string action, object data = null)
        {
            return JObject.FromObject(SendBotMessageAndReturn(action, data));
        }
        public static JObject SendGroupMessage(long group_id, string message)
        {
            return GetObjectBotMesssage("send_group_msg", new { group_id, message, auto_escape = false });
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
        public static JObject GetMsg(int message_id)
        {
            return GetObjectBotMesssage("get_msg", new { message_id });
        }
        public static JArray GetFriendList()
        {
            return GetArrayBotMesssage("get_friend_list");
        }
        public static JObject GetLoginInfo()
        {
            return GetObjectBotMesssage("get_login_info");
        }
        public static string At(long qq)
        {
            return $"[CQ:at,qq={qq}]";
        }
        private static async Task OnGroupMessageAsync(long groupId, long senderId, string rawMessage)
        {
            //at机器人 回复帮助 只匹配at机器人
            if (rawMessage == ("[CQ:at,qq=2778769763]"))
            {
                AnswerHelp(groupId);
                return;
            }

            var replyIdObj = Regex.Match(rawMessage, @"(?<=\[CQ:reply,id=)[\s\S]+?(?=\])");
            if (replyIdObj.Success)
            {
                if (int.TryParse(replyIdObj.ToString(), out var replyId))
                {
                    var msgId = 0;
                    //是回复帮助
                    if (group2helpIdDic.TryGetValue(groupId, out msgId))
                    {
                        if (msgId == replyId)
                        {
                            var match = Regex.Match(rawMessage, @"(?<=\[CQ:at,qq=[\s\S]+\]\s)[^\[]");
                            if (match.Success)
                            {
                                if (int.TryParse(match.ToString(), out var cmdId))
                                {
                                    HelpActionAsync(groupId, senderId, cmdId);
                                }
                            }

                            return;
                        }
                    }

                    ////是回复招募
                    //if (group2ConnectDic.TryGetValue(groupId, out msgId))
                    //{
                    //    if (msgId == replyId)
                    //    {
                    //        var match = Regex.Match(rawMessage, @"(?<=\[CQ:at,qq=[\s\S]+\]\s)[^\[][\s\S]*");

                    //        if (match.Success)
                    //        {
                    //            ProcessConnect(groupId, senderId, match.ToString());
                    //        }

                    //        return;
                    //    }
                    //}
                }

                return;
            }

            //处理gw2开头信息
            if (Regex.IsMatch(rawMessage, "gw2(.*)"))
            {
                var cmd = rawMessage.Replace("gw2", string.Empty);

                switch (cmd)
                {
                    case "":
                        break;
                    case "日常":
                        {
                            await AnwerWebDaily(groupId);
                        }

                        break;
                    case "菜单":
                        {
                            AnswerHelp(groupId);
                        }
                        break;
                    case "商人":
                        {
                            AnwerTrader(groupId);
                        }
                        break;
                    case "懒人":
                        {
                            await AnwerPVEFast(groupId);
                        }
                        break;
                    case "游戏日常":
                        {
                            await AnwerGameDaily(groupId);
                        }
                        break;
                    case "机器人状态":
                        {
                            var obj = GetLoginInfo();
                            SendGroupMessage(groupId, $"QQ号：{obj.Get<string>("user_id	")}\r\n昵称：{obj.Get<string>("nickname")}");
                        }
                        break;
                    case "招募":
                        {
                            AnswerRecruitLst(groupId);
                        }
                        break;
                    default:
                        break;
                }
            }
        }




        private static void AnswerRecruitLst(long groupId)
        {
            var recruitService = ServiceLocator.GetService<RecruitService>();
            var sendMessage = new StringBuilder();
            sendMessage.AppendLine($"招募列表 今日招募{recruitService.GetTodayRecruitCount()}");
            sendMessage.AppendLine(botConfig.GetWebURL("Recruits"));
            SendGroupMessage(groupId, sendMessage.ToString());
        }

        private static async Task AnwerGameDaily(long groupId)
        {
            var sendMessage = new StringBuilder();
            var codeStr = await GW2Api.GetGameDaily();
            sendMessage.AppendLine(codeStr);
            SendGroupMessage(groupId, sendMessage.ToString());
        }

        private static async Task AnwerPVEFast(long groupId)
        {
            var sendMessage = new StringBuilder();
            var codeStr = await GW2Api.GetPVEFast();
            sendMessage.AppendLine(codeStr);
            SendGroupMessage(groupId, sendMessage.ToString());
        }

        private static void AnwerTrader(long groupId)
        {
            var sendMessage = new StringBuilder();
            var codeStr = GW2Api.GetTraderCode();
            sendMessage.AppendLine(codeStr);
            SendGroupMessage(groupId, sendMessage.ToString());
        }

        private static async Task AnwerWebDaily(long groupId)
        {
            var sendMessage = new StringBuilder();
            var curDate = DateTime.Now.ToString("yyyy-MM-dd");
            sendMessage.AppendLine($"{curDate} 积分日常");
            var scoreTasks = await GW2Api.GetScoreTasksAsync(curDate);
            sendMessage.AppendLine(scoreTasks);

            sendMessage.AppendLine($"指挥官手册");
            var handbookTasks = await GW2Api.GetHandBookTasksAsync();
            sendMessage.AppendLine(handbookTasks.ClearHTMLTag());

            SendGroupMessage(groupId, sendMessage.ToString());
        }

        private static async Task HelpActionAsync(long groupId, long senderId, int cmd)
        {

            switch (cmd)
            {
                case 1:
                    await AnwerWebDaily(groupId);
                    break;
                case 2:
                    AnwerTrader(groupId);
                    break;
                case 3:
                    await AnwerPVEFast(groupId);
                    break;
                case 4:
                    await AnwerGameDaily(groupId);
                    break;
                case 5:
                    AnswerRecruitLst(groupId);
                    break;
            }
        }



        private static void AnswerHelp(long groupId)
        {
            var recruitService = ServiceLocator.GetService<RecruitService>();
            var recruitCount = recruitService.GetRecruitCount();
            var sendMessage = new StringBuilder();
            sendMessage.AppendLine("【回复此条数字执行命令】");
            sendMessage.AppendLine($"当前招募数量{recruitCount}");
            sendMessage.AppendLine("1 gw2日常");
            sendMessage.AppendLine("2 gw2商人");
            sendMessage.AppendLine("3 gw2懒人");
            sendMessage.AppendLine("4 gw2游戏日常");
            sendMessage.AppendLine("5 gw2招募");
            sendMessage.AppendLine("ps.上传日志自动解析");
            var msg = SendGroupMessage(groupId, sendMessage.ToString());
            var msgId = msg.Get<int>("message_id");

            if (group2helpIdDic.ContainsKey(groupId))
            {
                group2helpIdDic[groupId] = msgId;
            }
            else
            {
                group2helpIdDic.Add(groupId, msgId);
            }
        }

        private static async Task OnGroupUploadAsync(long groupId, long senderId, string fileName, string fileUrl)
        {
            //处理 dps 日志文件
            var fileExt = Path.GetExtension(fileName);
            if (".zevtc,.evtc".Contains(fileExt, StringComparison.OrdinalIgnoreCase))
            {
                var guid = Guid.NewGuid().ToString("N");
                var evtcFileName = Path.Combine(botConfig.WebRoot, "files", $"{guid}{fileExt}");
                var htmlFileName = Path.Combine(botConfig.WebRoot, "files", $"{guid}.html");
                SendGroupMessage(groupId, $"{At(senderId)}正在解析日志文件,请耐心等待！");
                await DownloadHelper.DownloadAsync(fileUrl, evtcFileName);
                var log = ParseHelper.Parse(evtcFileName, htmlFileName);
                var dpsLogService = ServiceLocator.GetService<DPSLogService>();
                dpsLogService.Add(new DPSLog
                {
                    Id = guid,
                    BossId = log.FightData.TriggerID,
                    BossName = log.FightData.GetFightName(log),
                    Success = log.FightData.Success,
                    CostTime = log.FightData.FightEnd,
                    Uploader = log.LogData.PoVName,
                    Gw2Build = log.LogData.GW2Build.ToString(),
                    UploadTime = DateTime.Now,
                    UploaderId = senderId
                });
                SendGroupMessage(groupId, $"{At(senderId)}解析完成,点击链接查看, {botConfig.GetWebURL($"files/{guid}.html")}");
                try
                {
                    File.Delete(evtcFileName);
                }
                catch (Exception)
                {

                }

            }
        }


        private static void OnPrivateMessage(long senderId, string senderName, string rawMessage)
        {
            if (Regex.IsMatch(rawMessage, "gw2login(.*)"))
            {
                var loginId = rawMessage.Replace("gw2login", string.Empty).Trim();
                var userService = ServiceLocator.GetService<UserService>();
                var user = userService.FindUserById(senderId);
                if (user == null)
                {
                    user = new User() { Id = senderId, NickName = senderName, Role = RoleType.MEMBER };
                    userService.AddUser(user);
                }
                var loginService = ServiceLocator.GetService<LoginService>();
                var loginHubContext = ServiceLocator.GetService<IHubContext<LoginHub>>();
                var loginLog = loginService.GetLogByID(loginId);
                var loginresult = "当前登录码已失效,请刷新网页重新获取";
                if (loginLog.Status != LoginStatus.Invalid)
                {
                    loginService.ModifyLogStatus(loginId, LoginStatus.Sucess);
                    var token = JWTUtils.Create(user, Constant.TOKEN_KEY);
                    loginHubContext.Clients.Client(loginId).SendAsync("loginSuccess", token);
                    loginresult = "登陆成功";
                }
                SendPrivateMessage(senderId, loginresult);
            }

        }

    }

    public class QQBotHttpResponse
    {
        public string Status { set; get; }
        public int RetCode { set; get; }
        public object Data { set; get; }
    }


}
