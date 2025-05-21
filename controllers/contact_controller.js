const Contactschema = require("../models/contact_model");

const Contactform= async (req, res) => 
    {
    try {
        const response = req.body;
        await Contactschema.create(response);
        
        return res.status(200).json({ message: "message sent successfully" });
    } catch (error) {
      console.log(error);
    }
}
module.exports = Contactform;