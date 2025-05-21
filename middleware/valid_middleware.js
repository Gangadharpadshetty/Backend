const validate = (Schema) => async (req, res, next) => {
    try {
        const parsedBody = await Schema.parseAsync(req.body); // Corrected function name to `parseAsync`
        req.body = parsedBody;
        next();
    } catch (err) {
        const status = 422;
        const extraDetails = err.errors[0].message;
        const error = {
            status,
         
            extraDetails,
        }
        console.log(error);
        // res.status(400).json({msg:message });
        next(error);
    }
};

module.exports = validate;

