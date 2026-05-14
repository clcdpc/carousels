namespace Carousels.Extensions
{
    public static class WebApplicationBuilderExtensions
    {
        public static WebApplicationBuilder AddClcConfigFolder(this WebApplicationBuilder builder)
        {
            builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("Config\\settings.json", false, true)
                .AddJsonFile($"Config\\settings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", false, true)
                .AddEnvironmentVariables();

            return builder;
        }
    }
}