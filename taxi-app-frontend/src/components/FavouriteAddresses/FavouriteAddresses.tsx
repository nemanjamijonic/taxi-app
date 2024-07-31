import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../Navbar/Navbar";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import "./FavouriteAddresses.css";

interface DecodedToken {
  nameid: string;
  role: string;
}

interface FavouriteAddress {
  id: string;
  addressName: string;
  address: string;
}

const FavouriteAddresses: React.FC = () => {
  const [addressName, setAddressName] = useState("");
  const [username, setUsername] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userType, setUserType] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [favouriteAddresses, setFavouriteAddresses] = useState<
    FavouriteAddress[]
  >([]);
  const [editMode, setEditMode] = useState<{
    id: string;
    addressName: string;
    address: string;
  } | null>(null);
  const navigate = useNavigate();
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const userId = decodedToken.nameid;
      setUserImage(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/get-image/${userId}`
      );
      fetchUserData(token);
      fetchFavouriteAddresses(userId, token);
    } else {
      navigate("/login");
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const userResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL_USER_API}/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = userResponse.data;
      setUsername(userData.username);
      setUserType(userData.userType);
    } catch (error) {
      setError("Failed to fetch user data. Please try again.");
    }
  };

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
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken: DecodedToken = jwtDecode(token);
      const userId = decodedToken.nameid;
      const role = decodedToken.role;

      if (role !== "User") {
        navigate("/dashboard");
      }

      const userUsername = username;

      if (editMode) {
        // Update address
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL_FAV_ADDR_API}/${editMode.id}`,
          { id: editMode.id, address },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 204) {
          setSuccess("Address updated successfully!");
          setEditMode(null);
          setAddressName("");
          setAddress("");
          fetchFavouriteAddresses(userId, token); // Refresh the list after updating an address
        }
      } else {
        // Add new address
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL_FAV_ADDR_API}`,
          { addressName, userUsername, userId, address },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          setSuccess("Address added successfully!");
          setAddressName("");
          setAddress("");
          fetchFavouriteAddresses(userId, token); // Refresh the list after adding a new address
        }
      }
    } catch (error) {
      setError("Failed to add or update address. Please try again.");
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setAddress(place.formatted_address);
      }
    }
  };

  const handleEdit = (favAddress: FavouriteAddress) => {
    setEditMode(favAddress);
    setAddressName(favAddress.addressName);
    setAddress(favAddress.address);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL_FAV_ADDR_API}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setSuccess("Address deleted successfully!");
        const decodedToken: DecodedToken = jwtDecode(token);
        const userId = decodedToken.nameid;
        fetchFavouriteAddresses(userId, token); // Refresh the list after deleting an address
        setAddressName("");
      }
    } catch (error) {
      setError("Failed to delete address. Please try again.");
    }
  };

  return (
    <div>
      <Navbar
        username={username}
        userType={userType}
        userImage={userImage}
        onLogout={handleLogout}
      />
      <div className="favourite-addresses-container">
        <h2 style={{ color: "#0056b3" }}>
          {editMode ? "Edit Favourite Address" : "Add Favourite Address"}
        </h2>
        <form className="favourite-addresses-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="addressName">Address Name:</label>
            <input
              type="text"
              id="addressName"
              className="favourite-addresses-input"
              placeholder="Enter Address Name"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <LoadScript
              googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
              libraries={["places"]}
            >
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  id="address"
                  className="favourite-addresses-input"
                  ref={addressInputRef}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Autocomplete>
            </LoadScript>
          </div>
          <button type="submit">
            {editMode ? "Update Address" : "Add Address"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <h3>Your Favourite Addresses</h3>
        <table className="address-table">
          <thead>
            <tr style={{ color: "#0056b3" }}>
              <th>Address Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {favouriteAddresses.map((favAddress) => (
              <tr key={favAddress.id}>
                <td>{favAddress.addressName}</td>
                <td>{favAddress.address}</td>
                <td>
                  <button onClick={() => handleEdit(favAddress)}>Edit</button>
                  <button onClick={() => handleDelete(favAddress.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FavouriteAddresses;
