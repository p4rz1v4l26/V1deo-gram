const Kafka = require("node-rdkafka");
const fs = require("fs");

const TOPIC_NAME = "demo_topic";
const OUTPUT_FILE = "output.mp4";

let isVideoReceived = false; // Flag to track video reception

const stream = new Kafka.createReadStream(
  {
    "metadata.broker.list": "kafka-17907454-v1deo-gram.a.aivencloud.com:26681",
    "group.id": "GROUP_ID",
    "security.protocol": "ssl",
    "ssl.key.location": "service.key",
    "ssl.certificate.location": "service.cert",
    "ssl.ca.location": "ca.pem",
  },
  { "auto.offset.reset": "beginning" },
  { topics: [TOPIC_NAME] }
);

const writeStream = fs.createWriteStream(OUTPUT_FILE);

stream.on("data", (message) => {
  try {
    const data = message.value;
    writeStream.write(data);
    console.log("Received and wrote video data to file.");
    isVideoReceived = true; // Set the flag to true once video is received
  } catch (err) {
    console.error("Error processing message:", err);
  }
  
  if (isVideoReceived) {
    stream.close(); // Close the stream to stop receiving further messages
    console.log("Stopped receiving messages.");
  }
});

stream.on("end", () => {
  writeStream.end();
  console.log(`Finished writing video to ${OUTPUT_FILE}`);
});

stream.on("error", (err) => {
  console.error("Stream error:", err);
});

// Handle process termination
process.on('SIGINT', () => {
  writeStream.end();
  process.exit();
});
