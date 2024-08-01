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
        public ChatHub(SharedDb sharedDb, ChatDbContext chatDbContext)
        {
            _sharedDb = sharedDb;
        }

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
            _sharedDb.Connections[Context.ConnectionId] = conn;

            var message = new ChatMessage
            {
                Username = "admin",
                Msg = $"{conn.UserName} has joined {conn.ChatRoom}",
                CreatedAt = DateTime.UtcNow.ToString("o"),
                UserType = "System"
            };

            await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", message);
        }



        public async Task SendMessage(ChatMessage message)
        {
            if (_sharedDb.Connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", message);
            }
        }



    }
}
