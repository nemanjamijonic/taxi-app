namespace DriveService.Dto
{
    public class UpdateCurrentLocationDto
    {
        public Guid UserId { get; set; }
        public string CurrentAddress { get; set; }
    }
}
