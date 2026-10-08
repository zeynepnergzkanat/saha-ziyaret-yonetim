using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmManagement.Api.Data;
using FarmManagement.Api.Models;
using FarmManagement.Api.DTOs;

namespace FarmManagement.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET api dashboard 
        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            var today = DateTime.UtcNow.Date;
            var sevenDaysLater = today.AddDays(7);

            var totalFarmers = await _context.Farmers.CountAsync();
            var totalVisits = await _context.FarmVisits.CountAsync();
            var plannedVisits = await _context.FarmVisits.CountAsync(v => v.Status == VisitStatus.Planned);
            var completedVisits = await _context.FarmVisits.CountAsync(v => v.Status == VisitStatus.Completed);

            var upcomingVisits = await _context.FarmVisits
                .Include(v => v.Farmer)
                .Where(v => v.VisitDate.Date >= today && v.VisitDate.Date <= sevenDaysLater)
                .OrderBy(v => v.VisitDate)
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

            return Ok(new DashboardSummaryDto
            {
                TotalFarmers = totalFarmers,
                TotalVisits = totalVisits,
                PlannedVisits = plannedVisits,
                CompletedVisits = completedVisits,
                UpcomingVisits = upcomingVisits
            });
        }
    }
}