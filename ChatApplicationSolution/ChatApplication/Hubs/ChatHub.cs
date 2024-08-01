using ChatApplication.Database;
using ChatApplication.Database.Models;
using ChatApplication.DataService;
using ChatApplication.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading;
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

        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            var messageContent = $"{conn.UserName} has joined {conn.ChatRoom}";

            // Use a lock to prevent multiple concurrent invocations for the same user and chat room
            var lockKey = $"{conn.UserName}_{conn.ChatRoom}";
            SemaphoreSlim semaphore = _sharedDb.Locks.GetOrAdd(lockKey, new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();

            try
            {
                // Check if the user is already connected
                bool userConnected = _sharedDb.Connections.Values.Any(c => c.UserName == conn.UserName && c.ChatRoom == conn.ChatRoom);

                if (!userConnected)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
                    _sharedDb.Connections[Context.ConnectionId] = conn;

                    var message = new ChatMessage
                    {
                        Username = "admin",
                        Msg = messageContent,
                        CreatedAt = DateTime.UtcNow.ToString("o"),
                        UserType = "System"
                    };

                    var msg = new Message
                    {
                        Username = "admin",
                        CreatedAt = DateTime.UtcNow.AddHours(2),
                        MessageContent = message.Msg,
                        UserType = "System"
                    };

                    await _chatDbContext.Messages.AddAsync(msg);
                    await _chatDbContext.SaveChangesAsync();

                    await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", message);
                }
                else
                {
                    var message = new ChatMessage
                    {
                        Username = "admin",
                        Msg = $"** {conn.UserName} ** has already joined this ChatRoom at {DateTime.UtcNow.AddHours(2).ToString("yyyy-MM-dd HH:mm:ss")}.",
                        CreatedAt = DateTime.UtcNow.AddHours(2).ToString("o"),
                        UserType = "System"
                    };

                    await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", message);

                    // Reactivate user connection
                    var existingConnection = _sharedDb.Connections.FirstOrDefault(c => c.Value.UserName == conn.UserName && c.Value.ChatRoom == conn.ChatRoom);
                    if (existingConnection.Value != null)
                    {
                        _sharedDb.Connections[Context.ConnectionId] = existingConnection.Value;
                        _sharedDb.Connections.TryRemove(existingConnection.Key, out _);
                        await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
                    }
                }
            }
            finally
            {
                semaphore.Release();
            }
        }

        public async Task SendMessage(ChatMessage message)
        {
            if (_sharedDb.Connections.TryGetValue(Context.ConnectionId, out UserConnection conn))
            {
                await Clients.Group(conn.ChatRoom).SendAsync("ReceiveSpecificMessage", message);

                var msg = new Message
                {
                    Username = message.Username,
                    CreatedAt = DateTime.UtcNow.AddHours(2),
                    MessageContent = message.Msg,
                    UserType = message.UserType
                };

                await _chatDbContext.Messages.AddAsync(msg);
                await _chatDbContext.SaveChangesAsync();
            }
        }
    }
}