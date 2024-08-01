using ChatApplication.Database.Configurations;
using ChatApplication.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApplication.Database
{
    public class ChatDbContext : DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new MessageConfiguration());
        }
    }
}
