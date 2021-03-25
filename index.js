const https = require('https');
const fs = require('fs');
const path = require('path');
const { createCanvas, Image } = require('canvas');

const express = require('express');
const hbs = require('hbs');

const utils = require('./utils');

const StreamFromArray = require('./src/StreamFromArray');
const Throttle = require('./src/Throttle');

const PORT = 6767;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const TenerifeBBox = {
	n: 28.61,
	w: -16.93,
	s: 27.99,
	e: -16.11,
};

function paramsValid(query) {
	return ['n', 'w', 's', 'e', 'z', 't'].every((p) => {
		return Object.keys(query).includes(p);
	});
}

const app = express();

const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views/pages');
const partialsPath = path.join(__dirname, './views/partials');

let tileOutputData = null;

app.use(express.static(publicDirectoryPath));

// setup handlebars
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
app.get('', (req, res) => {
	res.render('page', {
		title: 'Home',
	});
});

function getAndSaveTile(x, y, { type, zoom }) {
	const filePath = `./assets/${type}_${zoom}/${type}_${zoom}_${x}_${y}.jpg`;
	if (fs.existsSync(filePath)) {
		console.log(`${filePath} already exists, skipping...`);
	} else {
		https.get(
			`https://api.mapbox.com/v4/mapbox.${type}/${zoom}/${x}/${y}@2x.jpg90?access_token=${MAPBOX_TOKEN}`,
			(response) => {
				console.log('api call', x, y, type, zoom);
				response.pipe(fs.createWriteStream(filePath));
			}
		);
	}
}

function stitchTiles(
	directoryPath,
	tileData,
	opts = { tileSize: 512, format: 'png' }
) {
	const {
		bbox: { x1, y1, type, zoom, xCount, yCount },
	} = tileData;

	const tileImageNames = fs.readdirSync(directoryPath).filter((s) => {
		return s.split('.')[1] === opts.format;
	});

	const totalWidth = opts.tileSize * xCount;
	const totalHeight = opts.tileSize * yCount;

	const canvas = createCanvas(totalWidth, totalHeight);
	const ctx = canvas.getContext('2d');

	tileImageNames.forEach((imgName) => {
		// get x, y from name
		const [t, z, x, y, f] = imgName.replace('.', '_').split('_');

		let xOffset = (parseInt(x) - x1) * opts.tileSize;
		let yOffset = (parseInt(y) - y1) * opts.tileSize;
		const img = new Image();
		img.onload = () => ctx.drawImage(img, xOffset, yOffset);
		img.onerror = (err) => {
			console.error('image error', err);
		};
		img.src = directoryPath + '/' + imgName;
	});

	console.log('size of stitched image: ', totalWidth, totalHeight);
	return canvas.toBuffer('image/png');
}

app.get('/texture', (req, res) => {
	// get tile data
	const { type, zoom } = req.query;
	if (type && zoom) {
		const dirPath = `./assets/${type}_${zoom}`;

		const tileData = JSON.parse(
			fs.readFileSync(dirPath + '/' + 'tile_data.json').toString()
		);

		// console.log("tileData", tileData);
		const buffer = stitchTiles(dirPath, tileData);
		// console.log(image);
		fs.writeFileSync(`${dirPath}_full.png`, buffer);

		// TODO send image back
		res.send({ status: 'done' });
	} else {
		return res.render('texture', {
			title: 'Texture',
		});
	}
});
app.get('/mapbox', (req, res) => {
	if (paramsValid(req.query)) {
		const bbox = utils.getTileBox(req.query);
		const { x1, x2, y1, y2, zoom, type } = bbox;
		const dirPath = `./assets/${type}_${zoom}`;

		tileOutputData = { bbox, array: [] };

		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				tileOutputData.array.push({ x, y });
			}
		}

		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath);
		} else {
			// remove files
		}

		// save tile output data
		fs.writeFileSync(
			dirPath + '/' + 'tile_data.json',
			JSON.stringify(tileOutputData)
		);

		const tileStream = new StreamFromArray(tileOutputData.array);
		const throttle = new Throttle(150, { objectMode: true });

		tileStream
			.pipe(throttle)
			.on('data', (chunk) => {
				const { x, y } = chunk.data;
				getAndSaveTile(x, y, { zoom, type });
			})
			.on('end', () => {
				console.log('tileStream finished.');
			})
			.on('error', (err) => {
				console.log('error streaming tile: ', err);
			});

		return res.send({ info: 'processing your request...', bbox });
	} else {
		return res.render('mapbox', {
			title: 'Mapbox',
		});
	}
});
app.get('*', (req, res) => {
	res.render('404', {
		title: '404',
	});
});
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}...`);
});
