import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductGrid.module.css';

const products = [
  { id: 1, name: 'Minimalist Silk Blouse', category: 'Tops', price: '$120', image: '/images/model1.png' },
  { id: 2, name: 'Structured Wool Coat', category: 'Outerwear', price: '$350', image: '/images/model2.png' },
  { id: 3, name: 'Elevated Trousers', category: 'Bottoms', price: '$180', image: '/images/model1.png' },
  { id: 4, name: 'Contemporary Blazer', category: 'Outerwear', price: '$290', image: '/images/model2.png' },
];

export default function ProductGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>New Arrivals</h2>
        <Link href="/new" className={styles.link}>View All</Link>
      </div>
      
      <div className={styles.grid}>
        {products.map(product => (
          <div key={product.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                sizes="(max-width: 768px) 100vw, 25vw"
                style={{ objectFit: 'cover' }} 
                className={styles.image}
              />
              <div className={styles.quickAdd}>Quick Add +</div>
            </div>
            <div className={styles.info}>
              <div>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.category}>{product.category}</p>
              </div>
              <span className={styles.price}>{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
