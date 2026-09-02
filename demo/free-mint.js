import {createPublicClient,createWalletClient,custom,defineChain,getAddress,http,parseAbi} from "viem";

const PROFILE_URL="https://x.com/chainling_xyz";
const CAMPAIGN_TWEET_ID=window.CHAINLING_CAMPAIGN_TWEET_ID||"";
const CAMPAIGN_URL=/^\d{1,19}$/.test(CAMPAIGN_TWEET_ID)?`${PROFILE_URL}/status/${CAMPAIGN_TWEET_ID}`:PROFILE_URL;
const AUTH_API=window.CHAINLING_AUTH_API||"https://chainling-x-verifier.ertekh.chatgpt.site";
const VERIFIED_MINT_CONTRACT="";
const CHAIN_ID_HEX="0x1237";
const RPC_URL="https://rpc.mainnet.chain.robinhood.com/";
const EXPLORER="https://robinhoodchain.blockscout.com";
const verifiedMintAbi=parseAbi(["function mint(bytes32 xUserHash,uint256 deadline,bytes signature)","function minted() view returns (uint256)","function claimed(address) view returns (bool)"]);
const chain=defineChain({id:4663,name:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:[RPC_URL]}},blockExplorers:{default:{name:"Blockscout",url:EXPLORER}}});
const publicClient=createPublicClient({chain,transport:http(RPC_URL)});

