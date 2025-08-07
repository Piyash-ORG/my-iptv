document.addEventListener('DOMContentLoaded', () => {
    // আপনার গিটহাব M3U Raw লিঙ্কটি এখানে দিন
    const M3U_URL = 'https://raw.githubusercontent.com/Piyash-ORG/my-iptv/refs/heads/main/index.m3u'; 
    
    // DOM Elements
    const playlistElement = document.getElementById('playlist');
    const searchInput = document.getElementById('searchInput');
    const categoryFiltersElement = document.getElementById('categoryFilters');
    const videoPlayer = document.getElementById('videoPlayer');
    const nowPlayingElement = document.getElementById('nowPlaying');

    let channels = []; // সব চ্যানেলের তথ্য এখানে জমা হবে
    let hls = new Hls();

    // ১. প্লেলিস্ট ফেচ এবং পার্স করা
    async function loadPlaylist() {
        try {
            const response = await fetch(M3U_URL);
            const data = await response.text();
            channels = parseM3U(data);
            renderCategories(channels);
            renderPlaylist(channels);
        } catch (error) {
            console.error('Error loading playlist:', error);
            playlistElement.innerHTML = `<p style="color: red; padding: 1rem;">Failed to load playlist.</p>`;
        }
    }

    function parseM3U(data) {
        const lines = data.split('\n');
        const parsedChannels = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                const infoLine = lines[i];
                const urlLine = lines[i + 1];

                const titleMatch = infoLine.match(/,(.*)/);
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const categoryMatch = infoLine.match(/group-title="([^"]*)"/);

                if (titleMatch && urlLine) {
                    parsedChannels.push({
                        title: titleMatch[1].trim(),
                        logo: logoMatch ? logoMatch[1] : 'placeholder.png', // Placeholder if no logo
                        category: categoryMatch ? categoryMatch[1] : 'General',
                        url: urlLine.trim()
                    });
                }
            }
        }
        return parsedChannels;
    }

    // ২. প্লেলিস্ট UI-তে দেখানো
    function renderPlaylist(channelsToRender) {
        playlistElement.innerHTML = ''; // আগের লিস্ট মুছে ফেলি
        channelsToRender.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <img src="${channel.logo}" alt="${channel.title}" class="channel-logo" onerror="this.src='https://via.placeholder.com/50';">
                <div class="channel-info">
                    <div class="title">${channel.title}</div>
                    <div class="category">${channel.category}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                playChannel(channel);
                // Active class যোগ করা
                document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
            playlistElement.appendChild(card);
        });
    }

    // ৩. ক্যাটাগরি ফিল্টার তৈরি করা
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
                filterChannelsByCategory(category);
            });
            categoryFiltersElement.appendChild(btn);
        });
    }

    // ৪. চ্যানেল প্লে করা
    function playChannel(channel) {
        if (Hls.isSupported()) {
            hls.loadSource(channel.url);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play();
                nowPlayingElement.textContent = `Now Playing: ${channel.title}`;
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = channel.url;
            videoPlayer.play();
            nowPlayingElement.textContent = `Now Playing: ${channel.title}`;
        }
    }
    
    // ৫. সার্চ এবং ফিল্টার ফাংশন
    function filterChannels() {
        const searchText = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').textContent;

        const filteredChannels = channels.filter(channel => {
            const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
            const matchesSearch = channel.title.toLowerCase().includes(searchText);
            return matchesCategory && matchesSearch;
        });

        renderPlaylist(filteredChannels);
    }
    
    function filterChannelsByCategory(category) {
        searchInput.value = ''; // ক্যাটাগরি বদলালে সার্চ রিসেট
        filterChannels();
    }
    
    searchInput.addEventListener('input', filterChannels);

    // অ্যাপ চালু করা
    loadPlaylist();
});

