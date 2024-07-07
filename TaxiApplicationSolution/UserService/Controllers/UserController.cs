using Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Database;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserDbContext _userDbContext;

        public UserController(UserDbContext dbContext)
        {
            _userDbContext = dbContext;
        }

        // Metoda za dobijanje svih korisnika koji nisu obrisani
        [HttpGet("users")]
        public async Task<IActionResult> GetAllActiveUsers()
        {
            var users = await _userDbContext.Users
                .Where(user => !user.IsDeleted)
                .ToListAsync();

            return Ok(users);
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
