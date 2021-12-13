const http = require('http');
const url = require('url');

const jquery = require('jquery');
const jsdom = require('jsdom');
const jCanvas = require('jcanvas');
const unique_ogp = require('./unique_ogp.js');

const { registerFont } = require('canvas');
const Canvas = require('canvas');
const { JSDOM } = jsdom;

const OGP_IMAGE_PATH = '../resources/white.png';
const PORT = process.env.PORT || 8088;

// TODO: remove unnesessary methods
var getArticon = function(title, brand, mode) {
    registerFont('./fonts/NotoSansCJKjp-Black.otf', {'family': 'noto', 'weight': 'bold'});
    const { window } = new JSDOM(`<!DOCTYPE html><canvas id="canvas" width="1200" height="630"></canvas>`, {runScripts: "outside-only"});
    const $ = jquery(window);
    jCanvas($, window);
    var canvas = $("#canvas");
    canvas = unique_ogp.draw(canvas, title, brand, mode);
    return canvas[0];
};

async function OgpAppController(request, response) {

     // TODO: refactor and adjust design after ogp design is created

    if (request.method === 'GET') {
        let query = url.parse(request.url, true).query;
        let title = query["title"];
        let brand = query["brand"];
        let mode = query["mode"];
        if (!title) {
            response.write("Add Query to this page. '?title=$TITLE&brand=$BRAND'");
            return response.end();
        }
        
        const image = await Canvas.loadImage(OGP_IMAGE_PATH);
        const drawCanvas = new Canvas.createCanvas(1200, 640);
        const ctx = drawCanvas.getContext('2d');
    
        ctx.drawImage(image, 0, 0);
    
        const x = (1200 / 2);
        const y = (640 / 2);
    
        ctx.fillStyle = 'black';
        ctx.font = "bold 120px Arial";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`OGP: ${title}`, x, y);
    
        response.writeHead(200, {
            "Content-Type": "image/png",
            "cache-control": "public, max-age=999999",
        });
        response.write(new Buffer.from(drawCanvas.toDataURL().split(',')[1], 'base64'));

    }

    response.end();

};

const ogpServer = http.createServer();

ogpServer.on('request', OgpAppController);
ogpServer.listen(PORT, '0.0.0.0');
