const user = require("../models/user_model");
const bcrypt = require("bcryptjs"); // Corrected module name

/**
 * The function `home` is an asynchronous function that sends a "Welcome to home" message with a 200
 * status code, and handles errors by logging them and sending a 500 status code with "Internal Server
 * Error" message.
 * @param req - The `req` parameter in the `home` function typically represents the request object,
 * which contains information about the HTTP request made to the server, such as headers, parameters,
 * and body data. It is commonly used to access data sent from the client to the server.
 * @param res - The `res` parameter in the `home` function is the response object that is used to send
 * a response back to the client making the request. In this case, it is being used to send a status
 * code and a message back to the client.
 */
const home = async (req, res) => {
    try {
        res.status(200).send("Welcome to home");
    } catch(error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const Register = async (req, res) => {
    try {
        console.log(req.body);
       /* The line `const { username, email, phone, password } = req.body;` is using object
       destructuring in JavaScript to extract specific properties (`username`, `email`, `phone`,
       `password`) from the `req.body` object. */
        const { username, email, phone, password } = req.body;
        
        // Check if user with the same email exists
      /* The code snippet you provided is checking if a user with the same email already exists in the
      database before creating a new user. Here's a breakdown of what it does: */
        const userExist = await user.findOne({ email: email });
        if (userExist) {
            return res.status(409).json('User already exists');
        } 
     /* The line `const user = await userExist.comparePassword(password);` is attempting to compare the
     password provided in the request with the password stored in the database for the user with the
     given email. */
        // const user=  await userExist.comparePassword(password);
        // Create new user without hashing password
    /* The code snippet `const userCreated = await User.create({ username, email, phone, password });`
    is creating a new user in the database using the `User` model. Here's a breakdown of what it
    does: */
       
            const userCreated = await User.create({
                username,
                email,
                phone,
                password
            });
                
            res.status(200).send({ message: 'registration successfull', token:await userCreated.generateToken(),userId :userCreated._id});
        

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
};
//user login logic by default

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await user.findOne({ email: email });
        if (!userExist) {
            return res.status(401).json("Invalid Email");
        }
        
        // Compare the provided password with the hashed password stored in the database
        const validPassword = await userExist.comparePassword(password);
        
        if (validPassword) {
            res.status(200).json({
                message: 'Login successful',
                token: await userExist.generateToken(),
                userId: userExist._id
            });
        } else {
            res.status(401).json("Invalid password");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
};
////////////////////////////////////////////////////////////////
//user logic to sent the user data
//................................................................
const User = async (req, res, next) => 
    {
    try {
        const userData = req.user;
        console.log("userdata");
        res.status(200).json(userData);
    } catch (error) {
        console.log("error from the root",error);
    }
}
module.exports = { Register, home, login,User };