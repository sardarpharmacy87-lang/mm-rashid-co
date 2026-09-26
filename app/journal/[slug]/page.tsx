import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/journal";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return { title: a?.title ?? "Article not found", description: a?.intro };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main id="main-content" className="editorial-page">
        <article className="article-body">
          <Link className="text-link" href="/journal">
            ← Back to journal
          </Link>
          <p className="eyebrow" style={{ marginTop: 36 }}>
            {a.category}
          </p>
          <h1 className="editorial-title">{a.title}</h1>
          <p className="editorial-intro">{a.intro}</p>
          <Image src={a.image} alt={a.title} width={1000} height={700} />
          {a.sections.map(([h, p]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{p}</p>
            </section>
          ))}
          <Link className="atelier-button" href="/contact">
            Discuss your commission ↗
          </Link>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
