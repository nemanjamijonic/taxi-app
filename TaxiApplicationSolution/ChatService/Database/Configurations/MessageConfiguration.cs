using ChatService.Database.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace ChatService.Database.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);
            builder.Property(m => m.Content)
                   .IsRequired();
            builder.Property(m => m.UserId)
                   .IsRequired();
            builder.Property(m => m.UserName)
                   .IsRequired()
                   .HasMaxLength(50);
            builder.Property(m => m.SentAt)
                   .IsRequired();
            builder.Property(m => m.ChatRoomId)
                   .IsRequired();
            builder.Property(m => m.ChatRoomName)
                   .IsRequired()
                   .HasMaxLength(100);

        }
    }
}
