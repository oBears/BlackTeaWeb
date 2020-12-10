using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class ClaimsPrincipalExtensions
    {
        public static long GetId(this ClaimsPrincipal claimsPrincipal)
        {
            var claim = claimsPrincipal.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
            if (claim != null)
            {
                return Convert.ToInt64(claim.Value);
            }
            return 0;
        }

        public static string GetNickName(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
        }

        public static string GetRole(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value;
        }

        public static bool IsLogin(this ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal.GetId() > 0;
        }
       
    }


}
