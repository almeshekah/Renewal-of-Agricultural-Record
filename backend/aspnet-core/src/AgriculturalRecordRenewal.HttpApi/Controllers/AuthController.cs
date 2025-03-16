using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Identity;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using System.Security.Claims;
using Volo.Abp.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace AgriculturalRecordRenewal.Controllers
{
    [RemoteService]
    [Route("api/auth")]
    public class AuthController : AbpControllerBase
    {
        private readonly IdentityUserManager _userManager;
        private readonly IConfiguration _configuration;
        private readonly IIdentityRoleRepository _roleRepository;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IdentityUserManager userManager,
            IConfiguration configuration,
            IIdentityRoleRepository roleRepository,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _roleRepository = roleRepository;
            _logger = logger;
        }

        [HttpPost]
        [Route("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto model)
        {
            _logger.LogInformation("Login attempt for user: {Username}", model.UserName);
            
            if (string.IsNullOrEmpty(model.UserName))
            {
                _logger.LogWarning("Login failed: Username is empty");
                return BadRequest(new { message = "Username is required" });
            }

            // Find user by username
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found - {Username}", model.UserName);
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Check password - allow empty password if stored hash is NULL
            if (user.PasswordHash != null && !await _userManager.CheckPasswordAsync(user, model.Password ?? ""))
            {
                _logger.LogWarning("Login failed: Invalid password for user {Username}", model.UserName);
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);
            _logger.LogInformation("User {Username} logged in successfully with roles: {Roles}", 
                model.UserName, string.Join(", ", roles));

            // Generate JWT token
            var token = GenerateJwtToken(user, roles);

            return new LoginResponseDto
            {
                Id = user.Id.ToString(),
                UserName = user.UserName,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Token = token,
                Roles = roles.ToList()
            };
        }

        [HttpPost]
        [Route("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            // In JWT, we don't need server-side logout
            // The client should discard the token
            return Ok(new { message = "Successfully logged out" });
        }

        [HttpGet]
        [Route("verify")]
        [Authorize]
        public async Task<ActionResult<UserDto>> VerifyToken()
        {
            if (CurrentUser.Id == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.GetByIdAsync(CurrentUser.Id.Value);
            if (user == null)
            {
                return Unauthorized();
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

        private string GenerateJwtToken(IdentityUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // Add roles as claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // For development purposes, we're hardcoding the secret
            // In production, this should be a proper secret managed in a secure way
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YOUR_SECRET_KEY_HERE_MINIMUM_16_CHARACTERS_LONG_12345"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(1);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "agricultural-record-renewal",
                audience: _configuration["Jwt:Audience"] ?? "agricultural-record-renewal-app",
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequestDto
    {
        [Required]
        public string UserName { get; set; }

        public string Password { get; set; }
    }

    public class LoginResponseDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Token { get; set; }
        public List<string> Roles { get; set; }
    }
} 