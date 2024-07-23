using ChatService.Database.Configurations;
using ChatService.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatService.Database
{
    public class ChatDbContext : DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new ChatRoomConfiguration());
            modelBuilder.ApplyConfiguration(new MessageConfiguration());
        }
    }
}
