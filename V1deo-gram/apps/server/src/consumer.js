const Kafka = require("node-rdkafka");

const TOPIC_NAME = "Videogram";

const stream = new Kafka.createReadStream(
  {
    "metadata.broker.list": "kafka-17907454-v1deo-gram.a.aivencloud.com:26683",
    "group.id": "GROUP_ID",
    "security.protocol": "ssl",
    "ssl.key.location": "service.key",
    "ssl.certificate.location": "service.cert",
    "ssl.ca.location": "ca.pem",
  },
  { "auto.offset.reset": "beginning" },
  { topics: [TOPIC_NAME] }
);

stream.on("data", (message) => {
  console.log("Got message using SSL:", message.value.toString());
});