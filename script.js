document.getElementById("myStyleText").addEventListener("change", function () {
  if (this.checked) document.getElementById("styleModal").style.display = "block";
});
document.getElementById("myStyleImage").addEventListener("change", function () {
  if (this.checked) document.getElementById("styleModal").style.display = "block";
});

function closeModal() {
  document.getElementById("styleModal").style.display = "none";
}

async function extractTextFromImages(files) {
  const texts = [];
  for (const file of files) {
    const base64 = await toBase64(file);
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": "helloworld",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        base64Image: "data:image/png;base64," + base64
      })
    });
    const data = await ocrResponse.json();
    const parsed = data.ParsedResults?.[0]?.ParsedText || "";
    texts.push(parsed);
  }
  return texts.join("\n");
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = error => reject(error);
  });
}

async function generateTextReply() {
  const input = document.getElementById("textInput").value;
  const style = document.getElementById("styleSelect").value;
  const chatBox = document.getElementById("chatBox");
  const myStyle = document.getElementById("myStyleText").checked;
  const styleImages = document.getElementById("styleImages").files;

  chatBox.innerHTML = "<p><strong>You:</strong> " + input + "</p><p>Generating...</p>";

  let styleExamples = "";
  if (myStyle && styleImages.length > 0) {
    const extracted = await extractTextFromImages(styleImages);
    styleExamples = `\nHere are examples of how I chat:\n${extracted}`;
  }

  const prompt = `Give 5 unique ${style} responses to this dating message. Make them vary in tone and length:\n"${input}"${styleExamples}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply.";
    chatBox.innerHTML = "<p><strong>You:</strong> " + input + "</p><p>" + reply.replace(/\n/g, "<br>") + "</p>";
  } catch (error) {
    chatBox.innerHTML = "<p>Error generating response.</p>";
  }
}

async function generateProfileReply() {
  const output = document.getElementById("profileOutput");
  const fileInput = document.getElementById("profileImage");
  const image = fileInput.files[0];

  if (!image) {
    output.innerHTML = "<p>Please upload a screenshot.</p>";
    return;
  }

  const base64 = await toBase64(image);
  output.innerHTML = "<p>Extracting and analyzing...</p>";

  try {
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": "helloworld",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        base64Image: "data:image/png;base64," + base64
      })
    });

    const data = await ocrResponse.json();
    const parsed = data.ParsedResults?.[0]?.ParsedText || "";

    const prompt = `This is a dating profile:\n${parsed}\nGenerate a witty and personalized opener.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const reply = await response.json();
    const message = reply.choices?.[0]?.message?.content || "No reply.";
    output.innerHTML = "<p>" + message.replace(/\n/g, "<br>") + "</p>";
  } catch (e) {
    output.innerHTML = "<p>Error processing image or generating reply.</p>";
  }
}