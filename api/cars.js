module.exports = {
    get: function(req, res) {
        if (isNaN(req.query.get('number'))) {
            res.status(400).end();
        } else {
            const amount = parseInt(req.query.get('number')) || 1;

            if (!req.query.get('type')) {
                res.status(200).json({cars: getCars(amount)}).end();
            } else {
                switch (req.query.get('type')) {
                case 'json':
                    res.status(200).json({cars: getCars(amount)}).end();
                    break;
                case 'csv':
                    res.status(200).csv(getCars(amount)).end();
                    break;
                case 'xml':
                    res.status(200).xml('car', getCars(amount)).end();
                    break;
                default:
                    res.status(200).json({cars: getCars(amount)}).end();
                    break;
                }
            }
        }
    }
};

// Generate a car with random values
function getCars(amount) {
    return Array.apply({}, Array(amount)).map(() => {
        return {
            make: brands[randomInt(0, brands.length-1)],
            colour: colours[randomInt(0, colours.length-1)],
            registration: generateRegNr()
        };
    });
}

// Generate a random number inside a given interval
function randomInt(min, max) {
    return Math.round((Math.random()*(max-min))+min);
}

// Generate a random set of chars
function randomStr() {
    return String.fromCharCode(randomInt(65, 90), randomInt(65, 90));
}

// Generate car number plate
function generateRegNr() {
    return randomStr() + randomInt(100000, 999999);
}

const colours = ['black', 'white', 'red', 'green', 'blue'];
const brands = [
    'Audi', 'Chevrolet', 'Chrystler', 'Dodge', 'Ferrari', 'Fiat',
    'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Mazda',
    'Mercedez-Benz', 'Mitsubish', 'Nissan', 'Peugeot', 'Porsche',
    'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Tesla', 'Hummer'
];