using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmManagement.Api.Data;
using FarmManagement.Api.Models;
using FarmManagement.Api.DTOs;


namespace FarmManagement.Api.Controllers
{
    [ApiController]
    [Route("api/farm-visits")]
    public class FarmVisitsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmVisitsController(AppDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<PagedResult<FarmVisitResponseDto>>> GetFarmVisits(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] VisitStatus? status = null,
            [FromQuery] int? farmerId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.FarmVisits.Include(v => v.Farmer).AsQueryable();

            if (status.HasValue)
                query = query.Where(v => v.Status == status.Value);

            if (farmerId.HasValue)
                query = query.Where(v => v.FarmerId == farmerId.Value);

            if (startDate.HasValue)
                query = query.Where(v => v.VisitDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(v => v.VisitDate <= endDate.Value);

            var totalCount = await query.CountAsync();

            var visits = await query
                .OrderByDescending(v => v.VisitDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new FarmVisitResponseDto
                {
                    Id = v.Id,
                    FarmerId = v.FarmerId,
                    FarmerName = v.Farmer != null ? v.Farmer.FullName : null,
                    VisitDate = v.VisitDate,
                    VisitType = v.VisitType,
                    Notes = v.Notes,
                    Status = v.Status,
                    NextVisitDate = v.NextVisitDate,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<FarmVisitResponseDto>
            {
                Items = visits,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        // GET 
        [HttpGet("{id}")]
        public async Task<ActionResult<FarmVisitResponseDto>> GetFarmVisit(int id)
        {
            var visit = await _context.FarmVisits.Include(v => v.Farmer)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (visit == null) return NotFound();

            return Ok(new FarmVisitResponseDto
            {
                Id = visit.Id,
                FarmerId = visit.FarmerId,
                FarmerName = visit.Farmer?.FullName,
                VisitDate = visit.VisitDate,
                VisitType = visit.VisitType,
                Notes = visit.Notes,
                Status = visit.Status,
                NextVisitDate = visit.NextVisitDate,
                CreatedAt = visit.CreatedAt,
                UpdatedAt = visit.UpdatedAt
            });
        }
        [Authorize]
        [HttpPost] // POST farm-visits
        public async Task<ActionResult<FarmVisitResponseDto>> CreateFarmVisit(FarmVisitCreateDto dto)
        {
            var farmerExists = await _context.Farmers.AnyAsync(f => f.Id == dto.FarmerId);
            if (!farmerExists)
                return BadRequest(new { message = "Belirtilen çiftçi bulunamadı." });

            //aynı çiftçi için aynı gün ve aynı ziyaret türünde ikinci kayyıt oluşturulamaz
            var duplicate = await _context.FarmVisits.AnyAsync(v =>
                v.FarmerId == dto.FarmerId &&
                v.VisitDate.Date == dto.VisitDate.Date &&
                v.VisitType == dto.VisitType);

            if (duplicate)
                return Conflict(new { message = "Bu çiftçi için aynı gün ve aynı türde bir ziyaret zaten mevcut." });

            var visit = new FarmVisit
            {
                FarmerId = dto.FarmerId,
                VisitDate = dto.VisitDate,
                VisitType = dto.VisitType,
                Notes = dto.Notes,
                Status = dto.Status,
                NextVisitDate = dto.NextVisitDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.FarmVisits.Add(visit);
            await _context.SaveChangesAsync();

            var farmer = await _context.Farmers.FindAsync(visit.FarmerId);

            var responseDto = new FarmVisitResponseDto
            {
                Id = visit.Id,
                FarmerId = visit.FarmerId,
                FarmerName = farmer?.FullName,
                VisitDate = visit.VisitDate,
                VisitType = visit.VisitType,
                Notes = visit.Notes,
                Status = visit.Status,
                NextVisitDate = visit.NextVisitDate,
                CreatedAt = visit.CreatedAt,
                UpdatedAt = visit.UpdatedAt
            };

            return CreatedAtAction(nameof(GetFarmVisit), new { id = visit.Id }, responseDto);
        }

        [Authorize]
        [HttpPut("{id}")] // PUT farm visits id 
        public async Task<IActionResult> UpdateFarmVisit(int id, FarmVisitUpdateDto dto)
        {
            var visit = await _context.FarmVisits.FindAsync(id);
            if (visit == null) return NotFound();

            if (visit.Status == VisitStatus.Completed && dto.Status == VisitStatus.Planned)
                return BadRequest(new { message = "Tamamlanan bir ziyaret tekrar planlı duruma alınamaz." });

            if (dto.Status == VisitStatus.Planned && dto.VisitDate.Date < DateTime.UtcNow.Date)
                return BadRequest(new { message = "Geçmiş bir tarih için planlı ziyaret oluşturulamaz." });

            // aynı çiftçi, aynı gün, aynı tür (kendisi hariç) kontrolü
            var duplicate = await _context.FarmVisits.AnyAsync(v =>
                v.Id != id &&
                v.FarmerId == visit.FarmerId &&
                v.VisitDate.Date == dto.VisitDate.Date &&
                v.VisitType == dto.VisitType);

            if (duplicate)
                return Conflict(new { message = "Bu çiftçi için aynı gün ve aynı türde bir ziyaret zaten mevcut." });

            visit.VisitDate = dto.VisitDate;
            visit.VisitType = dto.VisitType;
            visit.Notes = dto.Notes;
            visit.Status = dto.Status;
            visit.NextVisitDate = dto.NextVisitDate;
            visit.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")] //DELETE
        public async Task<IActionResult> DeleteFarmVisit(int id)
        {
            var visit = await _context.FarmVisits.FindAsync(id);
            if (visit == null) return NotFound();

            _context.FarmVisits.Remove(visit);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}