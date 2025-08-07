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
// -------------------------------------------


// --- Favorite Feature এর জন্য নতুন ফাংশন ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('myFavoriteChannels')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('myFavoriteChannels', JSON.stringify(favorites));
}

function toggleFavorite(event, channel, starIcon) {
    event.stopPropagation(); // এই লাইনের কারণে চ্যানেলে ক্লিক লাগবে না, শুধু বাটনে কাজ করবে
    let favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.name === channel.name && fav.url === channel.url);

    if (index > -1) {
        favorites.splice(index, 1);
        starIcon.classList.remove('favorited');
    } else {
        favorites.push(channel);
        starIcon.classList.add('favorited');
    }
    saveFavorites(favorites);

    // যদি ফেভারিট ক্যাটাগরিতে থাকা অবস্থায় কোনো চ্যানেল আনফেভারিট করা হয়
    if (categoryFilter.value === 'Favorites') {
        setupInitialView();
    }
}
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
  
  // ফেভারিট অপশন যোগ করা
  const favOpt = document.createElement("option");
  favOpt.value = "Favorites";
  favOpt.textContent = "⭐ Favorites";
  categoryFilter.appendChild(favOpt);

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

    if (selectedGroup === "Favorites") {
        currentFilteredChannels = getFavorites().filter(ch => ch.name.toLowerCase().includes(search));
    } else {
        currentFilteredChannels = allChannels.filter(ch => {
            return (
                ch.name.toLowerCase().includes(search) &&
                (selectedGroup === "" || ch.group === selectedGroup)
            );
        });
    }

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
        channelList.innerHTML = `<div style="padding: 20px;">Not found.</div>`;
    }

    channelsToRender.forEach((ch, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const div = document.createElement("div");
        div.className = "channel";
        div.dataset.index = globalIndex;
        div.onclick = () => playStream(ch, globalIndex);

        const img = document.createElement("img");
        img.src = ch.logo || "https://via.placeholder.com/50";
        img.onerror = () => { img.src = "https://via.placeholder.com/50"; };

        const nameSpan = document.createElement("span");
        nameSpan.textContent = ch.name;
        
        // --- ফেভারিট বাটন তৈরি ও যোগ করা ---
        const favoriteBtn = document.createElement("span");
        favoriteBtn.className = "favorite-btn";
        favoriteBtn.innerHTML = "&#9733;"; // Star character
        
        if (getFavorites().some(fav => fav.name === ch.name && fav.url === ch.url)) {
            favoriteBtn.classList.add('favorited');
        }
        favoriteBtn.onclick = (event) => toggleFavorite(event, ch, favoriteBtn);
        // ------------------------------------

        div.appendChild(img);
        div.appendChild(nameSpan);
        div.appendChild(favoriteBtn); // বাটনটি div এর সাথে যোগ করা
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
    qualitySelector.innerHTML = "";
  }
}

function playNextVideo() {
  if (currentFilteredChannels.length === 0 || currentChannelIndex === -1) return;

  const nextIndex = (currentChannelIndex + 1) % currentFilteredChannels.length;
  const nextChannel = currentFilteredChannels[nextIndex];

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
