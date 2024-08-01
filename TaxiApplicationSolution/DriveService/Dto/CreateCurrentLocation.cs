namespace DriveService.Dto
{
    public class CreateCurrentLocation
    {
        public Guid UserId { get; set; }
        public string CurrentAddress { get; set; }
    }
}
