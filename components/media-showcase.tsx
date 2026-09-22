import Image from "next/image";
import styles from "./media-showcase.module.css";

export function MediaShowcase() {
  return (
    <section
      className={styles.showcase}
      id="workshop"
      aria-labelledby="workshop-title"
    >
      <div className={`section ${styles.inner}`}>
        <div className={`${styles.archive} reveal`}>
          <div className={styles.archiveImage}>
            <Image
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="Historic MM Rashid and Company workshop and artisans in Sialkot"
              fill
              sizes="(max-width: 900px) 100vw, 1400px"
              className={styles.coverImage}
            />

            <div className={styles.archiveShade} />

            <div className={styles.archiveLabel}>
              <span>MM Rashid &amp; Co.</span>
              <small>A tradition of skilled handwork</small>
            </div>
          </div>
        </div>

        <div className={styles.motionLayout}>
          <div className={`${styles.motionCopy} reveal`}>
            <p className={styles.eyebrow}>
              <span />
              Craftsmanship in motion
            </p>

            <h2 id="workshop-title">
              Every detail,
              <br />
              <span>formed by hand.</span>
            </h2>

            <p>
              Watch the patient handwork behind our bullion embroidery.
              Every curve is guided, secured and refined by experienced
              artisans using traditional techniques.
            </p>

            <div className={styles.details}>
              <div>
                <strong>Handmade</strong>
                <small>Individual craftsmanship</small>
              </div>

              <div>
                <strong>Sialkot</strong>
                <small>Pakistan</small>
              </div>
            </div>
          </div>

          <div className={`${styles.mediaComposition} reveal delay-one`}>
            <div className={styles.stitchingPhoto}>
              <Image
                src="/images/workshop/hand-stitching.jpeg"
                alt="Artisan hand-stitching gold bullion embroidery"
                fill
                sizes="(max-width: 650px) 68vw, 320px"
                className={styles.coverImage}
              />
            </div>

            <div className={styles.videoFrame}>
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/workshop/stitching-video-poster.jpg"
                aria-label="MM Rashid artisan producing ceremonial embroidery by hand"
              >
                <source
                  src="/videos/stitching/stitching-process.mp4"
                  type="video/mp4"
                />

                Your browser does not support the video element.
              </video>

              <div className={styles.videoCaption}>
                <span>Inside the workshop</span>
                <small>Hand embroidery in Sialkot</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
