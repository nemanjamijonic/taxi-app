namespace DriveService.Database.Models
{
    public class DriverRating
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid DriverId { get; set; }
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
