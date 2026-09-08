'use client';
export default function Error({ reset }: { reset: () => void }) {
  return <main className="loading-screen"><h1>관찰목록을 불러오지 못했습니다.</h1><p>잠시 후 다시 시도해 주세요.</p><button className="primary-button" onClick={reset}>다시 불러오기</button></main>;
}
