using DriveService.Database.Configurations;
using DriveService.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace DriveService.Database
{
    public class DriveDbContext : DbContext
    {
        public DriveDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Drive> Drives { get; set; }
        public DbSet<DriverRating> DriverRatings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new DriveConfiguration());
            modelBuilder.ApplyConfiguration(new DriverRatingConfiguration());
        }
    }
}
