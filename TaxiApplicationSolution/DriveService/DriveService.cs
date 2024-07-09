using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using DriveService.Database;
using Microsoft.EntityFrameworkCore;

namespace DriveService
{
    internal sealed class DriveService : StatelessService
    {
        public DriveService(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
                        {
                            ContentRootPath = AppContext.BaseDirectory
                        });

                        builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                                             .AddEnvironmentVariables();

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                         builder.Services.AddCors(options =>
                        {
                            options.AddDefaultPolicy(builder =>
                            {
                                builder.AllowAnyOrigin()
                                       .AllowAnyMethod()
                                       .AllowAnyHeader();
                            });
                        });

                        // Add DbContext with SQL Server provider
                        builder.Services.AddDbContext<DriveDbContext>(options =>
                            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

                        builder.WebHost
                               .UseKestrel()
                               .UseContentRoot(Directory.GetCurrentDirectory())
                               .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                               .UseUrls(url);

                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        var app = builder.Build();
                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseAuthorization();

                        app.UseCors(options =>
                        {
                            options.AllowAnyOrigin()
                                   .AllowAnyMethod()
                                   .AllowAnyHeader();
                        });

                        app.MapControllers();

                        return app;

                    }))
            };
        }
    }
}
