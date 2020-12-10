using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using BlackTeaWeb.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace BlackTeaWeb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddSignalR();
           
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            GW2Recruit.Init(env.WebRootPath);
            GW2Api.Init(env.WebRootPath);
            ParseHelper.Init(Path.Combine(env.WebRootPath, "cache"));
            var botConfig = Configuration.GetSection("BotConfig").Get<BotConfig>();
            botConfig.WebRoot = env.WebRootPath;

            MongoDbHelper.Init(Configuration.GetValue<string>("MongoDb"));
            QQBotClient.Start(botConfig);



            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }
            app.UseStaticFiles();
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapHub<LoginHub>("/loginhub");
            });
        }
    }
}
