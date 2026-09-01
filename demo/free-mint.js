import {createPublicClient,createWalletClient,custom,defineChain,http,parseAbi} from "viem";

const PROFILE_URL="https://x.com/chainling_xyz";
const FREE_MINT_CONTRACT="";
const CHAIN_ID_HEX="0x1237";
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
const freeMintAbi=parseAbi(["function mint()","function minted() view returns (uint256)","function claimed(address) view returns (bool)"]);
const chain=defineChain({id:4663,name:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:[RPC_URL]}},blockExplorers:{default:{name:"Blockscout",url:EXPLORER}}});
const publicClient=createPublicClient({chain,transport:http(RPC_URL)});

function isConfigured(){return /^0x[a-fA-F0-9]{40}$/.test(FREE_MINT_CONTRACT)}
function short(value){return `${value.slice(0,6)}…${value.slice(-4)}`}

export function initFreeMintCampaign(){
  const collection=document.querySelector("#collection");
  if(!collection||document.querySelector("#free-mint"))return;
  document.querySelector(".nav-links")?.insertAdjacentHTML("beforeend",'<a href="#free-mint">Free Mint</a>');
  const section=document.createElement("section");
  section.id="free-mint";
  section.className="free-mint-campaign panel";
  section.innerHTML=`
    <div class="free-mint-art" role="img" aria-label="Chainling #6 Aqua Kingfisher"></div>
    <div class="free-mint-copy">
      <p class="kicker">COMMUNITY CAMPAIGN</p>
      <h2>#6 Aqua Kingfisher<br><span>Free Mint</span></h2>
      <p class="free-mint-lead">Follow Chainling on X, like the pinned campaign post and repost it. Then connect your wallet to claim one free Aqua Kingfisher while supply lasts.</p>
      <div class="free-mint-stats"><div><span>Supply</span><strong>8,888</strong></div><div><span>Price</span><strong>FREE</strong></div><div><span>Wallet limit</span><strong>1 NFT</strong></div></div>
      <div class="free-mint-tasks" aria-label="X campaign tasks">
        <label class="free-mint-task"><input type="checkbox" data-free-task><span><strong>Follow @chainling_xyz</strong><small>Open the official Chainling profile.</small></span><a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer">Open X</a></label>
        <label class="free-mint-task"><input type="checkbox" data-free-task><span><strong>Like the campaign post</strong><small>Like the pinned free-mint announcement.</small></span><a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer">View post</a></label>
        <label class="free-mint-task"><input type="checkbox" data-free-task><span><strong>Repost the campaign post</strong><small>Share the pinned announcement with your community.</small></span><a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer">Repost</a></label>
      </div>
      <button class="free-mint-claim" type="button" disabled>Complete the X tasks</button>
      <p class="free-mint-status" aria-live="polite">Task completion is self-confirmed and is not automatically verified by X. Contract deployment is pending.</p>
    </div>`;
  collection.insertAdjacentElement("afterend",section);

  const tasks=[...section.querySelectorAll("[data-free-task]")];
  const claimButton=section.querySelector(".free-mint-claim");
  const status=section.querySelector(".free-mint-status");
  let busy=false;
  let claimedSuccessfully=false;
  const tasksDone=()=>tasks.every(task=>task.checked);
  const update=()=>{
    if(claimedSuccessfully){claimButton.textContent="Claimed";claimButton.disabled=true;return}
    if(busy){claimButton.textContent="Processing…";claimButton.disabled=true;return}
    if(!tasksDone()){claimButton.textContent="Complete the X tasks";claimButton.disabled=true;return}
    if(!isConfigured()){claimButton.textContent="Free mint coming soon";claimButton.disabled=true;return}
    claimButton.textContent="Connect wallet & claim free NFT";claimButton.disabled=false;
  };
  tasks.forEach(task=>task.addEventListener("change",update));
  claimButton.addEventListener("click",async()=>{
    if(!tasksDone()||!isConfigured()||busy)return;
    const provider=window.ethereum;
    if(!provider?.request){status.textContent="Open Chainling in an EVM wallet browser or install a compatible wallet.";return}
    busy=true;update();
    try{
      const accounts=await provider.request({method:"eth_requestAccounts"});
      const account=accounts?.[0];
      if(!account)throw new Error("Wallet connection was not completed.");
      const current=await provider.request({method:"eth_chainId"});
      if(current.toLowerCase()!==CHAIN_ID_HEX)await provider.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]});
      if(await publicClient.readContract({address:FREE_MINT_CONTRACT,abi:freeMintAbi,functionName:"claimed",args:[account]}))throw new Error("This wallet has already claimed its free NFT.");
      const walletClient=createWalletClient({account,chain,transport:custom(provider)});
      const hash=await walletClient.writeContract({address:FREE_MINT_CONTRACT,abi:freeMintAbi,functionName:"mint"});
      status.textContent=`Mint submitted: ${short(hash)}`;
      const receipt=await publicClient.waitForTransactionReceipt({hash});
      if(receipt.status!=="success")throw new Error("Mint transaction reverted.");
      const total=await publicClient.readContract({address:FREE_MINT_CONTRACT,abi:freeMintAbi,functionName:"minted"});
      status.innerHTML=`Claim successful. ${Number(total).toLocaleString("en-US")} / 8,888 minted. <a href="${EXPLORER}/tx/${hash}" target="_blank" rel="noopener noreferrer">View transaction</a>`;
      claimedSuccessfully=true;
    }catch(error){status.textContent=error?.shortMessage||error?.message||"Free mint failed."}
    finally{busy=false;update()}
  });
  update();
}
