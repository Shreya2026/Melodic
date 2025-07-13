import { clerkClient } from "@clerk/express";

export const protectRoute = (req, res, next) => {
    console.log("=== PROTECT ROUTE DEBUG ===");
    console.log("protectRoute - checking auth...");
    console.log("req.auth:", req.auth);
    console.log("req.headers.authorization:", req.headers.authorization);
    console.log("req.auth exists:", !!req.auth);
    console.log("req.auth.userId exists:", !!(req.auth && req.auth.userId));
    console.log("Full req.auth object:", JSON.stringify(req.auth, null, 2));
    
    if(!req.auth || !req.auth.userId) {
        console.log("Auth check failed - no auth or userId");
        console.log("req.auth is falsy:", !req.auth);
        console.log("req.auth.userId is falsy:", !req.auth?.userId);
        return res.status(401).json({ message: "Unauthorized : You must be logged in!" });
    }
    
    console.log("Auth check passed for userId:", req.auth.userId);
    console.log("=== PROTECT ROUTE SUCCESS ===");
    next();
};

export const requireAdmin = async (req, res, next) => {
    try{
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        console.log("Current user:", currentUser.primaryEmailAddress?.emailAddress);
        console.log("Admin email:", process.env.ADMIN_EMAIL);
        
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;
        if(!isAdmin) {
            return res.status(403).json({ message: "Forbidden : You do not have permission to access this resource!" });
        }
        next();
    }catch(error) {
        console.log("Error in requireAdmin middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};