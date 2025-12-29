import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    // 1. Token nikalna (Cookies ya Authorization Header se)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json(
            new ApiResponse(401, null, "Unauthorized: No token provided")
        );
    }

    // 2. Token decode aur verify karna
    // Note: Agar token invalid hoga toh jwt.verify error throw karega jo asyncHandler handle kar lega
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Role check karna
    if (decodedToken?.role !== "admin") {
        return res.status(403).json(
            new ApiResponse(403, null, "Forbidden: Only Admin can access this route")
        );
    }

    // 4. Request object mein save karna
    req.user = decodedToken;
    
    // Agle middleware ya controller par bhejna
    next();
});