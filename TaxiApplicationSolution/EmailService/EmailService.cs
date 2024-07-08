using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Fabric;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Common.Interfaces;
using Common.Models;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;

namespace EmailService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class EmailService : StatelessService, IEmailInterface
    {
        public EmailService(StatelessServiceContext context)
            : base(context)
        { }

        public async Task<bool> DriverVerificationEmail(EmailInfo emailInfo)
        {
            try
            {
                string smtpServer = "smtp.gmail.com";
                int port = 587;

                // Adresa i lozinka za autentifikaciju na SMTP serveru
                string smtpUsername = "forumdrs2023@gmail.com";
                string smtpPassword = "wtez cskt ddtm uqbx";
                string fromEmail = "forumdrs2023@gmail.com";
                string subject = "Driver Account Has Been Verified For User";

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
                string smtpServer = "smtp.gmail.com";
                int port = 587;

                // Adresa i lozinka za autentifikaciju na SMTP serveru
                string smtpUsername = "forumdrs2023@gmail.com";
                string smtpPassword = "wtez cskt ddtm uqbx";
                string fromEmail = "forumdrs2023@gmail.com";
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


        /// <summary>
        /// Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        /// <summary>
        /// This is the main entry point for your service instance.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service instance.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

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
