const CHAIN_ID_HEX = "0x1237";
const RPC_URL = "https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER = "https://robinhoodchain.blockscout.com";
const DESIGN_PRICES = {1:"1.50",2:"1.00",3:"0.60",4:"0.85",5:"1.75",6:"0.50",7:"1.25"};
let account = null;
let selectedDesign = 1;
const connectButtons = [...document.querySelectorAll("[data-connect]")];
const walletStatus = document.querySelector("#wallet-status");
const mintMessage = document.querySelector("#mint-message");
const selectedName = document.querySelector("#selected-name");
const selectedSupply = document.querySelector("#selected-supply");
const priceDisplay = document.querySelector(".price-box strong");
function shortAddress(address){return `${address.slice(0,6)}…${address.slice(-4)}`;}
function renderSelectedPrice(){if(priceDisplay)priceDisplay.innerHTML=`${DESIGN_PRICES[selectedDesign]} <em>USDG</em>`;}
function renderCardPrices(){document.querySelectorAll(".nft-card").forEach((card)=>{const id=Number(card.dataset.design);const label=card.querySelector(":scope > span");if(label)label.textContent=`${card.dataset.supply} Editions · ${DESIGN_PRICES[id]} USDG`;});}
function updateWalletUi(){const label=account?shortAddress(account):"Connect Wallet";connectButtons.forEach((button)=>{button.textContent=label;});walletStatus.textContent=account?shortAddress(account):"Not connected";}
async function ensureRobinhoodChain(){const ethereum=window.ethereum;if(!ethereum)throw new Error("No browser wallet detected. Open Chainling inside your EVM wallet browser or install a compatible wallet.");const current=await ethereum.request({method:"eth_chainId"});if(current.toLowerCase()===CHAIN_ID_HEX)return;try{await ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]});}catch(error){if(error?.code!==4902)throw error;await ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID_HEX,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]});}}
async function connectWallet(){try{await ensureRobinhoodChain();const accounts=await window.ethereum.request({method:"eth_requestAccounts"});account=accounts?.[0]??null;updateWalletUi();mintMessage.textContent=account?`Wallet connected on Robinhood Chain. Design #${selectedDesign} is selected at ${DESIGN_PRICES[selectedDesign]} USDG. Minting will unlock only after the verified collection contract is deployed.`:"Wallet connection was not completed.";}catch(error){mintMessage.textContent=error?.message||"Unable to connect wallet.";}}
connectButtons.forEach((button)=>button.addEventListener("click",connectWallet));
document.querySelectorAll(".nft-card").forEach((card)=>{card.addEventListener("click",()=>{document.querySelectorAll(".nft-card").forEach((item)=>item.classList.remove("active"));card.classList.add("active");selectedDesign=Number(card.dataset.design);selectedName.textContent=card.dataset.name;selectedSupply.textContent=card.dataset.supply;renderSelectedPrice();mintMessage.textContent=account?`Design #${selectedDesign} selected at ${DESIGN_PRICES[selectedDesign]} USDG. Verified contract deployment is still pending; no USDG will be requested yet.`:"Connect your wallet to prepare minting. No payment can be submitted until the verified contract is live.";});});
if(window.ethereum?.on){window.ethereum.on("accountsChanged",(accounts)=>{account=accounts?.[0]??null;updateWalletUi();});window.ethereum.on("chainChanged",()=>window.location.reload());}
renderCardPrices();
renderSelectedPrice();
updateWalletUi();

const featherCss=document.createElement("style");
featherCss.textContent=`
.feather::after,.feather-mark::after,.sigil::after,.benefits div:first-child b::after{content:""!important;display:inline-block;background:currentColor!important;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;vertical-align:middle}
.feather::after{width:26px;height:30px}.feather-mark::after{width:82px;height:92px}.sigil::after{width:70px;height:78px}.benefits div:first-child b::after{width:23px;height:27px}.art .sigil,.orbit .feather-mark{display:grid;place-items:center}
`;
document.head.appendChild(featherCss);
