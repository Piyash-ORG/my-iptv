document.addEventListener('DOMContentLoaded', function() {
    const playlistUrl = 'https://raw.githubusercontent.com/Piyash-ORG/my-iptv/refs/heads/main/index.m3u'; // আপনার গিটহাব Raw লিঙ্কটি এখানে দিন
    const playlistElement = document.getElementById('playlist');
    const videoPlayer = document.getElementById('videoPlayer');

    let hls = new Hls();

    // প্লেলিস্ট লোড করার ফাংশন
    async function loadPlaylist() {
        try {
            const response = await fetch(playlistUrl);
            const data = await response.text();
            parsePlaylist(data);
        } catch (error) {
            console.error('Error loading playlist:', error);
            playlistElement.innerHTML = 'প্লেলিস্ট লোড করা যায়নি।';
        }
    }

    // প্লেলিস্ট পার্স করে চ্যানেলের তালিকা দেখানোর ফাংশন
    function parsePlaylist(data) {
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF:')) {
                const channelName = lines[i].split(',').pop().trim();
                const streamUrl = lines[i + 1].trim();
                
                if (channelName && streamUrl) {
                    const channelItem = document.createElement('div');
                    channelItem.textContent = channelName;
                    channelItem.dataset.url = streamUrl; // ডেটা অ্যাট্রিবিউটে স্ট্রিম লিঙ্ক রাখা হলো
                    playlistElement.appendChild(channelItem);
                }
            }
        }
    }

    // প্লেলিস্টের কোনো চ্যানেলে ক্লিক করলে সেটি প্লে হবে
    playlistElement.addEventListener('click', function(e) {
        if (e.target && e.target.dataset.url) {
            const streamUrl = e.target.dataset.url;
            playStream(streamUrl);
        }
    });

    // স্ট্রিম প্লে করার ফাংশন
    function playStream(url) {
        if (Hls.isSupported()) {
            hls.loadSource(url);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                videoPlayer.play();
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = url;
            videoPlayer.addEventListener('loadedmetadata', function () {
                videoPlayer.play();
            });
        }
    }

    // অ্যাপ শুরু করার জন্য প্লেলিস্ট লোড করুন
    loadPlaylist();
});
