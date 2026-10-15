using FarmManagement.Api.Controllers;
using FarmManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using FarmManagement.Api.DTOs;

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
    [Fact]
    public async Task GetFarmers_SecondPage_ReturnsRemainingItems()
    {
        using var context = TestDb.Create();
        for (var i = 1; i <= 15; i++)
        {
            context.Farmers.Add(new Farmer
            {
                FullName = $"Test Ciftci {i:D2}",
                NationalId = $"2000000{i:D4}",
                PhoneNumber = $"0540000{i:D4}",
                Region = "Test Bolge",
                District = "Test Ilce"
            });
        }
        await context.SaveChangesAsync();

        var controller = new FarmersController(context);
        var result = await controller.GetFarmers(page: 2, pageSize: 10, search: null);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<FarmerResponseDto>>(ok.Value);
        Assert.Equal(15, paged.TotalCount);
        Assert.Equal(5, paged.Items.Count);
        Assert.Equal(2, paged.Page);
    }

    [Fact]
    public async Task GetFarmers_WithSearch_ReturnsOnlyMatchingFarmers()
    {
        using var context = TestDb.Create();
        context.Farmers.Add(new Farmer
        {
            FullName = "Test Ciftci A",
            NationalId = "20000000001",
            PhoneNumber = "05400000001",
            Region = "Ankara",
            District = "Test Ilce"
        });
        context.Farmers.Add(new Farmer
        {
            FullName = "Test Ciftci B",
            NationalId = "20000000002",
            PhoneNumber = "05400000002",
            Region = "Izmir",
            District = "Test Ilce"
        });
        await context.SaveChangesAsync();

        var controller = new FarmersController(context);
        var result = await controller.GetFarmers(page: 1, pageSize: 10, search: "Izmir");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<FarmerResponseDto>>(ok.Value);
        Assert.Single(paged.Items);
        Assert.Equal("Test Ciftci B", paged.Items[0].FullName);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(-1, 10)]
    [InlineData(1, 0)]
    [InlineData(1, 1001)]
    public async Task GetFarmers_InvalidPaging_ReturnsBadRequest(int page, int pageSize)
    {
        using var context = TestDb.Create();
        var controller = new FarmersController(context);

        var result = await controller.GetFarmers(page: page, pageSize: pageSize, search: null);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}