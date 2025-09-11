const nodemailer = require("nodemailer")

async function sendEmail(otp, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'yashsomani231@gmail.com',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
      html: `<p>Your OTP code is <b>${otp}</b></p>`,
    }

    await transporter.sendMail(mailOptions)

    return { success: true, message: "Email sent successfully" }
  } catch (error) {
    console.log("SMTP config:", process.env.MAILTRAP_HOST, process.env.MAILTRAP_PORT);

    console.error("Email sending failed:", error)
    return { success: false, message: "Failed to send email", error: error.message }
  }
}
module.exports = { sendEmail }