const video = document.getElementById("video");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const qualitySelector = document.getElementById("qualitySelector");

let allChannels = [];
let currentlyDisplayedChannels = []; // বর্তমানে দেখানো চ্যানেলগুলোর তালিকা রাখার জন্য
let currentChannelIndex = -1; // বর্তমানে কোন চ্যানেলটি চলছে তার ইনডেক্স রাখার জন্য

async function loadPlaylist() {
  try {
    const res = await fetch("index.m3u");
    if (!res.ok) {
        throw new Error(`Failed to load playlist: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    const lines = text.split("\n");
    allChannels = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        const meta = lines[i];
        const url = lines[i + 1];

        const nameMatch = meta.match(/,(.*)$/);
        const logoMatch = meta.match(/tvg-logo="(.*?)"/);
        const groupMatch = meta.match(/group-title="(.*?)"/);

        const name = nameMatch ? nameMatch[1].trim() : "Unnamed Channel";
        const logo = logoMatch ? logoMatch[1] : "";
        const group = groupMatch ? groupMatch[1] : "Others";
        
        if (url && name !== "Unnamed Channel") {
          allChannels.push({ name, logo, url, group });
        }
      }
    }

    populateCategories();
    showChannels();
  } catch (error) {
    channelList.innerHTML = `<div style="color: red; padding: 20px;">Error: Could not load playlist file. Please check if 'index.m3u' exists and is accessible.</div>`;
    console.error(error);
  }
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
  
  currentlyDisplayedChannels = filtered; 

  if (filtered.length === 0) {
    channelList.innerHTML = `<div style="padding: 20px;">No channels found.</div>`;
    return;
  }

  filtered.forEach((ch, index) => {
    const div = document.createElement("div");
    div.className = "channel";
    div.onclick = () => playStream(ch, index); 

    const img = document.createElement("img");
    img.src = ch.logo || "https://via.placeholder.com/50";
    img.onerror = () => { img.src = "https://via.placeholder.com/50"; };

    const nameSpan = document.createElement("span");
    nameSpan.textContent = ch.name;

    div.appendChild(img);
    div.appendChild(nameSpan);
    channelList.appendChild(div);
  });
}

let hls;

function playStream(channel, index) {
  currentChannelIndex = index;
  
  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
      const levels = hls.levels;
      qualitySelector.innerHTML = "<b>Quality:</b> ";

      const autoBtn = document.createElement("button");
      autoBtn.textContent = "Auto";
      autoBtn.onclick = () => { hls.currentLevel = -1; };
      qualitySelector.appendChild(autoBtn);

      levels.forEach((level, i) => {
        const btn = document.createElement("button");
        btn.textContent = `${level.height}p`;
        btn.onclick = () => { hls.currentLevel = i; };
        qualitySelector.appendChild(btn);
      });
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = channel.url;
    video.addEventListener("loadedmetadata", () => video.play());
  }
}

function playNextVideo() {
  if (currentlyDisplayedChannels.length === 0 || currentChannelIndex === -1) {
    return;
  }

  const nextIndex = (currentChannelIndex + 1) % currentlyDisplayedChannels.length;
  const nextChannel = currentlyDisplayedChannels[nextIndex];
  playStream(nextChannel, nextIndex);
}

video.addEventListener('ended', playNextVideo);

searchInput.addEventListener("input", showChannels);
categoryFilter.addEventListener("change", showChannels);

loadPlaylist();
