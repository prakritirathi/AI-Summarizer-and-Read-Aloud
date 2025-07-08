//--------------------------------------------------
//                    GLOBALS
//--------------------------------------------------
let currentUtterance = null; // active SpeechSynthesisUtterance
let isPaused = false;        // pause state flag

//--------------------------------------------------
//              MAIN FUNCTIONS
//--------------------------------------------------
// Wrap the summarising logic so it can be called by
// the button *and* by keyboard shortcuts
async function runSummarise() {
  const resultDiv   = document.getElementById("result");
  const summaryType = document.getElementById("summary-type").value;

  resultDiv.innerHTML =
    '<div class="loading"><div class="loader"></div></div>';

  chrome.storage.sync.get(["geminiApiKey"], async ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      resultDiv.innerHTML =
        "API key not found. Please set your API key in the extension options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text) {
            resultDiv.innerText = "Could not extract article text from this page.";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              geminiApiKey
            );
            resultDiv.innerText = summary;
            speakText(summary);
          } catch (error) {
            resultDiv.innerText = `Error: ${error.message || "Failed to generate summary."}`;
          }
        }
      );
    });
  });
}

//--------------------------------------------------
//              BUTTON LISTENERS
//--------------------------------------------------

document.getElementById("summarize").addEventListener("click", runSummarise);

document.getElementById("copy-btn").addEventListener("click", copySummaryToClipboard);

//--------------------------------------------------
//              COPY TO CLIPBOARD helper
//--------------------------------------------------
function copySummaryToClipboard() {
  const txt = document.getElementById("result").innerText.trim();
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.getElementById("copy-btn");
    if (btn) {
      const old = btn.innerText;
      btn.innerText = "Copied!";
      setTimeout(() => (btn.innerText = old), 2000);
    }
    sayFeedback("Copied.");
  });
}

//--------------------------------------------------
//              GEMINI CALL
//--------------------------------------------------
async function getGeminiSummary(text, type, apiKey) {
  const maxLength = 20000;
  const truncated = text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  let prompt;
  switch (type) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncated}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncated}`;
      break;
    case "bullets":
      prompt = `Summarise the following article in 5-7 key points. Each line should start with "- ":\n\n${truncated}`;
      break;
    default:
      prompt = `Summarise the following article:\n\n${truncated}`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "API request failed");
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
}

//--------------------------------------------------
//              TEXT‑TO‑SPEECH
//--------------------------------------------------
function stopSpeaking() {
  if (window.speechSynthesis.speaking || isPaused) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  isPaused = false;
}

function speakText(text) {
  if (!text) return;
  stopSpeaking();
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "en-US";
  currentUtterance.rate = 1;
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;
  currentUtterance.onend = () => {
    currentUtterance = null;
    isPaused = false;
  };
  window.speechSynthesis.speak(currentUtterance);
}


function sayFeedback(msg) {
  const u = new SpeechSynthesisUtterance(msg);
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
}

sayFeedback("Press 1 for brief summary")
sayFeedback("Press 2 for detailed summary")
sayFeedback("Press 3 for bullet points ")
sayFeedback("Press tab to copy the summary")
sayFeedback(" Press spacebar key to start or stop reading")



//--------------------------------------------------
//              GLOBAL KEY HANDLER
//--------------------------------------------------
document.addEventListener("keydown", (e) => {
  // Prevent interfering with input fields (none in popup, but be safe)
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  // --- Reader controls ---
  if (e.code === "Space") {
    e.preventDefault();

    if (currentUtterance) {
      if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        sayFeedback("Resumed.");
      } else {
        window.speechSynthesis.pause();
        isPaused = true;
        sayFeedback("Paused.");
      }
    } else {
      const txt = document.getElementById("result").innerText.trim();
      if (txt) {
        speakText(txt);
        sayFeedback("Started reading.");
      }
    }
  }

  if (e.code === "Escape") {
    if (currentUtterance || isPaused) {
      stopSpeaking();
      sayFeedback("Stopped.");
    }
  }

  // --- Copy summary ---
  if (e.code === "Tab") {
    e.preventDefault();
    copySummaryToClipboard();
  }

  // --- Summary type shortcuts ---
  if (["Digit1", "Digit2", "Digit3"].includes(e.code)) {
    e.preventDefault();
    const select = document.getElementById("summary-type");
    switch (e.code) {
      case "Digit1":
        select.value = "brief";
        sayFeedback("Brief summary selected.");
        break;
      case "Digit2":
        select.value = "detailed";
        sayFeedback("Detailed summary selected.");
        break;
      case "Digit3":
        select.value = "bullets";
        sayFeedback("Bullet summary selected.");
        break;
    }
    // Trigger summarisation automatically
    runSummarise();
  }
});
