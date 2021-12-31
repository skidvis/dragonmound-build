const App = {
  data() {
    return {
      wallet: null,
      account: null,
      contract: '0xdc79ccA5412A74aeE401B70679802f03c32807Cf',
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
      let response = await app.gameContract.addPlayer(app.account);
      let confirmations = 0;

      let interval = setInterval(async ()=>{
        let txn_test = await provider.getTransaction(response.hash);
        confirmations = txn_test.confirmations;
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
      gameContract.balanceOf(app.account).then(
        (res)=>{
          if(!new BigNumber(res._hex).isZero())unityInstance.SendMessage('JsListener', 'SetGoldMiner');;
        },
        (err)=>{
          console.log('GoldMine1221 unavailable');
        });
    }
  }
}

const app = Vue.createApp(App).mount('#app');