import {createAppKit} from "https://esm.sh/@reown/appkit?bundle";
import {EthersAdapter} from "https://esm.sh/@reown/appkit-adapter-ethers?bundle";
import {defineChain} from "https://esm.sh/@reown/appkit/networks?bundle";

const PROJECT_ID=window.CHAINLING_WALLETCONNECT_PROJECT_ID;
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
let appKitPromise=null;
let connectionTimer=null;
let handoffDone=false;

async function completeHandoff(modal){
  const provider=modal.getWalletProvider?.();
  if(!modal.getIsConnectedState?.()||!provider)return;
  try{await modal.close?.()}catch{}
  triggerChainlingHandoff(provider);
}

function announceProvider(provider){
  if(!provider||typeof provider.request!=="function")throw new Error("WalletConnect provider was not available.");
  window.dispatchEvent(new CustomEvent("eip6963:announceProvider",{detail:{info:{uuid:"6dd58eb5-73ec-48d6-85e2-0423ae0ee61b",name:"WalletConnect",icon:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233B99FC'/%3E%3Cpath d='M16 25c9-9 23-9 32 0l3 3-4 4-3-3c-7-7-17-7-24 0l-3 3-4-4 3-3Zm6 7c6-6 14-6 20 0l3 3-4 4-3-3c-3-3-9-3-12 0l-3 3-4-4 3-3Z' fill='white'/%3E%3C/svg%3E",rdns:"com.reown.walletconnect"},provider}}));
}

function exposeProvider(provider){
  try{
    Object.defineProperty(window,"ethereum",{configurable:true,writable:true,value:provider});
  }catch{
    try{window.ethereum=provider}catch{}
  }
}

function triggerChainlingHandoff(provider){
  if(handoffDone||!provider||typeof provider.request!=="function")return;
  handoffDone=true;
  clearTimeout(connectionTimer);
  exposeProvider(provider);
  announceProvider(provider);
  document.querySelector("#chainling-wallet-chooser")?.remove();
  setTimeout(()=>document.querySelector(".wallet-btn[data-connect]")?.click(),180);
}

async function getAppKit(){
  if(appKitPromise)return appKitPromise;
  appKitPromise=(async()=>{
    if(!PROJECT_ID)throw new Error("Reown Project ID is missing.");
    const robinhood=defineChain({
      id:4663,
      caipNetworkId:"eip155:4663",
      chainNamespace:"eip155",
      name:"Robinhood Chain",
      nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},
      rpcUrls:{default:{http:[RPC_URL]}},
      blockExplorers:{default:{name:"Blockscout",url:EXPLORER}}
    });
    const modal=createAppKit({
      adapters:[new EthersAdapter()],
      networks:[robinhood],
      projectId:PROJECT_ID,
      metadata:{
        name:"Chainling",
        description:"Chainling Early Explorer souvenir NFTs",
        url:"https://chainling.xyz",
        icons:[],
        redirect:{universal:"https://chainling.xyz/#home"}
      },
      allWallets:"SHOW",
      enableWallets:true,
      enableReconnect:true,
      enableNetworkSwitch:true,
      enableMobileFullScreen:true,
      features:{analytics:false,email:false,socials:[]}
    });

    modal.subscribeAccount(state=>{
      if(state?.isConnected)void completeHandoff(modal);
    },"eip155");
    modal.subscribeProviders(()=>void completeHandoff(modal));

    return modal;
  })().catch(error=>{
    appKitPromise=null;
    throw error;
  });
  return appKitPromise;
}

async function resumeConnectedSession(){
  try{
    const modal=await getAppKit();
    await completeHandoff(modal);
  }catch(error){
    console.error("Chainling Reown resume error",error);
  }
}

async function openReownWallets(){
  handoffDone=false;
  document.querySelector("#chainling-wallet-chooser")?.remove();
  try{
    const modal=await getAppKit();
    const existing=modal.getWalletProvider?.();
    if(modal.getIsConnectedState?.()&&existing){
      triggerChainlingHandoff(existing);
      return;
    }
    await modal.open({view:"Connect",namespace:"eip155"});
    clearTimeout(connectionTimer);
    connectionTimer=setTimeout(()=>{
      if(!handoffDone)console.warn("WalletConnect is still waiting for wallet approval.");
    },120000);
  }catch(error){
    console.error("Chainling Reown connection error",error);
  }
}

document.addEventListener("click",event=>{
  const button=event.target?.closest?.("#chainling-wallet-chooser button");
  if(!button)return;
  const label=button.textContent.trim();
  if(label!=="WalletConnect")return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  document.querySelector("#chainling-wallet-chooser")?.remove();
  void openReownWallets();
},true);

window.addEventListener("focus",()=>void resumeConnectedSession());
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")void resumeConnectedSession();
});

void resumeConnectedSession();
