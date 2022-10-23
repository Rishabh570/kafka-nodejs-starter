const express = require('express');
const { Kafka } = require('kafkajs');

(async () => {
  console.log("Initializing kafka...");
  const kafka = new Kafka({
    clientId: 'kafka-nodejs-starter',
    brokers: ['localhost:9092'],
  });
  
  // Initialize the Kafka producer and consumer
  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId: 'demoTopic-consumerGroup' });


  await producer.connect();
  console.log("Connected to producer.");
  
  await consumer.connect();
  console.log("Connected to consumer.");
  
  
  await consumer.subscribe({ topic: 'demoTopic', fromBeginning: true });
  console.log("Consumer subscribed to topic = demoTopic");

  // Log every message consumed
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      
      console.log(
        'Consumed a message = ',
        { topic, partition, value: message.value.toString() }
      )
    },
  });
  
  // Send an event to the demoTopic topic
  await producer.send({
    topic: 'demoTopic',
    messages: [
      { value: 'This event came from another service.' },
    ],
  });
  console.log("Produced a message.");
  
  // Disconnect the producer once we’re done
  await producer.disconnect();
  
  const app = express();
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🎉🎉🎉 Application running on port: ${PORT} 🎉🎉🎉`);
  });
})();
