import {createPublicClient,createWalletClient,custom,defineChain,formatUnits,http,parseAbi} from "viem";
import "./free-mint.css";
import {initFreeMintCampaign} from "./free-mint.js";

const CHAIN_ID_HEX="0x1237";
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
const NFT_CONTRACT="0xd1F482AB6B379268003B42f9330a72eCd11fF565";
const USDG_CONTRACT="0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const DESIGN_PRICES={1:"1.50",2:"1.00",3:"0.60",4:"0.85",5:"1.75",6:"0.50",7:"1.25"};
const chain=defineChain({id:4663,name:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:[RPC_URL]}},blockExplorers:{default:{name:"Blockscout",url:EXPLORER}}});
const publicClient=createPublicClient({chain,transport:http(RPC_URL)});
const nftAbi=parseAbi(["function mint(uint256 id,uint256 amount)","function mintPrice(uint256 id) view returns (uint256)","function minted(uint256 id) view returns (uint256)"]);
const usdgAbi=parseAbi(["function allowance(address owner,address spender) view returns (uint256)","function approve(address spender,uint256 amount) returns (bool)"]);
let account=null;
let selectedDesign=1;
let busy=false;
let activeProvider=null;
let activeProviderInfo=null;
const discoveredProviders=[];
let connecting=false;
const connectButton=document.querySelector(".wallet-btn[data-connect]");
const mintButton=document.querySelector(".mint-action");
const walletStatus=document.querySelector("#wallet-status");
const mintMessage=document.querySelector("#mint-message");
const selectedName=document.querySelector("#selected-name");
const selectedSupply=document.querySelector("#selected-supply");
const priceDisplay=document.querySelector(".price-box strong");
const heroCard=document.querySelector(".hero-card");
const mintedRow=document.createElement("div");
mintedRow.className="selected-row";
mintedRow.innerHTML='<span>Minted</span><strong id="minted-count">Loading…</strong>';
document.querySelector(".wallet-row")?.before(mintedRow);
const mintedCount=document.querySelector("#minted-count");
mintButton?.removeAttribute("data-connect");
const walletControl=document.createElement("div");
walletControl.className="wallet-control";
const walletMenu=document.createElement("div");
walletMenu.className="wallet-account-menu";
walletMenu.hidden=true;
walletMenu.innerHTML='<button type="button" data-wallet-refresh>Refresh Connection</button><button type="button" data-wallet-disconnect>Disconnect Wallet</button>';
if(connectButton?.parentNode){connectButton.parentNode.insertBefore(walletControl,connectButton);walletControl.append(connectButton,walletMenu)}

function shortAddress(value){return `${value.slice(0,6)}…${value.slice(-4)}`}
function renderSelectedPrice(){if(priceDisplay)priceDisplay.innerHTML=`${DESIGN_PRICES[selectedDesign]} <em>USDG</em>`}
function renderCardPrices(){document.querySelectorAll(".nft-card").forEach(card=>{const id=Number(card.dataset.design);const label=card.querySelector(":scope > span");if(label)label.textContent=`${card.dataset.supply} Editions · ${DESIGN_PRICES[id]} USDG`})}
function syncHero(){if(!heroCard)return;heroCard.classList.remove("design-1","design-2","design-3","design-4","design-5","design-6","design-7");heroCard.classList.add(`design-${selectedDesign}`)}
function closeAccountMenu(){walletMenu.hidden=true;connectButton?.setAttribute("aria-expanded","false")}
function toggleAccountMenu(){if(!account)return;walletMenu.hidden=!walletMenu.hidden;connectButton?.setAttribute("aria-expanded",String(!walletMenu.hidden))}
function updateWalletUi(){if(connectButton){connectButton.textContent=connecting?"Connecting…":account?shortAddress(account):"Connect Wallet";connectButton.disabled=connecting;connectButton.setAttribute("aria-haspopup","menu");connectButton.setAttribute("aria-expanded",String(account&&!walletMenu.hidden))}if(!account)closeAccountMenu();if(walletStatus)walletStatus.textContent=account?shortAddress(account):"Not connected";if(mintButton){mintButton.textContent=busy?"Processing…":"Mint NFT";mintButton.disabled=!account||busy}}
function showMessage(message,hash){if(!mintMessage)return;mintMessage.textContent=message;if(hash){mintMessage.append(" ");const link=document.createElement("a");link.href=`${EXPLORER}/tx/${hash}`;link.target="_blank";link.rel="noreferrer";link.textContent=shortAddress(hash);link.style.color="#78ff22";mintMessage.append(link)}}
function errorMessage(error){if(error?.code===4001||error?.cause?.code===4001)return "Transaction was rejected in the wallet.";return error?.shortMessage||error?.message||"Transaction failed."}
function isProvider(value){return !!value&&typeof value.request==="function"}
function providerLabel(info){return String(info?.name||info?.rdns||"").toLowerCase()}
function rememberProvider(detail){if(!detail?.provider||!isProvider(detail.provider))return;if(discoveredProviders.some(item=>item.provider===detail.provider))return;discoveredProviders.push(detail)}
window.addEventListener("eip6963:announceProvider",event=>rememberProvider(event.detail));
window.dispatchEvent(new Event("eip6963:requestProvider"));

