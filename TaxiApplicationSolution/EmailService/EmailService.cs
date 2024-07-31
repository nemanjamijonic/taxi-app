using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Common.Interfaces;
using Common.Models;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace EmailService
{
    internal sealed class EmailService : StatelessService, IEmailInterface
    {
        private string smtpServer;
        private int port;
        private string smtpUsername;
        private string smtpPassword;
        private string fromEmail;

        public EmailService(StatelessServiceContext context)
            : base(context)
        {
            LoadConfiguration(context);
        }

        private void LoadConfiguration(StatelessServiceContext context)
        {
            var configPackage = context.CodePackageActivationContext.GetConfigurationPackageObject("Config");
            var emailSettings = configPackage.Settings.Sections["EmailServiceSettings"];

            smtpServer = emailSettings.Parameters["SmtpServer"].Value;
            port = int.Parse(emailSettings.Parameters["Port"].Value);
            smtpUsername = emailSettings.Parameters["SmtpUsername"].Value;
            smtpPassword = emailSettings.Parameters["SmtpPassword"].Value;
            fromEmail = emailSettings.Parameters["FromEmail"].Value;
        }

        public async Task<bool> DriverRejectionEmail(EmailInfo emailInfo)
        {
            try
            {
                string subject = $"Driver Account Has Been Rejected For User: {emailInfo.Username}";

                string htmlContent = $@"
                <html>
                <body>
                    <h1>Account Rejected : {emailInfo.Id}</h1>
                    <p>Dear {emailInfo.FirstName} {emailInfo.LastName},</p>
                    <p>We are sorry to inform you that your driver account has been rejected.</p>
                    <p>You can now access our system but can't use all functionalities of application.</p>
                    <p>Best regards,<br/>Taxi Service Team</p>
                </body>
                </html>";

                string plainTextContent = $@"
                Account Rejected: {emailInfo.Id}.
                Dear {emailInfo.FirstName} {emailInfo.LastName},
                We are sorry to inform you that your driver account has been rejected.
                You can now access our system but can't use all functionalities of application.
                Best regards,
                Taxi Service Team";

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailInfo.Email))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DriverVerificationEmail(EmailInfo emailInfo)
        {
            try
            {
                string subject = $"Driver Account Has Been Verified For User {emailInfo.Username}";

                string htmlContent = $@"
                <html>
                <body>
                    <h1>Account Verified : {emailInfo.Id}</h1>
                    <p>Dear {emailInfo.FirstName} {emailInfo.LastName},</p>
                    <p>We are pleased to inform you that your driver account has been verified successfully.</p>
                    <p>You can now access all driver functionalities in our system.</p>
                    <p>Best regards,<br/>Taxi Service Team</p>
                </body>
                </html>";

                string plainTextContent = $@"
                Account Verified
                Dear {emailInfo.FirstName} {emailInfo.LastName},
                We are pleased to inform you that your driver account has been verified successfully.
                You can now access all driver functionalities in our system.
                Best regards,
                Taxi Service Team";

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailInfo.Email))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> UserRegistrationEmail(EmailInfo emailInfo)
        {
            try
            {
                string subject = "Your Account Has Been Successfully Registered";

                string htmlContent = $@"
                    <html>
                    <body>
                        <h1>Account created. User ID: {emailInfo.Id}</h1>
                        <p>Dear <b>{emailInfo.FirstName} {emailInfo.LastName}</b>,</p>
                        <p>You have been successfully registered as {emailInfo.UserType}.</p>
                        <p>Your username: <b>{emailInfo.Username}</b></p>
                        <p>You can now access all functionalities in our system.</p>
                        <p>Best regards,<br/><b>Taxi Service Team</b></p>
                        <br />
                        <br />
                        <p>Email sent by <b>EmailService</b></p>
                    </body>
                    </html>";

                string plainTextContent = $@"
                    Account created. User ID: {emailInfo.Id}
                    Dear {emailInfo.FirstName} {emailInfo.LastName},
                    You have been successfully registered as {emailInfo.UserType}.
                    Your username: {emailInfo.Username}
                    You can now access all functionalities in our system.
                    Best regards, Taxi Service Team
                    Email sent by EmailService";

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailInfo.Email))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DriverBlockingEmail(EmailInfo emailInfo)
        {
            try
            {
                string subject = "Your Account Has Been Blocked By Admin";

                string htmlContent = $@"
                    <html>
                    <body>
                        <h1>Account blocked. Driver ID: {emailInfo.Id}</h1>
                        <p>Dear <b>{emailInfo.FirstName} {emailInfo.LastName}</b>,</p>
                        <p>You have been blocked by admin, becouse of bad reviews of your drives.</p>
                        <p>Your username: <b>{emailInfo.Username}</b></p>
                        <p>You can now access our system, but cant take new drives.</p>
                        <p>Best regards,<br/><b>Taxi Service Team</b></p>
                        <br />
                        <br />
                        <p>Email sent by <b>EmailService</b></p>
                    </body>
                    </html>";

                string plainTextContent = $@"
                    Account blocked. Driver ID: {emailInfo.Id}
                    Dear {emailInfo.FirstName} {emailInfo.LastName},
                    You have been blocked by admin, becouse of bad reviews of your drives.
                    Your username: {emailInfo.Username}
                    You can now access our system, but cant take new drives.
                    Best regards, Taxi Service Team
                    Email sent by EmailService";

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailInfo.Email))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message}");
                return false;
            }
        }


        public async Task<bool> DriverUnblockingEmail(EmailInfo emailInfo)
        {
            try
            {
                string subject = "Your Account Has Been Unblocked By Admin";

                string htmlContent = $@"
                    <html>
                    <body>
                        <h1>Account unblocked. Driver ID: {emailInfo.Id}</h1>
                        <p>Dear <b>{emailInfo.FirstName} {emailInfo.LastName}</b>,</p>
                        <p>You have been unblocked by admin.</p>
                        <p>Your username: <b>{emailInfo.Username}</b></p>
                        <p>You can now access our system.</p>
                        <p>Best regards,<br/><b>Taxi Service Team</b></p>
                        <br />
                        <br />
                        <p>Email sent by <b>EmailService</b></p>
                    </body>
                    </html>";

                string plainTextContent = $@"
                    Account unblocked. Driver ID: {emailInfo.Id}
                    Dear {emailInfo.FirstName} {emailInfo.LastName},
                    You have been blocked by admin.
                    Your username: {emailInfo.Username}
                    You can now access our system.
                    Best regards, Taxi Service Team
                    Email sent by EmailService";

                using (var client = new SmtpClient(smtpServer, port))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    using (var message = new MailMessage(fromEmail, emailInfo.Email))
                    {
                        message.Subject = subject;
                        message.IsBodyHtml = true;
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainTextContent, null, "text/plain"));
                        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlContent, null, "text/html"));

                        await client.SendMailAsync(message);
                        Trace.TraceInformation("Email sent successfully.");
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Trace.TraceError($"Error while sending mail: {ex.Message}");
                return false;
            }
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ServiceEventSource.Current.ServiceMessage(this.Context, "Working-{0}", ++iterations);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }

    }
}
