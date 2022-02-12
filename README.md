# Segasync

Segasync is a Node.js library for asynchronous downloading of segmented media, like segments in MPD/M3U8 playlists.

## Installing

**Requirements**

- [Node.js](https://nodejs.org) v16 or greater
- npm v8

**Install dependencies**

```bash
npm i
```

## Usage examples

**Downloading two streams: video & audio**

```javascript
const { download } = require('segasync');

const tracks = [
  {
    urls: [
      'https://ll.v.vrv.co/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/fragment-23-f1-a1-x3.m4s?t=exp=1644850035~acl=/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/*~hmac=a5c72d918094933b84a959a0718d2f3e7dc53df150bf88c48231fb4bcc99a904',
      'https://ll.v.vrv.co/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/fragment-72-f1-a1-x3.m4s?t=exp=1644850035~acl=/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/*~hmac=a5c72d918094933b84a959a0718d2f3e7dc53df150bf88c48231fb4bcc99a904'
    ],
    filepath: 'downloads/video.mp4'
  },
  {
    urls: [
      'https://ll.v.vrv.co/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/fragment-106-f2-v1-x3.m4s?t=exp=1644850035~acl=/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/*~hmac=a5c72d918094933b84a959a0718d2f3e7dc53df150bf88c48231fb4bcc99a904',
      'https://ll.v.vrv.co/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/fragment-100-f1-a1-x3.m4s?t=exp=1644850035~acl=/evs1/226e764e388890159fab57aa02cdb9a2/assets/p/2583c52d3b940781078378ce9796b25b_,3547366.mp4,3547367.mp4,3547365.mp4,3547363.mp4,3547364.mp4,.urlset/*~hmac=a5c72d918094933b84a959a0718d2f3e7dc53df150bf88c48231fb4bcc99a904'
    ],
    filepath: 'downloads/audio.m4a'
  }
];

const queue = [];
for (const track of tracks) {
  const { urls, filepath } = track;
  queue.push(download(urls, { filepath }));
}

try {
  await Promise.all(queue);
} catch (e) {
  console.error(`Download failed: ${e.message}`);
}

```
