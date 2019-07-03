const BizoftToken = artifacts.require("BizoftToken");


contract('BizoftToken', function(account){
    it('Set the total supply', function(){
        return BizoftToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Set Total Supply to 1,000,000");
        });
    });
})