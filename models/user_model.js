const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
/* The `const Schema = mongoose.Schema({ ... });` in the code snippet is defining a Mongoose schema for
a user model in a Node.js application. This schema specifies the structure of the user document that
will be stored in the MongoDB database. Here's a breakdown of what each field in the schema
represents: */
const Schema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },    phone: {
        type: String,
        required: true,
    },
    isadmin: {
        type: Boolean,
        default: false,
    },

});
/* The `Schema.pre("save", async function () { ... })` middleware function in the Mongoose schema is a
pre-save hook that is executed before saving a user document to the database. Here's a breakdown of
what this function is doing: */
Schema.pre("save", async function () {
    const Userr = this;
    if (!Userr.isModified("password")) {
        next();
    }

    try {
        const saltround = await bcrypt.genSalt(10);  // generate a salt and round of hashing
        const hash_password = await bcrypt.hash(Userr.password, saltround);
        Userr.password = hash_password.toString();
    } catch (error) {
        next(error.message);
    }
});


//compare password against
Schema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}
/* The comment `JSON webtoken` in the code snippet is likely a placeholder or a reminder for
implementing JSON Web Token (JWT) functionality in the application. */
/* The `Schema.methods.generateToken` function in the Mongoose schema is defining a method that
generates a JSON Web Token (JWT) for a user document. Here's a breakdown of what this function is
doing: */
Schema.methods.generateToken = async function () {
   try {
  /* The line `userId:this._id.toString()` in the `generatToken` method is attempting to set the
  `userId` property of the token payload to the string representation of the `_id` field of the user
  document. */
       return jwt.sign({
           userId: this._id.toString(),
           email: this.email,
           isadmin: this.isadmin,
       },
           process.env.jwt_sec_key,
           {
               expiresIn: "30d",
           }
       );
   } catch (error) {
    console.error(error.message);
   } 
};
const user = new mongoose.model("User", Schema);
module.exports = user;