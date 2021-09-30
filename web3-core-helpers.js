const { isPackagesExist } = require('ethers-cfx-patch').utils
const debug = require('debug')("truffle-patch/web3-core-helpers")
if (!_isAllPackagesExists()) return

const formatters = require("web3-core-helpers").formatters;
var utils = require('web3-utils');
const { isValidCfxAddress } = require("js-conflux-sdk").address;


function overwrite() {
    _oInputAddressFormatter();
    _oInputCallFormatter();
    _oInputTransactionFormatter();
    _oInputLogFormatter();
}

function _oInputAddressFormatter() {
    const oldMethod = formatters.inputAddressFormatter;
    formatters.inputAddressFormatter = function (address) {
        if (isValidCfxAddress(address)) {
            return address;
        }
        return oldMethod(address);
    };
}

function _oInputCallFormatter() {
    formatters.inputCallFormatter = function (options) {
        options = _txInputFormatter(options);

        var from = options.from || (this ? this.defaultAccount : null);

        if (from) {
            options.from = formatters.inputAddressFormatter(from);
        }

        return options;
    };
}

var _oInputTransactionFormatter = function () {
    formatters.inputTransactionFormatter = function (options) {

        options = _txInputFormatter(options);

        // check from, only if not number, or object
        if (!(typeof options.from === 'number') && !(!!options.from && typeof options.from === 'object')) {
            options.from = options.from || (this ? this.defaultAccount : null);

            if (!options.from && !(typeof options.from === 'number')) {
                throw new Error('The send transactions "from" field must be defined!');
            }

            options.from = formatters.inputAddressFormatter(options.from);
        }
        return options;
    };
};

var _oInputLogFormatter = function () {
    formatters.inputLogFormatter = function (options) {
        let { inputAddressFormatter, inputBlockNumberFormatter } = formatters;
        var toTopic = function (value) {

            if (value === null || typeof value === 'undefined')
                return null;

            value = String(value);

            if (value.indexOf('0x') === 0)
                return value;
            else
                return utils.fromUtf8(value);
        };

        if (options === undefined) options = {};
        // If options !== undefined, don't blow out existing data
        if (options.fromBlock === undefined) options = { ...options, fromBlock: 'latest' };
        if (options.fromBlock || options.fromBlock === 0)
            options.fromBlock = inputBlockNumberFormatter(options.fromBlock);

        if (options.toBlock || options.toBlock === 0)
            options.toBlock = inputBlockNumberFormatter(options.toBlock);


        // make sure topics, get converted to hex
        options.topics = options.topics || [];
        options.topics = options.topics.map(function (topic) {
            return (Array.isArray(topic)) ? topic.map(toTopic) : toTopic(topic);
        });

        toTopic = null;

        if (options.address) {
            options.address = (Array.isArray(options.address)) ? options.address.map(function (addr) {
                return inputAddressFormatter(addr);
            }) : inputAddressFormatter(options.address);
        }

        return options;
    };
};


function _txInputFormatter(options) {
    if (options.to) { // it might be contract creation
        options.to = formatters.inputAddressFormatter(options.to);
    }

    if (options.data && options.input) {
        throw new Error('You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.');
    }

    if (!options.data && options.input) {
        options.data = options.input;
        delete options.input;
    }

    if (options.data && !options.data.startsWith('0x')) {
        options.data = '0x' + options.data;
    }

    if (!options.data || !utils.isHex(options.data)) {
        throw new Error('The data field must be HEX encoded data.');
    }

    // allow both
    if (options.gas || options.gasLimit) {
        options.gas = options.gas || options.gasLimit;
    }

    if (options.maxPriorityFeePerGas || options.maxFeePerGas) {
        delete options.gasPrice;
    }

    ['gasPrice', 'gas', 'value', 'maxPriorityFeePerGas', 'maxFeePerGas', 'nonce'].filter(function (key) {
        return options[key] !== undefined;
    }).forEach(function (key) {
        options[key] = utils.numberToHex(options[key]);
    });

    return options;
}

function _isAllPackagesExists() {
    const result = isPackagesExist(
        [
            "web3-core-helpers",
            "web3-utils"
        ]
    )

    if (!result.isAllExist) {
        debug(`not exist dependencies: ${result.notExists}`)
        module.exports = function () { }
        return false
    }
    return true
}

module.exports = overwrite;