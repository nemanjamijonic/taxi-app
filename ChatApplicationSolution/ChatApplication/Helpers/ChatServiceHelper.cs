using System.Threading.Tasks;
using System;
using ChatApplication.Database;
using ChatApplication.Database.Models;
using System.Linq;

namespace ChatApplication.Helpers
{
    public class ChatServiceHelper
    {
        private readonly ChatDbContext _context;

        public ChatServiceHelper(ChatDbContext context)
        {
            _context = context;
        }

        public async Task<ChatRoom> CreateChatRoomAsync(Guid userId, string userUsername, Guid driverId, string driverUsername)
        {
            var chatRoom = new ChatRoom
            {
                Name = $"{userUsername}_{driverUsername}",
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                UserUsername = userUsername,
                DriverId = driverId,
                DriverUsername = driverUsername
            };

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            return chatRoom;
        }

        public async Task<Message> SaveMessageAsync(string chatRoomName, Guid userId, string userName, string content)
        {
            var chatRoom = _context.ChatRooms.Where(cr => cr.Name == chatRoomName).FirstOrDefault();

            var message = new Message
            {
                Content = content,
                UserId = userId,
                UserName = userName,
                ChatRoomId = chatRoom.Id,
                SentAt = DateTime.UtcNow,
                ChatRoomName = chatRoomName
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return message;
        }
    }
}
