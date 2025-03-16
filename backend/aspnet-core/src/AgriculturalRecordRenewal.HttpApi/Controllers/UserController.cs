using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Identity;
using System.Linq;
using Volo.Abp.Users;

namespace AgriculturalRecordRenewal.Controllers
{
    [RemoteService]
    [Route("api/users")]
    [Authorize]
    public class UserController : AbpController
    {
        private readonly IdentityUserManager _userManager;
        private readonly IIdentityUserRepository _userRepository;
        private readonly IIdentityRoleRepository _roleRepository;

        public UserController(
            IdentityUserManager userManager,
            IIdentityUserRepository userRepository,
            IIdentityRoleRepository roleRepository)
        {
            _userManager = userManager;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        [HttpGet("me")]
        public async Task<UserDto> GetCurrentUser()
        {
            if (CurrentUser.Id == null)
            {
                return null;
            }

            var user = await _userManager.GetByIdAsync(CurrentUser.Id.Value);
            if (user == null)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id.ToString(),
                UserName = user.UserName,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                PhoneNumber = user.PhoneNumber,
                Roles = roles.ToList()
            };
        }

        [HttpGet]
        [Authorize(Roles = "Admin,COO")]
        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = await _userRepository.GetListAsync();
            var result = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new UserDto
                {
                    Id = user.Id.ToString(),
                    UserName = user.UserName,
                    Email = user.Email,
                    Name = user.Name,
                    Surname = user.Surname,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles.ToList()
                });
            }

            return result;
        }

        [HttpGet("roles")]
        [Authorize(Roles = "Admin,COO")]
        public async Task<List<RoleDto>> GetAllRoles()
        {
            var roles = await _roleRepository.GetListAsync();
            return roles.Select(r => new RoleDto
            {
                Id = r.Id.ToString(),
                Name = r.Name,
                IsDefault = r.IsDefault,
                IsPublic = r.IsPublic
            }).ToList();
        }

        [HttpGet("by-role/{roleName}")]
        [Authorize(Roles = "Admin,COO,Manager")]
        public async Task<List<UserDto>> GetUsersByRole(string roleName)
        {
            var role = await _roleRepository.FindByNormalizedNameAsync(roleName.ToUpperInvariant());
            if (role == null)
            {
                return new List<UserDto>();
            }

            var users = await _userManager.GetUsersInRoleAsync(roleName);
            if (users == null || !users.Any())
            {
                return new List<UserDto>();
            }

            return users.Select(u => new UserDto
            {
                Id = u.Id.ToString(),
                UserName = u.UserName,
                Email = u.Email,
                Name = u.Name,
                Surname = u.Surname,
                PhoneNumber = u.PhoneNumber,
                Roles = new List<string> { role.Name }
            }).ToList();
        }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string PhoneNumber { get; set; }
        public List<string> Roles { get; set; }
    }

    public class RoleDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
    }
} 