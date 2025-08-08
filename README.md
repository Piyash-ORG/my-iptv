# My IPTV Player 📺

A versatile, web-based player for all your M3U content, including **Live TV**, **Movies**, **Web Series**, and **FM Radio**. Built with vanilla HTML, CSS, and JavaScript.

**[➡️ Live Demo](https://jiocreator.github.io/streaming/)**



## ✨ Features

* **Multi-Content Support**: Seamlessly plays various media types like Live TV channels (`.m3u8`), Movies/VOD (`.mp4`), and live FM Radio streams.
* **Multiple Playlists**: Loads and merges multiple `.m3u` playlists from different URLs into a single, unified library.
* **Dual View Modes**: Switch between a detailed **List View** and a modern, thumbnail-focused **Grid View**.
* **Infinite Scroll**: Smoothly handles thousands of items by loading them as you scroll, ensuring fast performance.
* **Advanced Filtering & Sorting**:
    * Filter by **Category**.
    * Instantly **Search** by name.
    * **Sort** content (Default, Newest, A-Z, Z-A).
* **Favorite System**: **Long-press (1.5s)** any item to add or remove it from your personal favorites list, which is saved in your browser.
* **Quality Selector**: Automatically shows available quality options for HLS streams.
* **Autoplay Next**: Automatically plays the next item in the current list when one finishes.
* **Lazy Loading**: Images are loaded only when they scroll into view for a faster initial load.
* **Responsive Design**: Works smoothly on both desktop and mobile devices.

## 🚀 How to Use Your Own Playlists

1.  **Fork this repository** or use it as a template.
2.  Open the `script.js` file.
3.  Find the `playlistUrls` array at the top of the file.
4.  Replace the existing URLs with the URLs of your own `.m3u` files.

    ```javascript
    const playlistUrls = [
        "https://.../your_tv_channels.m3u",
        "https://.../your_movies.m3u"
    ];
    ```
5.  Commit your changes, and your player will load your custom playlists.

## 🛠️ Built With

* **HTML5**
* **CSS3** (Flexbox & Grid)
* **Vanilla JavaScript** (ES6+)
* **HLS.js** Library

