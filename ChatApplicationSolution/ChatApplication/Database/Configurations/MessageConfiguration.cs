using ChatApplication.Database.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace ChatApplication.Database.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Id)
                .IsRequired()
                .ValueGeneratedOnAdd();

            builder.Property(m => m.MessageContent)
                   .IsRequired();

            builder.Property(m => m.UserType)
                   .IsRequired();

            builder.Property(m => m.Username)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(m => m.CreatedAt)
                   .IsRequired();

        }
    }
}
