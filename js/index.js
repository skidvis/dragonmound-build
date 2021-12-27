const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0x6827B143e907A3dabDAc18060a368cEE95ceCb10',
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
        var account;
      
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
        unityInstance.SendMessage('JsListener', 'SetWalletAddress', this.account);
      
        this.wallet.on("accountsChanged", function () {
          location.reload();
        });
      }catch(error){
        console.log(error);
      }  
    },
    async addPlayer(){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      console.log(app.account);
      return;
      let response = await gameContract.addPlayer(app.account);
      
      console.log(response);
      if(response == 'you have added a player'){
        unityInstance.SendMessage('JsListener', 'SetText', response);
        unityInstance.SendMessage('JsListener', 'SetCube');
      }
    }
  }
}

const app = Vue.createApp(App).mount('#app');