import {createAppKit} from "@reown/appkit";
import {EthersAdapter} from "@reown/appkit-adapter-ethers";
import {defineChain} from "@reown/appkit/networks";

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

function addSocialPlaceholders(){
  const footer=document.querySelector("footer.footer");
  if(!footer||footer.querySelector(".chainling-socials"))return;

  const style=document.createElement("style");
  style.textContent=`
    .chainling-socials{display:flex;align-items:center;gap:10px;margin:10px 0 0}
    .chainling-social-icon{width:38px;height:38px;border:1px solid rgba(120,255,34,.28);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#dce8df;background:rgba(120,255,34,.04);opacity:.72;cursor:default}
    .chainling-social-icon svg{width:19px;height:19px;fill:currentColor}
    .chainling-social-icon:hover{opacity:1;border-color:rgba(120,255,34,.5);color:#78ff22}
  `;
  document.head.appendChild(style);

  const socials=document.createElement("div");
  socials.className="chainling-socials";
  socials.setAttribute("aria-label","Chainling social channels coming soon");
  socials.innerHTML=`
    <span class="chainling-social-icon" role="img" aria-label="X — coming soon" title="X — coming soon">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
    </span>
    <span class="chainling-social-icon" role="img" aria-label="Discord — coming soon" title="Discord — coming soon">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3a13.785 13.785 0 0 0-.566 1.167 18.27 18.27 0 0 0-5.638 0A12.64 12.64 0 0 0 9.115 3a19.736 19.736 0 0 0-4.434 1.371C1.878 8.527 1.12 12.578 1.5 16.573a19.9 19.9 0 0 0 5.438 2.752 14.17 14.17 0 0 0 1.166-1.9 12.93 12.93 0 0 1-1.834-.879c.154-.113.305-.23.451-.349 3.54 1.624 7.379 1.624 10.877 0 .147.12.298.237.452.349-.584.34-1.199.635-1.834.879a14.05 14.05 0 0 0 1.166 1.9 19.879 19.879 0 0 0 5.438-2.752c.447-4.63-.762-8.642-2.503-12.204ZM8.02 14.147c-1.06 0-1.927-.973-1.927-2.165 0-1.193.849-2.166 1.927-2.166 1.087 0 1.945.982 1.927 2.166 0 1.192-.849 2.165-1.927 2.165Zm7.96 0c-1.06 0-1.927-.973-1.927-2.165 0-1.193.849-2.166 1.927-2.166 1.087 0 1.945.982 1.927 2.166 0 1.192-.84 2.165-1.927 2.165Z"/></svg>
    </span>`;

  const brand=footer.firstElementChild;
  if(brand)brand.appendChild(socials);
  else footer.prepend(socials);
}

document.addEventListener("DOMContentLoaded",addSocialPlaceholders,{once:true});
if(document.readyState!=="loading")addSocialPlaceholders();

void resumeConnectedSession();
void import("./landing.js").catch(error=>console.error("Chainling landing layer error",error));
