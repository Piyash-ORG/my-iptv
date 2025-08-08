#  IPTV Player 📺

A simple, modern, and feature-rich web-based M3U playlist player built with vanilla HTML, CSS, and JavaScript.

**[➡️ Live Demo](https://jiocreator.github.io/streaming/)**


## ✨ Features

* **Multiple Playlists**: Loads and merges multiple `.m3u` playlists from different URLs.
* **Dual View Modes**: Switch between a clean **List View** and a modern **Grid View**.
* **Infinite Scroll**: Smoothly handles thousands of channels by loading them as you scroll.
* **Advanced Filtering**:
    * Filter by **Category**.
    * **Search** by channel name.
    * **Sort** channels (Default, Newest, A-Z, Z-A).
* **Favorite System**: **Long-press (1.5s)** any channel to add or remove it from your personal favorites list, which is saved in your browser.
* **HLS & MP4 Support**: Plays both HLS (`.m3u8`) and standard MP4 video streams.
* **Quality Selector**: Automatically shows available quality options for HLS streams.
* **Autoplay Next**: Automatically plays the next channel in the current list when one finishes.
* **Lazy Loading**: Images are loaded only when they scroll into view for faster performance.
* **Responsive Design**: Works smoothly on both desktop and mobile devices.

## 🚀 How to Use Your Own Playlists

1.  **Fork this repository** or use it as a template.
2.  Open the `script.js` file.
3.  Find the `playlistUrls` array at the top of the file.
4.  Replace the existing URLs with the URLs of your own `.m3u` files.

    ```javascript
    const playlistUrls = [
        "https://.../your_playlist1.m3u",
        "https://.../your_playlist2.m3u"
    ];
    ```
5.  Commit your changes, and your player will load your custom playlists.

## 🛠️ Built With

* **HTML5**
* **CSS3** (Flexbox & Grid)
* **Vanilla JavaScript** (ES6+)
* **HLS.js** Library

