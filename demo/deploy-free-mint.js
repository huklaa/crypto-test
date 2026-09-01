import {encodeDeployData} from "viem";
import artifact from "./deploy/ChainlingAquaFreeMint.json";

const OWNER="0x5A0598f78184AE2632F8ee6ead6fC4E4b66ce5D0";
const TOKEN_URI="https://chainling.xyz/free-mint/6.json";
const CHAIN_ID="0x1237";
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
const PROJECT_ID=window.CHAINLING_WALLETCONNECT_PROJECT_ID;
const deployData=encodeDeployData({abi:artifact.abi,bytecode:artifact.bytecode,args:[OWNER,TOKEN_URI]});
const button=document.querySelector("#deploy");
const mobileButton=document.querySelector("#deploy-mobile");
const status=document.querySelector("#status");
let mobileProvider=null;

function message(value){status.textContent=value}
function linkResult(label,url){status.textContent="";const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.textContent=label;status.append(link)}
async function ensureNetwork(provider){
  const current=await provider.request({method:"eth_chainId"});
  if(Number(current)===4663)return;
  try{await provider.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID}]})}
  catch(error){
    if(error?.code!==4902)throw error;
    await provider.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]});
  }
}
async function waitForReceipt(provider,hash){
  for(let attempt=0;attempt<150;attempt+=1){
    const receipt=await provider.request({method:"eth_getTransactionReceipt",params:[hash]});
    if(receipt)return receipt;
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
  throw new Error("Deployment is still pending. Check the transaction in Blockscout.");
}

function setBusy(value){button.disabled=value;mobileButton.disabled=value}

async function deploy(provider,connectedAccount){
  if(!provider?.request){message("Wallet provider was not available.");return}
  setBusy(true);
  try{
    message("Connecting owner wallet…");
    let accounts=connectedAccount?[connectedAccount]:await provider.request({method:"eth_accounts"});
    if(!accounts?.length)accounts=await provider.request({method:"eth_requestAccounts"});
    const account=accounts?.[0];
    if(!account)throw new Error("Wallet connection was not completed.");
    if(account.toLowerCase()!==OWNER.toLowerCase())throw new Error(`Wrong wallet. Connect the owner wallet ${OWNER}.`);
    await ensureNetwork(provider);
    message("Review and approve the contract deployment in your wallet.");
    const gas=await provider.request({method:"eth_estimateGas",params:[{from:account,data:deployData}]});
    const hash=await provider.request({method:"eth_sendTransaction",params:[{from:account,data:deployData,gas}]});
    linkResult("Deployment submitted — view transaction",`${EXPLORER}/tx/${hash}`);
    const receipt=await waitForReceipt(provider,hash);
    if(receipt.status!=="0x1"||!receipt.contractAddress)throw new Error("Contract deployment failed.");
    status.textContent=`Contract deployed: ${receipt.contractAddress} `;
    const link=document.createElement("a");link.href=`${EXPLORER}/address/${receipt.contractAddress}`;link.target="_blank";link.rel="noopener noreferrer";link.textContent="View contract";status.append(link);
    button.textContent="Deployment complete";
    mobileButton.textContent="Deployment complete";
    return;
  }catch(error){message(error?.message||"Deployment failed or was cancelled.")}
  setBusy(false);
}

button.addEventListener("click",async()=>{
  const provider=window.ethereum;
  if(!provider?.request){message("Browser MetaMask was not found. Use the QR button for MetaMask Mobile.");return}
  await deploy(provider);
});

mobileButton.addEventListener("click",async()=>{
  if(mobileProvider){
    const accounts=mobileProvider.accounts?.length?mobileProvider.accounts:await mobileProvider.request({method:"eth_accounts"});
    await deploy(mobileProvider,accounts?.[0]);
    return;
  }
  setBusy(true);
  try{
    if(!PROJECT_ID)throw new Error("WalletConnect configuration is missing.");
    message("Opening WalletConnect QR code… Scan it in MetaMask Mobile.");
    const module=await import(/* @vite-ignore */"https://esm.sh/@walletconnect/ethereum-provider@2.21.1");
    const EthereumProvider=module.default;
    const provider=await EthereumProvider.init({projectId:PROJECT_ID,chains:[4663],optionalChains:[4663],showQrModal:true,rpcMap:{4663:RPC_URL},metadata:{name:"Chainling",description:"Chainling Aqua Kingfisher contract deployment",url:location.origin,icons:[]}});
    await provider.connect();
    const accounts=provider.accounts?.length?provider.accounts:await provider.request({method:"eth_accounts"});
    const account=accounts?.[0];
    if(!account)throw new Error("Wallet connected but no account was shared.");
    if(account.toLowerCase()!==OWNER.toLowerCase())throw new Error(`Wrong wallet. Connect the owner wallet ${OWNER}.`);
    mobileProvider=provider;
    mobileButton.textContent="Send deployment request to phone";
    message("Mobile wallet connected. Click the button again to send the deployment request to MetaMask.");
    setBusy(false);
  }catch(error){message(error?.message||"WalletConnect connection was cancelled or failed.");setBusy(false)}
});
