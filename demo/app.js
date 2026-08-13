const CHAIN_ID_HEX = "0x1237";
const RPC_URL = "https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER = "https://robinhoodchain.blockscout.com";
let account = null;
let selectedDesign = 1;
const connectButtons = [...document.querySelectorAll("[data-connect]")];
const walletStatus = document.querySelector("#wallet-status");
const mintMessage = document.querySelector("#mint-message");
const selectedName = document.querySelector("#selected-name");
const selectedSupply = document.querySelector("#selected-supply");
function shortAddress(address){return `${address.slice(0,6)}…${address.slice(-4)}`;}
function updateWalletUi(){const label=account?shortAddress(account):"Connect Wallet";connectButtons.forEach((button)=>{button.textContent=label;});walletStatus.textContent=account?shortAddress(account):"Not connected";}
async function ensureRobinhoodChain(){const ethereum=window.ethereum;if(!ethereum)throw new Error("No browser wallet detected. Open Chainling inside your EVM wallet browser or install a compatible wallet.");const current=await ethereum.request({method:"eth_chainId"});if(current.toLowerCase()===CHAIN_ID_HEX)return;try{await ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]});}catch(error){if(error?.code!==4902)throw error;await ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID_HEX,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]});}}
async function connectWallet(){try{await ensureRobinhoodChain();const accounts=await window.ethereum.request({method:"eth_requestAccounts"});account=accounts?.[0]??null;updateWalletUi();mintMessage.textContent=account?`Wallet connected on Robinhood Chain. Design #${selectedDesign} is selected. Minting will unlock only after the verified collection contract is deployed.`:"Wallet connection was not completed.";}catch(error){mintMessage.textContent=error?.message||"Unable to connect wallet.";}}
connectButtons.forEach((button)=>button.addEventListener("click",connectWallet));
document.querySelectorAll(".nft-card").forEach((card)=>{card.addEventListener("click",()=>{document.querySelectorAll(".nft-card").forEach((item)=>item.classList.remove("active"));card.classList.add("active");selectedDesign=Number(card.dataset.design);selectedName.textContent=card.dataset.name;selectedSupply.textContent=card.dataset.supply;mintMessage.textContent=account?`Design #${selectedDesign} selected. Verified contract deployment is still pending; no USDG will be requested yet.`:"Connect your wallet to prepare minting. No payment can be submitted until the verified contract is live.";});});
if(window.ethereum?.on){window.ethereum.on("accountsChanged",(accounts)=>{account=accounts?.[0]??null;updateWalletUi();});window.ethereum.on("chainChanged",()=>window.location.reload());}
updateWalletUi();
