using System;

namespace ChatApplication.Database.Models
{
    public class ChatRoom
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid UserId { get; set; }
        public string UserUsername { get; set; }
        public Guid DriverId { get; set; }
        public string DriverUsername { get; set; }
    }
}
