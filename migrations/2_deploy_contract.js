const BizoftToken = artifacts.require("BizoftToken");

module.exports = function(deployer) {
  deployer.deploy(BizoftToken, 1000000);
};
