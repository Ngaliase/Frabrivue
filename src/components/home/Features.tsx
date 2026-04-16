import styles from './Features.module.css';

const features = [
  { 
    id: 1, 
    num: "01",
    svg: <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10a7 7 0 1014 0 7 7 0 00-14 0zm18 11l-4.35-4.35M9 10h.01M12 10h.01M9 13h.01" /></svg>,
    title: 'Nhận Diện AI', 
    desc: 'Quét để phân tích bề mặt vải, hiển thị độ rủ, khả năng giữ nếp và tên chuẩn xác.' 
  },
  { 
    id: 2, 
    num: "02",
    svg: <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    title: 'Đo Số Lượng Vải', 
    desc: 'Tính toán chính xác lượng vải cần mua dựa trên chiều cao, cân nặng và form dáng mong muốn.' 
  },
  { 
    id: 3, 
    num: "03",
    svg: <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    title: 'Trợ Lý Stylist', 
    desc: 'Gợi ý ngay chất liệu vải may phù hợp nhất chỉ bằng việc tải lên một ảnh mẫu thiết kế.' 
  },
  { 
    id: 4, 
    num: "04",
    svg: <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Thang Điểm Eco', 
    desc: 'Chấm điểm tự động mức độ thân thiện với môi trường dựa trên thành phần sợi dệt.' 
  },
];

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.header}>
        <h2 className={styles.title}>Tính Năng Cốt Lõi</h2>
        <p className={styles.subtitle}>Sức mạnh Trí tuệ nhân tạo (AI) giúp bạn đưa ra những lựa chọn thông minh xuất sắc và bền vững nhất.</p>
      </div>
      
      <div className={styles.grid}>
        {features.map(feature => (
          <div key={feature.id} className={styles.card}>
            <div className={styles.cardNumber}>{feature.num}</div>
            <div className={styles.icon}>{feature.svg}</div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
