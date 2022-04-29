const mongoose = require('mongoose');

const validateEmail = email => {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const validateName = name => {
    let re = /^[a-zA-Z]+ [a-zA-Z]+$/;
    return re.test(name);
}

const validatePassword = password => {
    let re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
    return re.test(password);
}


const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        minlength: 5,
        validate: [validateName , 'Please enter a valid name'], 
        match: [/^[a-zA-Z]+ [a-zA-Z]+$/, 'Please enter a valid name']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: 'Password is required',
        minlength: 8,
        validate: [validatePassword, 'Please enter proper password'],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/, 'Please enter proper password']
    },
}, { versionKey: false, timestamp: true });

module.exports = mongoose.model("User", userSchema);