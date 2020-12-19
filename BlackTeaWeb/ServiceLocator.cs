using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
namespace BlackTeaWeb
{
    public static class ServiceLocator
    {
        private static IServiceProvider _provider;

        public static void Init(IServiceProvider provider)
        {
            _provider = provider;
        }

        public static T GetService<T>()
        {
            return _provider.GetService<T>();
        }


    }
}
