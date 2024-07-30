using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using UserService.Database.Models;

namespace UserService.Database.Configurations
{
    public class FavouriteAddressConfiguration : IEntityTypeConfiguration<FavouriteAddress>
    {
        public void Configure(EntityTypeBuilder<FavouriteAddress> builder)
        {

            // Primary Key
            builder.HasKey(fa => fa.Id);

            // Properties
            builder.Property(fa => fa.Id)
                .IsRequired()
                .ValueGeneratedOnAdd();// Default value for new GUIDs

            builder.Property(fa => fa.UserId)
                .IsRequired();

            builder.Property(fa => fa.UserUsername)
                .IsRequired()
                .HasMaxLength(100); // Set max length as needed

            builder.Property(fa => fa.AddressName)
                .IsRequired()
                .HasMaxLength(100); // Set max length as needed

            builder.Property(fa => fa.Address)
                .IsRequired()
                .HasMaxLength(255); // Set max length as needed

            builder.Property(d => d.CreatedAt)
                .IsRequired();

            builder.Property(d => d.IsDeleted)
                .IsRequired();

            // Indexes
            builder.HasIndex(fa => fa.UserId);
            builder.HasIndex(fa => new { fa.UserId, fa.AddressName })
                .IsUnique(); // Ensure the user can't have two favourite addresses with the same name
        }
    }
}
