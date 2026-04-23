// 🔴 প্রতিবার নতুন আপডেট দিলে নিচের ভার্সন নাম্বারটি পরিবর্তন করবেন (যেমন: v1 থেকে v2)
const CACHE_NAME = 'nafinance-premium-v4'; 

const assetsToCache = [
  '/',
  '/index.html',
  // আপনার যদি কোনো লোগো বা মেইন আইকন থাকে সেগুলো এখানে অ্যাড করতে পারেন
];

// ১. ইন্সটল ইভেন্ট: নতুন সার্ভিস ওয়ার্কার আসার সাথে সাথে এটি আগেরটাকে সরিয়ে দিবে
self.addEventListener('install', (event) => {
  self.skipWaiting(); // এটি নতুন আপডেটকে "Waiting" এ না রেখে সরাসরি চালু করে দিবে
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NaFinance: New Cache Established');
      return cache.addAll(assetsToCache);
    })
  );
});

// ২. অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ ডিলিট করার লজিক
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('NaFinance: Clearing Old Cache...', cache);
            return caches.delete(cache); // পুরনো ভার্সন ডিলিট করে দিবে
          }
        })
      );
    })
  );
  return self.clients.claim(); // সাথে সাথে সব ট্যাব কন্ট্রোল নিয়ে নিবে
});
// ৩. ফেচ ইভেন্ট: নেটওয়ার্ক ফার্স্ট স্ট্র্যাটেজি (ক্র্যাশ ফিক্সড)
self.addEventListener('fetch', (event) => {
  // শুধুমাত্র সাধারণ GET রিকোয়েস্টগুলো ক্যাশ করবে
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        // যদি ক্যাশে ডেটা থাকে সেটা দিবে, না থাকলে অ্যাপ ক্র্যাশ না করিয়ে একটা ডিফল্ট মেসেজ দিবে
        return response || new Response("Offline Content Not Found", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});