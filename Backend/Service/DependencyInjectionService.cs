using Backend.Interface;
using Backend.Repository;

namespace Backend.Service
{
    public static class DependencyInjectionService
    {
        public static IServiceCollection AddAplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddConfiguration(configuration.GetSection("logging"));
                loggingBuilder.AddConsole();
            });
            services.AddScoped<IValoracionRepository, ValoracionRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<INotificacionRepository, NotificacionRepository>();
            services.AddScoped<IMensajeRepository, MensajeRepository>();
            services.AddScoped<ILocalRepository, LocalRepository>();
            services.AddScoped<IFavoritoRepository, FavoritoRepository>();
            services.AddScoped<IDisponibilidadRepository, DisponibilidadRepository>();
            return services;
        }
    }
}
