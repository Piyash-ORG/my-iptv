document.addEventListener('DOMContentLoaded', () => {
    // আপনার M3U লিঙ্ক
    const M3U_URL = 'https://raw.githubusercontent.com/Piyash-ORG/my-iptv/refs/heads/main/index.m3u'; 
    
    // DOM Elements
    const gridElement = document.getElementById('channel-grid');
    const searchInput = document.getElementById('searchInput');
    const categoryFiltersElement = document.getElementById('categoryFilters');
    const playerModal = document.getElementById('player-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const videoPlayer = document.getElementById('videoPlayer');
    const nowPlayingElement = document.getElementById('nowPlaying');

    let channels = [];
    let hls = new Hls();

    // M3U ফাইল লোড ও পার্স করার ফাংশন (আগের মতোই)
    async function loadPlaylist() {
        try {
            const response = await fetch(M3U_URL);
            const data = await response.text();
            channels = parseM3U(data);
            renderCategories(channels);
            renderGrid(channels);
        } catch (error) {
            console.error('Error loading playlist:', error);
            gridElement.innerHTML = `<p style="color: red; padding: 1rem;">Failed to load playlist.</p>`;
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const parsedChannels = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                const titleMatch = lines[i].match(/,(.*)/);
                const logoMatch = lines[i].match(/tvg-logo="([^"]*)"/);
                const categoryMatch = lines[i].match(/group-title="([^"]*)"/);
                const urlLine = lines[i + 1];

                if (titleMatch && urlLine) {
                    parsedChannels.push({
                        title: titleMatch[1].trim(),
                        logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/150',
                        category: categoryMatch ? categoryMatch[1] : 'General',
                        url: urlLine.trim()
                    });
                }
            }
        }
        return parsedChannels;
    }

    // গ্রিডে চ্যানেল দেখানোর নতুন ফাংশন
    function renderGrid(channelsToRender) {
        gridElement.innerHTML = '';
        channelsToRender.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <img src="${channel.logo}" alt="${channel.title}" class="thumbnail" onerror="this.onerror=null;this.src='https://via.placeholder.com/150';">
                <div class="title">${channel.title}</div>
            `;
            // কার্ডে ক্লিক করলে মডাল খুলবে
            card.addEventListener('click', () => {
                openPlayerModal(channel);
            });
            gridElement.appendChild(card);
        });
    }
    
    // ক্যাটাগরি ফিল্টার দেখানোর ফাংশন (আগের মতোই)
    function renderCategories(allChannels) {
        const categories = ['All', ...new Set(allChannels.map(ch => ch.category))];
        categoryFiltersElement.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = category;
            if (category === 'All') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterChannels();
            });
            categoryFiltersElement.appendChild(btn);
        });
    }
    
    // মডাল খোলা ও ভিডিও প্লে করার ফাংশন
    function openPlayerModal(channel) {
        playerModal.style.display = 'flex'; // মডাল দেখানো
        nowPlayingElement.textContent = channel.title;
        if (Hls.isSupported()) {
            hls.loadSource(channel.url);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play();
            });
        }
    }

    // মডাল বন্ধ করার ফাংশন
    function closePlayerModal() {
        playerModal.style.display = 'none'; // মডাল লুকানো
        hls.stopLoad(); // স্ট্রিম লোড বন্ধ করা
        videoPlayer.pause();
        videoPlayer.src = ""; // ভিডিও সোর্স খালি করে দেওয়া
    }

    closeModalBtn.addEventListener('click', closePlayerModal);
    
    // সার্চ এবং ফিল্টার ফাংশন
    function filterChannels() {
        const searchText = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').textContent;

        const filteredChannels = channels.filter(channel => {
            const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
            const matchesSearch = channel.title.toLowerCase().includes(searchText);
            return matchesCategory && matchesSearch;
        });

        renderGrid(filteredChannels);
    }
    
    searchInput.addEventListener('input', filterChannels);

    // অ্যাপ চালু করা
    loadPlaylist();
});
