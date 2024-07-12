﻿using Common.Enums;
using Common.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Database;
using UserService.Dto;
using System.IO;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;
using Common.Models;
using Microsoft.Extensions.Hosting;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;
        private readonly IConfiguration _configuration;

        private readonly string _imagesFolderPath = @"C:\github\TaxiApp\TaxiApplicationSolution\Images";

        public AuthController(UserDbContext userDbContext, IConfiguration configuration)
        {
            _userDbContext = userDbContext;
            _configuration = configuration;
        }

        [NonAction]
        public async Task<string> SaveImage(IFormFile imageFile, string userId)
        {
            string extension = Path.GetExtension(imageFile.FileName);
            string imageName = $"{userId}{extension}";
            var imagePath = Path.Combine(_imagesFolderPath, imageName);

            // Ako slika već postoji, obriši je
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }

            using (var fileStream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }
            return imageName;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            var user = _userDbContext.Users.SingleOrDefault(u => u.Email == loginDto.Email);
            if (user == null || !HashHelper.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDto registerDto)
        {
            if (_userDbContext.Users.Any(u => u.Email == registerDto.Email))
            {
                return BadRequest(new { message = "Email is already registered" });
            }

            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            var hashedPassword = HashHelper.HashPassword(registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = hashedPassword,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                UserState = UserState.Created,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow.AddHours(2),
                DateOfBirth = registerDto.DateOfBirth.Date,
                Address = registerDto.Address,
            };

            if (registerDto.UserType.Equals("Driver"))
            {
                user.UserType = UserType.Driver;
            }
            else if (registerDto.UserType.Equals("User"))
            {
                user.UserType = UserType.User;
            }

            if (user.UserType == UserType.User)
            {
                user.UserState = UserState.Verified;
            }

            if (user.UserType == UserType.Admin)
            {
                user.UserState = UserState.Verified;
            }

            user.ImageName = "";

            _userDbContext.Users.Add(user);
            _userDbContext.SaveChanges();

            // Save image with the user ID as the filename
            var image = await SaveImage(registerDto.ImageFile, user.Id.ToString());
            user.ImageName = image;

            _userDbContext.Users.Update(user);
            _userDbContext.SaveChanges();

            EmailInfo emailInfo = new EmailInfo()
            {
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserType = user.UserType.ToString(),
                Id = user.Id
            };

            var emailServiceProxy = ServiceProxy.Create<IEmailInterface>(
                new Uri("fabric:/TaxiApplication/EmailService")
            );

            var emailSent = await emailServiceProxy.UserRegistrationEmail(emailInfo);

            var token = GenerateJwtToken(user);

            return Ok("Registration successful");
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? string.Empty);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserType.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiresInMinutes"])),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
