const video = document.getElementById("video");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const qualitySelector = document.getElementById("qualitySelector");
const channelTitle = document.getElementById("channelTitle");

let allChannels = [];
let hls;

async function loadPlaylist() {
  const res = await fetch("index.m3u");
  const text = await res.text();
  const lines = text.split("\n");
  allChannels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const meta = lines[i];
      const url = lines[i + 1];

      const nameMatch = meta.match(/tvg-name="(.*?)"/);
      const logoMatch = meta.match(/tvg-logo="(.*?)"/);
      const groupMatch = meta.match(/group-title="(.*?)"/);

      const name = nameMatch ? nameMatch[1] : "Unnamed";
      const logo = logoMatch ? logoMatch[1] : "";
      const group = groupMatch ? groupMatch[1] : "Others";

      allChannels.push({ name, logo, url, group });
    }
  }

  populateCategories();
  showChannels();
}

function populateCategories() {
  const groups = new Set(allChannels.map(ch => ch.group));
  categoryFilter.innerHTML = `<option value="">📁 All Categories</option>`;
  groups.forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    categoryFilter.appendChild(opt);
  });
}

function showChannels() {
  const search = searchInput.value.toLowerCase();
  const selectedGroup = categoryFilter.value;
  channelList.innerHTML = "";

  const filtered = allChannels.filter(ch => {
    return (
      ch.name.toLowerCase().includes(search) &&
      (selectedGroup === "" || ch.group === selectedGroup)
    );
  });

  filtered.forEach(ch => {
    const div = document.createElement("div");
    div.className = "channel";
    div.onclick = () => playStream(ch.url, ch.name); // ✅ নাম পাঠানো

    const img = document.createElement("img");
    img.src = ch.logo || "https://via.placeholder.com/50";

    const name = document.createElement("span");
    name.textContent = ch.name;

    div.appendChild(img);
    div.appendChild(name);
    channelList.appendChild(div);
  });
}

function playStream(url, name = "Now Playing") {
  channelTitle.textContent = name; // ✅ টাইটেল দেখানো

  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
      const levels = hls.levels;
      qualitySelector.innerHTML = "<b>🔧 Quality:</b> ";

      const autoBtn = document.createElement("button");
      autoBtn.textContent = "Auto";
      autoBtn.onclick = () => hls.currentLevel = -1;
      qualitySelector.appendChild(autoBtn);

      levels.forEach((level, i) => {
        const btn = document.createElement("button");
        btn.textContent = `${level.height}p`;
        btn.onclick = () => hls.currentLevel = i;
        qualitySelector.appendChild(btn);
      });
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", () => video.play());
  }
}

searchInput.addEventListener("input", showChannels);
categoryFilter.addEventListener("change", showChannels);

loadPlaylist();
