using Common.Enums;
using DriveService.Database.Models;
using DriveService.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using DriveService.Dto;

namespace DriveService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriveController : ControllerBase
    {
        private readonly DriveDbContext _context;

        public DriveController(DriveDbContext context)
        {
            _context = context;
        }

        [HttpGet("drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetAllDrives()
        {
            var drives = await _context.Drives.Where(d => !d.IsDeleted).ToListAsync();
            return Ok(drives);
        }


        [HttpPost("drive")]
        public async Task<ActionResult<Drive>> CreateDrive([FromBody] CreateDriveDto createDriveDto)
        {
            /*var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

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
            }*/

            if (createDriveDto == null)
            {
                return BadRequest("Drive data is null");
            }
            Drive drive = new Drive()
            {
                StartingAddress = createDriveDto.StartingAddress,
                EndingAddress = createDriveDto.EndingAddress,
                CreatedAt = DateTime.Now.AddHours(2),
                DriveState = DriveState.UserOrderedDrive
                /*UserId = Guid.Parse(userId.ToString()),*/
            };


            _context.Drives.Add(drive);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDriveById), new { id = drive.Id }, drive);
        }

        [HttpGet("drive/{id}")]
        public async Task<ActionResult<Drive>> GetDriveById(Guid id)
        {
            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            return Ok(drive);
        }
    }
}
