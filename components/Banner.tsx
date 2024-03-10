import styles from '../styles/components/Banner.module.css';
import Container from '@/containers/Container';

export default function Banner() {
  return (
    <section className={styles.banner}>
      <Container>
        <div className={styles.banner_inside}>
          <h1 className={styles.banner_text}>
            I build
            <span className={styles.highlighted_text}> websites</span>
            , web interfaces, and apps.
          </h1>
          <p className={styles.banner_paragraph}>
            Front-end developer at nexxar in Vienna, Austria.
            Experienced in designing and developing websites, web
            interfaces, and APIs, with a versatile skill set in
            various web technologies.
          </p>
          <div className={styles.info}>
            <button className={styles.button}>Contact</button>
            <span className={styles.more}>More about me</span>
          </div>
        </div>

        <div className={styles.panel}>
          <span className={styles.header_text}>Lorem ipsum</span>
          <h2 className={styles.panel_title}>
            Lorem ipsum dolor, sit amet consectetur
          </h2>
          <p className={styles.panel_text}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Sapiente officia nesciunt vel. Distinctio, nobis libero!
            Nostrum, neque.
          </p>
          <div className={styles.panel_items}>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
            <div className={styles.panel_item_container}>
              <div className={styles.panel_item}>
                <span className={styles.panel_item_title}>
                  <svg
                    className={styles.panel_item_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                    />
                  </svg>
                  Web interfaces
                </span>
                <span className={styles.panel_item_text}>
                  Nostrum, neque. Porro vel laudantium consequuntur
                  quisquam.
                </span>
              </div>
              <div className={styles.blur}></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
