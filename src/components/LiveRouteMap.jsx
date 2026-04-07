import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function LiveRouteMap({ shipments = [] }) {

    const delivered = shipments.filter(s =>
        (s.latest?.status || s.status) === "DELIVERED"
    );

    const bubbles = {};
    delivered.forEach(s => {
        // support all historical shapes
        const snapshot =
            s.latest?.latest ||
            s.latest ||
            {
                location: s.location,
                lat: s.lat,
                lng: s.lng,
                isValid: s.isValid
            };

        if (
            !snapshot ||
            !snapshot.location ||
            typeof snapshot.lat !== "number" ||
            typeof snapshot.lng !== "number"
        ) {
            return; // skip invalid point
        }

        const loc = snapshot.location;

        if (!bubbles[loc]) {
            bubbles[loc] = {
                city: loc,
                lat: snapshot.lat,
                lng: snapshot.lng,
                trips: 0,
                verified: 0,
                tampered: 0
            };
        }

        bubbles[loc].trips += 1;

        if (snapshot.isValid === true) {
            bubbles[loc].verified += 1;
        }

        if (snapshot.isValid === false) {
            bubbles[loc].tampered += 1;
        }
    });

    const points = Object.values(bubbles);

    if (!points.length) {
        return (
            <div style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: 14
            }}>
                No delivered locations yet
            </div>
        );
    }

    return (
        <MapContainer
            center={[points[0].lat, points[0].lng]}
            zoom={6}
            minZoom={6}
            maxZoom={10}
            scrollWheelZoom={false}
            style={{
                height: "100%",
                width: "100%",
                borderRadius: 12
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            {points.map((s, i) => (
                <CircleMarker
                    key={i}
                    center={[s.lat, s.lng]}
                    radius={8 + s.trips * 2}
                    pathOptions={{
                        color: s.tampered ? "#dc2626" : "#16a34a",
                        fillColor: s.tampered ? "#ef4444" : "#22c55e",
                        fillOpacity: 0.8
                    }}
                >
                    <Popup>
                        <strong>{s.city}</strong><br />
                        Trips: {s.trips}<br />
                        Verified: {s.verified}<br />
                        Tampered: {s.tampered}
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}