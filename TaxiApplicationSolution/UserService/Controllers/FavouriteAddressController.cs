using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserService.Database.Models;
using UserService.Database;
using UserService.Dto;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavouriteAddressController : ControllerBase
    {

        private readonly UserDbContext _context;

        public FavouriteAddressController(UserDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFavouriteAddress([FromBody] CreateFavouriteAddressDto createDto)
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

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var favAddress = await _context.FavouriteAddresses
                                            .FirstOrDefaultAsync(fa => fa.AddressName.Equals(createDto.AddressName) && fa.UserId == user.Id);
            if (favAddress == null)
            {
                var favouriteAddress = new FavouriteAddress
                {
                    UserId = createDto.UserId,
                    UserUsername = createDto.UserUsername,
                    AddressName = createDto.AddressName,
                    Address = createDto.Address,
                    CreatedAt = DateTime.UtcNow
                };

                _context.FavouriteAddresses.Add(favouriteAddress);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetFavouriteAddressById), new { id = favouriteAddress.Id }, favouriteAddress);
            }
            else
            {
                return BadRequest(new { message = "Address already exists." });
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFavouriteAddress(Guid id, [FromBody] UpdateFavouriteAddressDto updateDto)
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


            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var favouriteAddress = await _context.FavouriteAddresses.FindAsync(id);
            if (favouriteAddress == null)
            {
                return NotFound();
            }

            favouriteAddress.Address = updateDto.Address;

            _context.FavouriteAddresses.Update(favouriteAddress);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFavouriteAddress(Guid id)
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

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var favouriteAddress = await _context.FavouriteAddresses.FindAsync(id);
            if (favouriteAddress == null)
            {
                return NotFound();
            }
            favouriteAddress.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFavouriteAddressById(Guid id)
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


            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var favouriteAddress = await _context.FavouriteAddresses.FindAsync(id);
            if (favouriteAddress == null)
            {
                return NotFound();
            }

            return Ok(favouriteAddress);
        }

        [HttpGet("user-fav-addresses/{userId}")]
        public async Task<IActionResult> GetFavouriteAddressesByUserId(Guid userId)
        {
            var jwtToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            var tokenHandler = new JwtSecurityTokenHandler();
            var decodedToken = tokenHandler.ReadJwtToken(jwtToken);

            var claims = decodedToken.Claims.ToList();
            var userIdClaim = claims.FirstOrDefault(c => c.Type == "nameid")?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var tokenUserId) || tokenUserId != userId)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var favouriteAddresses = await _context.FavouriteAddresses
                                                    .Where(fa => fa.UserId == userId && !fa.IsDeleted)
                                                    .ToListAsync();

            return Ok(favouriteAddresses);
        }
    }
}
