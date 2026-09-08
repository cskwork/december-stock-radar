'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronRight, Clock3, ExternalLink, Info, ListFilter, RefreshCw, X } from 'lucide-react';
import { isStale } from '@/lib/normalize';
import type { MarketSnapshot, Stock } from '@/lib/types';

type Research = { reviewedAt: string; horizon: string; brief: string; reviewNote: string; history: { date: string; text: string }[]; stocks: Stock[] };
function date(value: string, time = false) {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '확인 필요';
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', ...(time ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}) }).format(d);
}
function Price({ price, currency }: { price?: number; currency?: string }) {
  return <>{price === undefined ? '확인 중' : `${currency === 'USD' ? '$' : ''}${price.toLocaleString('ko-KR', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0 })}${currency === 'KRW' ? '원' : ''}`}</>;
}
function Change({ value }: { value?: number | null }) {
  if (value == null) return <span className="change neutral">등락 미확인</span>;
  return <span className={`change ${value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'}`}>{value > 0 ? <ArrowUp size={13}/> : value < 0 ? <ArrowDown size={13}/> : null}{value > 0 ? '+' : ''}{value.toFixed(2)}%</span>;
}

export default function Dashboard({ research, snapshot }: { research: Research; snapshot: MarketSnapshot }) {
  const [market, setMarket] = useState<'ALL' | 'US' | 'KR'>('ALL');
  const [selected, setSelected] = useState(research.stocks[0].id);
  const [sort, setSort] = useState('rank');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [current, setCurrent] = useState(snapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [refreshMessage, setRefreshMessage] = useState('');
  const stock = research.stocks.find(s => s.id === selected)!;
  const item = current.items.find(i => i.id === selected);
  const incomplete = current.items.some(i => i.quoteError || i.newsError || !i.quote || isStale(i.quote.collectedAt) || isStale(i.newsCollectedAt));
  const expired = new Date() > new Date(`${research.horizon}T23:59:59+09:00`);
  const analysisOld = isStale(research.reviewedAt);
  const stocks = research.stocks.filter(s => market === 'ALL' || s.market === market).sort((a, b) => {
    if (sort === 'rank') return a.rank - b.rank;
    const av = current.items.find(i => i.id === a.id)?.quote?.changePercent;
    const bv = current.items.find(i => i.id === b.id)?.quote?.changePercent;
    if (av == null) return bv == null ? 0 : 1;
    if (bv == null) return -1;
    return sort === 'gain' ? bv - av : av - bv;
  });
  function filter(value: 'ALL' | 'US' | 'KR') {
    setMarket(value);
    if (value !== 'ALL' && stock.market !== value) setSelected(research.stocks.find(s => s.market === value)!.id);
  }
  function selectStock(id: string) {
    setSelected(id); setMobileOpen(true);
    if (window.matchMedia('(max-width: 760px)').matches) requestAnimationFrame(() => {
      const detail = document.getElementById('stock-detail');
      detail?.scrollIntoView({ behavior: 'instant', block: 'start' });
      detail?.focus({ preventScroll: true });
    });
  }
  async function refresh() {
    setRefreshing(true); setRefreshError(''); setRefreshMessage('');
    try {
      const r = await fetch('/api/market'); if (!r.ok) throw new Error();
      const next = await r.json() as MarketSnapshot;
      if (!Array.isArray(next.items) || next.items.length !== 10) throw new Error();
      setCurrent(next);
      const delayed = next.items.some(i => i.quoteError || i.newsError || !i.quote || isStale(i.quote.collectedAt) || isStale(i.newsCollectedAt));
      setRefreshMessage(delayed ? '일부 자료의 수집이 지연됐습니다. 종목별 기준 시각을 확인해 주세요.' : next.collectedAt === current.collectedAt ? '최신 일일 자료를 표시하고 있습니다.' : '새로 수집된 자료를 반영했습니다.');
    } catch { setRefreshError('자료를 불러오지 못했습니다. 표시 중인 자료는 유지됩니다.'); }
    finally { setRefreshing(false); }
  }
  return <>
    <a className="skip-link" href="#watchlist">관찰목록으로 건너뛰기</a>
    <header className="site-header"><a href="/" className="brand" aria-label="12월의 관찰목록 홈"><span className="brand-mark">12</span><span>12월의 관찰목록</span></a><div className="header-meta"><span className="edition">2026</span><span className="daily-label"><Clock3 size={15}/> 매일 아침 갱신</span></div></header>
    <main className="shell">
      <section className="intro" aria-labelledby="page-title"><div><h1 id="page-title">연말까지 지켜볼, <span>10종목.</span></h1><p>미국과 한국 시장의 성장 후보를 근거와 함께 살펴봅니다.</p></div><div className="horizon"><span>관찰 기한</span><strong>2026. 12. 31</strong></div></section>
      <section className="brief" aria-label="최근 분석 요약"><div className="brief-label"><span className="status-dot"/><strong>관찰 포인트</strong></div><p>{research.brief}</p><a href="#method">선정 기준 <ArrowUpRight size={16}/></a></section>
      <div className="freshness"><div><span><Clock3 size={14}/> {incomplete ? '최근 수집 시도' : '시세·뉴스 수집'} {date(current.collectedAt, true)}</span><span className={analysisOld ? 'caution-text' : ''}>분석 검토 {date(research.reviewedAt)}{analysisOld ? ' · 재검토 대기' : ''}</span><span>모든 시간은 한국 기준</span></div><button onClick={refresh} disabled={refreshing} className="text-button"><RefreshCw size={14} className={refreshing ? 'spin' : ''}/>{refreshing ? '확인 중' : '최신 자료 확인'}</button></div>
      <div role="status" className="status-message">{refreshError || refreshMessage}</div>
      {(incomplete || expired) && <div className="notice"><Info size={17}/><p>{expired ? '관찰 기한이 지났습니다. 아래 분석은 2026년 말까지의 전망을 기록한 자료입니다.' : '일부 자료의 수집이 지연됐습니다. 종목별 기준 시각과 이전 자료 표시를 확인해 주세요.'}</p></div>}
      <div className="workspace">
        <section id="watchlist" className="watchlist" aria-label="10종목 비교">
          <div className="list-toolbar"><div className="filters" aria-label="시장 필터">{([['ALL','전체',10],['US','미국',7],['KR','한국',3]] as const).map(([v,label,n]) => <button key={v} aria-pressed={market === v} className={market === v ? 'active' : ''} onClick={() => filter(v)}>{label}<span>{n}</span></button>)}</div><label className="sort"><ListFilter size={14}/><span className="sr-only">종목 정렬</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="rank">관찰 우선순위</option><option value="gain">등락률 높은 순</option><option value="loss">등락률 낮은 순</option></select><ChevronDown size={13}/></label></div>
          <div className="column-labels"><span>종목 / 관심 분야</span><span>최근 주가 / 전일 대비</span></div>
          <ul className="stock-list">{stocks.map(s => {
            const data = current.items.find(i => i.id === s.id); const q = data?.quote;
            const stale = data?.quoteError || (q && isStale(q.collectedAt));
            return <li key={s.id}><button data-stock-id={s.id} className={`stock-row ${s.id === selected ? 'selected' : ''}`} onClick={() => selectStock(s.id)} aria-pressed={s.id === selected} aria-controls="stock-detail" aria-label={`${s.name} 상세 보기`}>
              <span className="rank">{String(s.rank).padStart(2,'0')}</span><span className="stock-identity"><strong>{s.name}</strong><span>{s.symbol}<span className="divider">·</span>{s.sector}</span></span><span className="stock-price"><strong><Price price={q?.price} currency={q?.currency}/></strong>{stale ? <span className="stale-label">이전 자료 · {q ? date(q.tradedAt) : '미확인'}</span> : <Change value={q?.changePercent}/>}</span><ChevronRight className="row-arrow" size={16}/>
            </button></li>;
          })}</ul>
          <p className="list-footnote"><Info size={14}/> 등락률은 전일 대비입니다. 예상 상승률이 아닙니다.</p>
          <div className="allocation"><strong>같은 위험에 함께 움직일 수 있습니다.</strong><p>10종목 중 7종목이 AI 투자·반도체 업황에 연결돼 있습니다.</p><div className="allocation-bar" aria-label="AI 관련 7종목, 바이오 1종목, 우주 2종목"><span/><span/><span/></div><div className="allocation-labels"><span>AI·반도체 7</span><span>바이오 1</span><span>우주 2</span></div></div>
        </section>
        <section id="stock-detail" tabIndex={-1} className={`detail ${mobileOpen ? 'mobile-open' : ''}`} aria-label={`${stock.name} 분석`}>
          <button className="mobile-back text-button" onClick={() => {setMobileOpen(false); document.querySelector<HTMLButtonElement>(`[data-stock-id="${selected}"]`)?.focus();}}><X size={18}/> 상세 접기</button>
          <div className="detail-content" key={stock.id}>
            <div className="detail-topline"><span className="market-tag">{stock.market === 'US' ? '미국 · NASDAQ' : '한국'}<span> / </span>{stock.symbol}</span><span className={`risk-tag ${stock.riskLevel === '매우 높음' ? 'risk-very-high' : ''}`}>위험 {stock.riskLevel}</span></div>
            <h2>{stock.name}<a href={item?.quote?.sourceUrl || stock.sources[0].url} target="_blank" rel="noopener noreferrer" aria-label={`${stock.name} 시세 원문 새 창`}><ArrowUpRight size={22}/></a></h2><p className="english-name">{stock.englishName}</p>
            <div className="detail-quote"><strong><Price price={item?.quote?.price} currency={item?.quote?.currency}/></strong><Change value={item?.quote?.changePercent}/></div>
            <p className="quote-time">{item?.quote ? <>{date(item.quote.tradedAt, true)} 기준 · {item.quote.marketStatus === 'OPEN' ? '장중 수집값' : item.quote.marketStatus === 'CLOSE' ? '장 마감 기준' : '최근 제공값'} · Npay 증권</> : '시세를 확인하지 못했습니다.'}{(item?.quoteError || isStale(item?.quote?.collectedAt || null)) && <span className="caution-text"> · 이전 수집 자료</span>}</p>
            <div className="thesis-heading"><span className="mini-rule"/><h3>{stock.summary}</h3></div>
            <div className="research-block"><div className="section-icon positive"><ArrowUpRight size={17}/></div><div><h4>상승을 기대하는 이유</h4><p>{stock.thesis}</p></div></div>
            <div className="research-block"><div className="section-icon caution"><Info size={17}/></div><div><h4>전망이 틀릴 수 있는 이유</h4><p>{stock.risk}</p></div></div>
            <div className="watch-next"><Check size={17}/><div><h4>다음에 확인할 것</h4><p>{stock.watch}</p></div></div>
            <div className="source-section"><div className="section-heading"><h3>분석의 근거</h3><span>{stock.reviewedAt.replaceAll('-','.')} 검토</span></div>{stock.sources.map(source => <a key={source.url} className="source-link" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.date.replaceAll('-','.')}</small></span><ExternalLink size={15}/></a>)}</div>
            <div className="news-section"><div className="section-heading"><h3>최근 뉴스</h3><span>제목만 수집 · 분석과 구분</span></div>{item?.newsError && <p className="caution-text">뉴스 수집이 지연됐습니다. 이전 자료가 표시될 수 있습니다.</p>}{item?.news.length ? item.news.map(news => <a key={news.url} className="news-link" href={news.url} target="_blank" rel="noopener noreferrer"><span>{news.title}<small>{news.publisher} · {date(news.publishedAt)}</small></span><ArrowUpRight size={16}/></a>) : <p className="empty-news">최근 14일 안의 관련 기사를 찾지 못했습니다. 위의 공식 자료를 확인해 주세요.</p>}</div>
          </div>
        </section>
      </div>
      <section id="method" className="method"><div><h2>숫자보다, 근거를 먼저.</h2><p>상승 여력과 12월까지 확인할 수 있는 사업 진척을 함께 봅니다. 순위는 정성적 관찰 우선순위이며, 확정 수익률이나 목표주가를 뜻하지 않습니다.</p><p>미국 주가는 달러, 한국 주가는 원화입니다. 환율·세금·배당을 반영한 투자 수익률과 다릅니다. 개인의 자산·손실 감내 수준을 반영한 자문은 아닙니다.</p></div><div><h3>갱신은 이렇게 구분합니다.</h3><dl><div><dt>주가·뉴스</dt><dd>매일 오전 8~9시 수집 예정. 휴장일에는 최근 거래일 가격을 표시합니다.</dd></div><div><dt>추천 근거</dt><dd>매일 오전 9시 검토 예약. 새 실적·공시가 있으면 근거와 위험을 수정하고, 검토 날짜를 남깁니다.</dd></div></dl><p className="method-note">주가·뉴스는 서버에서 갱신합니다. 분석 검토는 작업용 컴퓨터와 Codex가 실행 가능한 상태일 때 진행됩니다. 일정 실행이 지연되면 검토 날짜가 유지됩니다.</p></div></section>
      <details className="review-log"><summary>최근 검토 기록 <ChevronDown size={16}/></summary><p>{research.reviewNote}</p>{research.history.slice(0,7).map((h,i)=><div key={`${h.date}-${i}`}><time>{h.date}</time><p>{h.text}</p></div>)}</details>
      <footer><span className="footer-brand">12월의 관찰목록</span><span>미국 7 · 한국 3 · 2026년 12월까지</span><a href="#page-title">맨 위로 <ArrowUp size={13}/></a></footer>
    </main>
  </>;
}
