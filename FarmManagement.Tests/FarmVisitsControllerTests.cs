using FarmManagement.Api.Controllers;
using FarmManagement.Api.Data;
using FarmManagement.Api.DTOs;
using FarmManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace FarmManagement.Tests;

public class FarmVisitsControllerTests
{
    private static async Task<Farmer> SeedFarmer(AppDbContext context)
    {
        var farmer = new Farmer
        {
            FullName = "Test Ciftci",
            NationalId = "12345678901",
            PhoneNumber = "05511234567",
            Region = "Test Bolge",
            District = "Test ilce"
        };
        context.Farmers.Add(farmer);
        await context.SaveChangesAsync();
        return farmer;
    }

    [Fact]
    public async Task CreateFarmVisit_SameFarmerSameDaySameType_ReturnsConflict()
    {
        using var context = TestDb.Create();
        var farmer = await SeedFarmer(context);
        var controller = new FarmVisitsController(context);
        var dto = new FarmVisitCreateDto
        {
            FarmerId = farmer.Id,
            VisitDate = DateTime.UtcNow.Date.AddDays(3),
            VisitType = VisitType.Routine,
            Status = VisitStatus.Planned
        };

        var first = await controller.CreateFarmVisit(dto);
        var second = await controller.CreateFarmVisit(dto);

        Assert.IsType<CreatedAtActionResult>(first.Result);
        Assert.IsType<ConflictObjectResult>(second.Result);
    }

    [Fact]
    public async Task UpdateFarmVisit_CompletedToPlanned_ReturnsBadRequest()
    {
        using var context = TestDb.Create();
        var farmer = await SeedFarmer(context);
        var visit = new FarmVisit
        {
            FarmerId = farmer.Id,
            VisitDate = DateTime.UtcNow.Date.AddDays(-1),
            VisitType = VisitType.Routine,
            Status = VisitStatus.Completed,
            Notes = "Tamamlandi"
        };
        context.FarmVisits.Add(visit);
        await context.SaveChangesAsync();

        var controller = new FarmVisitsController(context);
        var dto = new FarmVisitUpdateDto
        {
            VisitDate = DateTime.UtcNow.Date.AddDays(2),
            VisitType = VisitType.Routine,
            Status = VisitStatus.Planned,
            Notes = "Tekrar planlandi"
        };

        var result = await controller.UpdateFarmVisit(visit.Id, dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(-1, 10)]
    [InlineData(1, 0)]
    [InlineData(1, 1001)]
    public async Task GetFarmVisits_InvalidPaging_ReturnsBadRequest(int page, int pageSize)
    {
        using var context = TestDb.Create();
        var controller = new FarmVisitsController(context);

        var result = await controller.GetFarmVisits(page: page, pageSize: pageSize);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}