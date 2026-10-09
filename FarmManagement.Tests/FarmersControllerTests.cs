using FarmManagement.Api.Controllers;
using FarmManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace FarmManagement.Tests;

public class FarmersControllerTests
{
    private static Farmer NewFarmer() => new()
    {
        FullName = "Test Ciftci",
        NationalId = "12345678901",
        PhoneNumber = "05511234567",
        Region = "Test Bolge",
        District = "Test ilce"
    };

    [Fact]
    public async Task DeleteFarmer_WithVisits_ReturnsBadRequest()
    {
        using var context = TestDb.Create();
        var farmer = NewFarmer();
        farmer.FarmVisits.Add(new FarmVisit
        {
            VisitDate = DateTime.UtcNow.Date.AddDays(1),
            VisitType = VisitType.Routine,
            Status = VisitStatus.Planned
        });
        context.Farmers.Add(farmer);
        await context.SaveChangesAsync();

        var controller = new FarmersController(context);
        var result = await controller.DeleteFarmer(farmer.Id);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(1, context.Farmers.Count());
    }

    [Fact]
    public async Task DeleteFarmer_WithoutVisits_ReturnsNoContent()
    {
        using var context = TestDb.Create();
        var farmer = NewFarmer();
        context.Farmers.Add(farmer);
        await context.SaveChangesAsync();

        var controller = new FarmersController(context);
        var result = await controller.DeleteFarmer(farmer.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, context.Farmers.Count());
    }
}