using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using UserService.Database.Configurations;
using UserService.Database.Models;

namespace UserService.Database
{
    public class UserDbContext : DbContext
    {
        public UserDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<FavouriteAddress> FavouriteAddresses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new FavouriteAddressConfiguration());
        }
    }
}
