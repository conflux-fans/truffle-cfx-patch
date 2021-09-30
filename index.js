require('ethers-cfx-patch');
const overwriteWeb3CoreHelpers = require("./web3-core-helpers");
const overwriteWeb3Utils = require("./web3-utils");

function patch(){
    overwriteWeb3Utils();
    overwriteWeb3CoreHelpers();
}

patch();