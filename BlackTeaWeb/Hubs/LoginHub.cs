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



        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await Clients.Caller.SendAsync("setCode", Context.ConnectionId);
            LoginService.AddRecord(new LoginRecord()
            {
                Id = Context.ConnectionId,
                CreateTime = DateTime.Now,
                Status = LoginStatus.Pending
            }, Clients.Caller);

        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            LoginService.LoginInvalid(Context.ConnectionId);

        }




    }
}
