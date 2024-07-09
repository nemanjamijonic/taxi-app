# TaxiApp

TaxiApp is a microservices-based taxi application built using Microsoft Service Fabric. This project includes multiple services that communicate with each other using Microsoft.ServiceFabric.Services.Remoting. The application is developed in .NET Core and uses EntityFramework for database management.

## Contents

- [Project Description](#project-description)
- [Services](#services)
- [Technologies](#technologies)
- [Installation](#installation)

## Project Description

TaxiApp is designed to manage taxi bookings with different user roles: Admin, User, and Driver. The application provides functionalities for user registration, ride creation and tracking, and driver verification.

## Services

### Web Stateless Service

- **UserService**: Handles user interface interactions, including login and register.
- **DriveService**: Handles creation of new Taxi Drive, Drivers Rating...

### Stateless Service

- **EmailService**: Sends E-mail after registration and driver verification.

### Stateful Service

- **DriveCalculation**: Estimates drive price and time for specific drive.

## Technologies

- .NET Core
- Microsoft Service Fabric
- Microsoft.ServiceFabric.Services.Remoting
- EntityFramework Core
- SQL Server

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/M1jonicN/TaxiApp.git
   cd TaxiApp

   ```

2. Backend Application

   - Open Visual Studio 2022 in Adminitrator mode. Select Open Project or Solution.
   - Find TaxiApplicationSolution.sln file. You can find this file on this route: location-where-you-cloned-repo/TaxiApp/TaxiApplicationSolution/TaxiApplicationSolution.sln.

3. Frontend Application

   - Frontned Application is App developed using React.js
   - Make sure you have Node.js installed on your computer.
   - Position to this folder in Terminal: location-where-you-cloned-repo/TaxiApp/taxi-app-frontend
   - You can use cmd (Command Prompt) or Terminal integrated in Visual Studio Code.
   - Run next commands:

   ```bash
   npm install
   npm start

   ```
