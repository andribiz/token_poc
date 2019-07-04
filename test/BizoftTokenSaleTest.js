const BizoftTokenSale = artifacts.require("BizoftTokenSale");
const BizoftToken = artifacts.require("BizoftToken");


contract('BizoftTokenSale', function (account) {
    var tokenPrice = 100000000000000 //in Wei
    var tokenAvailable = 750000;
    var tokenInstance;
    var numberOfTokens = 10;

    it('Initialization Test', function () {
        return BizoftTokenSale.deployed().then(function (instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function (address) {
            assert.notEqual(address, 0x0, "has contract Adress");
            return tokenSaleInstance.tokenContract();
        }).then(function (address) {
            assert.notEqual(address, 0x0, "has token contract Adress");
            return tokenSaleInstance.tokenPrice();
        }).then(function (price) {
            assert.equal(price, tokenPrice, "has correct price of token price");
        });
    });
    it('Function buy Token Test', function () {
        var buyer = account[1];
        var value = numberOfTokens * tokenPrice;

        return BizoftToken.deployed().then(function(instance){
            tokenInstance = instance;
            return BizoftTokenSale.deployed();
        }).then(function (instance) {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokenAvailable, {from: account[0]});
        }).then(function (reciept){

            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: value });
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, "Triggers one event");
            assert.equal(reciept.logs[0].event, "Sell", "Should be the transfer event");
            assert.equal(reciept.logs[0].args._buyer, buyer, "Logs the account transfer from");
            assert.equal(reciept.logs[0].args._value, value, "Logs the value of transfer");
            assert.equal(reciept.logs[0].args._amount, numberOfTokens, "Logs the number of token");
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, "Increment number of token sold");
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), tokenAvailable-numberOfTokens, "Check Balance contract balance");
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokens, "Check Balance of buyer");
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "invalid value check");
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: value });
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Check error not enough token available");
        });
    });

    it('Function end sale Test', function () {
        return BizoftToken.deployed().then(function(instance){
            tokenInstance = instance;
            return BizoftTokenSale.deployed();
        }).then(function (instance) {
            tokenSaleInstance = instance;
            console.log(tokenSaleInstance.address);
            return tokenSaleInstance.endSale({from: account[1]});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Check not admin call end sale");
            return tokenSaleInstance.endSale({from: account[0]});
        }).then(function(reciept){
            return tokenInstance.balanceOf(account[0]);
        }).then(function (balance){
            assert.equal(balance.toNumber(), 250000+tokenAvailable-numberOfTokens, "Check ending balance after endSale");
            // assert.equal(tokenSaleInstance.address,0x0, "Check destroyed contract");
            // return tokenSaleInstance.tokenPrice();
        // }).then(asert.fail).catch(function(error){
        //     assert(error.message.indexOf("revert") >= 0, "Check destroyed contract");
        });
    });

})