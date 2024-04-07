import { api } from "@/server/api";
import { CheckinProps } from "@/store/checkin-store";

export const checkCheckinStatus = async (value: any) => {
    try {
        const response = await await api.get(`/attendees/${value}/check-in`)

        if (response.status == 200 && response.data) {
            return response.data
        } else {
            return null
        }

    } catch (error) {
        console.error("Error checking check-in status:", error);
        throw error;
    }
}