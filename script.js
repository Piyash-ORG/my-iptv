// script.js ফাইলের এই ফাংশনটি পরিবর্তন করুন

async function loadPlaylist() {
  const res = await fetch("index.m3u");
  const text = await res.text();
  const lines = text.split("\n");
  allChannels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const meta = lines[i];
      const url = lines[i + 1];

      // --- এই লাইনটি পরিবর্তন করা হয়েছে ---
      const nameMatch = meta.match(/,(.*)$/); // এখানে tvg-name এর পরিবর্তে কমা'র পর থেকে নাম খোঁজা হচ্ছে

      const logoMatch = meta.match(/tvg-logo="(.*?)"/);
      const groupMatch = meta.match(/group-title="(.*?)"/);

      // .trim() ব্যবহার করা হয়েছে যাতে নামের আগে-পরে থাকা অপ্রয়োজনীয় স্পেস মুছে যায়
      const name = nameMatch ? nameMatch[1].trim() : "Unnamed Channel"; 
      const logo = logoMatch ? logoMatch[1] : "";
      const group = groupMatch ? groupMatch[1] : "Others";

      // url থাকলে এবং নাম থাকলে তবেই চ্যানেলের লিস্টে যোগ করা হবে
      if (url && name) { 
        allChannels.push({ name, logo, url, group });
      }
    }
  }

  populateCategories();
  showChannels();
}
