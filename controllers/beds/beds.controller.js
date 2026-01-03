import Bed from "../../models/bed.model.js";

export const initializeBeds = async () => {
    try {
        const bedCount = await Bed.countDocuments();
        
        if (bedCount === 0) {
            const beds = [];
            for (let i = 1; i <= 10; i++) {
                beds.push({
                    bedNumber: i,
                    diseaseCategory: "General", 
                    bedType: i <= 3 ? "critical" : "normal",
                    isOccupied: false
                });
            }
            await Bed.insertMany(beds);
        }
    } catch (error) {
        console.error("❌ Bed initialization failed:", error);
    }
};