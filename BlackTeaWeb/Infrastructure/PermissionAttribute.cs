using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class PermissionAttribute : Attribute, IActionFilter
    {
        private string[] _roles;
        public PermissionAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (!context.HttpContext.User.IsLogin())
            {
                context.Result = new RedirectResult("/Account/Login");
            }
            else if (_roles.Length > 0 && !_roles.Contains(context.HttpContext.User.GetRole()))
            {
                context.Result = new ContentResult() { Content = "权限不足" };
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var token = context.HttpContext.Request.Cookies[Constant.TOKEN_NAME];
            if (string.IsNullOrEmpty(token))
            {
                token = context.HttpContext.Request.Headers[Constant.TOKEN_NAME];
            }
            var jwt = JWTUtils.Decode<User>(token, Constant.TOKEN_KEY);
            if (jwt.IsValid)
            {
                var claimsIdentity = new ClaimsIdentity();
                claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, jwt.Data.Id.ToString()));
                claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, jwt.Data.NickName));
                claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, jwt.Data.Role));
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
                context.HttpContext.User = claimsPrincipal;
            }
        }
    }
}
