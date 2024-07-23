namespace ChatService.Models
{
    public class UserConnection
    {
        public string UserName { get; set; } = string.Empty;
        public string ChatRoom { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string UserUsername { get; set; } = string.Empty;
        public Guid DriverId { get; set; }
        public string DriverUsername { get; set; } = string.Empty;
    }
}
