using Common.Enums;
using DriveService.Database.Models;
using DriveService.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using DriveService.Dto;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;
using Common.Models;

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


        [HttpGet("user-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetDrivesByUser()
        {
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

            // Get all drives for the user
            var userDrives = await _context.Drives.Where(d => d.UserId == userId && !d.IsDeleted).ToListAsync();

            return Ok(userDrives);
        }
        

        [HttpPost("drive")]
        public async Task<ActionResult<Drive>> CreateDrive([FromBody] CreateDriveDto createDriveDto)
        {
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

            ServicePartitionKey partition = new ServicePartitionKey(long.Parse("1"));

            var statefulProxy = ServiceProxy.Create<ICalculationInterface>(
                new Uri("fabric:/TaxiApplication/DriveCalculation"),
                partition
            );


            var estimatedTime = await statefulProxy.EstimateTime();
            var estimatedCost = await statefulProxy.EstimatePrice();


            if (createDriveDto == null)
            {
                return BadRequest("Drive data is null");
            }

            Drive drive = new Drive()
            {
                StartingAddress = createDriveDto.StartingAddress,
                EndingAddress = createDriveDto.EndingAddress,
                CreatedAt = DateTime.Now.AddHours(2),
                AproximatedTime = estimatedTime,
                AproximatedCost = estimatedCost,
                DriveState = DriveState.UserOrderedDrive,
                UserId = Guid.Parse(userId.ToString())
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
