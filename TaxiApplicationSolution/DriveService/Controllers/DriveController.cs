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
using System.Fabric.Query;

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
            var userDrives = await _context.Drives.Where(d => d.UserId == userId && !d.IsDeleted && d.DriveState == DriveState.DriveCompleted).ToListAsync();

            return Ok(userDrives);
        }


        [HttpGet("new-driver-drives")]
        public async Task<ActionResult<IEnumerable<Drive>>> GetNewDriverDrives()
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

            var drives = await _context.Drives
                                       .Where(d => d.DriveState == DriveState.UserOrderedDrive && !d.IsDeleted)
                                       .ToListAsync();
            return Ok(drives);
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

            if (createDriveDto == null)
            {
                return BadRequest("Drive data is null");
            }

            var usersDrives = _context.Drives.Where(d => d.UserId == userId);
            foreach (var usersDrive in usersDrives) 
            {
                if (usersDrive.DriveState != DriveState.DriveCompleted) 
                {
                    return Conflict("You already have unfinished drives!");
                }
            }

            Drive drive = new Drive()
            {
                StartingAddress = createDriveDto.StartingAddress,
                EndingAddress = createDriveDto.EndingAddress,
                CreatedAt = DateTime.Now.AddHours(2),
                UserUsername = createDriveDto.UserUsername,
                DriverUsername = "",
                DriveState = DriveState.UserOrderedDrive,
                UserId = Guid.Parse(userId.ToString())
            };

            _context.Drives.Add(drive);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDriveById), new { id = drive.Id }, drive);
        }


        [HttpPost("create-offer/{id}")]
        public async Task<ActionResult<Drive>> DriverMakesOffer(Guid id, [FromBody] CreateOfferDto createOfferDto)
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

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            ServicePartitionKey partition = new ServicePartitionKey(long.Parse("1"));
            var statefulProxy = ServiceProxy.Create<ICalculationInterface>(
                new Uri("fabric:/TaxiApplication/DriveCalculation"),
                partition
            );  

            var estimatedTime = await statefulProxy.EstimateTime();
            var estimatedCost = await statefulProxy.EstimatePrice();

            drive.AproximatedCost = estimatedCost;
            drive.AproximatedTime = estimatedTime;
            drive.DriverId = userId;
            drive.DriverUsername = createOfferDto.DriverUsername; // use the provided DriverUsername
            drive.DriveState = DriveState.DriverCreatedOffer;

            await _context.SaveChangesAsync();

            return Ok(drive);
        }


        [HttpPost("accept-drive/{id}")]
        public async Task<ActionResult<Drive>> UserAceptDrive(Guid id)
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

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            drive.DriveState = DriveState.UserAceptedDrive;
            await _context.SaveChangesAsync();

            return Ok(drive);
        }


        [HttpGet("drive/{id}")]
        public async Task<ActionResult<Drive>> GetDriveById(Guid id)
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

            var drive = await _context.Drives.FindAsync(id);

            if (drive == null)
            {
                return NotFound();
            }

            return Ok(drive);
        }

        [HttpPost("drive-arrived/{id}")]
        public async Task<ActionResult<Drive>> DriveArrivedForUser(Guid id) 
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

            var drive = await _context.Drives.FindAsync(id);
            if (drive == null)
            {
                return NotFound();
            }

            drive.DriveState = DriveState.DriveActive;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("drive-completed/{id}")]
        public async Task<ActionResult<Drive>> DriveCompleted(Guid id)
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

            var drive = await _context.Drives.FindAsync(id);
            if (drive == null)
            {
                return NotFound();
            }

            drive.DriveState = DriveState.DriveCompleted;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("current-user-drive")]
        public async Task<ActionResult<Drive>> GetCurrentDriveByUser()
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

            // Get the current active drive for the user
            var currentUserDrive = await _context.Drives
                                                 .Where(d => d.UserId == userId && !d.IsDeleted && d.DriveState != DriveState.DriveCompleted)
                                                 .FirstOrDefaultAsync();

            if (currentUserDrive == null)
            {
                return NotFound(new { message = "No active drive found for the user." });
            }

            return Ok(currentUserDrive);
        }



    }
}
