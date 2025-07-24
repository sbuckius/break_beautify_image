let baseImage;
let brokenImage;
let overlays = [];

function setup() {
  createCanvas(800, 800);
  noLoop();

  document.getElementById('baseImageInput').addEventListener('change', e => {
    let file = e.target.files[0];
    if (file) {
      loadImage(URL.createObjectURL(file), img => {
        baseImage = img;
        brokenImage = baseImage.get();
        image(baseImage, 0, 0, width, height);
      });
    }
  });

  document.getElementById('overlayInput').addEventListener('change', e => {
    overlays = [];
    let files = e.target.files;
    for (let file of files) {
      loadImage(URL.createObjectURL(file), img => {
        overlays.push(img);
      });
    }
  });
}

function breakImage() {
  if (!baseImage) return;

  brokenImage = baseImage.get();

  // 1. Extreme Glitch effect
  for (let i = 0; i < 80; i++) {
    let y = int(random(brokenImage.height));
    let h = int(random(30, 150));
    let xOffset = int(random(-300, 300));
    let strip = brokenImage.get(0, y, brokenImage.width, h);
    brokenImage.copy(strip, 0, 0, brokenImage.width, h, xOffset, y, brokenImage.width, h);
  }

  // 2. Heavy overlaying
  for (let i = 0; i < 50 && overlays.length > 0; i++) {
    let overlay = random(overlays);
    let sw = int(random(100, 300));
    let sh = int(random(100, 300));
    let sx = int(random(overlay.width - sw));
    let sy = int(random(overlay.height - sh));
    let dx = int(random(brokenImage.width));
    let dy = int(random(brokenImage.height));
    brokenImage.copy(overlay, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  // 3. Lots of big holes
  let mask = createGraphics(brokenImage.width, brokenImage.height);
  mask.background(255);
  for (let i = 0; i < 60; i++) {
    mask.noStroke();
    mask.fill(0);
    let holeW = random(80, 300);
    let holeH = random(80, 300);
    mask.ellipse(random(width), random(height), holeW, holeH);
  }
  brokenImage.mask(mask);

  // 4. Pixel sorting on horizontal glitch bands
  pixelSortHorizontalBands(brokenImage, 40);

  // Display final result
  clear();
  image(brokenImage, 0, 0, width, height);

  // Show Save Button
  document.getElementById("saveButton").style.display = "inline-block";
}

function pixelSortHorizontalBands(img, numBands = 30) {
  img.loadPixels();

  for (let i = 0; i < numBands; i++) {
    let y = int(random(img.height));
    let h = int(random(5, 20));

    for (let row = y; row < y + h && row < img.height; row++) {
      let rowPixels = [];

      for (let x = 0; x < img.width; x++) {
        let idx = 4 * (row * img.width + x);
        rowPixels.push([
          img.pixels[idx],
          img.pixels[idx + 1],
          img.pixels[idx + 2],
          img.pixels[idx + 3]
        ]);
      }

      if (random() < 0.5) {
        rowPixels.sort((a, b) => brightness(color(...a)) - brightness(color(...b)));
      } else {
        shuffle(rowPixels, true);
      }

      for (let x = 0; x < img.width; x++) {
        let idx = 4 * (row * img.width + x);
        let pix = rowPixels[x];
        img.pixels[idx] = pix[0];
        img.pixels[idx + 1] = pix[1];
        img.pixels[idx + 2] = pix[2];
        img.pixels[idx + 3] = pix[3];
      }
    }
  }

  img.updatePixels();
}
