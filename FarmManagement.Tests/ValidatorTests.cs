using FarmManagement.Api.DTOs;
using FarmManagement.Api.Models;
using FarmManagement.Api.Validators;

namespace FarmManagement.Tests;

public class ValidatorTests
{
    [Fact]
    public void PlannedVisitInThePast_IsInvalid()
    {
        var dto = new FarmVisitCreateDto
        {
            FarmerId = 1,
            VisitDate = DateTime.UtcNow.Date.AddDays(-2),
            VisitType = VisitType.Routine,
            Status = VisitStatus.Planned
        };

        var result = new FarmVisitCreateDtoValidator().Validate(dto);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void CompletedVisitWithoutNotes_IsInvalid()
    {
        var dto = new FarmVisitCreateDto
        {
            FarmerId = 1,
            VisitDate = DateTime.UtcNow.Date.AddDays(-1),
            VisitType = VisitType.Inspection,
            Status = VisitStatus.Completed,
            Notes = ""
        };

        var result = new FarmVisitCreateDtoValidator().Validate(dto);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void FarmerWithShortNationalId_IsInvalid()
    {
        var dto = new FarmerCreateDto
        {
            FullName = "Test Ciftci",
            NationalId = "123",
            PhoneNumber = "05511234567",
            Region = "Test Bolge",
            District = "Test ilce"
        };

        var result = new FarmerCreateDtoValidator().Validate(dto);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void ValidFarmer_IsValid()
    {
        var dto = new FarmerCreateDto
        {
            FullName = "Test Ciftci",
            NationalId = "12345678901",
            PhoneNumber = "05511234567",
            Region = "Test Bolge",
            District = "Test ilce"
        };

        var result = new FarmerCreateDtoValidator().Validate(dto);

        Assert.True(result.IsValid);
    }
}