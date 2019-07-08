App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  tokenSold : 0,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {

    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("BizoftTokenSale.json", function (bizoftTokenSale) {
      App.contracts.BizoftTokenSale = TruffleContract(bizoftTokenSale);
      App.contracts.BizoftTokenSale.setProvider(App.web3Provider);
    }).done(function () {
      $.getJSON("BizoftToken.json", function (bizoftToken) {
        App.contracts.BizoftToken = TruffleContract(bizoftToken);
        App.contracts.BizoftToken.setProvider(App.web3Provider);
        App.listenForEvents();
        return App.render();
      });
    });
  },

  listenForEvents: function () {
    App.contracts.BizoftTokenSale.deployed().then(function (instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event);
        App.render();
      });
    });
  },

  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    $("#form").trigger("reset");


    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        console.log(account);
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.BizoftTokenSale.deployed().then(function (instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.tokenPrice();
    }).then(function (price) {
      $(".token-price").html(web3.fromWei(price, "ether").toNumber());
      return tokenSaleInstance.tokenSold();
    }).then(function (ammount) {
      tokenSold = ammount.toNumber()
      $(".token-sold").html(tokenSold);
      App.contracts.BizoftToken.deployed().then(function (token) {
        tokenInstance = token;
      //   return tokenInstance.balanceOf(tokenSaleInstance.address);
      // }).then(function (balance) {
        $(".token-available").html("750000");
        var progressPercent = (tokenSold/750000) * 100;
        $("#progress").css("width", progressPercent+"%");
        return tokenInstance.balanceOf(App.account);
      }).then(function (balance) {
        $(".dapp-balance").html(balance.toNumber());
        loader.hide();
        content.show();
      });
    });

  },
  buyTokens: function () {
    $("#loader").show();
    $("#content").hide();

    var numberOfTokens = $("#numberOfTokens").val();

    App.contracts.BizoftTokenSale.deployed().then(function(instance){
      tokenSaleInstance = instance;
      return tokenSaleInstance.tokenPrice( );
    }).then(function(price){
      return tokenSaleInstance.buyTokens(numberOfTokens,{
        from: App.account,
        value: numberOfTokens * price,
        gas: 500000
      })
    }).then(function(result){
      console.log("Tokens bought");
    }).catch(function(err){
      console.log(err);
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});