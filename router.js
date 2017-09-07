const url = require('url');
const fs = require('fs');

let endpoints = {};
module.exports = {
    // redirects all requests to its appropriate handler
    route: function(req, res) {
        addFeatures(req, res);

        if (endpoints[req.pathname]) {
            if (endpoints[req.pathname][req.method]) {
                endpoints[req.pathname][req.method](req, res);
            } else {
                res.status(405).end();
            }
        } else {
            res.status(404).end();
        }
    },
    // insert new endpoints
    add: function(path, handler) {
        const pathType = typeof path;
        const endpointType = typeof handler;

        if (pathType != 'string') {
            throw new TypeError(
                'Expected path to be of type string, but received '+
                pathType
            );
        } else if (endpointType != 'object') {
            throw new TypeError(
                'Expected endpoint to be of type object, but received '+
                endpointType
            );
        }

        if (endpoints[path]) {
            throw new Error('Duplicate endpoints added');
        } else {
            endpoints[path] = handler;
        }
    },
    // import new endpoints
    import: function(path) {
        const basePath = path.substr(1)+'/';
        const endpoints = fs.readdirSync(path);

        for (let i = 0; i < endpoints.length; i++) {
            if (endpoints[i].endsWith('.js')) {
                const endpoint = basePath + endpoints[i].slice(0, -3);
                this.add(endpoint, require('.'+endpoint));
            } else {
                this.import(path+'/'+endpoints[i]);
            }
        }
    }
};

function addFeatures(req, res) {
    const hostURL = new url.URL('http://127.0.0.1:8081'+req.url);
    req.query = hostURL.searchParams;
    req.pathname = hostURL.pathname;
    req.method = req.method.toLowerCase();

    res.__proto__.status = (code) => {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = code;
        return res;
    };

    res.__proto__.json = (obj) => {
        if (typeof obj != 'object') {
            throw new TypeError(
                'Expected Object, but received ' + typeof obj
            );
        }

        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(obj));
        return res;
    };

    res.__proto__.csv = (arr) => {
        res.setHeader('Content-Type', 'application/csv');

        if (!arr) {
            throw new Error('Expected an array with car(s)');
        }

        if (Object.prototype.toString.call(arr) != '[object Array]') {
            throw new TypeError(
                'Expected an array, received '+
                Object.prototype.toString.call(arr)
            );
        }

        let csv = '';
        for (let i = 0; i < arr.length; i++) {
            const car = arr[i];
            const keys = Object.keys(car);

            if (i == 0) {
                for (let j = 0; j < keys.length; j++) {
                    csv += keys[j];
                    csv += j == keys.length-1 ? '\n':',';
                }
            }

            for (let j = 0; j < keys.length; j++) {
                csv += car[keys[j]];
                csv += j == keys.length-1 ? '\n':',';
            }
        }

        res.write(csv);
        return res;
    };

    res.__proto__.xml = (child, arr) => {
        res.setHeader('Content-Type', 'application/xml');

        if (!arr) {
            throw new Error('Expected an array with car(s)');
        }

        if (!child) {
            throw new Error('Expected string');
        }

        if (Object.prototype.toString.call(arr) != '[object Array]') {
            throw new TypeError(
                'Expected an array, received '+
                Object.prototype.toString.call(arr)
            );
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<data>';

        for (let i = 0; i < arr.length; i++) {
            const keys = Object.keys(arr[i]);

            xml += `<${child}>`;
            for (let j = 0; j < keys.length; j++) {
                xml += `<${keys[j]}>${arr[i][keys[j]]}</${keys[j]}>`;
            }
            xml += `</${child}>`;
        }
        xml += '</data>';
        res.write(xml);
        return res;
    };
}