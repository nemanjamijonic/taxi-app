using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Common.Interfaces
{
    public interface ICalculationInterface : IService
    {
        Task<double> EstimateTime();
        Task<double> EstimatePrice();
    }
}
