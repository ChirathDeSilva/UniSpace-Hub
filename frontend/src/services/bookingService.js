import api from "../api/axiosConfig";

export const getBookings = () => {
    return api.get("/bookings");
};

export const createBooking = (data) => {
    return api.post("/bookings", data);
};