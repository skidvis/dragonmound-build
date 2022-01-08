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
      if(this.account == null){
        app.sendError('Your wallet address is null <br /> Please check your wallet, refresh and try again.');
        return;
      }
      unityInstance.SendMessage('JsListener', 'SetWalletAddress', `Wallet: ${this.account}`);
      app.getGoldmine();
    },
    async addPlayer(){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);      
      try {
        let response = await app.gameContract.addPlayer();
        const receipt = await response.wait();
        app.getStats();
      } catch (error) {
        console.log(error);
        app.sendRestart();
      }
    }, 
    sendRestart(){
      unityInstance.SendMessage('JsListener', 'ResetStart');
    },
    sendError(msg=null){
      let err = msg === null ? 'Something went horribly wrong. <br />Refresh and start over.' : msg;
      Swal.fire({
        title: 'Error!',
        html: err,
        icon: 'error',
        confirmButtonText: 'Okie dokie!'
      })
    },
    async getStats(hasWon=false){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);
      app.gameContract.getStats().then(
        (stats)=>{
          if(!hasWon){ 
            let level =  new BigNumber(stats.level._hex).toNumber();
            let gold =  new BigNumber(stats.gold._hex).toNumber();
            let hasWon =  new BigNumber(stats.hasWon._hex).toNumber();
            let mintId =  new BigNumber(stats.mintId._hex).toNumber();
            let playerstats = {level: level, gold: gold, hasWon: hasWon, mintId: mintId};
            unityInstance.SendMessage('JsListener', 'ShowInteractables', JSON.stringify(playerstats));
          }else{
            unityInstance.SendMessage('JsListener', 'MintSuccess');
          }
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

      try {
        let response = await gameContract.mintyFresh({value: cost});
        const receipt = await response.wait();
        app.getStats(true);
      } catch (error) {
        console.log(error);
        app.sendError();
      }; 
    },        
    async setWin(level, gold){
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      app.gameContract = new ethers.Contract(app.contract,myEpicGame.abi,signer);

      try {
        let response = await app.gameContract.levelUp(level, gold);
        const receipt = await response.wait();
        app.getStats();
      } catch (error) {
        console.log(error);
        app.sendError();
      }      
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