const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0xC9FB51373720D91EbDA0ce45478c0C44680f8c36',
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      console.log(app.account);
      let response = await app.gameContract.addPlayer(app.account);
      let confirmations = 0;

      let interval = setInterval(async ()=>{
        let txn_test = await provider.getTransaction(response.hash);
        confirmations = txn_test.confirmations;
        console.log(confirmations);
        if(confirmations > 0) {   
          clearInterval(interval);            
          unityInstance.SendMessage('JsListener', 'SetText', 'Success!');
          unityInstance.SendMessage('JsListener', 'SetCube');
        }
      }, 5000);
    }, 
    async getGoldmine(){
      const goldmineAbi = ["function balanceOf(address) view returns (uint)"];
      const goldmineContract = '0x1955cCBEb9cf1Db1CEF28a03eDF826dcB3696841';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let gameContract = new ethers.Contract(goldmineContract,goldmineAbi,signer);
      let res = await gameContract.balanceOf(app.account);
      if(!new BigNumber(res._hex).isZero())unityInstance.SendMessage('JsListener', 'SetGoldMiner');;
    }
  }
}

const app = Vue.createApp(App).mount('#app');