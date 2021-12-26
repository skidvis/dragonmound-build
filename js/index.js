const App = {
  data() {
    return {
      wallet: null,
      contract: '0x2d29763b7eeb73808CA598De3474Bdaa9E8f6fB1'
    }
  },
  mounted(){
    console.log('mounted...');
    this.checkForWallet();
  },
  methods: {
    checkForWallet(){
      try{  
        this.wallet = window.ethereum;
        console.log(this.wallet);
        var account;
      
        if(!this.wallet){
          alert('GetMetamask');
        }else{
          console.log('wallet found..');
        }
      
        this.wallet.request({
          method: 'eth_requestAccounts'
        }).then((x)=>{console.log(x); account = x});
      
      
        this.wallet.on("accountsChanged", function () {
          location.reload();
        });
      }catch(error){
        console.log(error);
      }  
    },
    async doGreet(){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      var gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      let response = await gameContract.sayHello();
      unityInstance.SendMessage('JsListener', 'SetText', response);
    }
  }
}

const app = Vue.createApp(App).mount('#app');