function getInjectedCandidates(){
  const candidates=[];
  const trust=window.trustwallet?.ethereum;
  if(isProvider(trust))candidates.push({provider:trust,info:{name:"Trust Wallet",rdns:"com.trustwallet.app"}});
  for(const item of discoveredProviders)candidates.push(item);
  if(isProvider(window.ethereum)){
    const providers=Array.isArray(window.ethereum.providers)?window.ethereum.providers:[window.ethereum];
    for(const provider of providers){if(isProvider(provider))candidates.push({provider,info:{name:provider.isTrust?"Trust Wallet":provider.isMetaMask?"MetaMask":provider.isRabby?"Rabby Wallet":provider.isCoinbaseWallet?"Coinbase Wallet":"Browser Wallet"}})}
  }
  return candidates.filter((item,index,array)=>array.findIndex(other=>other.provider===item.provider)===index);
}
function choosePreferredInjected(){
  const candidates=getInjectedCandidates();
  return candidates.find(item=>providerLabel(item.info).includes("trust")||item.provider?.isTrust)
    ||candidates.find(item=>providerLabel(item.info).includes("coinbase")||item.provider?.isCoinbaseWallet)
    ||candidates.find(item=>providerLabel(item.info).includes("rabby")||item.provider?.isRabby)
    ||candidates.find(item=>providerLabel(item.info).includes("metamask")||item.provider?.isMetaMask)
    ||candidates[0]
    ||null;
}
function closeWalletChooser(){document.querySelector("#chainling-wallet-chooser")?.remove()}
function showWalletChooser(){
  closeWalletChooser();
  const overlay=document.createElement("div");overlay.id="chainling-wallet-chooser";overlay.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:20px";
  const panel=document.createElement("div");panel.style.cssText="width:min(420px,100%);background:#07100d;border:1px solid rgba(120,255,34,.28);border-radius:22px;padding:22px;color:#fff;font-family:inherit;box-shadow:0 20px 70px rgba(0,0,0,.55)";
  panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:14px"><strong style="font-size:22px;color:#78ff22">Connect Wallet</strong><button type="button" data-close style="border:0;background:transparent;color:#fff;font-size:28px;cursor:pointer">×</button></div><p style="margin:0 0 16px;color:#aab5af;line-height:1.5">Choose your wallet with WalletConnect. Chainling stays open in Chrome while you select a wallet.</p><div data-wallet-actions style="display:grid;gap:10px"></div><p data-wallet-note style="margin:14px 0 0;color:#87928c;font-size:13px;line-height:1.45"></p>';
  const actions=panel.querySelector("[data-wallet-actions]");
  const addAction=(label,handler)=>{const button=document.createElement("button");button.type="button";button.textContent=label;button.style.cssText="width:100%;padding:14px 16px;border:1px solid rgba(120,255,34,.35);border-radius:14px;background:#102118;color:#fff;font:inherit;font-weight:700;cursor:pointer";button.addEventListener("click",handler);actions.append(button)};
  addAction("WalletConnect",async()=>{const note=panel.querySelector("[data-wallet-note]");try{const projectId=window.CHAINLING_WALLETCONNECT_PROJECT_ID;if(!projectId){note.textContent="WalletConnect needs a project ID. Open this page in Trust Wallet or Base App for now.";return}note.textContent="Opening WalletConnect…";const module=await import(/* @vite-ignore */"https://esm.sh/@walletconnect/ethereum-provider@2.21.1");const EthereumProvider=module.default;const provider=await EthereumProvider.init({projectId,chains:[4663],optionalChains:[4663],showQrModal:true,rpcMap:{4663:RPC_URL},metadata:{name:"Chainling",description:"Chainling Early Explorer",url:location.origin,icons:[]}});await provider.connect();activeProvider=provider;activeProviderInfo={name:"WalletConnect"};closeWalletChooser();await finishWalletConnection(provider)}catch(error){note.textContent=errorMessage(error)}});
  panel.querySelector("[data-close]").addEventListener("click",closeWalletChooser);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWalletChooser()});overlay.append(panel);document.body.append(overlay);
}
async function ensureRobinhoodChain(provider=activeProvider){if(!isProvider(provider))throw new Error("No browser wallet detected.");const current=await provider.request({method:"eth_chainId"});if(current.toLowerCase()===CHAIN_ID_HEX)return;try{await provider.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]})}catch(error){if(error?.code!==4902)throw error;await provider.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID_HEX,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]})}}
async function refreshMinted(){if(!mintedCount)return;try{const value=await publicClient.readContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"minted",args:[BigInt(selectedDesign)]});mintedCount.textContent=Number(value).toLocaleString("en-US")}catch{mintedCount.textContent="Unavailable"}}
async function finishWalletConnection(provider){const accounts=await provider.request({method:"eth_requestAccounts"});account=accounts?.[0]??null;activeProvider=provider;updateWalletUi();if(!account){showMessage("Wallet connection was not completed.");return}bindProviderEvents(provider);await ensureRobinhoodChain(provider);showMessage(`Wallet connected. Design #${selectedDesign} is ready to mint.`)}
function bindProviderEvents(provider){if(!provider?.on||provider.__chainlingBound)return;provider.__chainlingBound=true;provider.on("accountsChanged",accounts=>{account=accounts?.[0]??null;updateWalletUi();showMessage(account?`Wallet connected. Design #${selectedDesign} is ready to mint.`:"Wallet disconnected.")});provider.on("chainChanged",chainId=>{showMessage(chainId?.toLowerCase()===CHAIN_ID_HEX?`Robinhood Chain connected. Design #${selectedDesign} is ready to mint.`:"Please switch to Robinhood Chain (4663).")})}
async function connectWallet(){if(connecting)return;connecting=true;updateWalletUi();try{let candidate=activeProvider?{provider:activeProvider,info:activeProviderInfo}:choosePreferredInjected();if(!candidate){showWalletChooser();showMessage("Choose a wallet to continue.");return}activeProvider=candidate.provider;activeProviderInfo=candidate.info;await finishWalletConnection(candidate.provider)}catch(error){showMessage(errorMessage(error))}finally{connecting=false;updateWalletUi()}}
async function restoreWalletSession(provider=activeProvider){if(!isProvider(provider))return;try{const accounts=await provider.request({method:"eth_accounts"});account=accounts?.[0]??null;if(account){activeProvider=provider;bindProviderEvents(provider);showMessage(`Wallet connected. Design #${selectedDesign} is ready to mint.`)}updateWalletUi()}catch{account=null;updateWalletUi()}}
async function refreshWalletConnection(){if(connecting||!isProvider(activeProvider))return;closeAccountMenu();connecting=true;updateWalletUi();try{const accounts=await activeProvider.request({method:"eth_accounts"});account=accounts?.[0]??null;if(!account){await finishWalletConnection(activeProvider);return}await ensureRobinhoodChain(activeProvider);updateWalletUi();showMessage(`Connection refreshed. Design #${selectedDesign} is ready to mint.`)}catch(error){showMessage(errorMessage(error))}finally{connecting=false;updateWalletUi()}}
async function disconnectWallet(){if(connecting)return;closeAccountMenu();connecting=true;updateWalletUi();const provider=activeProvider;try{if(typeof provider?.disconnect==="function")await provider.disconnect();else if(isProvider(provider)){try{await provider.request({method:"wallet_revokePermissions",params:[{eth_accounts:{}}]})}catch{}}}catch{}finally{account=null;if(typeof provider?.disconnect==="function"){activeProvider=null;activeProviderInfo=null}connecting=false;updateWalletUi();showMessage("Wallet disconnected.")}}
async function mintSelected(){if(!account||busy)return;busy=true;updateWalletUi();try{if(!isProvider(activeProvider))throw new Error("Wallet provider is not connected.");await ensureRobinhoodChain(activeProvider);const walletClient=createWalletClient({account,chain,transport:custom(activeProvider)});const id=BigInt(selectedDesign);const amount=1n;const cost=await publicClient.readContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"mintPrice",args:[id]});renderSelectedPrice();const allowance=await publicClient.readContract({address:USDG_CONTRACT,abi:usdgAbi,functionName:"allowance",args:[account,NFT_CONTRACT]});if(allowance<cost){showMessage(`Approve ${formatUnits(cost,6)} USDG in your wallet.`);const approveHash=await walletClient.writeContract({address:USDG_CONTRACT,abi:usdgAbi,functionName:"approve",args:[NFT_CONTRACT,cost]});showMessage("Approval submitted:",approveHash);await publicClient.waitForTransactionReceipt({hash:approveHash});}showMessage(`Confirm mint of design #${selectedDesign} in your wallet.`);const mintHash=await walletClient.writeContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"mint",args:[id,amount]});showMessage("Mint submitted:",mintHash);const receipt=await publicClient.waitForTransactionReceipt({hash:mintHash});if(receipt.status!=="success")throw new Error("Mint transaction reverted.");showMessage(`Mint successful for design #${selectedDesign}:`,mintHash);await refreshMinted()}catch(error){showMessage(errorMessage(error))}finally{busy=false;updateWalletUi()}}

