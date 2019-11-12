const { Image, createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const { format } = require('./commands/format');

const artisans = [
  { maker: 'Art Key Universe', sculpt: 'Mumkey', colorway: 'Something', image: `${__dirname}/seed/scrapers/artkey-images/image1.jpg` },
  { maker: 'Art Key Universe', sculpt: 'Mumkey', colorway: 'Something', image: `${__dirname}/seed/scrapers/artkey-images/image2.png` },
  { maker: 'Art Key Universe', sculpt: 'Mumkey', colorway: 'Something', image: `${__dirname}/seed/scrapers/artkey-images/image3.png` },
  { maker: 'Art Key Universe', sculpt: 'Mumkey', colorway: 'Something', image: `${__dirname}/seed/scrapers/artkey-images/image4.jpg` },
];

const width = 200;
const height = 220;
const imgWidth = 200;
const imgHeight = 200;
const gap = 10;

const numImgs = artisans.length;
const numCols = 3;
const numRows = parseInt(numImgs / numCols, 10) + (numImgs % numCols > 0 ? 1 : 0);

const canvasWidth = (gap * 2) + (Math.min(numImgs, numCols) * (width + gap));
const canvasHeight = (gap * 2) + (numRows * (height + gap));

const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

async function main() {
  const promises = [];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const src = artisans.shift();
      if (src) {
        const x = gap + (col * (width + gap));
        const y = gap + (row * (height + gap));

        promises.push(loadImage(src.image).then(img => {
          ctx.font = '24px serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          const text = `${src.sculpt} ${src.colorway}`;
          ctx.fillText(text, x + (width/2), y + height, width);
          ctx.drawImage(img, x, y, imgWidth, imgHeight);
        }));
      }
    }
  }

  const res = await Promise.all(promises).catch(err => console.error('Error', err));

  const out = fs.createWriteStream('wishlist.jpg');
  stream = canvas.createJPEGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('done'));

  return res;
}

main().then(_ => console.log('extra done'));
