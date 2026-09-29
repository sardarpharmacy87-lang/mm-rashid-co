export function Faq() {
  return (
    <div className="atelier-accordions">
      {[
        [
          "How do I receive a price?",
          "Choose a product and send your quantity, specifications and delivery country. We prepare an individual quotation in your customer account. Prices are tailored to your order and are never listed publicly.",
        ],
        [
          "Can you work from my artwork or a sample?",
          "Yes. Share your artwork, reference photographs or measurements with our team. We will confirm the materials and construction before preparing your quotation.",
        ],
        [
          "Can I order from outside Pakistan?",
          "International enquiries are welcome. Tell us your delivery country so we can confirm shipping arrangements, charges and any relevant delivery requirements with your quotation.",
        ],
        [
          "How long will my order take?",
          "Production time depends on the design, materials and quantity. Your required date and the proposed production schedule are agreed before work begins.",
        ],
        [
          "How do payments and returns work?",
          "Payment arrangements are shared privately with your quotation. Please check the approved specification and terms before paying. Contact us promptly with any concern about the finished work; made-to-order pieces are handled according to the agreed order terms.",
        ],
      ].map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
