const request = require('request');
const assert = require('assert');
const xmlParser = require('xml2js');

const baseURL = 'http://127.0.0.1:8081';
const colours = ['black', 'white', 'red', 'green', 'blue'];
const brands = [
    'Audi', 'Chevrolet', 'Chrystler', 'Dodge', 'Ferrari', 'Fiat',
    'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Mazda',
    'Mercedez-Benz', 'Mitsubish', 'Nissan', 'Peugeot', 'Porsche',
    'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Tesla', 'Hummer'
];

describe('Server responses', () => {
    describe('Validate response status', () => {
        it('Get landingpage', done => {
            request.get(baseURL, (err, res, body) => {
                assert.equal(res.statusCode, 404);
                done();
            });
        });

        it('Get api endpoint', done => {
            request.get(baseURL+'/api/cars', (err, res, body) => {
                assert.equal(res.statusCode, 200);
                done();
            });
        });

        it('Get car endpoint', done => {
            request.get(baseURL+'/api/cars', (err, res, body) => {
                assert.equal(res.statusCode, 200);
                done();
            });
        });

        it('Post car endpoint', done => {
            request.post(baseURL+'/api/cars', (err, res, body) => {
                assert.equal(res.statusCode, 405);
                done();
            });
        });
    });

    describe('Validate response type and length', () => {
        it('Get car', done => {
            request.get(baseURL+'/api/cars', (err, res, body) => {
                const response = JSON.parse(body);
                assert.equal(res.statusCode, 200);
                assert.equal(typeof response, 'object');
                assert.equal(response.cars.length, 1);
                done();
            });
        });
    
        it('Get cars', done => {
            request.get(baseURL+'/api/cars?number=500', (err, res, body) => {
                const response = JSON.parse(body);
                assert.equal(res.statusCode, 200);
                assert.equal(typeof response, 'object');
                assert.equal(response.cars.length, 500);
                done();
            });
        });
    });

    describe('Validate response values', () => {
        it('Confirm car value', done => {
            request.get(baseURL+'/api/cars', (err, res, body) => {
                const response = JSON.parse(body);
                const car = response.cars[0];

                assert.equal(res.statusCode, 200);
                assert.equal(typeof car, 'object');
                assert.equal(brands.includes(car.make), true);
                assert.equal(colours.includes(car.colour), true);
                assert.equal(car.registration.length, 8);
    
                const alphaPart = car.registration.substring(0, 2);
                const numberPart = car.registration.substring(2, 8);
    
                assert.equal(isNaN(alphaPart), true);
                assert.equal(isNaN(numberPart), false);
                done();
            });
        });
    
        it('Confirm car values', done => {
            request.get(baseURL+'/api/cars?number=1000', (err, res, body) => {
                assert.equal(res.statusCode, 200);
                const response = JSON.parse(body);
                assert.equal(response.cars.length, 1000);

                response.cars.map((car, i) => {
                    assert.equal(typeof car, 'object');
                    assert.equal(brands.includes(car.make), true);
                    assert.equal(colours.includes(car.colour), true);
                    assert.equal(car.registration.length, 8);
    
                    const alphaPart = car.registration.substring(0, 2);
                    const numberPart = car.registration.substring(2, 8);
    
                    assert.equal(isNaN(alphaPart), true);
                    assert.equal(isNaN(numberPart), false);
                });
                done();
            });
        });
    });

    describe('Validate response', () => {
        it('Confirm base response', done => {
            request.get(baseURL+'/', (err, res, body) => {
                assert.equal(res.headers['content-type'], 'text/plain');
                done();
            });
        });

        it('Confirm default response', done => {
            request.get(baseURL+'/api/cars', (err, res, body) => {
                assert.equal(res.headers['content-type'], 'application/json');
                assert.equal(
                    Object.prototype.toString.call(JSON.parse(body)),
                    '[object Object]'
                );
                done();
            });
        });

        it('Confirm json response', done => {
            request.get(baseURL+'/api/cars?type=json', (err, res, body) => {
                assert.equal(res.headers['content-type'], 'application/json');
                assert.equal(
                    Object.prototype.toString.call(JSON.parse(body)),
                    '[object Object]'
                );
                done();
            });
        });

        it('Confirm csv response', done => {
            request.get(baseURL+'/api/cars?type=csv', (err, res, body) => {
                assert.equal(res.headers['content-type'], 'application/csv');
                
                let value = body.split(/[,\n]/);
                value = value.splice(0, value.length-1); // removes empty new line
                
                assert.equal(value.length % 3, 0);
                assert.equal(value.length, 6);
                assert.equal(value[0], 'make');
                assert.equal(value[1], 'colour');
                assert.equal(value[2], 'registration');
                done();
            });
        });

        it('Confirm xml response', done => {
            request.get(baseURL+'/api/cars?type=xml', (err, res, body) => {
                assert.equal(res.headers['content-type'], 'application/xml');
                
                xmlParser.parseString(body, (err, result) => {
                    assert.equal(
                        Object.prototype.toString.call(result),
                        '[object Object]'
                    );
                    assert.equal(
                        Object.prototype.toString.call(result.data),
                        '[object Object]'
                    );
                    assert.equal(
                        Object.prototype.toString.call(result.data.car),
                        '[object Array]'
                    );

                    const keys = Object.keys(result.data.car[0]);
                    assert.ok(keys.includes('make'));
                    assert.ok(keys.includes('colour'));
                    assert.ok(keys.includes('registration'));
                });

                done();
            });
        });
    });

});