using FarmManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FarmManagement.Api.Data;

public static class DbSeeder
{
    private const string SampleIdPrefix = "1000000";

    private static readonly (string Region, string District)[] Places =
    {
        ("Ankara", "Cankaya"), ("Izmir", "Bornova"), ("Konya", "Selcuklu"),
        ("Bursa", "Nilufer"), ("Adana", "Seyhan"), ("Antalya", "Muratpasa"),
        ("Samsun", "Atakum"), ("Manisa", "Yunusemre"), ("Tekirdag", "Suleymanpasa"),
        ("Mersin", "Yenisehir"), ("Kayseri", "Melikgazi"), ("Denizli", "Pamukkale")
    };

    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.Users.AnyAsync(u => u.Username == "demo"))
        {
            context.Users.Add(new User
            {
                Username = "demo",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo1234!"),
                Role = UserRole.Admin
            });
        }

        for (var i = 0; i < Places.Length; i++)
        {
            var nationalId = $"{SampleIdPrefix}{i + 1:D4}";
            if (await context.Farmers.AnyAsync(f => f.NationalId == nationalId))
            {
                continue;
            }

            context.Farmers.Add(new Farmer
            {
                FullName = $"Ornek Ciftci {i + 1:D2}",
                NationalId = nationalId,
                PhoneNumber = $"0530000{i + 1:D4}",
                Region = Places[i].Region,
                District = Places[i].District
            });
        }

        await context.SaveChangesAsync();

        var visitsAlreadySeeded = await context.FarmVisits
            .AnyAsync(v => v.Farmer!.NationalId.StartsWith(SampleIdPrefix));
        if (visitsAlreadySeeded)
        {
            return;
        }

        var farmers = await context.Farmers
            .Where(f => f.NationalId.StartsWith(SampleIdPrefix))
            .OrderBy(f => f.NationalId)
            .Take(6)
            .ToListAsync();

        if (farmers.Count < 6)
        {
            return;
        }

        var today = DateTime.UtcNow.Date;

        var samples = new (int FarmerIndex, int DayOffset, VisitType Type, VisitStatus Status, string? Notes, int? NextOffset)[]
        {
            (0, -14, VisitType.Routine, VisitStatus.Completed, "Rutin kontrol yapildi, sorun gozlenmedi.", 14),
            (1, -10, VisitType.Inspection, VisitStatus.Completed, "Denetim tamamlandi.", null),
            (2, -3, VisitType.Training, VisitStatus.Cancelled, "Hava kosullari nedeniyle iptal edildi.", null),
            (0, 2, VisitType.Routine, VisitStatus.Planned, null, 16),
            (3, 4, VisitType.Training, VisitStatus.Planned, null, null),
            (4, 6, VisitType.Inspection, VisitStatus.Planned, null, null),
            (5, 20, VisitType.Emergency, VisitStatus.Planned, null, null)
        };

        foreach (var sample in samples)
        {
            context.FarmVisits.Add(new FarmVisit
            {
                FarmerId = farmers[sample.FarmerIndex].Id,
                VisitDate = today.AddDays(sample.DayOffset),
                VisitType = sample.Type,
                Status = sample.Status,
                Notes = sample.Notes,
                NextVisitDate = sample.NextOffset.HasValue
                    ? today.AddDays(sample.NextOffset.Value)
                    : null
            });
        }

        await context.SaveChangesAsync();
    }
}