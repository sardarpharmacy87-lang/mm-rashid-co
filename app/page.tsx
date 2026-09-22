const services = [
  ["Goldwork & Bullion","Dimensional motifs shaped in gold and silver wire, purl and decorative cord."],
  ["Military & Ceremonial","Rank badges, shoulder boards, cap peaks and uniform insignia made to specification."],
  ["Regalia Embroidery","Masonic and fraternal aprons, banners, badges, emblems and ceremonial pieces."],
  ["Custom Crests","Institutional crests, coats of arms and premium embroidered patches built by hand."],
  ["Caps & Visors","Precision bullion embroidery for peaked caps, visors and ceremonial headwear."],
  ["Custom Fez Work","Lettering, symbols, beads, sequins and bullion details for distinctive fez designs."]
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <div className="brand"><span>MM</span> RASHID & CO.</div>
        <nav><a href="#heritage">Heritage</a><a href="#craft">Craft</a><a href="#contact">Contact</a></nav>
      </header>

      <section className="hero">
        <div className="eyebrow">SIALKOT · PAKISTAN · HANDCRAFTED</div>
        <h1>Symbols of distinction,<br/><em>made by hand.</em></h1>
        <p>Goldwork, bullion embroidery and ceremonial regalia for institutions, uniform makers and private commissions worldwide.</p>
        <div className="actions"><a className="gold" href="#craft">View our craft</a><a href="#contact">Discuss a custom order →</a></div>
        <div className="facts"><div><strong>Handmade</strong><span>Every detail</span></div><div><strong>Sialkot</strong><span>Pakistan</span></div><div><strong>Worldwide</strong><span>Enquiries</span></div></div>
      </section>

      <section id="heritage" className="split">
        <div><span className="section-no">01</span><h2>A tradition built in thread, wire and discipline.</h2></div>
        <p>MM Rashid & Co. creates ceremonial embroidery with the precision demanded by military, institutional and private commissions. Every piece is shaped by hand, inspected carefully and finished to specification.</p>
      </section>

      <section id="craft" className="craft">
        <div className="section-head"><span className="section-no">02</span><h2>Our craft</h2></div>
        <div className="grid">{services.map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="statement">
        <p>MADE IN SIALKOT</p>
        <h2>Craftsmanship that carries meaning.</h2>
      </section>

      <section id="contact" className="contact">
        <div><span className="section-no">03</span><h2>Start a custom commission.</h2></div>
        <div><p>Share your artwork, measurements, quantity and required finish. We will review the details and prepare the next production step.</p><a className="gold" href="mailto:info@mmrashid.com">Send an enquiry</a></div>
      </section>

      <footer><div>MM RASHID & CO.</div><span>Goldwork · Bullion Embroidery · Ceremonial Regalia</span><small>© 2026 MM Rashid & Co.</small></footer>
    </main>
  );
}