// ram-eater.js — Browser-safe memory stressor
(function () {
  let blocks = [];
  let allocated = 0;
  let interval = null;

  function log(msg) {
    // Log to console and try to update a status element if present
    console.log(msg);
    const el = document.getElementById('status-message');
    if (el) el.textContent = msg;
  }

  function stressMemory(targetMiB = 4096, chunkMiB = 64, delayMs = 100) {
    // Stop any previous run
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    blocks = [];
    allocated = 0;

    const targetBytes = targetMiB * 1024 * 1024;
    const chunkBytes  = chunkMiB * 1024 * 1024;

    log(`Starting stress: target=${targetMiB} MiB, chunk=${chunkMiB} MiB, delay=${delayMs}ms`);

    interval = setInterval(() => {
      try {
        if (allocated + chunkBytes > targetBytes) {
          clearInterval(interval);
          interval = null;
          log(`Reached ~${(allocated / 1024 / 1024).toFixed(1)} MiB. Holding memory.`);
        } else {
          const arr = new Uint8Array(chunkBytes);
          // Fill with random data to avoid compression/dedup
          for (let i = 0; i < arr.length; i++) {
            arr[i] = (Math.random() * 256) | 0;
          }
          blocks.push(arr);
          allocated += chunkBytes;
          log(`Allocated ${(allocated / 1024 / 1024).toFixed(1)} MiB`);
        }
      } catch (e) {
        clearInterval(interval);
        interval = null;
        log(`Error at ${(allocated / 1024 / 1024).toFixed(1)} MiB: ${e.message}`);
      }
    }, delayMs);
  }

  function releaseMemory() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    blocks = [];
    allocated = 0;
    log("Released memory.");
  }

  // Expose to global scope
  window.stressMemory = stressMemory;
})();
