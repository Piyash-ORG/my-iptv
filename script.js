const video = document.getElementById("video");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const qualitySelector = document.getElementById("qualitySelector");

let allChannels = [];
let hls;

// --- সব ফিচারের জন্য প্রয়োজনীয় ভ্যারিয়েবল ---
const CHANNELS_PER_LOAD = 20;
let currentFilteredChannels = [];
let pageToLoad = 1;
let isLoading = false;
let currentChannelIndex = -1;
// ------------------------------------------

async function loadPlaylist() {
  try {
    const res = await fetch("index.m3u");
    if (!res.ok) throw new Error(`Failed to load playlist: ${res.status}`);
    const text = await res.text();
    allChannels = parseM3U(text);
    populateCategories();
    setupInitialView();
  } catch (error) {
    channelList.innerHTML = `<div style="color: red; padding: 20px;">Error: Could not load playlist.</div>`;
    console.error(error);
  }
}

function parseM3U(data) {
  const lines = data.split("\n");
  const channels = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const meta = lines[i];
      const url = lines[i + 1];
      const nameMatch = meta.match(/,(.*)$/);
      const logoMatch = meta.match(/tvg-logo="(.*?)"/);
      const groupMatch = meta.match(/group-title="(.*?)"/);
      const name = nameMatch ? nameMatch[1].trim() : "Unnamed";
      const logo = logoMatch ? logoMatch[1] : "";
      const group = groupMatch ? groupMatch[1] : "Others";
      
      if (url && name) {
        channels.push({ name, logo, url, group });
      }
    }
  }
  return channels;
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

function setupInitialView() {
    const search = searchInput.value.toLowerCase();
    const selectedGroup = categoryFilter.value;

    currentFilteredChannels = allChannels.filter(ch => {
        return (
            ch.name.toLowerCase().includes(search) &&
            (selectedGroup === "" || ch.group === selectedGroup)
        );
    });

    channelList.innerHTML = "";
    pageToLoad = 1;
    loadMoreChannels();
}

function loadMoreChannels() {
    if (isLoading) return;
    isLoading = true;

    const startIndex = (pageToLoad - 1) * CHANNELS_PER_LOAD;
    const endIndex = startIndex + CHANNELS_PER_LOAD;

    const channelsToRender = currentFilteredChannels.slice(startIndex, endIndex);

    if (channelsToRender.length === 0 && pageToLoad === 1) {
        channelList.innerHTML = `<div style="padding: 20px;">No channels found.</div>`;
    }

    channelsToRender.forEach((ch, localIndex) => {
        const globalIndex = startIndex + localIndex; // চ্যানেলের আসল ইনডেক্স
        const div = document.createElement("div");
        div.className = "channel";
        div.dataset.index = globalIndex; // প্রতিটি চ্যানেলকে চেনার জন্য ইনডেক্স যোগ করা
        div.onclick = () => playStream(ch, globalIndex);

        const img = document.createElement("img");
        img.src = ch.logo || "https://via.placeholder.com/50";
        img.onerror = () => { img.src = "https://via.placeholder.com/50"; };

        const nameSpan = document.createElement("span");
        nameSpan.textContent = ch.name;

        div.appendChild(img);
        div.appendChild(nameSpan);
        channelList.appendChild(div);
    });

    pageToLoad++;
    isLoading = false;
}

channelList.addEventListener('scroll', () => {
    if (channelList.scrollTop + channelList.clientHeight >= channelList.scrollHeight - 100) {
        loadMoreChannels();
    }
});

function playStream(channel, index) {
  currentChannelIndex = index;
  
  // "Now Playing" হাইলাইট করার জন্য
  document.querySelectorAll('.channel').forEach(d => d.classList.remove('active'));
  const activeElement = document.querySelector(`.channel[data-index="${index}"]`);
  if (activeElement) {
    activeElement.classList.add('active');
  }

  if (hls) hls.destroy();
  const url = channel.url;

  if (url.endsWith('.m3u8')) {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        video.play();
        // কোয়ালিটি সিলেকটর আবার যোগ করা হলো
        qualitySelector.innerHTML = "<b>🔧 Quality:</b> ";
        const autoBtn = document.createElement("button");
        autoBtn.textContent = "Auto";
        autoBtn.onclick = () => { hls.currentLevel = -1; };
        qualitySelector.appendChild(autoBtn);

        data.levels.forEach((level, i) => {
          const btn = document.createElement("button");
          btn.textContent = `${level.height}p`;
          btn.onclick = () => { hls.currentLevel = i; };
          qualitySelector.appendChild(btn);
        });
      });
    }
  } else {
    video.src = url;
    video.play();
    qualitySelector.innerHTML = ""; // MP4 এর জন্য কোয়ালিটি সিলেকটর খালি রাখা
  }
}

// অটোপ্লে নেক্সট ফিচার আবার যোগ করা হলো
function playNextVideo() {
  if (currentFilteredChannels.length === 0 || currentChannelIndex === -1) return;

  const nextIndex = (currentChannelIndex + 1) % currentFilteredChannels.length;
  const nextChannel = currentFilteredChannels[nextIndex];

  // পরের চ্যানেলটি যদি লোড না হয়ে থাকে, তাহলে লোড করা
  const nextElement = document.querySelector(`.channel[data-index="${nextIndex}"]`);
  if (!nextElement) {
    loadMoreChannels();
  }
  
  playStream(nextChannel, nextIndex);
}

video.addEventListener('ended', playNextVideo);
searchInput.addEventListener("input", setupInitialView);
categoryFilter.addEventListener("change", setupInitialView);

loadPlaylist();
