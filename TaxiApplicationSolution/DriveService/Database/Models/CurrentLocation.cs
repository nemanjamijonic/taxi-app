namespace DriveService.Database.Models
{
    public class CurrentLocation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string CurrentAddress { get; set; }
    }
}
