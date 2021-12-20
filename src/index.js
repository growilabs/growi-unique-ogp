const http = require('http');
const url = require('url');

const jquery = require('jquery');
const jsdom = require('jsdom');
const jCanvas = require('jcanvas');
const unique_ogp = require('./unique_ogp.js');

const { registerFont } = require('canvas');
const Canvas = require('canvas');
const { JSDOM } = jsdom;

const OGP_IMAGE_PATH = '../resources/growi_logo.svg';
const OGP_BG_IMAGE_PATH = '../resources/growi_ogp_bg.svg';

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
        const imageBg = await Canvas.loadImage(OGP_BG_IMAGE_PATH);

        // imageBg.width *= 0.98
        // imageBg.height *= 0.98

        const drawCanvas = new Canvas.createCanvas(1200, 630);
        const context = drawCanvas.getContext('2d');
    
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, 1200, 630);

        context.drawImage(image, 1200/2 - (image.width/2), 40);
        context.drawImage(imageBg, 0, 0);

        // gradient
        var grad= context.createLinearGradient(0, 0, 1200, 0);
        grad.addColorStop(0.3, "#39c8ff");
        grad.addColorStop(1, "#f32dff");
        
        context.strokeStyle = grad;
        
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(1200,0);
        context.lineWidth = 13 ;
        context.stroke();
        // end gradient

        // gradient
        var grad= context.createLinearGradient(1200, 630, 0, 630);
        grad.addColorStop(0.3, "#39c8ff");
        grad.addColorStop(1, "#f32dff");
        
        context.strokeStyle = grad;
        
        context.beginPath();
        context.moveTo(0,630);
        context.lineTo(1200,630);
        context.lineWidth = 13 ;
        context.stroke();
        // end gradient
    
    
        const x = (1200 / 2);
        const y = (630 / 2);
    

        console.log(image.width);
    
        context.fillStyle = '#112744';
        context.font = "bold 70px sans-serif";
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`new OGP image: ${title}`, x, y);

        context.font = "bold 40px sans-serif";
        context.fillText('@yuto-o', x, 580);



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