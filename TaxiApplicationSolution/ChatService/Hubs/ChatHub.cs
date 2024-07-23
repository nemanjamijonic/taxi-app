using ChatService.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ChatService.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;
        private readonly ChatServiceHelper _chatService;

        public ChatHub(SharedDb sharedDb, ChatServiceHelper chatService)
        {
            _sharedDb = sharedDb;
            _chatService = chatService;
        }

        public async Task JoinChat(UserConnection conn)
        {
            await Clients.All.SendAsync("ReceiveMessage", "admin", $"{conn.UserName} has joined.");
        }

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);

            _sharedDb.Connections[Context.ConnectionId] = conn;

            await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", "admin", $"{conn.UserName} has joined {conn.ChatRoom}");
        }

        public async Task SendMessage(string message)
        {
            if (_sharedDb.Connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await _chatService.SaveMessageAsync(conn.ChatRoom, conn.UserId, conn.UserName, message);
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", conn.UserName, message);
            }
        }
    }
}
