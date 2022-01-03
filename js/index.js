const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0x8734489eF1053D709b7607E0fa5236f131f23044',
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
          }, 5000);
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
                  let playerstats = {level: level, gold: gold};
                  unityInstance.SendMessage('JsListener', 'ShowInteractables', JSON.stringify(playerstats));
                }, 
                (err)=>{
                  console.log(err);
                }
              );
            }
          }, 5000);
        },
        (err)=>{
          console.log(err);
        }
      );
    }
  }
}

const app = Vue.createApp(App).mount('#app');