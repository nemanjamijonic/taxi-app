namespace ChatService.Database.Models
{
    public class ChatRoom
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string CreatedAt { get; set; }
        public Guid UserId { get; set; }
        public string UserUsername { get; set; }
        public Guid DriverId { get; set; }
        public string DriverUsername { get; set; }
    }
}
