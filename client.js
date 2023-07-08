const got = require('got');

(async () => {
  console.log("**Start Stream**\n")
  try {
    const stream = got.stream({
      url: 'https://starfish-app-gl4tg.ondigitalocean.app/chat',
      method: 'POST',
      json: {
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant. Your primary task is to directly address the very last question or topic posed in the user's message, even if there are other questions or topics included. Disregard previous topics. Provide a comprehensive, fact-based response suitable for a client, using a logical framework. Use bullet points or numbers where appropriate. Ignore all topics not directly relevant to the final question or topic."
          },
          {
            "role": "user",
            "content": "I'm starting an affordable smartphone business in the german market. What factors should I consider and what would my market size be in dollar values if you were to provide an estaimte. Try your best to work through the entire calculation using approximations"
          }
        ],
        "temperature": 0.2,
        "top_p": 1,
        "max_tokens": 500,
        "frequency_penalty": 0,
        "presence_penalty": 0
      },
      responseType: 'json'
    });

    stream.on('data', (chunk) => {
      try {
        const chunkStr = chunk.toString();
        const jsonStrs = chunkStr.split('}{').map((str, index, arr) => {
          if (index !== 0) str = '{' + str;
          if (index !== arr.length - 1) str = str + '}';
          return str;
        });

        jsonStrs.forEach(jsonStr => {
          const data = JSON.parse(jsonStr);
          process.stdout.write(data.choices[0].delta.content || "");
        });
      } catch (e) {
        console.error(e.message);
      }
    });

    stream.on('error', (error) => {
      console.error(error.message);
    });

    stream.on('end', () => {
      console.log('\n\n**Response stream ended**');
    });
  } catch (error) {
    console.error(error.message);
  }
})();
