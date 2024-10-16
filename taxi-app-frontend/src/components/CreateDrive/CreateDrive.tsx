"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import Navbar from "../Navbar/Navbar"; // Adjust the import path as necessary
import "./CreateDrive.css"; // Add any necessary styles for the component
import Directions from "../Directions/Directions";

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? "";
const mapId = process.env.REACT_APP_GOOGLE_MAPS_ID ?? "";

const formatAddress = (address: string) => {
  return address
    .replace(/ć/g, "c")
    .replace(/č/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj");
};

interface JwtPayload {
  nameid: string;
  unique_name: string;
  email: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

interface Driver {
  id: string;
  username: string;
  address: string;
  lat: number;
  lng: number;
}

interface FavouriteAddress {
  id: string;
  addressName: string;
  address: string;
}

const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    if (response.data.status !== "OK") {
      console.error("Geocoding API error:", response.data.status);
      return null;
    }

    const results = response.data.results;

    if (results.length > 0) {
      const location = results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

export default function CreateDrive() {
  const [position1, setPosition1] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [position2, setPosition2] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(9);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const autocomplete1Ref = useRef<google.maps.places.Autocomplete | null>(null);
  const autocomplete2Ref = useRef<google.maps.places.Autocomplete | null>(null);
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const position = { lat: 45.254, lng: 19.852 };
  const [favouriteAddresses, setFavouriteAddresses] = useState<
    FavouriteAddress[]
  >([]);
  const [filteredFavAddresses1, setFilteredFavAddresses1] = useState<
    FavouriteAddress[]
  >([]);
  const [filteredFavAddresses2, setFilteredFavAddresses2] = useState<
    FavouriteAddress[]
  >([]);

  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("User not authenticated");
      navigate("/login");
      setLoading(false);
      return;
    }

    const decodedToken: JwtPayload = jwtDecode(token);
    if (decodedToken.role !== "User") {
      navigate("/dashboard");
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = response.data;
      const userId = decodedToken.nameid;
      setUsername(userData.username);
      setUserType(userData.userType);
      setUserImage(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
      );
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data. Please try again later.");
      setLoading(false); // Set loading to false even if there is an error
    }
  }, [navigate]);

  const fetchDrivers = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const driversData: Driver[] = response.data;

      // Geocode addresses
      for (const driver of driversData) {
        const coords = await geocodeAddress(driver.address);
        if (coords) {
          driver.lat = coords.lat;
          driver.lng = coords.lng;
        }
      }

      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to fetch drivers. Please try again later.");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchDrivers();
  }, [fetchUserData, fetchDrivers]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const decodedToken: JwtPayload = jwtDecode(token);
      fetchFavouriteAddresses(decodedToken.nameid, token);
    }
  }, []);

  const fetchFavouriteAddresses = async (userId: string, token: string) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_FAV_ADDR_API}/user-fav-addresses/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFavouriteAddresses(response.data);
    } catch (error) {
      setError("Failed to fetch favourite addresses. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
  };

  const onPlaceChanged = (
    autocompleteRef: React.MutableRefObject<google.maps.places.Autocomplete | null>,
    setPosition: React.Dispatch<
      React.SetStateAction<{ lat: number; lng: number } | null>
    >,
    setAddress: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      const lat =
        typeof location.lat === "function" ? location.lat() : location.lat;
      const lng =
        typeof location.lng === "function" ? location.lng() : location.lng;
      setPosition({ lat: lat as number, lng: lng as number });

      const formattedAddress = formatAddress(place.formatted_address ?? "");
      setAddress(formattedAddress);
    }
  };

  const handleCreateDrive = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setError("User not authenticated");
        navigate("/login");
        return;
      }

      const decodedToken: JwtPayload = jwtDecode(token);
      const username = decodedToken.unique_name;

      // Čitanje podataka iz lokalnog skladišta
      const driveDistance = localStorage.getItem("driveDistance");
      const driveTime = localStorage.getItem("driveTime");
      const routeIndex = localStorage.getItem("selectedRouteIndex");

      if (!driveDistance || !driveTime || !routeIndex) {
        setError("Drive data not available");
        return;
      }

      // Pretvaranje vrednosti u brojeve
      const driveDistanceValue = parseFloat(driveDistance);
      const driveTimeValue = parseFloat(driveTime);
      const routeIndexValue = parseInt(routeIndex);

      // Brisanje podataka iz lokalnog skladišta
      localStorage.removeItem("driveDistance");
      localStorage.removeItem("driveTime");
      localStorage.removeItem("selectedRouteIndex");

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL_DRIVE_API}/drive`,
        {
          UserUsername: username,
          StartingAddress: address1,
          EndingAddress: address2,
          distance: driveDistanceValue,
          DriveTime: driveTimeValue,
          routeIndex: routeIndexValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const driveData = response.data;
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error creating drive:", error);
      setError("Failed to create drive. Please try again later.");
    }
  };

  const handleAddress1Change = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value;
    setAddress1(input);
    if (input.length > 2) {
      setFilteredFavAddresses1(
        favouriteAddresses.filter((favAddr) =>
          favAddr.addressName.toLowerCase().includes(input.toLowerCase())
        )
      );
    } else {
      setFilteredFavAddresses1([]);
    }
  };

  const handleAddress2Change = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value;
    setAddress2(input);
    if (input.length > 2) {
      setFilteredFavAddresses2(
        favouriteAddresses.filter((favAddr) =>
          favAddr.addressName.toLowerCase().includes(input.toLowerCase())
        )
      );
    } else {
      setFilteredFavAddresses2([]);
    }
  };

  const handleFavAddressSelect1 = async (address: FavouriteAddress) => {
    setAddress1(address.address);
    setFilteredFavAddresses1([]);

    const coords = await geocodeAddress(address.address);
    if (coords) {
      setPosition1({ lat: coords.lat, lng: coords.lng });
    }
  };

  const handleFavAddressSelect2 = async (address: FavouriteAddress) => {
    setAddress2(address.address);
    setFilteredFavAddresses2([]);

    const coords = await geocodeAddress(address.address);
    if (coords) {
      setPosition2({ lat: coords.lat, lng: coords.lng });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  console.log("Favourite addresses: " + favouriteAddresses);

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="maps-div">
        <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
          <div className="input-container">
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocomplete1Ref.current = autocomplete)
              }
              onPlaceChanged={() =>
                onPlaceChanged(autocomplete1Ref, setPosition1, setAddress1)
              }
            >
              <input
                type="text"
                placeholder="Enter starting address"
                value={address1}
                onChange={handleAddress1Change}
              />
            </Autocomplete>
            {filteredFavAddresses1.length > 0 && (
              <ul className="fav-address-list">
                {filteredFavAddresses1.map((favAddr) => (
                  <li
                    key={favAddr.id}
                    onClick={() => handleFavAddressSelect1(favAddr)}
                  >
                    {favAddr.addressName} - {favAddr.address}
                  </li>
                ))}
              </ul>
            )}
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocomplete2Ref.current = autocomplete)
              }
              onPlaceChanged={() =>
                onPlaceChanged(autocomplete2Ref, setPosition2, setAddress2)
              }
            >
              <input
                type="text"
                placeholder="Enter destination address"
                value={address2}
                onChange={handleAddress2Change}
              />
            </Autocomplete>
            {filteredFavAddresses2.length > 0 && (
              <ul className="fav-address-list">
                {filteredFavAddresses2.map((favAddr) => (
                  <li
                    key={favAddr.id}
                    onClick={() => handleFavAddressSelect2(favAddr)}
                  >
                    {favAddr.addressName} - {favAddr.address}
                  </li>
                ))}
              </ul>
            )}
            <button className="create-drive-button" onClick={handleCreateDrive}>
              Create Drive
            </button>
          </div>
          <br />
          <APIProvider apiKey={apiKey}>
            <Map
              mapId={mapId}
              zoom={13.5}
              zoomControl={true}
              center={position}
              fullscreenControl={false}
            >
              {drivers.map((driver) => (
                <Marker
                  key={driver.id}
                  position={{ lat: driver.lat, lng: driver.lng }}
                  onClick={() => setSelectedDriver(driver)}
                ></Marker>
              ))}
              {selectedDriver && (
                <InfoWindow
                  position={{
                    lat: selectedDriver.lat,
                    lng: selectedDriver.lng,
                  }}
                  onCloseClick={() => setSelectedDriver(null)}
                >
                  <div>
                    <h3 style={{ color: "red" }}>
                      Driver Username: {selectedDriver.username}
                    </h3>
                    <p style={{ color: "red" }}>
                      Driver Address: {selectedDriver.address}
                    </p>
                  </div>
                </InfoWindow>
              )}
              {position1 && <AdvancedMarker position={position1} />}
              {position2 && <AdvancedMarker position={position2} />}

              <Directions address1={address1} address2={address2}></Directions>
            </Map>
          </APIProvider>
        </LoadScript>
      </div>
    </div>
  );
}
