const BizoftToken = artifacts.require("BizoftToken");


contract('BizoftToken', function(account){
    it('Set the total supply', function(){
        return BizoftToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Set Total Supply to 1,000,000");
            return tokenInstance.balanceOf(account[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(),1000000, "Initial Balance allocation to Root Account")
        });
    }),

    it('Contract Transaction Test', function(){
        return BizoftToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(account[1], 999999999999999);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return tokenInstance.transfer.call(account[1], 2000, {from: account[0]});
        }).then(function(success){
            assert.equal(success, true, "Return true when successfully");
            return tokenInstance.transfer(account[1], 2000, {from: account[0]})
        }).then(function(reciept){
            assert.equal(reciept.logs.length,1,"Triggers one event");
            assert.equal(reciept.logs[0].event,"Transfer","Should be the transfer event");
            assert.equal(reciept.logs[0].args._from,account[0],"Logs the account trasnfer from");
            assert.equal(reciept.logs[0].args._to, account[1],"Logs the account transfer to");
            assert.equal(reciept.logs[0].args._value, 2000,"Logs the value of transfer");
            return tokenInstance.balanceOf(account[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(),2000, "Add the amount to receiving account");
            return tokenInstance.balanceOf(account[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(),1000000-2000, "Duducted ammount");
        })
    })

})