import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '12월의 관찰목록 | 미국·한국 주식 10종목',
  description: '2026년 12월까지 지켜볼 미국·한국 주식 10종목. 매일 갱신되는 주가와 뉴스, 날짜와 출처가 있는 추천 근거를 함께 읽으세요.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
