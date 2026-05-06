/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  postMessage(data);
});

setInterval(() => {
  postMessage([`BTC/USD ${Math.random() * 100}`]);
}, 1000);
