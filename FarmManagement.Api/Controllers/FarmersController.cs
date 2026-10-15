using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmManagement.Api.Data;
using FarmManagement.Api.Models;
using FarmManagement.Api.DTOs;


namespace FarmManagement.Api.Controllers
{
    [ApiController]
    [Route("api/farmers")]
    public class FarmersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmersController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<PagedResult<FarmerResponseDto>>> GetFarmers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)

        {
            if (!PagingRules.IsValid(page, pageSize))
                return BadRequest(new { message = PagingRules.ErrorMessage });

            var query = _context.Farmers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(f =>
                    f.FullName.Contains(search) ||
                    f.Region.Contains(search) ||
                    f.PhoneNumber.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var farmers = await query
                .OrderBy(f => f.FullName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new FarmerResponseDto
                {
                    Id = f.Id,
                    FullName = f.FullName,
                    NationalId = f.NationalId,
                    PhoneNumber = f.PhoneNumber,
                    Region = f.Region,
                    District = f.District,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<FarmerResponseDto>
            {
                Items = farmers,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        // GET farmers id
        [HttpGet("{id}")]
        public async Task<ActionResult<FarmerResponseDto>> GetFarmer(int id)
        {
            var farmer = await _context.Farmers.FindAsync(id);
            if (farmer == null) return NotFound();

            return Ok(new FarmerResponseDto
            {
                Id = farmer.Id,
                FullName = farmer.FullName,
                NationalId = farmer.NationalId,
                PhoneNumber = farmer.PhoneNumber,
                Region = farmer.Region,
                District = farmer.District,
                CreatedAt = farmer.CreatedAt
            });
        }

        [Authorize]
        [HttpPost] // POST api farmers
        public async Task<ActionResult<FarmerResponseDto>> CreateFarmer(FarmerCreateDto dto)
        {
            var exists = await _context.Farmers.AnyAsync(f => f.NationalId == dto.NationalId);
            if (exists)
                return Conflict(new { message = "Bu kimlik numarasıyla kayıtlı bir çiftçi zaten var." });

            var farmer = new Farmer
            {
                FullName = dto.FullName,
                NationalId = dto.NationalId,
                PhoneNumber = dto.PhoneNumber,
                Region = dto.Region,
                District = dto.District,
                CreatedAt = DateTime.UtcNow
            };

            _context.Farmers.Add(farmer);
            await _context.SaveChangesAsync();

            var responseDto = new FarmerResponseDto
            {
                Id = farmer.Id,
                FullName = farmer.FullName,
                NationalId = farmer.NationalId,
                PhoneNumber = farmer.PhoneNumber,
                Region = farmer.Region,
                District = farmer.District,
                CreatedAt = farmer.CreatedAt
            };

            return CreatedAtAction(nameof(GetFarmer), new { id = farmer.Id }, responseDto);
        }

        [Authorize]
        [HttpPut("{id}")] // PUT farmers id 
        public async Task<IActionResult> UpdateFarmer(int id, FarmerUpdateDto dto)
        {
            var farmer = await _context.Farmers.FindAsync(id);
            if (farmer == null) return NotFound();

            var duplicateNationalId = await _context.Farmers
                .AnyAsync(f => f.NationalId == dto.NationalId && f.Id != id);
            if (duplicateNationalId)
                return Conflict(new { message = "Bu kimlik numarasıyla kayıtlı başka bir çiftçi var." });

            farmer.FullName = dto.FullName;
            farmer.NationalId = dto.NationalId;
            farmer.PhoneNumber = dto.PhoneNumber;
            farmer.Region = dto.Region;
            farmer.District = dto.District;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]  //DELETE api farmers id
        public async Task<IActionResult> DeleteFarmer(int id)
        {
            var farmer = await _context.Farmers
                .Include(f => f.FarmVisits)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (farmer == null) return NotFound();

            //bağlı ziyaret kaydı bulunan çiftçi silinemez
            if (farmer.FarmVisits.Any())
                return BadRequest(new { message = "Bağlı ziyaret kaydı bulunan çiftçi silinemez." });

            _context.Farmers.Remove(farmer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}