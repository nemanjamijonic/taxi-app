"use client";

import { useEffect, useState } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";

function Directions({
  address1,
  address2,
}: {
  address1: string;
  address2: string;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionService, setDirectionService] =
    useState<google.maps.DirectionsService>();
  const [directionsRendered, setDirectionsRendered] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (routesLibrary && map) {
      setDirectionService(new routesLibrary.DirectionsService());
      setDirectionsRendered(new routesLibrary.DirectionsRenderer({ map }));
    }
  }, [routesLibrary, map]);

  useEffect(() => {
    if (directionService && directionsRendered && address1 && address2) {
      directionService
        .route({
          origin: address1,
          destination: address2,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        })
        .then((response) => {
          directionsRendered.setDirections(response);
          setRoutes(response.routes);
        });
    }
  }, [directionService, directionsRendered, address1, address2]);

  useEffect(() => {
    if (directionsRendered) {
      console.log("Route index: " + routeIndex);
      localStorage.setItem("selectedRouteIndex", routeIndex.toString());
      directionsRendered.setRouteIndex(routeIndex);
    }
  }, [routeIndex, directionsRendered]);

  useEffect(() => {
    if (leg) {
      const distance = leg.distance?.value ?? 0;
      const duration = leg.duration?.value ?? 0;
      localStorage.setItem("driveDistance", distance.toString());
      localStorage.setItem("driveTime", duration.toString());
    }
  }, [leg]);

  const handleRouteSelection = (index: number) => {
    setRouteIndex(index);
    localStorage.setItem("selectedRouteIndex", index.toString());
  };

  if (!leg) return null;

  return (
    <div className="direction-container">
      <div className="direction-details">
        <h2 style={{ color: "#007bff" }}>
          <span> Route: </span>
          {selected.summary}
        </h2>
        <p>
          <b style={{ color: "#007bff" }}>Starting address:</b>{" "}
          {leg.start_address.split(",")[0]}
        </p>
        <p>
          <b style={{ color: "#007bff" }}>Destination address:</b>{" "}
          {leg.end_address.split(",")[0]}
        </p>
        <p>
          <b style={{ color: "#007bff" }}>Duration:</b> {leg.duration?.text}
        </p>
        <p>
          <b style={{ color: "#007bff" }}>Distance:</b> {leg.distance?.text}
        </p>
      </div>
      <h2 style={{ color: "#007bff" }}>Other routes:</h2>
      <ul className="route-list">
        {routes.map((route, index) => (
          <li key={route.summary} className="route-item">
            <button
              onClick={() => handleRouteSelection(index)}
              className="route-button"
            >
              {route.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Directions;
