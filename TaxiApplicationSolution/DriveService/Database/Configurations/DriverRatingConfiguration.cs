﻿using DriveService.Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DriveService.Database.Configurations
{
    public class DriverRatingConfiguration : IEntityTypeConfiguration<DriverRating>
    {
        public void Configure(EntityTypeBuilder<DriverRating> builder)
        {

            // Set the primary key
            builder.HasKey(dr => dr.Id);

            // Set properties
            builder.Property(dr => dr.Id)
                .IsRequired();

            builder.Property(dr => dr.UserId)
                .IsRequired();

            builder.Property(dr => dr.DriverId)
                .IsRequired();

            builder.Property(dr => dr.Rating)
                .IsRequired();

            builder.Property(dr => dr.CreatedAt)
                .IsRequired();

            builder.Property(dr => dr.IsDeleted)
                .IsRequired();
        }
    }
}
