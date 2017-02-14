/**
 * ethereumjs-connect unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../");
ethcon.debug = true;

describe("resetState", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.resetState();
      t.assertions(ethcon.state);
    });
  };
  test({
    description: "initial null state values remain null",
    state: {
      from: null,
      coinbase: null,
      networkID: null,
      contracts: null,
      allContracts: null,
      api: {events: null, functions: null},
      connection: null
    },
    assertions: function (state) {
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      });
    }
  });
  test({
    description: "set internal state values to null",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      });
    }
  });
});

describe("setContracts", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setContracts();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set active contracts to network ID",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.contracts, state.allContracts[state.networkID]);
    }
  });
  test({
    description: "switch active contracts from network ID 1 to 3",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {myContract: "0xc1"},
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.contracts, state.allContracts[state.networkID]);
    }
  });
});

describe("setupFunctionsAPI", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setupFunctionsAPI();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set up functions API, do not modify null events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {}, method2: {}},
          contract2: {method1: {}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
      });
    }
  });
  test({
    description: "modify existing functions API, do not modify null events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
      });
    }
  });
  test({
    description: "modify existing functions API, do not modify existing events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xC1", contract: "contract1"},
        event2: {address: "0xC1", contract: "contract1"},
        event3: {address: "0xC2", contract: "contract2"}
      });
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
      });
    }
  });
});

describe("setupEventsAPI", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setupEventsAPI();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set up events API, do not modify null functions API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: {
          event1: {contract: "contract1"},
          event2: {contract: "contract1"},
          event3: {contract: "contract2"}
        },
        functions: null
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
      });
      assert.isNull(state.api.functions);
    }
  });
  test({
    description: "modify existing events API, do not modify null functions API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: null
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
      });
      assert.isNull(state.api.functions);
    }
  });
  test({
    description: "modify existing events API, do not modify existing functions API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
      });
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
        contract2: {method1: {to: "0xC2"}}
      });
    }
  });
});

describe("setGasPrice", function () {
  var test = function (t) {
    var getGasPrice = ethcon.rpc.getGasPrice;
    after(function () {
      ethcon.rpc.getGasPrice = getGasPrice;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.state = clone(t.state);
        ethcon.rpc.getGasPrice = function (callback) {
          if (!callback) return t.blockchain.gasPrice;
          callback(t.blockchain.gasPrice);
        };
        ethcon.setGasPrice();
        t.assertions(null, ethcon.rpc, ethcon.state);
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.state = clone(t.state);
        ethcon.rpc.getGasPrice = function (callback) {
          if (!callback) return t.blockchain.gasPrice;
          callback(t.blockchain.gasPrice);
        };
        ethcon.setGasPrice(function (err) {
          t.assertions(err, ethcon.rpc, ethcon.state);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "set rpc.gasPrice to latest block value",
    blockchain: {
      gasPrice: "0x4a817c801"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (err, rpc, state) {
      assert.isNull(err);
      assert.strictEqual(rpc.gasPrice, 20000000001);
      assert.deepEqual(state, {
        from: "0xb0b",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      });
    }
  });
  test({
    description: "rpc.gasPrice the same as latest block value",
    blockchain: {
      gasPrice: "0x4a817c800"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (err, rpc, state) {
      assert.isNull(err);
      assert.strictEqual(rpc.gasPrice, 20000000000);
      assert.deepEqual(state, {
        from: "0xb0b",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      });
    }
  });
});

describe("setNetworkID", function () {
  var test = function (t) {
    var version = ethcon.rpc.version;
    after(function () {
      ethcon.rpc.version = version;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.rpc.version = function (callback) {
          if (!callback) return t.blockchain.networkID;
          callback(t.blockchain.networkID);
        };
        ethcon.state = clone(t.state);
        ethcon.setNetworkID();
        t.assertions(null, ethcon.state);
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.rpc.version = function (callback) {
          if (!callback) return t.blockchain.networkID;
          callback(t.blockchain.networkID);
        };
        ethcon.state = clone(t.state);
        ethcon.setNetworkID(function (err) {
          t.assertions(err, ethcon.state);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "network ID unchanged",
    blockchain: {
      networkID: "3"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.networkID, "3");
    }
  });
  test({
    description: "change network ID from 1 to 3",
    blockchain: {
      networkID: "3"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "1",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.networkID, "3");
    }
  });
});

describe("setFrom", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setFrom(t.params.account);
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set from fields in functions API",
    params: {
      account: undefined
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
          contract2: {method1: {to: "0xc2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xb0b");
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {from: "0xb0b", to: "0xc1"}, method2: {from: "0xb0b", to: "0xc1"}},
        contract2: {method1: {from: "0xb0b", to: "0xc2"}}
      });
    }
  });
  test({
    description: "set from fields in functions API using account parameter",
    params: {
      account: "0xb0b"
    },
    state: {
      from: "0xd00d",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
          contract2: {method1: {to: "0xc2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {from: "0xb0b", to: "0xc1"}, method2: {from: "0xb0b", to: "0xc1"}},
        contract2: {method1: {from: "0xb0b", to: "0xc2"}}
      });
    }
  });
  test({
    description: "change from fields in functions API",
    params: {
      account: undefined
    },
    state: {
      from: "0xd00d",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {from: "0xb0b", to: "0xc1"}, method2: {from: "0xb0b", to: "0xc1"}},
          contract2: {method1: {from: "0xb0b", to: "0xc2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {from: "0xd00d", to: "0xc1"}, method2: {from: "0xd00d", to: "0xc1"}},
        contract2: {method1: {from: "0xd00d", to: "0xc2"}}
      });
    }
  });
  test({
    description: "change from fields in functions API using account parameter",
    params: {
      account: "0xd00d"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
          contract2: {method1: {to: "0xc2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xb0b");
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {from: "0xd00d", to: "0xc1"}, method2: {from: "0xd00d", to: "0xc1"}},
        contract2: {method1: {from: "0xd00d", to: "0xc2"}}
      });
    }
  });
  test({
    description: "set state.from value and change from fields in functions API using account parameter",
    params: {
      account: "0xd00d"
    },
    state: {
      from: null,
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
          contract2: {method1: {to: "0xc2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {from: "0xd00d", to: "0xc1"}, method2: {from: "0xd00d", to: "0xc1"}},
        contract2: {method1: {from: "0xd00d", to: "0xc2"}}
      });
    }
  });

  describe("setCoinbase", function () {
    var test = function (t) {
      var coinbase = ethcon.rpc.coinbase;
      after(function () {
        ethcon.rpc.coinbase = coinbase;
      });
      describe(t.description, function () {
        it("sync", function () {
          ethcon.rpc.coinbase = function (callback) {
            if (!callback) return t.blockchain.coinbase;
            callback(t.blockchain.coinbase);
          };
          ethcon.state = clone(t.state);
          try {
            ethcon.setCoinbase();
            t.assertions(null, ethcon.state);
          } catch (exc) {
            t.assertions(exc, ethcon.state);
          }
          ethcon.resetState();
        });
        it("async", function (done) {
          ethcon.rpc.coinbase = function (callback) {
            if (!callback) return t.blockchain.coinbase;
            callback(t.blockchain.coinbase);
          };
          ethcon.state = clone(t.state);
          ethcon.setCoinbase(function (err) {
            t.assertions(err, ethcon.state);
            ethcon.resetState();
            done();
          });
        });
      });
    };
    test({
      description: "set coinbase address, do not modify existing from address",
      blockchain: {
        coinbase: "0xb0b"
      },
      state: {
        from: "0xd00d",
        coinbase: null,
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.isNull(err);
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xd00d");
      }
    });
    test({
      description: "set coinbase and from addresses",
      blockchain: {
        coinbase: "0xb0b"
      },
      state: {
        from: null,
        coinbase: null,
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.isNull(err);
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xb0b");
      }
    });
    test({
      description: "coinbase unchanged, set from address",
      blockchain: {
        coinbase: "0xb0b"
      },
      state: {
        from: null,
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.isNull(err);
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xb0b");
      }
    });
    test({
      description: "coinbase and from addresses unchanged",
      blockchain: {
        coinbase: "0xb0b"
      },
      state: {
        from: "0xd00d",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.isNull(err);
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xd00d");
      }
    });
    test({
      description: "error if blockchain coinbase is 0x, coinbase and from unchanged",
      blockchain: {
        coinbase: "0x"
      },
      state: {
        from: "0xd00d",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.deepEqual(err, new Error("[ethereumjs-connect] setCoinbase: coinbase not found"));
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xd00d");
      }
    });
    test({
      description: "error if blockchain coinbase is null, coinbase and from unchanged",
      blockchain: {
        coinbase: null
      },
      state: {
        from: "0xd00d",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      },
      assertions: function (err, state) {
        assert.deepEqual(err, new Error("[ethereumjs-connect] setCoinbase: coinbase not found"));
        assert.strictEqual(state.coinbase, "0xb0b");
        assert.strictEqual(state.from, "0xd00d");
      }
    });
  });

  describe("retryConnect", function () {
    var test = function (t) {
      var connect = ethcon.connect;
      after(function () {
        ethcon.connect = connect;
      });
      it(t.description, function (done) {
        ethcon.connect = function (options, callback) {
          var connection = {
            http: options.http,
            ws: options.ws,
            ipc: options.ipc
          };
          if (!callback) return connection;
          callback(connection);
        };
        ethcon.retryConnect(null, t.params.options, function (connection) {
          t.assertions(connection);
          ethcon.resetState();
          done();
        });
      });
    };
    test({
      description: "first retry: call connect",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null
        });
      }
    });
    test({
      description: "second retry: fail",
      params: {
        options: {
          attempts: 1,
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null
        }
      },
      assertions: function (connection) {
        assert.isNull(connection);
      }
    });
  });

  describe("asyncConnect", function () {
    var test = function (t) {
      var blockNumber = ethcon.rpc.blockNumber;
      var setNetworkID = ethcon.setNetworkID;
      var setCoinbase = ethcon.setCoinbase;
      var setGasPrice = ethcon.setGasPrice;
      after(function () {
        ethcon.rpc.blockNumber = blockNumber;
        ethcon.setNetworkID = setNetworkID;
        ethcon.setCoinbase = setCoinbase;
        ethcon.setGasPrice = setGasPrice;
      });
      it(t.description, function (done) {
        ethcon.rpc.blockNumber = function (callback) {
          if (!callback) return t.blockchain.blockNumber;
          callback(t.blockchain.blockNumber);
        };
        ethcon.setNetworkID = function (callback) {
          ethcon.state.networkID = t.blockchain.networkID;
          if (callback) callback(null);
        };
        ethcon.setCoinbase = function (callback) {
          ethcon.state.coinbase = t.blockchain.coinbase;
          ethcon.state.from = ethcon.state.from || t.blockchain.coinbase;
          if (callback) callback(null);
        };
        ethcon.setGasPrice = function (callback) {
          ethcon.rpc.gasPrice = parseInt(t.blockchain.gasPrice, 16);
          if (callback) callback(null);
        };
        ethcon.state = clone(t.state);
        ethcon.asyncConnect(t.params.options, function (connection) {
          t.assertions(ethcon.state, connection);
          ethcon.resetState();
          done();
        });
      });
    };
    test({
      description: "asynchronous connection sequence without api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546"
        }
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {events: null, functions: null},
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {events: null, functions: null},
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
    test({
      description: "asynchronous connection sequence with api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546"
        }
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {
          events: {
            event1: {contract: "contract1"},
            event2: {contract: "contract1"},
            event3: {contract: "contract2"}
          },
          functions: {
            contract1: {method1: {}, method2: {}},
            contract2: {method1: {}}
          }
        },
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {address: "0xc1", contract: "contract1"},
              event2: {address: "0xc1", contract: "contract1"},
              event3: {address: "0xc2", contract: "contract2"}
            },
            functions: {
              contract1: {method1: {from: "0xb0b", to: "0xc1"}, method2: {from: "0xb0b", to: "0xc1"}},
              contract2: {method1: {from: "0xb0b", to: "0xc2"}}
            }
          },
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
    test({
      description: "asynchronous connection sequence without http option",
      params: {
        options: {
          http: null,
          ws: "ws://127.0.0.1:8546"
        }
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {events: null, functions: null},
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {events: null, functions: null},
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
    test({
      description: "asynchronous connection sequence without http or ws option",
      params: {
        options: {http: null, ws: null}
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {events: null, functions: null},
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {events: null, functions: null},
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
  });

  describe("syncConnect", function () {
    var test = function (t) {
      var blockNumber = ethcon.rpc.blockNumber;
      var setNetworkID = ethcon.setNetworkID;
      var setCoinbase = ethcon.setCoinbase;
      var setGasPrice = ethcon.setGasPrice;
      after(function () {
        ethcon.rpc.blockNumber = blockNumber;
        ethcon.setNetworkID = setNetworkID;
        ethcon.setCoinbase = setCoinbase;
        ethcon.setGasPrice = setGasPrice;
      });
      it(t.description, function () {
        ethcon.rpc.blockNumber = function (callback) {
          if (!callback) return t.blockchain.blockNumber;
          callback(t.blockchain.blockNumber);
        };
        ethcon.setNetworkID = function (callback) {
          ethcon.state.networkID = t.blockchain.networkID;
          if (callback) callback(null);
        };
        ethcon.setCoinbase = function (callback) {
          ethcon.state.coinbase = t.blockchain.coinbase;
          ethcon.state.from = ethcon.state.from || t.blockchain.coinbase;
          if (callback) callback(null);
        };
        ethcon.setGasPrice = function (callback) {
          ethcon.rpc.gasPrice = parseInt(t.blockchain.gasPrice, 16);
          if (callback) callback(null);
        };
        ethcon.state = clone(t.state);
        var connection = ethcon.syncConnect(t.params.options);
        t.assertions(ethcon.state, connection);
        ethcon.resetState();
      });
    };
    test({
      description: "synchronous connection sequence without api",
      params: {
        options: {}
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {events: null, functions: null},
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {events: null, functions: null},
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
    test({
      description: "synchronous connection sequence with api",
      params: {
        options: {}
      },
      blockchain: {
        blockNumber: "0x2328",
        coinbase: "0xb0b",
        gasPrice: "0x4a817c801",
        networkID: "3"
      },
      state: {
        allContracts: {
          3: {contract1: "0xc1", contract2: "0xc2"}
        },
        api: {
          events: {
            event1: {contract: "contract1"},
            event2: {contract: "contract1"},
            event3: {contract: "contract2"}
          },
          functions: {
            contract1: {method1: {}, method2: {}},
            contract2: {method1: {}}
          }
        },
        coinbase: null,
        connection: null,
        contracts: null,
        from: null,
        networkID: null
      },
      assertions: function (state, connection) {
        var expectedConnection = {
          http: ["https://eth9000.augur.net"],
          ws: "wss://ws9000.augur.net",
          ipc: null
        };
        assert.deepEqual(state, {
          from: "0xb0b",
          coinbase: "0xb0b",
          networkID: "3",
          contracts: {contract1: "0xc1", contract2: "0xc2"},
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {address: "0xc1", contract: "contract1"},
              event2: {address: "0xc1", contract: "contract1"},
              event3: {address: "0xc2", contract: "contract2"}
            },
            functions: {
              contract1: {method1: {from: "0xb0b", to: "0xc1"}, method2: {from: "0xb0b", to: "0xc1"}},
              contract2: {method1: {from: "0xb0b", to: "0xc2"}}
            }
          },
          connection: expectedConnection
        });
        assert.deepEqual(connection, expectedConnection);
      }
    });
  });

  describe("configure", function () {
    var test = function (t) {
      it(t.description, function () {
        ethcon.state = clone(t.state);
        ethcon.configure(t.params.options);
        t.assertions(ethcon.state, ethcon.rpc);
        ethcon.resetState();
      });
    };
    test({
      description: "http-only without api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: null,
          api: {events: null, functions: null},
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: false
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {events: null, functions: null},
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.strictEqual(rpc.nodes.local, "http://127.0.0.1:8545");
        assert.deepEqual(rpc.nodes.hosted, []);
        assert.isNull(rpc.wsUrl);
        assert.isNull(rpc.ipcpath);
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
    test({
      description: "http-only with api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: null,
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: false
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.strictEqual(rpc.nodes.local, "http://127.0.0.1:8545");
        assert.deepEqual(rpc.nodes.hosted, []);
        assert.isNull(rpc.wsUrl);
        assert.isNull(rpc.ipcpath);
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
    test({
      description: "http and websockets with api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null,
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: false
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.strictEqual(rpc.nodes.local, "http://127.0.0.1:8545");
        assert.deepEqual(rpc.nodes.hosted, []);
        assert.strictEqual(rpc.wsUrl, "ws://127.0.0.1:8546");
        assert.isNull(rpc.ipcpath);
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
    test({
      description: "http, websockets, and ipc with api",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: "/home/jack/.ethereum/geth.ipc",
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: false
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.strictEqual(rpc.nodes.local, "http://127.0.0.1:8545");
        assert.deepEqual(rpc.nodes.hosted, []);
        assert.strictEqual(rpc.wsUrl, "ws://127.0.0.1:8546");
        assert.strictEqual(rpc.ipcpath, "/home/jack/.ethereum/geth.ipc");
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
    test({
      description: "second pass with fallback",
      params: {
        options: {
          attempts: 1,
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: "/home/jack/.ethereum/geth.ipc",
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: false
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.isNull(rpc.nodes.local);
        assert.deepEqual(rpc.nodes.hosted, ["https://eth9000.augur.net"]);
        assert.strictEqual(rpc.wsUrl, "wss://ws9000.augur.net");
        assert.isNull(rpc.ipcpath);
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
    test({
      description: "second pass without fallback",
      params: {
        options: {
          attempts: 1,
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: "/home/jack/.ethereum/geth.ipc",
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          contracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          noFallback: true
        }
      },
      state: {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: {events: null, functions: null},
        connection: null
      },
      assertions: function (state, rpc) {
        assert.deepEqual(state, {
          allContracts: {
            3: {contract1: "0xc1", contract2: "0xc2"}
          },
          api: {
            events: {
              event1: {contract: "contract1"},
              event2: {contract: "contract1"},
              event3: {contract: "contract2"}
            },
            functions: {
              contract1: {method1: {}, method2: {}},
              contract2: {method1: {}}
            }
          },
          coinbase: null,
          connection: null,
          contracts: null,
          from: null,
          networkID: null
        });
        assert.strictEqual(rpc.nodes.local, "http://127.0.0.1:8545");
        assert.deepEqual(rpc.nodes.hosted, []);
        assert.strictEqual(rpc.wsUrl, "ws://127.0.0.1:8546");
        assert.strictEqual(rpc.ipcpath, "/home/jack/.ethereum/geth.ipc");
        assert.strictEqual(rpc.rpcStatus.ws, 0);
        assert.strictEqual(rpc.rpcStatus.ipc, 0);
      }
    });
  });

  describe("connect", function () {
    var test = function (t) {
      var syncConnect = ethcon.syncConnect;
      var asyncConnect = ethcon.asyncConnect;
      after(function () {
        ethcon.syncConnect = syncConnect;
        ethcon.asyncConnect = asyncConnect;
      });
      describe(t.description, function () {
        it("sync", function () {
          ethcon.syncConnect = function (options) {
            return {
              http: options.http,
              ws: options.ws,
              ipc: options.ipc
            };
          };
          t.assertions(ethcon.connect(t.params.options));
          ethcon.resetState();
        });
        it("async", function (done) {
          ethcon.asyncConnect = function (options, callback) {
            callback({
              http: options.http,
              ws: options.ws,
              ipc: options.ipc
            });
          };
          ethcon.connect(t.params.options, function (connection) {
            t.assertions(connection);
            ethcon.resetState();
            done();
          });
        });
      });
    };
    test({
      description: "no endpoints specified",
      params: {
        options: {
          contracts: {}
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: undefined,
          ws: undefined,
          ipc: undefined
        });
      }
    });
    test({
      description: "http only",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: null,
          contracts: {}
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: null
        });
      }
    });
    test({
      description: "http and websockets",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null,
          contracts: {}
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: null
        });
      }
    });
    test({
      description: "http and ipc",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: "/home/jack/.ethereum/geth.ipc",
          contracts: {}
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: "http://127.0.0.1:8545",
          ws: null,
          ipc: "/home/jack/.ethereum/geth.ipc"
        });
      }
    });
    test({
      description: "http, websockets, and ipc",
      params: {
        options: {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: "/home/jack/.ethereum/geth.ipc",
          contracts: {}
        }
      },
      assertions: function (connection) {
        assert.deepEqual(connection, {
          http: "http://127.0.0.1:8545",
          ws: "ws://127.0.0.1:8546",
          ipc: "/home/jack/.ethereum/geth.ipc"
        });
      }
    });
  });
});