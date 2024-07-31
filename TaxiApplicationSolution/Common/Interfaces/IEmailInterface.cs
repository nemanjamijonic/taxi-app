using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface IEmailInterface : IService
    {
        Task<bool> UserRegistrationEmail(EmailInfo emailInfo);
        Task<bool> DriverVerificationEmail(EmailInfo emailInfo);
        Task<bool> DriverRejectionEmail(EmailInfo emailInfo);
        Task<bool> DriverBlockingEmail(EmailInfo emailInfo);
        Task<bool> DriverUnblockingEmail(EmailInfo emailInfo);
    }
}
