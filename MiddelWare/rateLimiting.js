const accessSchema = require("../Models/accessSchema");

const rateLimiting = async (req, res, next) => {
  const sessionId = req.session.id;
  try {
    const authId = await accessSchema.findOne({ sessionId: sessionId });
    console.log(authId);
    if (!authId) {
      let rateLimitingData = new accessSchema({
        sessionId: sessionId,
        time: Date.now(),
      });
      await rateLimitingData.save();
      next();
    }
    else{
        //Checking the difference between current and saved time in seconds
        const timeDifference = (Date.now()-authId.time)/1000;
        console.log('Time Diff', timeDifference);
        if(timeDifference<2)
        {
           return res.send({
                status:'failure',
                message:"You are making request too frequently! Please wait for a while."
            })
        }
        await accessSchema.findOneAndUpdate({sessionId:sessionId},{time:Date.now()})
        next()
    }
    
  } catch (error) {
    res.send({
      status: 500,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = rateLimiting;
