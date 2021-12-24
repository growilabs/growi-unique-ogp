const http = require('http');
const url = require('url');
const GrowiOgpDrawer  = require('./growi-ogp-drawer').GrowiOgpDrawer;
const PORT = process.env.PORT || 8088;

const growiOgpController = async(request, response) => {

    if (request.method === 'GET') {
        const query = url.parse(request.url, true).query;
        const title = query["title"];
        const userName = query["userName"]

        if (title == null || userName == null) {
            response.write("Add Query to this page. '?title=$TITLE&userName=$userName'");
            return response.end();
        }

        const growiOgpDrawer = new GrowiOgpDrawer(title, userName);
        const ogpCanvas = await growiOgpDrawer.drawOgp();
        const bufferedOgpImage = new Buffer.from(ogpCanvas.toDataURL().split(',')[1], 'base64');

        response.writeHead(200, {
            "Content-Type": "image/png",
            "cache-control": "public, max-age=999999",
        });

        response.write(bufferedOgpImage);

    }

    response.end();

};

const growiOgpServer = http.createServer();

growiOgpServer.on('request', growiOgpController);
growiOgpServer.listen(PORT, '0.0.0.0');
