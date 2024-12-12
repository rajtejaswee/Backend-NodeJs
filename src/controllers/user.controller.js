import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // Algorithm to register the user :-
    // get user details from frontend
    // validation - not empty
    // check if user already registered: username and email
    // check for the images, check avatar
    // upload them on the cloudinary
    // create user object - create entry in db
    // remove the password and response token field from the response
    // check for the user creation
    // return response

    //get the user from the frontend
    const { fullName, email, username, password } = req.body

    // validation
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //check for the user already existed
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    //check for images, check avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image is required")
    }

    //upload on the cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // create user object 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", 
        email, 
        password,
        username: username.toLowerCase()
    })

    // remove the password and response token field from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken")
    
    // check for the user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
        

})

export {
    registerUser,
}