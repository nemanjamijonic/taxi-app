using System;
using System.Collections.Generic;
using System.Text;

namespace Common.Enums
{
    public enum DriveState
    {
        UserOrderedDrive,
        DriverEstimatingTimeAndCost,
        DriverCreatedOffer,
        UserAceptedDrive,
        UserDeclinedDrive,
        DriveCompleted
    }
}
