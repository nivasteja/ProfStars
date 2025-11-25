// src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ universities }) => {
  const valid = universities.filter((u) => u.lat && u.lon);

  return (
    <div className="map-container">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "500px", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {valid.map((u, i) => (
          <Marker key={i} position={[u.lat, u.lon]}>
            <Popup>
              <b>{u.name}</b> <br />
              {u.country}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
