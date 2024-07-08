using Common.Enums;
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

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AuthController(UserDbContext userDbContext, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
        {
            _userDbContext = userDbContext;
            _configuration = configuration;
            _webHostEnvironment = webHostEnvironment;
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

            // Save the image to the server
            var imagePath = "";
            if (registerDto.UserImage != null)
            {
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + registerDto.UserImage.FileName;
                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images");

                // Ensure the directory exists
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await registerDto.UserImage.CopyToAsync(fileStream);
                }
                imagePath = "/images/" + uniqueFileName;
            }

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
                ImagePath = imagePath
            };

            if (registerDto.UserType.Equals("Driver"))
            {
                user.UserType = UserType.Driver;
            }
            else if (registerDto.UserType.Equals("User"))
            {
                user.UserType = UserType.User;
            }

            EmailInfo emailInfo = new EmailInfo() {
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserType = user.UserType.ToString()
            };



            _userDbContext.Users.Add(user);
            _userDbContext.SaveChanges();

            emailInfo.Id = user.Id;

            var emailServiceProxy = ServiceProxy.Create<IEmailInterface>(
                    new Uri("fabric:/TaxiApplication/EmailService")
                );

            var emailSent = await emailServiceProxy.UserRegistrationEmail(emailInfo);

            var token = GenerateJwtToken(user);

            return Ok(new { token, message = "Registration successful" });
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
