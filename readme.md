# Truffle Cfx Patch 

## Description

`truffle-cfx-patch` is used for compatiable @truffle/xxx packages with conflux network. The purpose is to overwrite some methods to compatibale with cfx network, most are functions related address and transaction. And it will not break origin features.

## Install
```sh
$ npm install truffle-cfx-patch
```
## Usage

### Overwrite methods
Load truffle-cfx-patch package in the head of your project. It will overwrite methods.
```js
// load pacakge to overwrite methods
require("truffle-cfx-patch")
// your project
// ...
```

## Example
When use @openzeppelin/truffle-upgrades to deploy an upgradable contract, you should use `truffle-cfx-patch` to patch for conflux network.

```js
require("truffle-cfx-patch");
var cfxFormat = require("js-conflux-sdk/src/util/format");
var { deployProxy } = require("@openzeppelin/truffle-upgrades");
var StableToken = artifacts.require("StableToken");

module.exports = async function (deployer, network, accounts) {
    var tmpAdmin = cfxFormat.hexAddress(accounts[0]);
    var genesisSupplyAmount = "500000000000000000000";
    await deployProxy(StableToken, [tmpAdmin, genesisSupplyAmount], {
        deployer: deployer,
        unsafeAllowCustomTypes: true,
    });
    var stableToken = await StableToken.deployed();
    console.log(stableToken)
};

```
