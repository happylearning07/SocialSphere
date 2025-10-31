// import jwt from "jsonwebtoken";
// const isAuthenticated = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ message: "User not authenticated", success: false });
//     }

//     const decode = jwt.verify(token, process.env.SECRET_KEY);
//     if (!decode) {
//       return res.status(401).json({ message: "Invalid token", success: false });
//     }

//     req.id = decode.userId; // ✅ Add this line
//     req.user = { id: decode.userId }; // optional, keep for consistency
//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(401).json({ message: "Auth error", success: false });
//   }
// };
// export default isAuthenticated;







import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => { // Removed 'async' here since jwt.verify is synchronous
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false
            });
        }

        // CORRECTED: Removed 'await' from jwt.verify
        const decode = jwt.verify(token, process.env.SECRET_KEY); 
        
        if (!decode) {
            return res.status(401).json({
                message: 'Invalid token',
                success: false
            });
        }

        req.id = decode.userId;
        req.user = { id: decode.userId }; // Add this back if you use req.user in other controllers
        next();
    } catch (error) {
        // This catch block will handle expired/invalid tokens and send the 401 response.
        console.log("Authentication Error:", error);
        return res.status(401).json({ 
            message: error.message === 'jwt expired' ? 'Session expired, please log in again.' : 'Invalid token.',
            success: false 
        });
    }
};

export default isAuthenticated;