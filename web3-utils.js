var utilsMod = require('web3-utils');
const { isValidCfxAddress } = require("js-conflux-sdk").address;

function overwrite() {
    _oToChecksumAddress();
}

function _oToChecksumAddress() {
    const oldMethod = utilsMod.toChecksumAddress;
    utilsMod.toChecksumAddress = function (address) {
        if (isValidCfxAddress(address)) {
            return address;
        }
        return oldMethod(address);
    };
}

module.exports = overwrite;