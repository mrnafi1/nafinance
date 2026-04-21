self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // অ্যাপটি অফলাইনেও কাজ করার জন্য এটি প্রয়োজন
});