connectButton?.addEventListener("click",event=>{event.stopPropagation();if(account)toggleAccountMenu();else connectWallet()});
walletMenu.querySelector("[data-wallet-refresh]")?.addEventListener("click",refreshWalletConnection);
walletMenu.querySelector("[data-wallet-disconnect]")?.addEventListener("click",disconnectWallet);
document.addEventListener("click",event=>{if(!walletControl.contains(event.target))closeAccountMenu()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeAccountMenu()});
mintButton?.addEventListener("click",mintSelected);
document.querySelectorAll(".nft-card").forEach(card=>card.addEventListener("click",async()=>{document.querySelectorAll(".nft-card").forEach(item=>item.classList.remove("active"));card.classList.add("active");selectedDesign=Number(card.dataset.design);if(selectedName)selectedName.textContent=card.dataset.name;if(selectedSupply)selectedSupply.textContent=card.dataset.supply;renderSelectedPrice();syncHero();showMessage(account?`Design #${selectedDesign} selected. Ready to mint.`:"Connect your wallet to prepare minting.");await refreshMinted()}));
const initial=choosePreferredInjected();if(initial){activeProvider=initial.provider;activeProviderInfo=initial.info;bindProviderEvents(initial.provider)}
renderCardPrices();renderSelectedPrice();syncHero();updateWalletUi();refreshMinted();
restoreWalletSession();
initFreeMintCampaign();
const featherCss=document.createElement("style");
featherCss.textContent=`.feather::after,.feather-mark::after,.sigil::after,.benefits div:first-child b::after{content:""!important;display:inline-block;background:currentColor!important;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;vertical-align:middle}.feather::after{width:26px;height:30px}.feather-mark::after{width:82px;height:92px}.sigil::after{width:70px;height:78px}.benefits div:first-child b::after{width:23px;height:27px}.art .sigil,.orbit .feather-mark{display:grid;place-items:center}`;
document.head.appendChild(featherCss);
