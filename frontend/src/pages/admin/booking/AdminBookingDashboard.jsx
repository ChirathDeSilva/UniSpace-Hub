import { useEffect, useState } from "react";
import {
    getBookings,
    approveBooking,
    rejectBooking
} from "../services/bookingService";

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = () => {
        getBookings()
            .then((res) => setBookings(res.data))
            .catch((err) => console.log(err));
    };

    const handleApprove = (id) => {
        if (!window.confirm("Approve this booking?")) return;

        approveBooking(id)
            .then(() => {
                alert("Booking approved");
                loadBookings();
            })
            .catch((err) => console.log(err));
    };

    const handleReject = (id) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        rejectBooking(id, reason)
            .then(() => {
                alert("Booking rejected");
                loadBookings();
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
            <h2>Admin Dashboard</h2>

            <table border="1" width="100%" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Purpose</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.purpose}</td>
                            <td>{b.date}</td>
                            <td>{b.startTime} - {b.endTime}</td>

                            <td
                                style={{
                                    color: getStatusColor(b.status),
                                    fontWeight: "bold"
                                }}
                            >
                                {b.status}
                            </td>

                            <td>
                                <button
                                    onClick={() => handleApprove(b.id)}
                                    disabled={b.status !== "PENDING"}
                                    style={{ marginRight: "10px" }}
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => handleReject(b.id)}
                                    disabled={b.status !== "PENDING"}
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}