import Image from "next/image";
import Link from "next/link";
import { articles } from "@/lib/journal";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
export const metadata = { title: "The journal" };
export default function Journal() {
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="editorial-page" id="main-content">
        <p className="eyebrow">Notes from the workshop</p>
        <h1 className="editorial-title">The journal.</h1>
        <p className="editorial-intro">
          Our heritage, our process, and a closer look at the pieces we make.
        </p>
        <div className="journal-grid">
          {articles.map((a) => (
            <article className="journal-card" key={a.slug}>
              <Link href={"/journal/" + a.slug}>
                <div className="journal-card-image">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(max-width:760px) 90vw, 30vw"
                  />
                </div>
                <p className="eyebrow">{a.category}</p>
                <h2>{a.title}</h2>
              </Link>
              <p>{a.intro}</p>
              <Link className="text-link" href={"/journal/" + a.slug}>
                Read the story ↗
              </Link>
            </article>
          ))}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
