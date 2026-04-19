import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fabrivo – Tra Cứu & Nhận Diện Vải Thông Minh',
  description: 'Tra cứu hơn 300 loại vải bằng AI. Nhận thông tin chi tiết, hướng dẫn bảo quản và gợi ý phong cách theo mùa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
