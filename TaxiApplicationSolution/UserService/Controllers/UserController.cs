using Common.Enums;
using Common.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using UserService.Database;
using UserService.Dto;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;
        private readonly ILogger<UserController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public UserController(UserDbContext dbContext, ILogger<UserController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _userDbContext = dbContext;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("get-image-url")]
        public IActionResult GetImageUrl()
        {
            //  path C:\github\TaxiApp\TaxiApplicationSolution\UserService\images\
            // Retrieve the JWT token from the request headers
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.ToList();

            // Find the 'nameid' claim and get its value
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Now you have the user ID (`userId`) extracted from the JWT token
            // Use it as needed in your application logic
            var user = _userDbContext.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Assuming ImagePath is the property where you store the relative path of the user's image
            var imageUrl = user.ImagePath;
            return Ok(new { imageUrl });
        }


        /*[HttpGet("get-image-url")]
        public IActionResult GetImageUrl()
        {
            // Retrieve the JWT token from the request headers
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Decode the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            // Retrieve all claims from the decoded token
            var claims = decodedToken.Claims.Select(c => new { c.Type, c.Value }).ToList();

            return Ok(new { claims });
        }*/



        // Metoda za dobijanje svih korisnika koji nisu obrisani
        [HttpGet("users")]
        public async Task<IActionResult> GetAllActiveUsers()
        {
            var users = await _userDbContext.Users
                .Where(user => !user.IsDeleted)
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
                user.ImagePath
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
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + editProfileDto.UserImage.FileName;
                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images");
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                Directory.CreateDirectory(uploadsFolder);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await editProfileDto.UserImage.CopyToAsync(fileStream);
                }

                user.ImagePath = "/images/" + uniqueFileName;
            }

            await _userDbContext.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        // Metoda za validaciju vozača
        [HttpPost("validate/{userId}")]
        //[Authorize(Roles = "Admin")]
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
                return Ok("Driver validated successfully");
            }

            return BadRequest("User is not a driver");
        }
    }
}
