const GEMINI_API_KEY = "AIzaSyCX0mKLUwGjXOpm_dtL8eYg-B4EsTOIm08";

document.getElementById('generateBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('imageInput');
  const prompt = document.getElementById('promptInput').value.trim();
  const result = document.getElementById('resultSection');
  const error = document.getElementById('errorSection');
  const img = document.getElementById('generatedImage');
  const text = document.getElementById('geminiText');
  const errMsg = document.getElementById('errorMessage');

  if (!fileInput.files[0]) return alert("Bro, upload an image first!");
  if (!prompt) return alert("Bro, type a description too!");

  result.classList.add('hidden');
  error.classList.add('hidden');

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const base64Image = reader.result.split(',')[1];

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: file.type, data: base64Image } },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: { response_modalities: ["IMAGE", "TEXT"] }
          })
        }
      );

      if (!res.ok) throw new Error((await res.json()).error?.message);

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      let imgData = null, txt = "";

      parts.forEach(p => {
        if (p.text) txt += p.text + "\n";
        if (p.inlineData) imgData = p.inlineData.data;
      });

      if (imgData) {
        img.src = `data:image/png;base64,${imgData}`;
        img.alt = prompt;
        result.classList.remove('hidden');
      } else {
        errMsg.textContent = "No image data received.";
        error.classList.remove('hidden');
      }

      text.textContent = txt.trim() || "Gemini is silent this time.";

    } catch (e) {
      console.error(e);
      errMsg.textContent = `❌ ${e.message || "Something went wrong"}`;
      error.classList.remove('hidden');
    }
  };

  reader.readAsDataURL(file);
});

// Download with watermark
document.getElementById('downloadBtn').addEventListener('click', () => {
  const img = document.getElementById('generatedImage');
  if (!img.src) return alert("Bro, no image to download!");

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tempImg = new Image();
  tempImg.crossOrigin = "anonymous";
  tempImg.onload = () => {
    canvas.width = tempImg.width;
    canvas.height = tempImg.height;
    ctx.drawImage(tempImg, 0, 0);
    ctx.font = `${Math.floor(tempImg.width / 30)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "right";
    ctx.fillText("© Kaustav Ray", tempImg.width - 10, tempImg.height - 10);
    const link = document.createElement('a');
    link.download = 'Kaustav_copyright.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  tempImg.src = img.src;
});
