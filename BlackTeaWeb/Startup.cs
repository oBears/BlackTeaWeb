using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
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


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();

            //services.AddHttpClient<ProductService>(config => {
            //    config.BaseAddress = new Uri(Configuration["ProductService:BaseAddress"]);
            //    config.DefaultRequestHeaders.Add("Accept", "application/json");
            //});

            services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");

            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
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
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseStaticFiles();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
        }
    }
}
