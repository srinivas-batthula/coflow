import nodemailer from 'nodemailer';


export async function POST(request) {
    const { to, fullName, otp } = await request.json();

    if (!to || !fullName || !otp) {
        return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 400px; margin: auto;">
                <h2 style="color: #4CAF50;">Welcome to HackPilot 🎉, ${fullName}!</h2>
                <p style="font-size: 16px; color: #333;">
                    Your One-Time Password (OTP) is:
                </p>
                <p style="font-size: 28px; font-weight: bold; color: #2196F3; margin: 20px 0;">
                    ${otp}
                </p>
                <p style="font-size: 14px; color: #666;">
                    Please use this OTP to complete your sign-up process. This code is valid for only 5 minutes.
                </p>
                <p style="float: right;">Thank you, ~Feedback team!</p>
                <p style="float: right;">~HackPilot</p>
            </div>
        `;

        // Send email
        await transporter.sendMail({
            from: `"NoReply" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'OTP Code from ~HackPilot',
            html: htmlContent,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Email error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}