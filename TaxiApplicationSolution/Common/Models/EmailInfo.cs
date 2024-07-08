using System;
using System.Collections.Generic;
using System.Text;

namespace Common.Models
{
    public class EmailInfo
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserType { get; set; }

    }
}
