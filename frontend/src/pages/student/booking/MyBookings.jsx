import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../services/bookingService";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);

    // temporary hardcoded user
    const userId = 1;

    useEffect(() => {
        loadMyBookings();
    }, []);

    const loadMyBookings = () => {
        getMyBookings(userId)
            .then((res) => setBookings(res.data))
            .catch((err) => console.log(err));
    };

    const handleCancel = (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        cancelBooking(id)
            .then(() => {
                alert("Booking cancelled successfully");
                loadMyBookings();
            })
            .catch((err) => console.log(err));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "APPROVED":
                return "green";
            case "PENDING":
                return "orange";
            case "REJECTED":
                return "red";
            case "CANCELLED":
                return "gray";
            default:
                return "black";
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Bookings</h2>

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                bookings.map((b) => (
                    <div
                        key={b.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "8px"
                        }}
                    >
                        <p><b>Purpose:</b> {b.purpose}</p>
                        <p><b>Date:</b> {b.date}</p>
                        <p><b>Time:</b> {b.startTime} - {b.endTime}</p>

                        <p>
                            <b>Status:</b>{" "}
                            <span
                                style={{
                                    color: getStatusColor(b.status),
                                    fontWeight: "bold"
                                }}
                            >
                                {b.status}
                            </span>
                        </p>

                        {(b.status === "PENDING" || b.status === "APPROVED") && (
                            <button onClick={() => handleCancel(b.id)}>
                                Cancel Booking
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}