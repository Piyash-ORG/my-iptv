const video = document.getElementById("video");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const qualitySelector = document.getElementById("qualitySelector");

let allChannels = [];

async function loadPlaylist() {
  try {
    const res = await fetch("index.m3u"); // নিশ্চিত করুন আপনার প্লেলিস্ট ফাইলের নাম index.m3u
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

        // --- মূল পরিবর্তনটি এখানে করা হয়েছে ---
        // tvg-name এর পরিবর্তে কমা'র (,) পর থেকে নাম খোঁজা হচ্ছে
        const nameMatch = meta.match(/,(.*)$/); 
        
        const logoMatch = meta.match(/tvg-logo="(.*?)"/);
        const groupMatch = meta.match(/group-title="(.*?)"/);

        // .trim() যোগ করা হয়েছে যাতে নামের আগে-পরের অপ্রয়োজনীয় স্পেস মুছে যায়
        const name = nameMatch ? nameMatch[1].trim() : "Unnamed Channel"; 
        const logo = logoMatch ? logoMatch[1] : "";
        const group = groupMatch ? groupMatch[1] : "Others";
        
        // শুধুমাত্র যদি url এবং name ঠিকমতো পাওয়া যায়, তবেই লিস্টে যোগ করা হবে
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
  
  if (filtered.length === 0) {
    channelList.innerHTML = `<div style="padding: 20px;">No channels found.</div>`;
    return;
  }

  filtered.forEach(ch => {
    const div = document.createElement("div");
    div.className = "channel";
    div.onclick = () => playStream(ch.url);

    const img = document.createElement("img");
    img.src = ch.logo || "https://via.placeholder.com/50";
    img.onerror = () => { img.src = "https://via.placeholder.com/50"; }; // ভাঙ্গা লোগো লিঙ্ক এর সমাধান

    const nameSpan = document.createElement("span");
    nameSpan.textContent = ch.name;

    div.appendChild(img);
    div.appendChild(nameSpan);
    channelList.appendChild(div);
  });
}

let hls;

function playStream(url) {
  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
      const levels = hls.levels;
      qualitySelector.innerHTML = "<b>🔧 Quality:</b> ";

      // Auto Quality Button
      const autoBtn = document.createElement("button");
      autoBtn.textContent = "Auto";
      autoBtn.onclick = () => { hls.currentLevel = -1; };
      qualitySelector.appendChild(autoBtn);

      // Other Quality Buttons
      levels.forEach((level, i) => {
        const btn = document.createElement("button");
        btn.textContent = `${level.height}p`;
        btn.onclick = () => { hls.currentLevel = i; };
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

// অ্যাপলিকেশন শুরু করার জন্য ফাংশন কল
loadPlaylist();
