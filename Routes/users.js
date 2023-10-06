const router = require('express').Router();
let User = require("../Models/User");

const nodeCron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { default: mongoose } = require('mongoose');

const openWeatherApiKey = `https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid`;

//Nodemiler Setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Email Service'
    user:"orangea345@gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "login",
        user: 'orangea345@gmail.com',
        pass: 'Hasitha@99',
    },
});

//Add User Details
router.route("/add").post(async (req, res) => {
    try {
        const email = req.body.email;
        const location = req.body.location;

        const newUser = new User({
            email,
            location
        });

        await newUser.save();
        res.json("User Added!");
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal Server Error");
    }
});

//Get All User Details
router.route('/').get(async (req, res) => {
    try {
        const users = await User.find(); // Only fetch email and location fields
        res.json(users);

        // Schedule the weather report sending job
        nodeCron.schedule('0 */3 * * *', () => {
            users.forEach(async (user) => {
                await sendWeatherReport(user);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal Server Error');
    }
});

// Update User Details
router.route("/update/:id").put(async (req, res) => {
    const userId = req.params.id;
    const { email, location } = req.body;

    try {
        // Validate userId as a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ status: "Invalid user ID" });
        }
        // Validate email and location here if needed

        const updateUser = {
            email,
            location
        };
        const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ status: "User not found" });
        }
        return res.status(200).json({ status: "User Updated!", user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "User Update Failed!" });
    }
});


//Delete User
router.route("/delete/:id").delete(async (req, res) => {
    const userId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ status: "Invalid user ID" });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ status: "User not found" });
        }
        return res.status(200).json({ status: "User Deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "User Deletion Failed", error: err.message });
    }
});



//Function for get wether report
async function sendWeatherReport(user) {
    try {
        // Fetch weather data from OpenWeatherMap API
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${user.location}&appid=${openWeatherApiKey}&units=metric`
        );
        const weatherData = weatherResponse.data;
        //weather report message
        const weatherReport = `Hourly Weather Report for ${user.location}: ${weatherData.weather[0].description}, Temperature: ${weatherData.main.temp}°C`;

        // Send the weather report to the user's email
        const mailOptions = {
            from: 'orangea345@gmail.com',
            to: user.email,
            subject: 'Weather Report',
            text: weatherReport,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Weather report sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send weather report to ${user.email}: ${error.message}`);
    }
}

module.exports = router;