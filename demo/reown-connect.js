const PROJECT_ID=window.CHAINLING_WALLETCONNECT_PROJECT_ID;
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
let appKitPromise=null;
let providerWaiter=null;

function announceProvider(provider){
  if(!provider||typeof provider.request!=="function")throw new Error("WalletConnect provider was not available.");
  window.dispatchEvent(new CustomEvent("eip6963:announceProvider",{detail:{info:{uuid:"6dd58eb5-73ec-48d6-85e2-0423ae0ee61b",name:"WalletConnect",icon:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233B99FC'/%3E%3Cpath d='M16 25c9-9 23-9 32 0l3 3-4 4-3-3c-7-7-17-7-24 0l-3 3-4-4 3-3Zm6 7c6-6 14-6 20 0l3 3-4 4-3-3c-3-3-9-3-12 0l-3 3-4-4 3-3Z' fill='white'/%3E%3C/svg%3E",rdns:"com.reown.walletconnect"},provider}}));
}

async function getAppKit(){
  if(appKitPromise)return appKitPromise;
  appKitPromise=(async()=>{
    if(!PROJECT_ID)throw new Error("Reown Project ID is missing.");
    const [{createAppKit},{EthersAdapter},{defineChain}]=await Promise.all([
      import(/* @vite-ignore */"https://esm.sh/@reown/appkit?bundle"),
      import(/* @vite-ignore */"https://esm.sh/@reown/appkit-adapter-ethers?bundle"),
      import(/* @vite-ignore */"https://esm.sh/@reown/appkit/networks?bundle")
    ]);
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
      metadata:{name:"Chainling",description:"Chainling Early Explorer souvenir NFTs",url:location.origin,icons:[]},
      allWallets:"SHOW",
      enableWallets:true,
      enableNetworkSwitch:true,
      enableMobileFullScreen:true,
      features:{analytics:false,email:false,socials:[]}
    });
    modal.subscribeProviders(state=>{
      const provider=state?.eip155;
      if(provider&&providerWaiter){const resolve=providerWaiter;providerWaiter=null;resolve(provider)}
    });
    return modal;
  })();
  return appKitPromise;
}

async function openReownWallets(){
  const chooser=document.querySelector("#chainling-wallet-chooser");
  const note=chooser?.querySelector("[data-wallet-note]");
  try{
    if(note)note.textContent="Opening wallet list…";
    const modal=await getAppKit();
    const existing=modal.getProviders?.()?.eip155;
    if(existing){announceProvider(existing);chooser?.remove();document.querySelector(".wallet-btn[data-connect]")?.click();return}
    const providerPromise=new Promise((resolve,reject)=>{
      providerWaiter=resolve;
      setTimeout(()=>{if(providerWaiter){providerWaiter=null;reject(new Error("Wallet connection timed out."))}},120000);
    });
    await modal.open({view:"Connect",namespace:"eip155"});
    const provider=await providerPromise;
    announceProvider(provider);
    chooser?.remove();
    document.querySelector(".wallet-btn[data-connect]")?.click();
  }catch(error){
    if(note)note.textContent=error?.message||"Could not open wallet list.";
    console.error("Chainling Reown connection error",error);
  }
}

document.addEventListener("click",event=>{
  const button=event.target?.closest?.("#chainling-wallet-chooser button");
  if(!button||button.textContent.trim()!=="WalletConnect")return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  void openReownWallets();
},true);
