const playlistEl = document.getElementById("playlist");
const videoPlayer = document.getElementById("videoPlayer");
const themeToggle = document.getElementById("theme-toggle");

// Load playlist.json
fetch("playlist.json")
  .then(res => res.json())
  .then(data => {
    data.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "playlist-item";

      const logo = document.createElement("img");
      logo.src = item.logo || "";
      logo.alt = "logo";
      logo.className = "logo";

      const title = document.createElement("span");
      title.className = "title";
      title.textContent = item.name || `Channel ${index + 1}`;

      li.appendChild(logo);
      li.appendChild(title);

      li.addEventListener("click", () => {
        videoPlayer.src = item.url;
        videoPlayer.play();
      });

      playlistEl.appendChild(li);
    });

    // Load first by default
    if (data.length > 0) {
      videoPlayer.src = data[0].url;
    }
  })
  .catch(err => {
    playlistEl.innerHTML = "<li>Error loading playlist.</li>";
    console.error("Error:", err);
  });

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
