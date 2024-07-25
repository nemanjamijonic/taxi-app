using ChatApplication.Database;
using ChatApplication.Database.Models;
using ChatApplication.DataService;
using ChatApplication.Helpers;
using ChatApplication.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApplication.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;
        private readonly ChatDbContext _chatDbContext;

        public ChatHub(SharedDb sharedDb, ChatDbContext chatDbContext)
        {
            _sharedDb = sharedDb;
            _chatDbContext = chatDbContext;
        }

        public async Task JoinChat(UserConnection conn)
        {
            await Clients.All.SendAsync("ReceiveMessage", "admin", $"{conn.UserName} has joined.");
        }

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
            _sharedDb.Connections[Context.ConnectionId] = conn;
            var chatroom = _chatDbContext.ChatRooms.FirstOrDefault(cr => cr.Name == conn.ChatRoom);
            if (chatroom == null)
            {
                _chatDbContext.ChatRooms.Add(new ChatRoom()
                {
                    Name = conn.ChatRoom,
                    CreatedAt = DateTime.Now,
                    UserId = Guid.Parse("00000000-0000-0000-0000-000000000000"),
                    UserUsername = "Bilo sta samo da radi",
                    DriverId = Guid.Parse("00000000-0000-0000-0000-000000000000"),
                    DriverUsername = "Bilo sta samo da radi 2."
                });
            }
            await _chatDbContext.SaveChangesAsync();
            await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", "admin", $"{conn.UserName} has joined {conn.ChatRoom}");
        }


        public async Task SendMessage(string message)
        {
            if (_sharedDb.Connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", conn.UserName, message);
            }
        }

    }
}