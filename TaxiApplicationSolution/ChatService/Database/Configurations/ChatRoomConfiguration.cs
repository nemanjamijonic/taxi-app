using ChatService.Database.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace ChatService.Database.Configurations
{
    public class ChatRoomConfiguration : IEntityTypeConfiguration<ChatRoom>
    {
        public void Configure(EntityTypeBuilder<ChatRoom> builder)
        {
            builder.HasKey(cr => cr.Id);
            builder.Property(cr => cr.Name)
                   .IsRequired()
                   .HasMaxLength(100);
            builder.Property(cr => cr.CreatedAt)
                   .IsRequired();
        }
    }
}
