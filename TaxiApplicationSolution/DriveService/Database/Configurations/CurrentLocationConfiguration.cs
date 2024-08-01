using DriveService.Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DriveService.Database.Configurations
{
    public class CurrentLocationConfiguration : IEntityTypeConfiguration<CurrentLocation>
    {
        public void Configure(EntityTypeBuilder<CurrentLocation> builder)
        {
            builder.HasKey(cl => cl.Id);

            builder.Property(cl => cl.Id)
                .IsRequired();

            builder.Property(cl => cl.UserId)
                .IsRequired();

            builder.Property(cl => cl.CurrentAddress)
                .IsRequired()
                .HasMaxLength(255);
        }
    }
}
