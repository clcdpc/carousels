using Carousels.Extensions;
using Carousels.Models;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Data.SqlClient;

namespace Carousels
{
    public class Program
    {
        private const string CorsPolicyName = "_allowPublicCarouselReads";
        private const string DatabaseName = "Polaris";

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.AddClcConfigFolder();

            var connectionString = BuildPolarisConnectionString(builder.Configuration);

            builder.Services.AddControllersWithViews();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicyName, policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .WithMethods("GET")
                        .AllowAnyHeader();
                });
            });

            builder.Services.AddScoped(_ => new SqlConnection(connectionString));

            builder.Services.AddSingleton<ICoverImageProvider, SyndeticsCoverImageProvider>();
            builder.Services.AddScoped<ICarouselItemProvider, PolarisDbCarouselItemProvider>();

            builder.Services.AddHttpContextAccessor();

            builder.Services.AddScoped<ICatalogLinkProvider>(s =>
            {
                var httpContext = s.GetRequiredService<IHttpContextAccessor>().HttpContext;
                var ctxValue = httpContext?.Request.Query["ctx"].ToString();

                var ctx = int.TryParse(ctxValue, out var parsedCtx)
                    ? parsedCtx
                    : 1;

                return s.ResolveWith<PowerPacCatalogLinkProvider>(ctx);
            });

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseCors(CorsPolicyName);
            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }

        private static string BuildPolarisConnectionString(IConfiguration configuration)
        {
            var databaseServer = configuration["Database:Server"]
                ?? throw new InvalidOperationException("Missing configuration value: Database:Server");

            var connectionString = new SqlConnectionStringBuilder
            {
                DataSource = databaseServer,
                InitialCatalog = DatabaseName,
                IntegratedSecurity = true,
                TrustServerCertificate = true
            };

            return connectionString.ConnectionString;
        }
    }
}