using ChatApplication.Models;
using System.Collections.Concurrent;
using System.Threading;

namespace ChatApplication.DataService
{
    public class SharedDb
    {
        private readonly ConcurrentDictionary<string, UserConnection> _connections = new ConcurrentDictionary<string, UserConnection>();
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new ConcurrentDictionary<string, SemaphoreSlim>();

        public ConcurrentDictionary<string, UserConnection> Connections => _connections;
        public ConcurrentDictionary<string, SemaphoreSlim> Locks => _locks;
    }
}
