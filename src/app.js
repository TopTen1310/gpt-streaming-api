import express from "express";
import got from "got";
import { config } from "dotenv";
import cors from "cors";

config();

const app = express();
app.use(express.json());

app.use(cors());

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const model = req.body.model;

  const temperature = req.body.temperature;
  const top_p = req.body.top_p;
  const max_tokens = req.body.max_tokens;
  const frequency_penalty = req.body.frequency_penalty;
  const presence_penalty = req.body.presence_penalty;

  const stream = got.stream("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    json: {
      messages,
      model,
      temperature,
      top_p,
      max_tokens,
      frequency_penalty,
      presence_penalty,
      stream: true,
    },
    method: "POST",
  });

  stream.on("data", (chunk) => {
    const body = chunk.toString();

    for (const message of body.split("\n")) {
      if (message === "") {
        continue;
      }

      if (message === "data: [DONE]") {
        continue;
      }

      if (!message.startsWith("data: ")) {
        continue;
      }

      const json = JSON.parse(message.toString().slice("data: ".length));
      res.write(JSON.stringify(json));
    }
  });

  stream.on("error", (error) => {
    res.status(500).send({ error: error.toString() });
  });

  stream.on("end", () => {
    res.end();
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
