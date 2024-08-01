"use client";

import { useEffect, useState } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";

function DashboardDirections({
  address1,
  address2,
  routeIndex,
}: {
  address1: string;
  address2: string;
  routeIndex: number;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionService, setDirectionService] =
    useState<google.maps.DirectionsService>();
  const [directionsRendered, setDirectionsRendered] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [marker, setMarker] = useState<google.maps.Marker>();
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (routesLibrary && map) {
      setDirectionService(new routesLibrary.DirectionsService());
      setDirectionsRendered(new routesLibrary.DirectionsRenderer({ map }));
      setMarker(new google.maps.Marker({ map, label: "Driver" }));
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
          console.log("Full response: ", response);
          console.log("Routes: ", response.routes);
          response.routes.forEach((route, index) => {
            console.log(`Route ${index}:`, route);
            route.legs.forEach((leg, legIndex) => {
              console.log(`  Leg ${legIndex}:`, leg);
            });
          });
          directionsRendered.setDirections(response);
          setRoutes(response.routes);
        });
    }
  }, [directionService, directionsRendered, address1, address2]);

  useEffect(() => {
    if (directionsRendered && routes.length > 0) {
      console.log("Route index: " + routeIndex);
      localStorage.setItem("selectedRouteIndex", routeIndex.toString());
      directionsRendered.setRouteIndex(routeIndex);
    }
  }, [routeIndex, directionsRendered, routes.length]);

  useEffect(() => {
    if (leg && marker) {
      const steps = leg.steps;
      let currentStepIndex = 0;
      let currentStep = steps[currentStepIndex];
      let currentPoint = currentStep.start_location;
      let nextPoint = currentStep.end_location;
      let distanceTraveled = 0;
      const segmentLength = 200; // Length of each segment in meters
      let intervalId: number;

      const haversineDistance = (
        point1: google.maps.LatLng,
        point2: google.maps.LatLng
      ): number => {
        const toRad = (value: number): number => (value * Math.PI) / 180;
        const R = 6371e3; // Earth radius in meters
        const lat1 = toRad(point1.lat());
        const lat2 = toRad(point2.lat());
        const deltaLat = toRad(point2.lat() - point1.lat());
        const deltaLng = toRad(point2.lng() - point1.lng());

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      const interpolate = (
        point1: google.maps.LatLng,
        point2: google.maps.LatLng,
        fraction: number
      ): google.maps.LatLng => {
        const lat = point1.lat() + fraction * (point2.lat() - point1.lat());
        const lng = point1.lng() + fraction * (point2.lng() - point1.lng());
        return new google.maps.LatLng(lat, lng);
      };

      const moveMarker = () => {
        const stepDistance = haversineDistance(currentPoint, nextPoint);

        if (distanceTraveled + segmentLength >= stepDistance) {
          marker.setPosition(nextPoint);
          distanceTraveled = 0;
          currentStepIndex++;

          if (currentStepIndex < steps.length) {
            currentStep = steps[currentStepIndex];
            currentPoint = currentStep.start_location;
            nextPoint = currentStep.end_location;
          } else {
            clearInterval(intervalId);
          }
        } else {
          const fraction = segmentLength / stepDistance;
          currentPoint = interpolate(currentPoint, nextPoint, fraction);
          marker.setPosition(currentPoint);
          distanceTraveled += segmentLength;
        }
      };

      intervalId = window.setInterval(moveMarker, 1000);

      return () => clearInterval(intervalId);
    }
  }, [leg, marker]);

  useEffect(() => {
    if (leg) {
      const distance = leg.distance?.value ?? 0;
      const duration = leg.duration?.value ?? 0;
      localStorage.setItem("driveDistance", distance.toString());
      localStorage.setItem("driveTime", duration.toString());
    }
  }, [leg]);

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
    </div>
  );
}

export default DashboardDirections;
