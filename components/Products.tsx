import Container from '@/containers/Container';
import SectionHeader from './Section';
import { ProductItemProps } from '@/types/types';

import styles from '../styles/components/Products.module.css';

function ProductItem({ item }: { item: ProductItemProps }) {
  return (
    <div className={styles.productsItemContainer}>
      <div className={styles.productsItem}>
        <span className={styles.productsItemTitle}>
          {item.icon}
          {item.title}
        </span>
        <span className={styles.productsItemText}>{item.text}</span>
      </div>
      <div className={styles.blur}></div>
    </div>
  );
}

function Products() {
  const items: ProductItemProps[] = [
    {
      title: 'E-commerce websites',
      text: 'With platforms like Shopify and WooCommerce to custom solutions.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 2.5L0.958427 2.5C1.41012 2.5 1.82194 2.74308 2.04258 3.12774L2.5 4.5L3.93019 8.79057C4.27047 9.81142 5.22582 10.5 6.3019 10.5H12.4505C13.6422 10.5 14.6682 9.65885 14.9019 8.49029L15.7 4.5L16 3H14.4703L4.5 3L3.62309 3L3.50287 2.70678C3.07956 1.67431 2.0743 1 0.958427 1H0V2.5ZM4.08114 4.5L5.35321 8.31623C5.48933 8.72457 5.87147 9 6.3019 9H12.4505C12.9272 9 13.3376 8.66354 13.4311 8.19612L14.1703 4.5H4.5H4.08114ZM12.5 15C11.6716 15 11 14.3284 11 13.5C11 12.6716 11.6716 12 12.5 12C13.3284 12 14 12.6716 14 13.5C14 14.3284 13.3284 15 12.5 15ZM4.5 13.5C4.5 14.3284 5.17157 15 6 15C6.82843 15 7.5 14.3284 7.5 13.5C7.5 12.6716 6.82843 12 6 12C5.17157 12 4.5 12.6716 4.5 13.5Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Data visualizations',
      text: 'Interactive charts, graphs, and maps that bring data to life and tell a story.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M1 1v11.75A2.25 2.25 0 0 0 3.25 15H15v-1.5H3.25a.75.75 0 0 1-.75-.75V1H1Zm13.297 5.013.513-.547-1.094-1.026-.513.547-3.22 3.434-2.276-2.275a1 1 0 0 0-1.414 0L4.22 8.22l-.53.53 1.06 1.06.53-.53L7 7.56l2.287 2.287a1 1 0 0 0 1.437-.023l3.573-3.811Z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Content-management systems',
      text: 'From headless CMS like Sanity or Strapi, to various other API powered services.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 5.25136V4.2487L0.463236 4.05702L7.71324 1.05702L8 0.938354L8.28676 1.05702L15.5368 4.05702L16 4.2487V5.25136L15.5368 5.44304L8.28676 8.44304L8 8.5617L7.71324 8.44304L0.463236 5.44304L0 5.25136ZM0 8.45825V6.83491L0.536764 7.05702L8 10.1453L15.4632 7.05702L16 6.83491V8.45825L8.28676 11.6499L8 11.7686L7.71324 11.6499L0 8.45825ZM0 11.7083V10.0849L0.536764 10.307L8 13.3953L15.4632 10.307L16 10.0849V11.7083L8.28676 14.8999L8 15.0186L7.71324 14.8999L0 11.7083ZM8 6.93835L2.71154 4.75003L8 2.5617L13.2885 4.75003L8 6.93835Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Marketing websites',
      text: 'From small portfolio websites to large corporate multi-page websites.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 2.5H1.5V5.005H14.5V2.5ZM14.5 6.255H6.245V13.5H13.5C14.0523 13.5 14.5 13.0523 14.5 12.5V6.255ZM4.995 6.255H1.5V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H4.995V6.255ZM1.5 1H0V2.5V12.5C0 13.8807 1.11929 15 2.5 15H13.5C14.8807 15 16 13.8807 16 12.5V2.5V1H14.5H1.5Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      title: 'User interfaces & dashboards',
      text: 'Data-intensive applications of all sizes and complexities using React and Vue.js.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.30204 0.785875C4.54182 0.289965 6.20312 0 8 0C9.79688 0 11.4582 0.289965 12.698 0.785875C13.3158 1.033 13.8661 1.34602 14.2742 1.73197C14.6839 2.11942 15 2.63215 15 3.25V8V12.75C15 13.3679 14.6839 13.8806 14.2742 14.268C13.8661 14.654 13.3158 14.967 12.698 15.2141C11.4582 15.71 9.79688 16 8 16C6.20312 16 4.54182 15.71 3.30204 15.2141C2.68423 14.967 2.13394 14.654 1.72583 14.268C1.31613 13.8806 1 13.3679 1 12.75V8V3.25C1 2.63215 1.31613 2.11942 1.72583 1.73197C2.13394 1.34602 2.68423 1.033 3.30204 0.785875ZM2.5 5.33081V8C2.5 8.0725 2.53365 8.21745 2.75649 8.4282C2.98091 8.64044 3.34591 8.86612 3.85913 9.07141C4.8814 9.48032 6.3451 9.75 8 9.75C9.6549 9.75 11.1186 9.48032 12.1409 9.07141C12.6541 8.86612 13.0191 8.64044 13.2435 8.4282C13.4664 8.21745 13.5 8.0725 13.5 8V5.33081C13.2518 5.47297 12.982 5.60051 12.698 5.71412C11.4582 6.21004 9.79688 6.5 8 6.5C6.20312 6.5 4.54182 6.21004 3.30204 5.71412C3.018 5.60051 2.74824 5.47297 2.5 5.33081ZM13.5 3.25C13.5 3.3225 13.4664 3.46746 13.2435 3.6782C13.0191 3.89044 12.6541 4.11612 12.1409 4.32141C11.1186 4.73032 9.6549 5 8 5C6.3451 5 4.8814 4.73032 3.85913 4.32141C3.34591 4.11612 2.98091 3.89044 2.75649 3.6782C2.53365 3.46746 2.5 3.3225 2.5 3.25C2.5 3.1775 2.53365 3.03254 2.75649 2.8218C2.98091 2.60956 3.34591 2.38388 3.85913 2.17859C4.8814 1.76968 6.3451 1.5 8 1.5C9.6549 1.5 11.1186 1.76968 12.1409 2.17859C12.6541 2.38388 13.0191 2.60956 13.2435 2.8218C13.4664 3.03254 13.5 3.1775 13.5 3.25ZM13.5 10.0808C13.2518 10.223 12.982 10.3505 12.698 10.4641C11.4582 10.96 9.79688 11.25 8 11.25C6.20312 11.25 4.54182 10.96 3.30204 10.4641C3.018 10.3505 2.74824 10.223 2.5 10.0808V12.75C2.5 12.8225 2.53365 12.9675 2.75649 13.1782C2.98091 13.3904 3.34591 13.6161 3.85913 13.8214C4.8814 14.2303 6.3451 14.5 8 14.5C9.6549 14.5 11.1186 14.2303 12.1409 13.8214C12.6541 13.6161 13.0191 13.3904 13.2435 13.1782C13.4664 12.9675 13.5 12.8225 13.5 12.75V10.0808Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      title: 'SaaS (Software as a Service)',
      text: 'Robust architecture and scalable solutions for your software as a service.',
      icon: (
        <svg
          height="16"
          strokeLinejoin="round"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 1C0 0.447716 0.447715 0 1 0H15C15.5523 0 16 0.447716 16 1V10C16 10.5523 15.5523 11 15 11H12.5V9.5H14.5V1.5H1.5V9.5H3.5V11H1C0.447715 11 0 10.5523 0 10V1ZM8 14C6.84509 14 5.76659 14.5772 5.12596 15.5381L5 15.7271V16H3.5V15.5V15.2729L3.62596 15.084L3.87789 14.7061C4.79671 13.3278 6.34356 12.5 8 12.5C9.65644 12.5 11.2033 13.3278 12.1221 14.7061L12.374 15.084L12.5 15.2729V15.5V16H11V15.7271L10.874 15.5381C10.2334 14.5772 9.15491 14 8 14ZM7.75 6C6.50736 6 5.5 7.00736 5.5 8.25V8.75C5.5 9.99264 6.50736 11 7.75 11H8.25C9.49264 11 10.5 9.99264 10.5 8.75V8.25C10.5 7.00736 9.49264 6 8.25 6H7.75ZM7 8.25C7 7.83579 7.33579 7.5 7.75 7.5H8.25C8.66421 7.5 9 7.83579 9 8.25V8.75C9 9.16421 8.66421 9.5 8.25 9.5H7.75C7.33579 9.5 7 9.16421 7 8.75V8.25Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <Container>
      <div className={styles.products}>
        <SectionHeader
          header="Products"
          title="Web products that bring value to your business"
          text="During my career, I've worked on a wide range of web products, making sure that they are perfected to the smallest detail. Here are some of the digital products I can help you with."
        />
        <div className={styles.productsItems}>
          {items.map((item, index) => (
            <ProductItem key={index} item={item} />
          ))}
        </div>
      </div>
    </Container>
  );
}

export default Products;
