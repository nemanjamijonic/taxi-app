namespace DriveService.Dto
{
    public class CreateDriveDto
    {
        public string StartingAddress { get; set; }
        public string EndingAddress { get; set; }
        public string UserUsername { get; set; }
        public double Distance { get; set; }
        public int RouteIndex { get; set; }
        public int DriveTime { get; set; }
    }
}
