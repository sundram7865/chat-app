import amqp from "amqplib";

let channel:amqp.Channel

export const connectRabbitMQ=async()=>{
    try {
        const connection=await amqp.connect({
             protocol: "amqp",
             hostname: process.env.RABBITMQ_HOST,
             port: 5672,
             username: process.env.RABBITMQ_USER,
             password: process.env.RABBITMQ_PASSWORD,
        });
       channel = await connection.createChannel();
       console.log('RabbitMQ connected')
    } catch (error) {
        console.log(error)
    }

};
export const publishTOQueue=async(queueName:string,message:any)=>{
    if(!channel){
        console.log('RabbitMQ is not initialized');
        return;
    }
    await channel.assertQueue(queueName,{durable:true});
    await channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
        persistent:true
    });
}
