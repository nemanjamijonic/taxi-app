namespace DriveService.Dto
{
    public class CreateRatingDto
    {
        public Guid DriveId { get; set; }
        public int Rating { get; set; }
    }
}
