using BlackTeaWeb.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb.Hubs
{
    public class LoginHub : Hub
    {
        private readonly LoginService _loginService;

        public LoginHub(LoginService loginService)
        {
            _loginService = loginService;
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await Clients.Caller.SendAsync("setCode", Context.ConnectionId);
            _loginService.AddLog(new LoginLog()
            {
                Id = Context.ConnectionId,
                CreateTime = DateTime.Now,
                Status = LoginStatus.Pending
            });
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            _loginService.ModifyLogStatus(Context.ConnectionId, LoginStatus.Invalid);

        }




    }
}
