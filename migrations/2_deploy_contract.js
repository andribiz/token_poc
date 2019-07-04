const BizoftToken = artifacts.require("BizoftToken");
const BizoftTokenSale = artifacts.require("BizoftTokenSale");

const tokenPrice = 100000000000000 //in Wei

module.exports = function(deployer) {
  deployer.deploy(BizoftToken, 1000000).then(function(){
    return deployer.deploy(BizoftTokenSale, BizoftToken.address, tokenPrice);
  });
};
