const CONTRACT = "0x4342135Dc8E238B7e3ae20f931dbB2208e827192";

try{  
  const {ethereum} = window;
  var account;

  if(!ethereum){
    alert('GetMetamask');
  }

  ethereum.request({
    method: 'eth_requestAccounts'
  }).then((x)=>{console.log(x); account = x});


  window.ethereum.on("accountsChanged", function () {
    location.reload();
  });
}catch(error){
  console.log(error);
}   

function doGreet(){
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  console.log(provider);
  const signer = provider.getSigner();
  console.log(signer);
  var gameContract = new ethers.Contract(CONTRACT,myEpicGame.abi,signer);
  //gameContract.resetHealth().then((x)=>{console.log(x)});
  return provider.connection.url;
}

function getTime(){
  unityInstance.SendMessage('Test', 'SetText', 'this is a test');
}