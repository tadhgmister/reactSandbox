const fs = require("fs");
const path = require("path");
function getPath(url) {
    return path.join(path.resolve(__dirname, "../public"), decodeURIComponent(url));
}
module.exports = function(app) {
    console.log("CALLED PROXY MAKER");
    console.log(app);
    app.use("/api/indexof/", function(req, res, next) {
        console.log("CALLED INDEXOF: ", req.url);
        console.log(getPath(req.url));
        fs.readdir(getPath(req.url), (err, files) => {
            if (err) {
                res.json(null);
            } else {
                res.json(files);
            }
        });
        // res.json({ data: "HI THERE!" });
        // next(); // pass control to the next handler
    });
};
