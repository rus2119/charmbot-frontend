
const apiUrl = "https://charmbot-server.onrender.com";

document.querySelectorAll(".generate-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const isProfile = button.closest(".profile-analyze") !== null;
    const container = button.closest(".block");
    const output = container.querySelector(".output");
    const styleCheckbox = container.querySelector(".style-checkbox");
    const styleEnabled = styleCheckbox?.checked || false;

    output.innerText = "Loading...";

    if (isProfile) {
      const fileInput = container.querySelector("input[type='file']");
      const file = fileInput.files[0];
      if (!file) {
        output.innerText = "Please upload a screenshot.";
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("use_style", styleEnabled);

      const response = await fetch(apiUrl + "/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      output.innerText = data.reply || "No reply.";
    } else {
      const input = container.querySelector("textarea").value;
      const style = container.querySelector("select").value;

      const body = JSON.stringify({
        message: input,
        style: style,
        use_style: styleEnabled,
      });

      const response = await fetch(apiUrl + "/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await response.json();
      output.innerText = data.reply || "No reply.";
    }
  });
});
