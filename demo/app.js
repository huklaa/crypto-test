import {createPublicClient,createWalletClient,custom,defineChain,formatUnits,http,parseAbi} from "viem";

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

function shortAddress(value){return `${value.slice(0,6)}…${value.slice(-4)}`}
function renderSelectedPrice(){if(priceDisplay)priceDisplay.innerHTML=`${DESIGN_PRICES[selectedDesign]} <em>USDG</em>`}
function renderCardPrices(){document.querySelectorAll(".nft-card").forEach(card=>{const id=Number(card.dataset.design);const label=card.querySelector(":scope > span");if(label)label.textContent=`${card.dataset.supply} Editions · ${DESIGN_PRICES[id]} USDG`})}
function syncHero(){if(!heroCard)return;heroCard.classList.remove("design-1","design-2","design-3","design-4","design-5","design-6","design-7");heroCard.classList.add(`design-${selectedDesign}`)}
function updateWalletUi(){if(connectButton)connectButton.textContent=account?shortAddress(account):"Connect Wallet";if(walletStatus)walletStatus.textContent=account?shortAddress(account):"Not connected";if(mintButton){mintButton.textContent=busy?"Processing…":"Mint NFT";mintButton.disabled=!account||busy}}
function showMessage(message,hash){if(!mintMessage)return;mintMessage.textContent=message;if(hash){mintMessage.append(" ");const link=document.createElement("a");link.href=`${EXPLORER}/tx/${hash}`;link.target="_blank";link.rel="noreferrer";link.textContent=shortAddress(hash);link.style.color="#78ff22";mintMessage.append(link)}}
function errorMessage(error){if(error?.code===4001||error?.cause?.code===4001)return "Transaction was rejected in the wallet.";return error?.shortMessage||error?.message||"Transaction failed."}
async function ensureRobinhoodChain(){const ethereum=window.ethereum;if(!ethereum)throw new Error("No browser wallet detected.");const current=await ethereum.request({method:"eth_chainId"});if(current.toLowerCase()===CHAIN_ID_HEX)return;try{await ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]})}catch(error){if(error?.code!==4902)throw error;await ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID_HEX,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]})}}
async function refreshMinted(){if(!mintedCount)return;try{const value=await publicClient.readContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"minted",args:[BigInt(selectedDesign)]});mintedCount.textContent=Number(value).toLocaleString("en-US")}catch{mintedCount.textContent="Unavailable"}}
async function connectWallet(){try{await ensureRobinhoodChain();const accounts=await window.ethereum.request({method:"eth_requestAccounts"});account=accounts?.[0]??null;updateWalletUi();showMessage(account?`Wallet connected. Design #${selectedDesign} is ready to mint.`:"Wallet connection was not completed.")}catch(error){showMessage(errorMessage(error))}}
async function mintSelected(){if(!account||busy)return;busy=true;updateWalletUi();try{await ensureRobinhoodChain();const walletClient=createWalletClient({account,chain,transport:custom(window.ethereum)});const id=BigInt(selectedDesign);const amount=1n;const cost=await publicClient.readContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"mintPrice",args:[id]});renderSelectedPrice();const allowance=await publicClient.readContract({address:USDG_CONTRACT,abi:usdgAbi,functionName:"allowance",args:[account,NFT_CONTRACT]});if(allowance<cost){showMessage(`Approve ${formatUnits(cost,6)} USDG in your wallet.`);const approveHash=await walletClient.writeContract({address:USDG_CONTRACT,abi:usdgAbi,functionName:"approve",args:[NFT_CONTRACT,cost]});showMessage("Approval submitted:",approveHash);await publicClient.waitForTransactionReceipt({hash:approveHash});}showMessage(`Confirm mint of design #${selectedDesign} in your wallet.`);const mintHash=await walletClient.writeContract({address:NFT_CONTRACT,abi:nftAbi,functionName:"mint",args:[id,amount]});showMessage("Mint submitted:",mintHash);const receipt=await publicClient.waitForTransactionReceipt({hash:mintHash});if(receipt.status!=="success")throw new Error("Mint transaction reverted.");showMessage(`Mint successful for design #${selectedDesign}:`,mintHash);await refreshMinted()}catch(error){showMessage(errorMessage(error))}finally{busy=false;updateWalletUi()}}

connectButton?.addEventListener("click",connectWallet);
mintButton?.addEventListener("click",mintSelected);
document.querySelectorAll(".nft-card").forEach(card=>card.addEventListener("click",async()=>{document.querySelectorAll(".nft-card").forEach(item=>item.classList.remove("active"));card.classList.add("active");selectedDesign=Number(card.dataset.design);if(selectedName)selectedName.textContent=card.dataset.name;if(selectedSupply)selectedSupply.textContent=card.dataset.supply;renderSelectedPrice();syncHero();showMessage(account?`Design #${selectedDesign} selected. Ready to mint.`:"Connect your wallet to prepare minting.");await refreshMinted()}));
if(window.ethereum?.on){window.ethereum.on("accountsChanged",accounts=>{account=accounts?.[0]??null;updateWalletUi()});window.ethereum.on("chainChanged",()=>window.location.reload())}
renderCardPrices();renderSelectedPrice();syncHero();updateWalletUi();refreshMinted();
const featherCss=document.createElement("style");
featherCss.textContent=`.feather::after,.feather-mark::after,.sigil::after,.benefits div:first-child b::after{content:""!important;display:inline-block;background:currentColor!important;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='black' d='M92 8C62 16 34 35 18 60 8 75 6 91 11 106c1 4 6 5 9 2l25-22-18 26c-1 2 0 5 2 6 2 1 4 1 6-1l20-20 6 12 10-28-19-1 24-12-14-5 28-12-16-5 21-9-14-4c9-7 16-15 20-23 2-5-3-10-9-8z'/%3E%3Cpath fill='black' d='M18 106c15-20 32-37 51-52 9-7 18-13 27-18-8 7-15 14-22 21-18 18-34 37-47 57z'/%3E%3C/svg%3E") center/contain no-repeat!important;vertical-align:middle}.feather::after{width:26px;height:30px}.feather-mark::after{width:82px;height:92px}.sigil::after{width:70px;height:78px}.benefits div:first-child b::after{width:23px;height:27px}.art .sigil,.orbit .feather-mark{display:grid;place-items:center}`;
document.head.appendChild(featherCss);
