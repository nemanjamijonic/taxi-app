using ChatApplication.Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatApplication.Database.Configurations
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
