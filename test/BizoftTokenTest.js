const BizoftToken = artifacts.require("BizoftToken");


contract('BizoftToken', function (account) {
    it('Set the total supply', function () {
        return BizoftToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Set Total Supply to 1,000,000");
            return tokenInstance.balanceOf(account[0]);
        }).then(function (adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, "Initial Balance allocation to Root Account")
        });
    });

    it('Contract Transaction Test', function () {
        return BizoftToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(account[1], 999999999999999);
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return tokenInstance.transfer.call(account[1], 2000, {
                from: account[0]
            });
        }).then(function (success) {
            assert.equal(success, true, "Return true when successfully");
            return tokenInstance.transfer(account[1], 2000, {
                from: account[0]
            })
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, "Triggers one event");
            assert.equal(reciept.logs[0].event, "Transfer", "Should be the transfer event");
            assert.equal(reciept.logs[0].args._from, account[0], "Logs the account trasnfer from");
            assert.equal(reciept.logs[0].args._to, account[1], "Logs the account transfer to");
            assert.equal(reciept.logs[0].args._value, 2000, "Logs the value of transfer");
            return tokenInstance.balanceOf(account[1]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 2000, "Add the amount to receiving account");
            return tokenInstance.balanceOf(account[0]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 1000000 - 2000, "Duducted ammount");
        })
    });

    it('Approve Token for Delegate Transaction Test', function () {
        return BizoftToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(account[1], 100);
        }).then(function (success) {
            assert.equal(success, true, "Test Success delegate")
            return tokenInstance.approve(account[1], 100);
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, "Triggers one event");
            assert.equal(reciept.logs[0].event, "Approval", "Should be the Approve event");
            assert.equal(reciept.logs[0].args._owner, account[0], "Logs the account trasnfer from");
            assert.equal(reciept.logs[0].args._spender, account[1], "Logs the account transfer to");
            assert.equal(reciept.logs[0].args._value, 100, "Logs the value of transfer");
            return tokenInstance.allowance(account[0], account[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, "Allowance number 100 test")
        })
    });

    it('Delegate Transaction Test', function () {
        return BizoftToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAccount = account[2];
            toAccount = account[3];
            spendingAccount = account[4];
            return tokenInstance.transfer(fromAccount, 100, {
                from: account[0]
            });
        }).then(function (reciept) {
            return tokenInstance.approve(spendingAccount, 10, {
                from: fromAccount
            });
        }).then(function (reciept) {
            return tokenInstance.transferFrom(fromAccount, toAccount, 999, {
                from: spendingAccount
            });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "Cannot transfer larger than balance");
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
                from: spendingAccount
            });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "Cannot transfer larger than approved balance");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
                from: spendingAccount
            });
        }).then(function (success) {
            assert.equal(success, true, "Success Transfer test");
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
                from: spendingAccount
            });
        }).then(function (reciept) {
            assert.equal(reciept.logs.length, 1, "Triggers one event");
            assert.equal(reciept.logs[0].event, "Transfer", "Should be the transfer event");
            assert.equal(reciept.logs[0].args._from, fromAccount, "Logs the account trasnfer from");
            assert.equal(reciept.logs[0].args._to, toAccount, "Logs the account transfer to");
            assert.equal(reciept.logs[0].args._value, 10, "Logs the value of transfer");
            return tokenInstance.balanceOf(fromAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 90, "Update balance from Account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 10, "Update balance To Account");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 0, "Update balance spending Account");
        })
    });

})