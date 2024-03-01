const Kafka = require("node-rdkafka");
const { spawn } = require("child_process");

const TOPIC_NAME = "demo_topic";

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

const videoStream = spawn("ffmpeg", [
  "-f", "dshow",
  "-i", "video=Integrated Webcam",
  "-f", "mpegts",
  "-codec:v", "mpeg1video",
  "-s", "640x480",
  "-b:v", "800k",
  "-bf", "0",
  "-muxdelay", "0.001",
  "-"
]);

videoStream.stdout.on("data", (data) => {
  try {
    stream.produce(
      TOPIC_NAME,
      null,
      data,
      null,
      Date.now()
    );
    console.log("Sent video data to Kafka.");
  } catch (err) {
    console.error("Error sending video data to Kafka:", err);
  }
});

stream.on("error", (err) => {
  console.error("Stream error:", err);
});

// Handle process termination
process.on('SIGINT', () => {
  videoStream.kill();
  process.exit();
});