function isConfigured(){return /^0x[a-fA-F0-9]{40}$/.test(VERIFIED_MINT_CONTRACT)&&/^https:\/\//.test(AUTH_API)}
function short(value){return `${value.slice(0,6)}…${value.slice(-4)}`}

export function initFreeMintCampaign(){
  const collection=document.querySelector("#collection");
  if(!collection||document.querySelector("#free-mint"))return;
  document.querySelector(".nav-links")?.insertAdjacentHTML("afterbegin",'<a class="nav-free-mint" href="#free-mint">Free Mint</a>');
  const section=document.createElement("section");
  section.id="free-mint";
  section.className="free-mint-campaign panel";
  section.innerHTML=`
    <div class="free-mint-art" role="img" aria-label="Chainling #6 Aqua Kingfisher"></div>
    <div class="free-mint-copy">
      <p class="kicker">VERIFIED COMMUNITY CAMPAIGN</p>
      <h2>#6 Aqua Kingfisher<br><span>Free Mint</span></h2>
      <p class="free-mint-lead">Connect your wallet and X account. Chainling verifies the follow, like and repost before issuing a one-time mint permit for your wallet.</p>
      <div class="free-mint-stats"><div><span>Supply</span><strong>8,888</strong></div><div><span>Price</span><strong>FREE</strong></div><div><span>Limit</span><strong>1 X + 1 wallet</strong></div></div>
      <div class="free-mint-tasks" aria-label="Verified X campaign tasks">
        <div class="free-mint-task" data-task="followed"><b class="free-task-state">○</b><span><strong>Follow @chainling_xyz</strong><small>Verified through your connected X account.</small></span><a href="https://x.com/intent/follow?screen_name=chainling_xyz" target="_blank" rel="noopener noreferrer">Follow</a></div>
        <div class="free-mint-task" data-task="liked"><b class="free-task-state">○</b><span><strong>Like the campaign post</strong><small>Must be liked by the connected X account.</small></span><a href="${CAMPAIGN_URL}" target="_blank" rel="noopener noreferrer">View post</a></div>
        <div class="free-mint-task" data-task="reposted"><b class="free-task-state">○</b><span><strong>Repost the campaign post</strong><small>Must be reposted by the connected X account.</small></span><a href="${CAMPAIGN_URL}" target="_blank" rel="noopener noreferrer">Repost</a></div>
      </div>
      <p class="free-mint-identity" aria-live="polite">X account: Not connected</p>
      <button class="free-mint-claim" type="button">Connect wallet & X</button>
      <p class="free-mint-status" aria-live="polite">X tasks are checked automatically. A direct contract call cannot mint without a verified permit.</p>
    </div>`;
  collection.insertAdjacentElement("afterend",section);

  const promoteCampaign=()=>{
    const landing=document.querySelector(".chainling-landing");
    if(!landing)return false;
    landing.insertAdjacentElement("afterend",section);
    const copy=landing.querySelector(".landing-copy");
    if(copy&&!copy.querySelector(".landing-free-callout"))copy.insertAdjacentHTML("afterbegin",'<a class="landing-free-callout" href="#free-mint"><span>VERIFIED FREE MINT</span><strong>#6 Aqua Kingfisher · 8,888 supply · 1 per verified account</strong></a>');
    const actions=landing.querySelector(".landing-actions");
    if(actions&&!actions.querySelector("[data-go-free-mint]")){
      const button=document.createElement("button");button.className="landing-primary landing-free-mint";button.type="button";button.dataset.goFreeMint="";button.textContent="Claim Free #6";button.addEventListener("click",()=>section.scrollIntoView({behavior:"smooth",block:"start"}));actions.prepend(button);
      const collectionButton=actions.querySelector("[data-go-mint]");if(collectionButton){collectionButton.textContent="Explore Collection";collectionButton.className="landing-secondary"}
    }
    return true;
  };
  if(!promoteCampaign()){
    const observer=new MutationObserver(()=>{if(promoteCampaign())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),12000);
  }

  const claimButton=section.querySelector(".free-mint-claim");
  const status=section.querySelector(".free-mint-status");
  const identity=section.querySelector(".free-mint-identity");
  let session=null;
  let tasks={followed:false,liked:false,reposted:false};
  let permit=null;
  let authToken=sessionStorage.getItem("chainling_x_session");
  let busy=false;
  let claimedSuccessfully=false;

  const updateTasks=()=>{
    for(const [name,complete] of Object.entries(tasks)){
      const row=section.querySelector(`[data-task="${name}"]`);if(!row)continue;
      row.classList.toggle("complete",complete);row.querySelector(".free-task-state").textContent=complete?"✓":"○";
    }
  };
  const update=()=>{
    updateTasks();
    identity.textContent=session?`X account: @${session.username} · Wallet: ${short(session.wallet)}`:"X account: Not connected";
    if(claimedSuccessfully){claimButton.textContent="Claimed";claimButton.disabled=true;return}
    if(busy){claimButton.textContent="Processing…";claimButton.disabled=true;return}
    if(!isConfigured()){claimButton.textContent="Verified mint setup pending";claimButton.disabled=true;return}
    if(!session){claimButton.textContent="Connect wallet & X";claimButton.disabled=false;return}
    if(!permit){claimButton.textContent="Verify X tasks";claimButton.disabled=false;return}
    claimButton.textContent="Mint verified NFT";claimButton.disabled=false;
  };

  const provider=()=>window.chainlingGetWalletProvider?.()||window.ethereum||null;
  const requestJson=async(path,options={})=>{
    const response=await fetch(`${AUTH_API}${path}`,{...options,headers:{"content-type":"application/json",...(authToken?{authorization:`Bearer ${authToken}`}:{}) ,...(options.headers||{})}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||`Verification request failed (${response.status}).`);
    return payload;
  };
  const ensureNetwork=async walletProvider=>{
    const current=await walletProvider.request({method:"eth_chainId"});
    if(Number(current)===4663)return;
    try{await walletProvider.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_ID_HEX}]})}
    catch(error){if(error?.code!==4902)throw error;await walletProvider.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_ID_HEX,chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER]}]})}
  };
  const startXAuth=async()=>{
    const walletProvider=provider();
    if(!walletProvider?.request){status.textContent="Connect a wallet, then click this button again.";document.querySelector(".wallet-btn[data-connect]")?.click();return}
    const accounts=await walletProvider.request({method:"eth_requestAccounts"});
    const account=accounts?.[0];if(!account)throw new Error("Wallet connection was not completed.");
    const wallet=getAddress(account);
    status.textContent="Opening secure X authorization…";
    const result=await requestJson("/api/auth/start",{method:"POST",body:JSON.stringify({wallet})});
    location.href=result.authorizationUrl;
  };
  const verifyXTasks=async()=>{
    const result=await requestJson("/api/verify",{method:"POST",body:"{}"});
    tasks=result.tasks||tasks;
    if(!result.verified){permit=null;const missing=[!tasks.followed&&"follow",!tasks.liked&&"like",!tasks.reposted&&"repost"].filter(Boolean).join(", ");status.textContent=`Complete the missing X tasks: ${missing}. Then verify again.`;return}
    permit=result.permit;status.textContent="All X tasks verified. Your wallet-specific mint permit is ready.";
  };
  const mintVerified=async()=>{
    const walletProvider=provider();if(!walletProvider?.request)throw new Error("Reconnect the verified wallet.");
    const accounts=await walletProvider.request({method:"eth_requestAccounts"});const value=accounts?.[0];if(!value)throw new Error("Wallet connection was not completed.");const account=getAddress(value);
    if(account!==getAddress(session.wallet))throw new Error(`Connect the verified wallet ${short(session.wallet)}.`);
    await ensureNetwork(walletProvider);
    if(await publicClient.readContract({address:VERIFIED_MINT_CONTRACT,abi:verifiedMintAbi,functionName:"claimed",args:[account]}))throw new Error("This wallet has already claimed its free NFT.");
    const walletClient=createWalletClient({account,chain,transport:custom(walletProvider)});
    const hash=await walletClient.writeContract({address:VERIFIED_MINT_CONTRACT,abi:verifiedMintAbi,functionName:"mint",args:[permit.xUserHash,BigInt(permit.deadline),permit.signature]});
    status.textContent=`Mint submitted: ${short(hash)}`;
    const receipt=await publicClient.waitForTransactionReceipt({hash});if(receipt.status!=="success")throw new Error("Mint transaction reverted.");
    const total=await publicClient.readContract({address:VERIFIED_MINT_CONTRACT,abi:verifiedMintAbi,functionName:"minted"});
    status.innerHTML=`Claim successful. ${Number(total).toLocaleString("en-US")} / 8,888 minted. <a href="${EXPLORER}/tx/${hash}" target="_blank" rel="noopener noreferrer">View transaction</a>`;claimedSuccessfully=true;
  };

  claimButton.addEventListener("click",async()=>{
    if(busy||claimedSuccessfully||!isConfigured())return;busy=true;update();
    try{if(!session)await startXAuth();else if(!permit)await verifyXTasks();else await mintVerified()}
    catch(error){status.textContent=error?.shortMessage||error?.message||"Verified mint failed."}
    finally{busy=false;update()}
  });

  const refreshSession=async()=>{
    if(!isConfigured()){update();return}
    const match=location.hash.match(/(?:^#|&)x_session=([^&]+)/);
    if(match){authToken=decodeURIComponent(match[1]);sessionStorage.setItem("chainling_x_session",authToken);history.replaceState(null,"",`${location.pathname}#free-mint`)}
    try{const result=await requestJson("/api/status");session=result.connected?result:null}
    catch{session=null;authToken=null;sessionStorage.removeItem("chainling_x_session")}
    update();
  };
  update();refreshSession();
}
