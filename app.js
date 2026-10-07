const $ = id => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));
}

function assess(d) {
  let score = 0;
  let flags = [];

  const t = (
    d.item + " " +
    d.concern + " " +
    d.seller
  ).toLowerCase();

  // Hard-to-reverse payment methods
  if (/crypto|usdt|bitcoin|ethereum|gift card|itunes|apple card|western union|wire transfer|prepaid card/.test(t)) {
    score += 22;
    flags.push([
      "Hard-to-reverse payment mentioned",
      "Prefer payment methods with meaningful buyer protection where possible."
    ]);
  }

  // Pressure or urgency
  if (/urgent|immediately|today only|last chance|hurry|send now|rushed|act now|limited time|don't wait/.test(t)) {
    score += 17;
    flags.push([
      "Pressure or urgency",
      "Slow the decision down and verify independently."
    ]);
  }

  // Unrealistic offers
  if (/too cheap|half price|90% off|unbelievable|guaranteed profit|guaranteed return|double your money|risk free|no risk/.test(t)) {
    score += 16;
    flags.push([
      "Unusually attractive claim",
      "Compare the offer independently before paying."
    ]);
  }

  // Off-platform communication or payment
  if (/telegram|whatsapp only|whatsapp payment|pay privately|private payment|outside the platform|off platform|move to another app|send directly|direct payment/.test(t)) {
    score += 14;
    flags.push([
      "Off-platform request",
      "Verify the seller and keep communication or payment within a protected platform where possible."
    ]);
  }

  // Missing refund protection
  if (/no refund|no returns|non refundable|non-refundable|refund unavailable|cannot refund|no return policy/.test(t)) {
    score += 10;
    flags.push([
      "Refund or return protection may be missing",
      "Check the seller's refund and return terms before paying."
    ]);
  }

  // Suspicious seller/account language
  if (/new account|new seller|anonymous|fake account|verified account for sale|borrowed account|rented account|account for sale|suspicious seller|seller disappeared|blocked me|changed account/.test(t)) {
    score += 13;
    flags.push([
      "Suspicious seller or account language",
      "Look for independent evidence of the seller's identity and trading history."
    ]);
  }

  // Higher amount at risk
  if (Number(d.amount) > 5000) {
    score += 8;
    flags.push([
      "Higher amount at risk",
      "Consider additional identity and business verification before paying."
    ]);
  }

  // Missing public link
  if (!d.link) {
    score += 12;
    flags.push([
      "No public link supplied",
      "Independent verification may be harder."
    ]);
  }

  // Missing contact number
  if (!d.phone) {
    score += 5;
    flags.push([
      "No contact number supplied",
      "Look for additional independent contact information."
    ]);
  }

  // Missing seller information
  if (!d.seller.trim()) {
    score += 5;
    flags.push([
      "Seller information is incomplete",
      "A seller's identity should be independently verified before paying."
    ]);
  }

  // Missing deal information
  if (!d.item.trim()) {
    score += 4;
    flags.push([
      "Deal information is incomplete",
      "Provide enough information to allow a meaningful preliminary screening."
    ]);
  }

  // Stronger combined-risk weighting
  // Multiple warning signs together can be more concerning than one signal alone.
  if (flags.length >= 3) {
    score += 8;
    flags.push([
      "Multiple warning signals detected",
      "Several warning signs appearing together justify extra caution and independent verification."
    ]);
  }

  if (flags.length >= 5) {
    score += 10;
    flags.push([
      "Several serious signals combined",
      "Avoid rushing into payment until the seller, offer and payment method have been independently verified."
    ]);
  }

  score = Math.min(100, score);

  let title;
  let guidance;

  if (score <= 20) {
    title = "Low risk signals";
    guidance = "Few warning signals were detected. Still verify important details before paying.";
  } else if (score <= 40) {
    title = "Moderate caution";
    guidance = "Some warning signals were detected. Verify the seller and deal before paying.";
  } else if (score <= 60) {
    title = "Caution advised";
    guidance = "Several warning signals were detected. Slow down and verify independently.";
  } else if (score <= 80) {
    title = "High-risk signals";
    guidance = "Multiple warning signals are present. Consider avoiding payment until everything is verified.";
  } else {
    title = "Severe warning signals";
    guidance = "The information contains several serious warning signs. Do not rush into payment.";
  }

  return {
    score,
    flags,
    title,
    guidance
  };
}

$("dealForm").addEventListener("submit", e => {
  e.preventDefault();

  const d = {
    seller: $("seller").value,
    amount: $("amount").value,
    link: $("link").value,
    phone: $("phone").value,
    item: $("item").value,
    concern: $("concern").value
  };

  const r = assess(d);

  $("score").textContent = r.score + "/100";
  $("resultTitle").textContent = r.title;

  $("summary").textContent =
    `Preliminary screening for ${d.seller}. ${r.guidance} This score uses only the information entered here and is not a fraud verdict.`;

  $("flags").innerHTML = r.flags.map(x =>
    `<div class="flag"><b>${esc(x[0])}</b>${esc(x[1])}</div>`
  ).join("");

  $("result").classList.remove("hidden");
  $("result").scrollIntoView({ behavior: "smooth" });
});

$("newCheck").onclick = () => {
  $("dealForm").reset();
  $("result").classList.add("hidden");
  location.hash = "check";
};

$("print").onclick = () => window.print();

$("reportForm").addEventListener("submit", e => {
  e.preventDefault();

  let a = JSON.parse(
    localStorage.getItem("beforepay_reports") || "[]"
  );

  a.push({
    seller: $("reportSeller").value,
    link: $("reportLink").value,
    text: $("reportText").value,
    date: new Date().toISOString()
  });

  localStorage.setItem(
    "beforepay_reports",
    JSON.stringify(a)
  );

  $("saved").classList.remove("hidden");
  e.target.reset();
});
