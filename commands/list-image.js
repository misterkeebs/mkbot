const { Image, createCanvas, loadImage } = require('canvas');
const { formatName } = require('./format');

const imgWidth = 300;
const imgHeight = imgWidth;
const width = imgWidth;
const height = imgHeight + (imgHeight/10);
const gapH = 10;
const gapV = 20;
const fontSize = 28;

class ListImage {
  constructor(list) {
    this.list = list;
  }

  async render() {
    const artisans = await this.list.getArtisans();

    const numImgs = artisans.length;
    const numCols = 3;
    const numRows = parseInt(numImgs / numCols, 10) + (numImgs % numCols > 0 ? 1 : 0);

    const canvasWidth = (gapH * 2) + (Math.min(numImgs, numCols) * (width + gapH));
    const canvasHeight = (gapV * 2) + (numRows * (height + gapV));

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const promises = [];

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const src = artisans.shift();
        if (src) {
          const x = gapH + (col * (width + gapH));
          const y = gapV + (row * (height + gapV));

          promises.push(loadImage(src.image).then(img => {
            ctx.font = `${fontSize}px serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            const text = formatName(src);
            ctx.fillText(text, x + (width/2), y + height + 5, width);
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
          }));
        }
      }
    }

    const res = await Promise.all(promises);
    return canvas.toBuffer();
  }
}

module.exports = ListImage;
