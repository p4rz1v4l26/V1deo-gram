const Kafka = require("node-rdkafka");
const fs = require("fs");
const zlib = require("zlib");

const TOPIC_NAME = "demo_topic";
const OUTPUT_FILE = "output.mp4";

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
    const compressedData = zlib.gzipSync(message.value);
    writeStream.write(compressedData);
    console.log("Received and wrote compressed data to file:", OUTPUT_FILE);
  } catch (err) {
    console.error("Error processing message:", err);
  }
});

stream.on("end", () => {
  writeStream.end();
  console.log("Finished receiving and compressing video.");
});

stream.consumer.on("event.error", (err) => {
  console.error("Consumer error:", err);
});

stream.consumer.on("disconnected", () => {
  console.log("Consumer disconnected.");
});

stream.consumer.on("event.log", (log) => {
  console.log("Consumer log:", log);
});

stream.consumer.on("event.stats", (stats) => {
  console.log("Consumer stats:", stats);
});
