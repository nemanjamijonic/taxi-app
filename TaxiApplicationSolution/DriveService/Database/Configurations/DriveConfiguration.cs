using DriveService.Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DriveService.Database.Configurations
{
    public class DriveConfiguration : IEntityTypeConfiguration<Drive>
    {
        public void Configure(EntityTypeBuilder<Drive> builder)
        {
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Id)
                .IsRequired();

            builder.Property(d => d.UserId)
                .IsRequired();

            builder.Property(d => d.UserUsername)
               .IsRequired()
               .HasMaxLength(100);

            builder.Property(d => d.DriverId)
                .IsRequired();

            builder.Property(d => d.DriverUsername)
               .IsRequired()
               .HasMaxLength(100);

            builder.Property(d => d.AproximatedTime)
                .IsRequired();

            builder.Property(d => d.AproximatedCost)
                .IsRequired();

            builder.Property<int>(d => d.DriverArrivalTime)
                .IsRequired();

            builder.Property(d => d.DriveDistance)
                .IsRequired();

            builder.Property(d => d.CreatedAt)
                .IsRequired();

            builder.Property(d => d.DriveState)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(d => d.StartingAddress)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.EndingAddress)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.IsDeleted)
                .IsRequired();
        }
    }
}
