import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HomeBanner from "@/components/HomeBanner";
import Develop from "@/components/Develop";
import Test from "@/components/Test";
import Deploy from "@/components/Deploy";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Products from "@/components/Products";

import styles from "../styles/pages/layout.module.css";
import Projects from "@/components/Projects";

const DynamicSpotify = dynamic(() => import("@/components/Spotify"));

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <HomeBanner />
        <Products />
        <Develop />
        <Test />
        <Deploy />
        <Projects />
        <Contact />
        <DynamicSpotify />
      </main>
      <Footer />
    </>
  );
}
