require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const generateApiKey = require('generate-api-key');
const connnection = require("./config/db.config");
const User = require('./models/user_model');
const Api = require('./models/api_model');

connnection.once('open', () => console.log('DB Connected'));
connnection.on('error', () => console.log('DB error'));

const port = process.env.PORT || 5000
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static("html/static"));

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
    },
    secure: true,
});



const sendEmail = async (email, key) => {
    const error = null;
    const mailData = {
        from: process.env.APP_EMAIL,  // sender address
        to: email,   // list of receivers
        subject: 'API key from Saptarsi',
        text: 'That was easy!',
        html: `<b>Hey there! </b><br>Your api key is ${key}<br/>`,
    };
    await transporter
        .sendMail(mailData)
        .catch((err) => {
            error = err
        });
    return error
}

app.post("/failure", function (req, res) { res.redirect("/") });

app.get("/v1/getUsers", (req, res) => {
    const api_key = req.body.apiKey;
    if (api_key == null) {
        res.status(403).json({
            message: "Missing api key. Not authenticated",
            status: 403
        })
    } else {
        Api.findOne({ "apiKey": api_key }, (err, data) => {
            if (err) {
                res.json({
                    message: "Internal server error",
                    status: 500
                })
            } else if (data == null) {
                res.status(403).json({
                    message: "API key not found",
                    status: 403
                })
            } else {
                User.find((err, data) => {
                    try {
                        if (err) {
                            throw err
                        } else {
                            res.status(200).json({
                                status: 200,
                                data: data,
                            })
                        }
                    } catch (error) {
                        console.log(error);
                        res.status(500).json({
                            status: 500,
                            data: "Internal server error"
                        });
                    }
                });
            }
        })
    }
})

app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/html/signup.html");
})
    .post("/", async (req, res) => {
        const { displayName, email, password } = req.body;
        const data = {
            displayName, email, password
        }
        const user = new User(data)
        user.save((err, result) => {
            try {
                if (err) {
                    throw err
                } else {
                    let apiKey = generateApiKey({ method: 'string', prefix: displayName.replaceAll(/\s/g, '') });;
                    const api_key = new Api({ apiKey, user_id: result._id });
                    api_key.save(async (err) => {
                        try {
                            if (err) {
                                throw err
                            }
                            else {
                                const e = await sendEmail(email, api_key.apiKey);
                                if (e) {
                                    throw e
                                } else {
                                    res.sendFile(__dirname + "/html/success.html");
                                }
                            }
                        } catch (error) {
                            console.log(error);
                            res.sendFile(__dirname + "/html/failure.html");
                        }
                    })
                }
            } catch (error) {
                console.log(error);
                res.sendFile(__dirname + "/html/failure.html");
            }
        });
    })


app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Server running at port: ", port);
})

