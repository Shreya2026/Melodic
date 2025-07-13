import { User } from "../models/user.model.js";


export const authCallback=async(req,res,next)=>{
    try{
        console.log("Auth callback called with data:", req.body);
        
        const {id,firstName,lastName,imageUrl}=req.body;

        if (!id) {
            console.log("Missing user ID in request");
            return res.status(400).json({ error: "User ID is required" });
        }

        console.log("Looking for user with clerkId:", id);

        //check if user already exists
        const existingUser = await User.findOne({ clerkId: id });
        
        if(existingUser){
            console.log("User already exists:", existingUser);
            return res.status(200).json({success:true, user: existingUser});
        }

        console.log("Creating new user...");
        //create new user
        const newUser = await User.create({
            clerkId: id,
            fullName: `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown User',
            imageUrl: imageUrl || '',
        });
        
        console.log("New user created successfully:", newUser);
        res.status(201).json({success:true, user: newUser});
    }catch(error){
        console.error("Error in auth callback:", error);
        next(error);
    }
}