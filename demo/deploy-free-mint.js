import {encodeDeployData} from "viem";
import artifact from "./deploy/ChainlingAquaFreeMint.json";

const OWNER="0x5A0598f78184AE2632F8ee6ead6fC4E4b66ce5D0";
const TOKEN_URI="https://chainling.xyz/free-mint/6.json";
const CHAIN_ID="0x1237";
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
const deployData=encodeDeployData({abi:artifact.abi,bytecode:artifact.bytecode,args:[OWNER,TOKEN_URI]});
const button=document.querySelector("#deploy");
const status=document.querySelector("#status");

function message(value){status.textContent=value}
function linkResult(label,url){status.textContent="";const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.textContent=label;status.append(link)}
async function ensureNetwork(provider){
  const current=await provider.request({method:"eth_chainId"});
  if(current?.toLowerCase()===CHAIN_ID)return;
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

button.addEventListener("click",async()=>{
  const provider=window.ethereum;
  if(!provider?.request){message("Open this page inside the owner wallet browser or use a browser with an EVM wallet extension.");return}
  button.disabled=true;
  try{
    message("Connecting owner wallet…");
    const accounts=await provider.request({method:"eth_requestAccounts"});
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
    return;
  }catch(error){message(error?.message||"Deployment failed or was cancelled.")}
  button.disabled=false;
});
