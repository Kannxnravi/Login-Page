using Microsoft.AspNetCore.Mvc;
using AuthApi.Data;
using AuthApi.Models;
using AuthApi.Services;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuthService _auth;
        private readonly TokenService _token;

        public AuthController(AppDbContext context, AuthService auth, TokenService token)
        {
            _context = context;
            _auth = auth;
            _token = token;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User userDto)
        {
            var userExists = await _context.Users
                .AnyAsync(x => x.Email == userDto.Email);

            if (userExists)
                return BadRequest("User already exists");

            var user = new User
            {
                Username = userDto.Username,
                Email = userDto.Email,
                PasswordHash = _auth.HashPassword(userDto.PasswordHash)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                return Unauthorized("User not found");

            if (!_auth.VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized("Incorrect password");

            var token = _token.GenerateToken(user.Id.ToString(), user.Email);

            return Ok(new { token });
        }
    }
}
