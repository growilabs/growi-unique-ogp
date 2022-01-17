const http = require('http');
const GrowiOgpDrawer  = require('./growi-ogp-drawer').GrowiOgpDrawer;
const PORT = process.env.PORT || 8088;

const growiOgpController = async(request, response) => {

    if (request.method === 'POST') {
        let body = '';
        let title, userName, userImage;
        request.on('data', (data) => {
            body += data;
        })
        request.on('end', async() => {
            title = JSON.parse(body).data.title;
            userName =  JSON.parse(body).data.userName;
            bufferedUserImage = JSON.parse(body).data.userImage;

            if (title == null || userName == null || bufferedUserImage == null) {
                response.write("Add title, userName and userImage in request body");
                return response.end();
            }
    
            const growiOgpDrawer = new GrowiOgpDrawer(title, userName, bufferedUserImage);
            const ogpCanvas = await growiOgpDrawer.drawOgp();
            const bufferedOgpImage = new Buffer.from(ogpCanvas.toDataURL().split(',')[1], 'base64');
    
            response.writeHead(200, {
                "Content-Type": "image/png",
                "cache-control": "public, max-age=999999",
            });
            response.write(bufferedOgpImage);
            response.end();
        })

    }


};

const growiOgpServer = http.createServer();

growiOgpServer.on('request', growiOgpController);
growiOgpServer.listen(PORT, '0.0.0.0');
