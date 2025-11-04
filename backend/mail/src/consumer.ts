import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });

        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("mail services started listening to send-otp queue");

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    
                   
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false, // use TLS
                        auth: {
                            user: process.env.USER,
                            pass: process.env.PASS,
                        },
                        tls: {
                            rejectUnauthorized: false,
                        },
                    });

                    await transporter.sendMail({
                        from: "chat-app",
                        to,
                        subject,
                        text: body,
                    });

                    console.log(`✅ OTP mail sent to ${to}`);
                    channel.ack(msg);
                } catch (error) {
                    console.log("❌ Failed to send OTP:", error);
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};
