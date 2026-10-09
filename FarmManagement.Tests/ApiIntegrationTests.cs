using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FarmManagement.Api.Data;
using FarmManagement.Api.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FarmManagement.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}

public class ApiIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ApiIntegrationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private HttpClient NewClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
        AllowAutoRedirect = false
    });

    private static FarmerCreateDto NewFarmerDto() => new()
    {
        FullName = "Test Ciftci",
        NationalId = "11122233344",
        PhoneNumber = "05321234567",
        Region = "Izmir",
        District = "Bornova"
    };

    [Fact]
    public async Task CreateFarmer_WithoutToken_ReturnsUnauthorized()
    {
        var client = NewClient();

        var response = await client.PostAsJsonAsync("/api/farmers", NewFarmerDto());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RegisterLoginAndCreateFarmer_Succeeds()
    {
        var client = NewClient();
        var credentials = new LoginDto
        {
            Username = "tester-" + Guid.NewGuid().ToString("N"),
            Password = "Test1234!"
        };

        var register = await client.PostAsJsonAsync("/api/auth/register", credentials);
        Assert.Equal(HttpStatusCode.OK, register.StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", credentials);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var loginBody = await login.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.False(string.IsNullOrEmpty(loginBody?.Token));

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/farmers")
        {
            Content = JsonContent.Create(NewFarmerDto())
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", loginBody!.Token);

        var create = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
    }
}