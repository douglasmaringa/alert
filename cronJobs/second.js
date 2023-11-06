const axios = require("axios");
const mongoose = require('mongoose');
const Alert2 = require('../models/Alert2');
const MessageTemplate = require('../models/MessageTemplate');
const nodemailer = require('nodemailer');
require('dotenv').config()

const createAxiosInstance = axios.create({
  // Disable retries
  retries: 1,
  retryDelay: 0,
  retryCondition: () => false,

  // Set a lower timeout value (e.g., 5 seconds)
  timeout: 5000,
});



const sendAlert = async (email,message, code,alertId,from,subject) => {
  try {
    // Create a transporter using the Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'uptimemonitor50@gmail.com', // Replace with your Gmail email address
        pass: 'tkhnhlwqxpawpgcc', // Replace with your Gmail password or an App Password if you have 2-Step Verification enabled
      },
    });

    messageTemplate = message.replace('{{variable}}', code);
    //const from = "test@gmail.com"
    //const subject = "testing"

    // Setup email data
    const mailOptions = {
      from: `From @${from} <donotreply@bar.com>`, // Sender address (must be your Gmail email address)
      to: email, // Recipient's email address
      subject: subject, // Subject line
      //text: `Message Details: ${error}`, // Plain text body
      html: messageTemplate,
      // You can also provide an HTML body for the email
      // html: `<h1>Alert: Service Issue</h1><p>Error Details: ${error}</p>`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
     // If the email was successfully sent, delete the alert from the database
     await Alert2.findByIdAndDelete(alertId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const second = async () => {
  console.log("Running cronJob for 5 second jobs");

  try {
    // Fetch alerts with pagination (10 at a time)
    const pageSize = 10;
    let currentPage = 1;

    let alerts = await Alert2.find({})
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    while (alerts.length > 0) {
      // Process the alerts (e.g., send emails)
      for (const alert of alerts) {
        // Call the sendAlert function to send the alert
      const messageTemplate = await MessageTemplate.findOne({ type: alert?.type });
     
        sendAlert(alert?.email,messageTemplate?.message, alert?.message,alert?._id,messageTemplate?.from,messageTemplate?.subject);
      }

      // Move to the next page of alerts
      currentPage++;
      alerts = await Alert2.find({})
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);
    }
  } catch (error) {
    console.error("Error performing cron job 1:", error);
  }
};

module.exports = second;
