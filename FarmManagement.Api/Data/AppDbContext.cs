using Microsoft.EntityFrameworkCore;
using FarmManagement.Api.Models;

namespace FarmManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Farmer> Farmers { get; set; }
        public DbSet<FarmVisit> FarmVisits { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Farmer>()
                .HasIndex(f => f.NationalId)
                .IsUnique();

            modelBuilder.Entity<FarmVisit>()
                .HasOne(fv => fv.Farmer)
                .WithMany(f => f.FarmVisits)
                .HasForeignKey(fv => fv.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
              .HasIndex(u => u.Username)
               .IsUnique();

            modelBuilder.Entity<FarmVisit>()
             .Property(v => v.VisitDate)
              .HasColumnType("date");

            modelBuilder.Entity<FarmVisit>()
                .Property(v => v.NextVisitDate)
                .HasColumnType("date");

        }
    }
}