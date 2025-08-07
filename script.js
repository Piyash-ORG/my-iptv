const video = document.getElementById("video");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const qualitySelector = document.getElementById("qualitySelector");

let allChannels = [];
let hls;

// --- Infinite Scroll এর জন্য নতুন ভ্যারিয়েবল ---
const CHANNELS_PER_LOAD = 20; // একবারে কতগুলো চ্যানেল লোড হবে
let currentFilteredChannels = []; // ফিল্টার করা সম্পূর্ণ তালিকা
let pageToLoad = 1; // পরবর্তী কোন পৃষ্ঠা লোড হবে
let isLoading = false; // একাধিকবার লোড হওয়া থেকে বিরত রাখার জন্য
// ------------------------------------------

async function loadPlaylist() {
  try {
    const res = await fetch("index.m3u");
    if (!res.ok) throw new Error(`Failed to load playlist: ${res.status}`);
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
        const name = nameMatch ? nameMatch[1].trim() : "Unnamed";
        const logo = logoMatch ? logoMatch[1] : "";
        const group = groupMatch ? groupMatch[1] : "Others";
        
        if (url && name) {
          allChannels.push({ name, logo, url, group });
        }
      }
    }
    populateCategories();
    setupInitialView();
  } catch (error) {
    channelList.innerHTML = `<div style="color: red; padding: 20px;">Error: Could not load playlist.</div>`;
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
        isLoading = false;
        return;
    }

    channelsToRender.forEach(ch => {
        const div = document.createElement("div");
        div.className = "channel";
        div.onclick = () => playStream(ch);

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
    // যখন স্ক্রলের প্রায় শেষে পৌঁছাবে
    if (channelList.scrollTop + channelList.clientHeight >= channelList.scrollHeight - 100) {
        loadMoreChannels();
    }
});


function playStream(channel) {
  if (hls) hls.destroy();
  const url = channel.url;
  if (url.endsWith('.m3u8')) {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    }
  } else {
    video.src = url;
    video.play();
  }
}

// আগের অটোপ্লে নেক্সট এবং কোয়ালিটি সিলেকশন এই সিম্পল ভার্সনে নেই
// সার্চ এবং ফিল্টার করলে নতুন করে লিস্ট দেখানো হবে
searchInput.addEventListener("input", setupInitialView);
categoryFilter.addEventListener("change", setupInitialView);

loadPlaylist();
