const http = require("http");
const fs = require('fs')


module.exports = ({ output, port = 8000 } ) => {
    const host = 'localhost';

    const requestListener = function (req, res) {
        const path = __dirname+ '/' + output + req.url +"/index.html"
        try {
            const file = fs.readFileSync(path)
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(file);
        } catch (error) {
            res.writeHead(500);
            res.end(`error is ${error}`)
            return
        }
    };
    
    try {
        const server = http.createServer(requestListener);
        
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
        
    } catch (error) {
        console.log(error);
    }
}
