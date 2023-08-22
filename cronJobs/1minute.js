const axios = require("axios");
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const User = require('../models/User'); // Adjust the path as needed
const MessageTemplate = require('../models/MessageTemplate');
const nodemailer = require('nodemailer');

const createAxiosInstance = axios.create({
  // Disable retries
  retries: 1,
  retryDelay: 0,
  retryCondition: () => false,

  // Set a lower timeout value (e.g., 5 seconds)
  timeout: 5000,
});


const sendAlert = async (email, error,alertId) => {
  try {
    // Create a transporter using the Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'uptimemonitor50@gmail.com', // Replace with your Gmail email address
        pass: 'tkhnhlwqxpawpgcc', // Replace with your Gmail password or an App Password if you have 2-Step Verification enabled
      },
    });

    // Setup email data
    const mailOptions = {
      from: 'uptimemonitor50@gmail.com', // Sender address (must be your Gmail email address)
      to: email, // Recipient's email address
      subject: 'Alert: Service Issue', // Subject line
      text: `Message Details: ${error}`, // Plain text body
      // You can also provide an HTML body for the email
      // html: `<h1>Alert: Service Issue</h1><p>Error Details: ${error}</p>`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
     // If the email was successfully sent, delete the alert from the database
     //await Alert.findByIdAndDelete(alertId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const performCronJob1 = async () => {
  console.log("Running cronJob for 1 minute jobs");

  try {
    const pageSize = 10;
    let currentPage = 1;

    let alerts = await Alert.find({}).populate('userId') // Populate the userId field with user details
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);
    let message;
    
      if (alerts[0]?.userId?.contacts?.length > 0) {
        // Determine the appropriate message template for the down type
        const messageType = 'Down'; // Adjust based on alert type
        const messageTemplate = await MessageTemplate.findOne({ type: messageType });

        if (messageTemplate) {
          // Build the email content using the template and alert details
          message = messageTemplate.message;
        }
      }
    

    while (alerts.length > 0) {
      for (const alert of alerts) {
        // Loop through the active email contacts of the user
        for (const contact of alert.userId.contacts) {
          if (contact.medium === 'email' && contact.status === 'active') {
            // Send the email using the contact's email address
            const email = contact.value;
            const message2 = `Message: ${message}\nError: ${alert.url}`;
            sendAlert(email, message2, alert._id);
          }
           await Alert.findByIdAndDelete(alert._id);
        }
      }

      currentPage++;
      alerts = await Alert.find({})
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);
    }
  } catch (error) {
    console.error("Error performing cron job 1:", error);
  }
};


module.exports = performCronJob1;
