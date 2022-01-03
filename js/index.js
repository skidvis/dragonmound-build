const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0xEf3F0fA5F728da132b5275C75967c0dd925F11Ea',
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
        console.log(this.wallet);
      
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

        console.log('setting wallet...');        
      
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
            confirmations = txn_test.confirmations;
            if(confirmations > 0) {   
              clearInterval(interval);                      
              app.getStats().then(
                (stats)=>{
                  let level =  new BigNumber(stats.level._hex).toNumber();
                  let gold =  new BigNumber(stats.gold._hex).toNumber();
                  let playerstats = {level: level, gold: gold};
                  unityInstance.SendMessage('JsListener', 'ShowInteractables', JSON.stringify(playerstats));
                }, 
                (err)=>{
                  console.log(err);
                }
              );
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
      let response = await app.gameContract.getStats();
      app.gameContract.getPlayerLevel(app.account).then((lvl)=>{console.log(lvl)});
      return response;
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
      const goldmineAbi = ["function balanceOf(address) view returns (uint)"];
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      gameContract.balanceOf(app.account).then(
        (res)=>{
          console.log(BigNumber(res._hex).toNumber());
        },
        (err)=>{
          console.log('Not Minted');
        });
    }, 
    async mintyFresh(){
      const goldmineAbi = ["function balanceOf(address) view returns (uint)"];
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      let cost = await gameContract.getCost();
      gameContract.mintyFresh({value: cost}).then(
        (res)=>{
          unityInstance.SendMessage('JsListener', 'MintSuccess');
          console.log(res);
        },
        (err)=>{
          console.log('Not Minted');
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
            confirmations = txn_test.confirmations;
            if(confirmations > 0) {   
              clearInterval(interval);                      
              app.getStats().then(
                (stats)=>{
                  let level =  new BigNumber(stats.level._hex).toNumber();
                  let gold =  new BigNumber(stats.gold._hex).toNumber();
                  let hasWon =  new BigNumber(stats.hasWon._hex).toNumber();
                  let playerstats = {level: level, gold: gold, hasWon: hasWon};
                  unityInstance.SendMessage('JsListener', 'ShowInteractables', JSON.stringify(playerstats));
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
        }
      );
    }
  }
}

const app = Vue.createApp(App).mount('#app');