const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0x76C4eAF3fFECcD17AC22F5E5A098dD3899221f19',
      mintId: 0,
      hasWallet: false,
      gameContract: null
    }
  },
  mounted(){
    console.log('mounted...');
    this.checkForWallet();
  },
  methods: {
    async checkForWallet(){
      try{  
        this.wallet = window.ethereum;
      
        if(!this.wallet){
          return;
        }else{
          console.log('wallet found..');
          this.hasWallet = true;
        }
      
        let accounts = await this.wallet.request({
          method: 'eth_requestAccounts'
        });

        this.account = accounts[0];        
        this.addPolygonNetwork();
        this.checkMint();
      
        this.wallet.on("accountsChanged", function () {
          location.reload();
        });
      }catch(error){
        console.log(error);
      }  
    },
    showAddress(){
      unityInstance.SendMessage('JsListener', 'SetWalletAddress', `Wallet: ${this.account}`);
      app.getGoldmine();
    },
    async addPlayer(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      app.gameContract.addPlayer().then(
        (response)=>{
          let confirmations = 0;

          let interval = setInterval(async ()=>{
            let txn_test = await provider.getTransaction(response.hash);
            if(txn_test && txn_test.confirmations) confirmations = txn_test.confirmations;
            
            if(confirmations > 0) {   
              clearInterval(interval);                      
              app.getStats();
            }
          }, 2000);
        },
        (err)=>{
          console.log('error');
          unityInstance.SendMessage('JsListener', 'ResetStart');
        }
      );
    }, 
    async getStats(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      app.gameContract.getStats().then(
        (stats)=>{
          let level =  new BigNumber(stats.level._hex).toNumber();
          let gold =  new BigNumber(stats.gold._hex).toNumber();
          let hasWon =  new BigNumber(stats.hasWon._hex).toNumber();
          let mintId =  new BigNumber(stats.mintId._hex).toNumber();
          let playerstats = {level: level, gold: gold, hasWon: hasWon, mintId: mintId};
          unityInstance.SendMessage('JsListener', 'ShowInteractables', JSON.stringify(playerstats));
        }, 
        (err)=>{
          console.log(err);
        }
      );      
    }, 
    async getPlayerLevel(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      let response = await app.gameContract.getPlayerLevel();
      return response;
    }, 
    async getGoldmine(){
      const goldmineAbi = ["function balanceOf(address) view returns (uint)"];
      const goldmineContract = '0x1955cCBEb9cf1Db1CEF28a03eDF826dcB3696841';
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let gameContract = new ethers.Contract(goldmineContract,goldmineAbi,signer);
      gameContract.balanceOf(app.account).then(
        (res)=>{
          if(!new BigNumber(res._hex).isZero())unityInstance.SendMessage('JsListener', 'SetGoldMiner');;
        },
        (err)=>{
          console.log('GoldMine1221 unavailable');
        });
    },
    async checkMint(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      gameContract.getMintId().then(
        (res)=>{
          this.mintId = BigNumber(res._hex).toNumber();
        },
        (err)=>{
          console.log('Not Minted');
        });
    }, 
    async mintyFresh(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      let cost = await gameContract.getCost();
      gameContract.mintyFresh({value: cost}).then(
        (response)=>{
          let confirmations = 0;

          let interval = setInterval(async ()=>{
            let txn_test = await provider.getTransaction(response.hash);
            confirmations = txn_test.confirmations;
            if(confirmations > 0) {   
              clearInterval(interval);              
              app.getStats().then(
                (stats)=>{
                  unityInstance.SendMessage('JsListener', 'MintSuccess');
                }, 
                (err)=>{
                  console.log(err);
                }
              );
            }
          }, 2000);
        },
        (err)=>{
          console.log(err);
        });
    },        
    async setWin(level, gold){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      app.gameContract.levelUp(level, gold).then(
        (response)=>{
          let confirmations = 0;

          let interval = setInterval(async ()=>{
            let txn_test = await provider.getTransaction(response.hash);
            if(txn_test && txn_test.confirmations) confirmations = txn_test.confirmations;

            if(confirmations > 0) {   
              clearInterval(interval);                      
              app.getStats();
            }
          }, 2000);
        },
        (err)=>{
          console.log(err);
        }
      );
    },
    async addPolygonNetwork(){
      try {
          await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x89' }], // Hexadecimal version of 80001, prefixed with 0x
          });
      } catch (error) {
          if (error.code === 4902) {
              try {
                  await ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{ 
                          chainId: '0x89', // Hexadecimal version of 80001, prefixed with 0x
                          chainName: "POLYGON Mainnet",
                          nativeCurrency: {
                              name: "MATIC",
                              symbol: "MATIC",
                              decimals: 18,
                          },
                          rpcUrls: ["https://polygon-rpc.com/"],
                          blockExplorerUrls: ["https://polygonscan.com/"],
                          iconUrls: [""],
                  
                      }],
                  });
              } catch (addError){
                  console.log('Did not add network');
              }
          }
      }
  }
  }
}

const app = Vue.createApp(App).mount('#app');