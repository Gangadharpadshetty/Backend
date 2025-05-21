const { z } = require('zod');
const LoginSchema = z.object({

    email: z.string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Please provide a valid email address" })
        .min(3, { message: "Email must be at least 3 characters long" })
        .max(25, { message: "Email must be at most 25 characters long" }),
    password: z.string({ required_error: "Password required" })
        .trim()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(25, { message: "Password must be at most 25 characters long" }),
})

const signupSchema = LoginSchema.extend({
    username: z.string({ required_error: "Name is required" })
        .trim()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(25, { message: "Name must be at most 25 characters long" }),
    
   
    phone: z.string({ required_error: "Phone number required" })
        .trim()
        .min(10, { message: "Phone must be at least 10 characters long" })
        .max(10, { message: "Phone must be at most 10 characters long" }),
});

module.exports = {signupSchema,LoginSchema};
