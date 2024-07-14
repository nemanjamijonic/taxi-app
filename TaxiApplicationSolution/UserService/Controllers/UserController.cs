using Common.Enums;
using Common.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Net;
using System.Security.Claims;
using UserService.Database;
using UserService.Dto;
using Common.Interfaces;
using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting.Client;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly UserDbContext _userDbContext;
        private readonly string _imagesFolderPath = @"C:\github\TaxiApp\TaxiApplicationSolution\Images";


        public UserController(UserDbContext dbContext)
        {
            _userDbContext = dbContext;
        }

        [NonAction]
        public async Task<string> SaveImage(IFormFile imageFile, string userId, string currentImageName)
        {
            string extension = Path.GetExtension(imageFile.FileName);
            string imageName = $"{userId}{extension}";
            var imagePath = Path.Combine(_imagesFolderPath, imageName);

            // Proveri i obriši sve fajlove sa istim userId ali različitim ekstenzijama
            var existingFiles = Directory.GetFiles(_imagesFolderPath, $"{userId}.*");
            foreach (var file in existingFiles)
            {
                if (Path.GetFileName(file) != imageName)
                {
                    try
                    {
                        System.IO.File.Delete(file);
                        Console.WriteLine($"Existing image {file} deleted successfully.");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error deleting image {file}: {ex.Message}");
                    }
                }
            }

            using (var fileStream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }
            return imageName;
        }


        [HttpGet("get-image/{imageName}")]
        public IActionResult GetImage(string imageName)
        {
            var imageDirectory = @"C:\github\TaxiApp\TaxiApplicationSolution\Images";
            var imageFile = Directory.EnumerateFiles(imageDirectory, imageName + ".*")
                                      .FirstOrDefault();

            if (imageFile == null)
            {
                return NotFound();
            }

            string mimeType;
            var extension = Path.GetExtension(imageFile).ToLowerInvariant();
            switch (extension)
            {
                case ".jpeg":
                case ".jpg":
                    mimeType = "image/jpeg";
                    break;
                case ".png":
                    mimeType = "image/png";
                    break;
                default:
                    mimeType = "application/octet-stream";
                    break;
            }

            var image = System.IO.File.OpenRead(imageFile);
            return File(image, mimeType);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllActiveUsers()
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            var claims = decodedToken.Claims.ToList();
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var users = await _userDbContext.Users
                .Where(user => !user.IsDeleted && user.Id != userId)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserProfile()
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var jwtToken = authHeader.Replace("Bearer ", "");
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);
            var userIdClaim = decodedToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _userDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                user.Username,
                user.Email,
                user.FirstName,
                user.LastName,
                DateOfBirth = user.DateOfBirth.ToString("yyyy-MM-dd"),
                user.Address,
                user.UserType,
            });
        }



        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromForm] EditProfileDto editProfileDto)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);
            var userIdClaim = decodedToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _userDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (editProfileDto.Password != editProfileDto.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            var hashedPassword = HashHelper.HashPassword(editProfileDto.Password);

            user.Username = editProfileDto.Username;
            user.FirstName = editProfileDto.FirstName;
            user.LastName = editProfileDto.LastName;
            user.PasswordHash = hashedPassword;
            user.DateOfBirth = DateTime.Parse(editProfileDto.DateOfBirth);
            user.Address = editProfileDto.Address;

            if (editProfileDto.UserImage != null)
            {
                var image = await SaveImage(editProfileDto.UserImage, user.Id.ToString(), user.ImageName);
                user.ImageName = image;
            }

            await _userDbContext.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }


        [HttpGet("unverified-drivers")]
        public async Task<IActionResult> GetUnverifiedDrivers()
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var jwtToken = authHeader.Replace("Bearer ", "");
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);
            var userIdClaim = decodedToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _userDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (user.UserType != UserType.Admin)
            {
                Unauthorized(new { message = "Invalid role." });
            }
            else
            {
                var users = await _userDbContext.Users
                .Where(u => !u.IsDeleted && u.UserState == UserState.Created && u.UserType == UserType.Driver)
                .ToListAsync();

                if (users == null || !users.Any())
                {
                    return NotFound("Users not found");
                }

                return Ok(users);
            }

            return Unauthorized(new { message = "Invalid role." });

        }


        // Metoda za validaciju vozača
        [HttpPost("validate/{userId}")]
        public async Task<IActionResult> ValidateDriver(Guid userId)
        {
            var user = await _userDbContext.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.UserType == UserType.Driver)
            {
                user.UserState = UserState.Verified;
                await _userDbContext.SaveChangesAsync();

                EmailInfo emailInfo = new EmailInfo()
                {
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Id = userId,
                    UserType = user.UserType.ToString()
                };

                var emailServiceProxy = ServiceProxy.Create<IEmailInterface>(
                new Uri("fabric:/TaxiApplication/EmailService")
               );

                var emailSent = await emailServiceProxy.DriverVerificationEmail(emailInfo);

                return Ok("Succesfully validated driver!");
            }

            return BadRequest("User is not a driver");
        }


        [HttpPost("block/{userId}")]
        public async Task<IActionResult> BlockDriver(Guid userId)
        {
            var user = await _userDbContext.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.UserType == UserType.Driver)
            {
                if (user.UserState == UserState.Blocked) 
                {
                    return BadRequest("Driver already blocked.");
                }
                user.UserState = UserState.Blocked;
                await _userDbContext.SaveChangesAsync();

                EmailInfo emailInfo = new EmailInfo()
                {
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Id = userId,
                    UserType = user.UserType.ToString()
                };

                var emailServiceProxy = ServiceProxy.Create<IEmailInterface>(
                new Uri("fabric:/TaxiApplication/EmailService")
               );

                var emailSent = await emailServiceProxy.DriverBlockingEmail(emailInfo);

                return Ok("Succesfully validated driver!");
            }

            return BadRequest("User is not a driver");
        }


        [HttpPost("reject/{userId}")]
        public async Task<IActionResult> RejectDriver(Guid userId)
        {
            var user = await _userDbContext.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.UserType == UserType.Driver)
            {
                user.UserState = UserState.Rejected;
                await _userDbContext.SaveChangesAsync();

                EmailInfo emailInfo = new EmailInfo()
                {
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Id = userId,
                    UserType = user.UserType.ToString()
                };

                var emailServiceProxy = ServiceProxy.Create<IEmailInterface>(
                new Uri("fabric:/TaxiApplication/EmailService")
               );

                var emailSent = await emailServiceProxy.DriverRejectionEmail(emailInfo);

                return Ok("Succesfully rejected driver!");
            }

            return BadRequest("User is not a driver");
        }

    }
}
