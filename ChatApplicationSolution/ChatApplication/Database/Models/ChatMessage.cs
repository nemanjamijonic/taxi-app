namespace ChatApplication.Database.Models
{
    public class ChatMessage
    {
        public string Username { get; set; }
        public string Msg { get; set; }
        public string CreatedAt { get; set; }
        public string UserType { get; set; }
    }
}
