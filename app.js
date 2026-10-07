const $=id=>document.getElementById(id);
function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[c]));
}
function assess(d){
  let score=0,flags=[];
  const t=(
    d.item+" "+
    d.concern+" "+
    d.seller
  ).toLowerCase();
  // Hard-to-reverse payment methods
  if(/crypto|usdt|bitcoin|ethereum|gift card|itunes|apple card|western union|wire transfer|prepaid card/.test(t)){
    score+=22;
    flags.push([
      "Hard-to-reverse payment mentioned",
      "Prefer payment methods with meaningful buyer protection where possible."
    ]);
  }
  // Urgency or pressure
  if(/urgent|immediately|today only|last chance|hurry|send now|rushed|act now|limited time|don't wait/.test(t)){
    score+=17;
    flags.push([
      "Pressure or urgency",
      "Slow the decision down and verify independently."
    ]);
  }
  // Unrealistic offers or guaranteed returns
  if(/too cheap|half price|90% off|unbelievable|guaranteed profit|guaranteed return|double your money|risk free|no risk/.test(t)){
    score+=16;
    flags.push([
      "Unusually attractive claim",
      "Compare the offer independently before paying."
    ]);
  }
  // Off-platform communication or payment requests
  if(/telegram|whatsapp only|whatsapp payment|pay privately|private payment|outside the platform|off platform|move to another app|send directly|direct payment/.test(t)){
    score+=14;
    flags.push([
      "Off-platform request",
      "Verify the seller and keep communication or payment within a protected platform where possible."
    ]);
  }
  // Missing refund / return information
  if(/no refund|no returns|non refundable|non-refundable|refund unavailable|cannot refund|no return policy/.test(t)){
    score+=10;
    flags.push([
      "Refund or return protection may be missing",
      "Check the seller's refund and return terms before paying."
    ]);
  }
  // Suspicious seller/account language
  if(/new account|new seller|anonymous|fake account|verified account for sale|borrowed account|rented account|account for sale|suspicious seller|seller disappeared|blocked me|changed account/.test(t)){
    score+=13;
    flags.push([
      "Suspicious seller or account language",
      "Look for independent evidence of the seller's identity and trading history."
    ]);
  }
  // Higher amount at risk
  if(Number(d.amount)>5000){
    score+=8;
    flags.push([
      "Higher amount at risk",
      "Consider additional identity and business verification before paying."
    ]);
  }
  // Missing public link
  if(!d.link){
    score+=12;
    flags.push([
      "No public link supplied",
      "Independent verification may be harder."
    ]);
  }
  // Missing contact number
  if(!d.phone){
    score+=5;
    flags.push([
      "No contact number supplied",
      "Look for additional independent contact information."
    ]);
  }
  // Missing seller name
  if(!d.seller.trim()){
    score+=5;
    flags.push([
      "Seller information is incomplete",
      "A seller's identity should be independently verified before payment."
    ]);
  }
  // Missing item/deal information
  if(!d.item.trim()){
    score+=4;
    flags.push([
      "Deal information is incomplete",
      "Provide enough information to allow a meaningful preliminary screening."
    ]);
  }
  // No obvious signals
  if(!flags.length){
    flags.push([
      "No obvious pattern detected",
      "That does not prove the seller is legitimate."
    ]);
  }
  score=Math.min(100,score);
  let title;
  if(score<=20){
    title="Few warning signals detected";
  }else if(score<=40){
    title="Limited information";
  }else if(score<=60){
    title="Caution advised";
  }else if(score<=80){
    title="High-risk signals";
  }else{
    title="Severe warning signals";
  }
  return {score,flags,title};
}
$("dealForm").addEventListener("submit",e=>{
  e.preventDefault();
  const d={
    seller:$("seller").value,
    amount:$("amount").value,
    link:$("link").value,
    phone:$("phone").value,
    item:$("item").value,
    concern:$("concern").value
  };
  const r=assess(d);
  $("score").textContent=r.score+"/100";
  $("resultTitle").textContent=r.title;
  $("summary").textContent=
    `Preliminary screening for ${d.seller}. This score uses only the information entered here and is not a fraud verdict.`;
  $("flags").innerHTML=r.flags.map(x=>
    `<div class="flag"><b>${esc(x[0])}</b>${esc(x[1])}</div>`
  ).join("");
  $("result").classList.remove("hidden");
  $("result").scrollIntoView({behavior:"smooth"});
});
$("newCheck").onclick=()=>{
  $("dealForm").reset();
  $("result").classList.add("hidden");
  location.hash="check";
};
$("print").onclick=()=>window.print();
$("reportForm").addEventListener("submit",e=>{
  e.preventDefault();
  let a=JSON.parse(
    localStorage.getItem("beforepay_reports")||"[]"
  );
  a.push({
    seller:$("reportSeller").value,
    link:$("reportLink").value,
    text:$("reportText").value,
    date:new Date().toISOString()
  });
  localStorage.setItem(
    "beforepay_reports",
    JSON.stringify(a)
  );
  $("saved").classList.remove("hidden");
  e.target.reset();
});
