const fs = require('fs');
const path = require('path');

class JsonService {
    constructor(dirName) {
        this.dir = dirName;
        this.createDir();
    }

    createDir() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(`${path.dirname(require.main.filename)}/${this.dir}`);
        }
    }

    getFilePath(fileName) {
        return path.resolve(`${path.dirname(require.main.filename)}/${this.dir}/${fileName}.json`);
    }

    writeJsonFile(fileName, data) {
        const json = JSON.stringify(data);

        if (typeof data !== 'object') {
            console.error('data should be object');
            return;
        }

        fs.writeFileSync(this.getFilePath(fileName), json, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    readJsonFile(fileName) {
        const file = this.getFilePath(fileName);

        if (fs.existsSync(file)) {
            const json = fs.readFileSync(file, {
                encoding: 'utf-8'
            });
            return JSON.parse(json);
        } else {
            return false;
        }
    }
}

module.exports = JsonService;