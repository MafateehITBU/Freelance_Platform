import { transporter } from './nodemailer.js';

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = (minutes = 3) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    return expiresAt;
};

export const sendOTPEmail = async ({ to, otp, senderLabel = "Freelance Platform", emailUser = process.env.EMAIL_USER }) => {
    const mailOptions = {
        from: `"${senderLabel}" <${emailUser}>`,
        to,
        subject: 'Password Reset OTP',
        text: `Your OTP for resetting your password is: ${otp}. This OTP is valid for 3 minutes.`,
    };

    await transporter.sendMail(mailOptions);
};

export const verifyOTPMatch = (doc, otp) => {
    if (!doc.otp || !doc.otpExpiresAt) return false;
    return doc.otp === otp && new Date() <= doc.otpExpiresAt;
};