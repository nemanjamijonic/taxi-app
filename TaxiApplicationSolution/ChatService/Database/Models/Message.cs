namespace ChatService.Database.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public DateTime SentAt { get; set; }
        public Guid ChatRoomId {get; set;}
        public string ChatRoomName { get; set;}
    }
}
