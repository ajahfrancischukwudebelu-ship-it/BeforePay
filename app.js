const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function assess(d){
 let score=18,flags=[]; const t=(d.item+" "+d.concern).toLowerCase();
 if(!d.link){score+=12;flags.push(["No public link supplied","Independent verification may be harder."])}
 if(/crypto|usdt|bitcoin|ethereum|gift card|itunes|apple card|western union|wire transfer/.test(t)){score+=22;flags.push(["Hard-to-reverse payment mentioned","Prefer payment methods with meaningful buyer protection where possible."])}
 if(/urgent|immediately|today only|last chance|hurry|send now|rushed/.test(t)){score+=17;flags.push(["Pressure or urgency","Slow the decision down and verify independently."])}
 if(/too cheap|half price|90% off|unbelievable|guaranteed profit|guaranteed return/.test(t)){score+=16;flags.push(["Unusually attractive claim","Compare the offer independently before paying."])}
 if(Number(d.amount)>5000){score+=8;flags.push(["Higher amount at risk","Consider additional identity and business verification."])}
 if(!d.phone){score+=5;flags.push(["No contact number supplied","Look for additional independent contact information."])}
 if(!flags.length)flags.push(["No obvious pattern detected","That does not prove the seller is legitimate."]);
 score=Math.min(95,score); return {score,flags,title:score>=65?"High risk signals":score>=40?"Proceed with caution":"Lower risk signals"};
}
$("dealForm").addEventListener("submit",e=>{
 e.preventDefault(); const d={seller:$("seller").value,amount:$("amount").value,link:$("link").value,phone:$("phone").value,item:$("item").value,concern:$("concern").value}; const r=assess(d);
 $("score").textContent=r.score+"/100";$("resultTitle").textContent=r.title;
 $("summary").textContent=`Preliminary screening for ${d.seller}. This score uses only the information entered here and is not a fraud verdict.`;
 $("flags").innerHTML=r.flags.map(x=>`<div class="flag"><b>${esc(x[0])}</b>${esc(x[1])}</div>`).join("");
 $("result").classList.remove("hidden");$("result").scrollIntoView({behavior:"smooth"});
});
$("newCheck").onclick=()=>{$("dealForm").reset();$("result").classList.add("hidden");location.hash="check"};
$("print").onclick=()=>window.print();
$("reportForm").addEventListener("submit",e=>{e.preventDefault();let a=JSON.parse(localStorage.getItem("beforepay_reports")||"[]");a.push({seller:$("reportSeller").value,link:$("reportLink").value,text:$("reportText").value,date:new Date().toISOString()});localStorage.setItem("beforepay_reports",JSON.stringify(a));$("saved").classList.remove("hidden");e.target.reset()});
