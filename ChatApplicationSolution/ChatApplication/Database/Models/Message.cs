using System;

namespace ChatApplication.Database.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string MessageContent { get; set; }
        public string UserType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
