using DriveService.Database;
using DriveService.Database.Models;
using DriveService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DriveService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrentLocationController : ControllerBase
    {
        private readonly DriveDbContext _dbContext;
        public CurrentLocationController(DriveDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Metoda za vraćanje trenutne lokacije
        [HttpGet("{userId}")]
        public async Task<ActionResult<CurrentLocation>> GetCurrentLocation(Guid userId)
        {
            var currentLocation = _dbContext.CurrentLocations.FirstOrDefault(cl => cl.UserId == userId);

            if (currentLocation == null)
            {
                return NotFound($"Current location for user with ID {userId} not found.");
            }

            return Ok(currentLocation);
        }

        // Metoda za kreiranje trenutne lokacije
        [HttpPost]
        public async Task<ActionResult<CurrentLocation>> CreateCurrentLocation([FromBody] CreateCurrentLocation createCurrentLocation)
        {
            var existingLocation = _dbContext.CurrentLocations.FirstOrDefault(cl => cl.UserId == createCurrentLocation.UserId);

            if (existingLocation != null)
            {
                return Conflict($"Current location for user with ID {createCurrentLocation.UserId} already exists.");
            }

            var currentLocation = new CurrentLocation
            {
                UserId = createCurrentLocation.UserId,
                CurrentAddress = createCurrentLocation.CurrentAddress
            };

            _dbContext.CurrentLocations.Add(currentLocation);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCurrentLocation), new { userId = currentLocation.UserId }, currentLocation);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateCurrentLocation([FromBody] UpdateCurrentLocationDto updateCurrentLocationDto)
        {
            var currentLocation = _dbContext.CurrentLocations.FirstOrDefault(cl => cl.UserId == updateCurrentLocationDto.UserId);

            if (currentLocation == null)
            {
                return NotFound($"Current location for user with ID {updateCurrentLocationDto.UserId} not found.");
            }

            currentLocation.CurrentAddress = updateCurrentLocationDto.CurrentAddress;
            _dbContext.CurrentLocations.Update(currentLocation);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

    }
}
