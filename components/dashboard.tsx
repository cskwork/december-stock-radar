'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronRight, Clock3, ExternalLink, Info, ListFilter, RefreshCw, X } from 'lucide-react';
import { isStale } from '@/lib/normalize';
import { neighborId, resolveStockId, type Horizon } from '@/lib/horizon';
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
  return <span className={`change ${value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'}`}>{value > 0 ? <ArrowUp size={13} aria-hidden="true"/> : value < 0 ? <ArrowDown size={13} aria-hidden="true"/> : null}{value > 0 ? '+' : ''}{value.toFixed(2)}%</span>;
}
function stockUrl(id: string, firstId: string) {
  const url = new URL(window.location.href);
  if (id === firstId) url.searchParams.delete('stock'); else url.searchParams.set('stock', id);
  return `${url.pathname}${url.search}`;
}
const MOBILE = '(max-width: 760px)';

export default function Dashboard({ research, snapshot, initialStock, horizon }: { research: Research; snapshot: MarketSnapshot; initialStock?: string; horizon: Horizon }) {
  const ids = research.stocks.map(s => s.id);
  const firstId = ids[0];
  const linked = Boolean(initialStock && ids.includes(initialStock));
  const [market, setMarket] = useState<'ALL' | 'US' | 'KR'>('ALL');
  const [selected, setSelected] = useState(() => resolveStockId(initialStock, ids));
  const [sort, setSort] = useState('rank');
  const [mobileOpen, setMobileOpen] = useState(linked);
  const [current, setCurrent] = useState(snapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [refreshMessage, setRefreshMessage] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const stock = research.stocks.find(s => s.id === selected)!;
  const item = current.items.find(i => i.id === selected);
  const incomplete = current.items.some(i => i.quoteError || i.newsError || !i.quote || isStale(i.quote.collectedAt) || isStale(i.newsCollectedAt));
  const expired = horizon.ended;
  const analysisOld = isStale(research.reviewedAt);
  const progress = Math.round((horizon.elapsedDays / horizon.totalDays) * 100);
  const stocks = research.stocks.filter(s => market === 'ALL' || s.market === market).sort((a, b) => {
    if (sort === 'rank') return a.rank - b.rank;
    const av = current.items.find(i => i.id === a.id)?.quote?.changePercent;
    const bv = current.items.find(i => i.id === b.id)?.quote?.changePercent;
    if (av == null) return bv == null ? 0 : 1;
    if (bv == null) return -1;
    return sort === 'gain' ? bv - av : av - bv;
  });

  useEffect(() => {
    // Back/forward move between opened entries.
    function onPop() {
      const requested = new URLSearchParams(window.location.search).get('stock');
      const id = resolveStockId(requested, ids);
      setSelected(id);
      setMobileOpen(Boolean(requested && ids.includes(requested)));
      setMarket(m => (m === 'ALL' || research.stocks.find(s => s.id === id)?.market === m ? m : 'ALL'));
    }
    window.addEventListener('popstate', onPop);
    // A shared link to one entry lands on that entry on phones too.
    if (linked && window.matchMedia(MOBILE).matches) document.getElementById('stock-detail')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    return () => window.removeEventListener('popstate', onPop);
    // Runs once: ids and research are static for the page lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open(id: string, mode: 'push' | 'replace' = 'push') {
    setSelected(id);
    const next = stockUrl(id, firstId);
    if (next !== `${window.location.pathname}${window.location.search}`) window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', next);
  }
  function filter(value: 'ALL' | 'US' | 'KR') {
    setMarket(value);
    if (value !== 'ALL' && stock.market !== value) open(research.stocks.find(s => s.market === value)!.id, 'replace');
  }
  function selectStock(id: string) {
    open(id); setMobileOpen(true);
    if (window.matchMedia(MOBILE).matches) requestAnimationFrame(() => {
      const detail = document.getElementById('stock-detail');
      detail?.scrollIntoView({ behavior: 'instant', block: 'start' });
      detail?.focus({ preventScroll: true });
    });
  }
  function onListKey(event: React.KeyboardEvent<HTMLUListElement>) {
    const currentId = (event.target as HTMLElement).closest<HTMLElement>('[data-stock-id]')?.dataset.stockId;
    if (!currentId) return;
    const next = neighborId(stocks.map(s => s.id), currentId, event.key);
    if (!next) return;
    event.preventDefault();
    listRef.current?.querySelector<HTMLButtonElement>(`[data-stock-id="${next}"]`)?.focus();
    // On desktop the entry pane follows the keyboard; on phones Enter opens it.
    if (!window.matchMedia(MOBILE).matches) open(next, 'replace');
  }
  function closeDetail() {
    setMobileOpen(false);
    document.querySelector<HTMLButtonElement>(`[data-stock-id="${selected}"]`)?.focus();
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
  const quoteDelayed = Boolean(item?.quoteError || isStale(item?.quote?.collectedAt || null));

  return <>
    <a className="skip-link" href="#watchlist">관찰목록으로 건너뛰기</a>
    <header className="cover">
      <div className="cover-inner">
        <div className="cover-bar">
          <a href="/" className="brand" aria-label="12월의 관찰목록 홈"><span className="brand-mark">12</span><span>12월의 관찰목록</span></a>
          <span className="daily-label"><Clock3 size={15} aria-hidden="true"/> 매일 아침 갱신</span>
        </div>
        <div className="cover-body">
          <section className="intro" aria-labelledby="page-title">
            <h1 id="page-title">연말까지 지켜볼, <span>10종목.</span></h1>
            <p>미국과 한국 시장의 성장 후보를 근거와 함께 살펴봅니다.</p>
          </section>
          <figure className="cover-photo" aria-hidden="true">
            <img src="/images/fieldbook-cover.webp" width="560" height="620" alt="" fetchPriority="high"/>
          </figure>
          <div className="horizon" role="group" aria-label="관찰 기한">
            <span className="horizon-label">관찰 기한 <strong>2026. 12. 31</strong></span>
            <span className="dday">{expired ? '종료' : `D-${horizon.daysLeft}`}</span>
            <span className="sr-only">{expired ? '관찰 기한이 끝났습니다.' : `기한까지 ${horizon.daysLeft}일 남았습니다.`}</span>
            <div className="window" aria-hidden="true"><span style={{ width: `${progress}%` }}/></div>
            <span className="window-caption">9월 8일 시작 · {horizon.elapsedDays}일째 관찰</span>
          </div>
        </div>
      </div>
    </header>
    <main className="shell">
      <section className="brief" aria-label="최근 분석 요약"><strong className="tape-label">관찰 포인트</strong><p>{research.brief}</p><a href="#method">선정 기준 <ArrowUpRight size={16} aria-hidden="true"/></a></section>
      <div className="freshness">
        <div className="stamps">
          <span className={`stamp ${incomplete ? 'stamp-delayed' : ''}`}><Clock3 size={14} aria-hidden="true"/>{incomplete ? '최근 수집 시도' : '시세·뉴스 수집'} {date(current.collectedAt, true)}</span>
          <span className={`stamp ${analysisOld ? 'stamp-delayed' : ''}`}>분석 검토 {date(research.reviewedAt)}{analysisOld ? ' · 재검토 대기' : ''}</span>
          <span className="stamp-note">모든 시간은 한국 기준</span>
        </div>
        <button onClick={refresh} disabled={refreshing} className="text-button"><RefreshCw size={14} className={refreshing ? 'spin' : ''} aria-hidden="true"/>{refreshing ? '확인 중' : '최신 자료 확인'}</button>
      </div>
      <div role="status" className="status-message">{refreshError || refreshMessage}</div>
      {(incomplete || expired) && <div className="notice"><Info size={17} aria-hidden="true"/><p>{expired ? '관찰 기한이 지났습니다. 아래 분석은 2026년 말까지의 전망을 기록한 자료입니다.' : '일부 자료의 수집이 지연됐습니다. 종목별 기준 시각과 이전 자료 표시를 확인해 주세요.'}</p></div>}
      <div className="workspace">
        <section id="watchlist" className="watchlist" aria-label="10종목 비교">
          <div className="list-toolbar">
            <div className="filters" role="group" aria-label="시장 필터">{([['ALL', '전체', 10], ['US', '미국', 7], ['KR', '한국', 3]] as const).map(([v, label, n]) => <button key={v} aria-pressed={market === v} className={market === v ? 'active' : ''} onClick={() => filter(v)}>{label}<span>{n}</span></button>)}</div>
            <label className="sort"><ListFilter size={14} aria-hidden="true"/><span className="sr-only">종목 정렬</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="rank">관찰 우선순위</option><option value="gain">등락률 높은 순</option><option value="loss">등락률 낮은 순</option></select><ChevronDown size={13} aria-hidden="true"/></label>
          </div>
          <div className="column-labels" aria-hidden="true"><span>순위</span><span>종목 / 관심 분야</span><span>최근 주가 / 전일 대비</span></div>
          <ul className="stock-list" ref={listRef} onKeyDown={onListKey}>{stocks.map(s => {
            const data = current.items.find(i => i.id === s.id); const q = data?.quote;
            const stale = data?.quoteError || (q && isStale(q.collectedAt));
            return <li key={s.id}><button data-stock-id={s.id} className={`stock-row ${s.id === selected ? 'selected' : ''}`} onClick={() => selectStock(s.id)} aria-pressed={s.id === selected} aria-controls="stock-detail" aria-label={`${s.name} 상세 보기`}>
              <span className="rank">{String(s.rank).padStart(2, '0')}</span><span className="stock-identity"><strong>{s.name}</strong><span>{s.symbol}<span className="divider">·</span>{s.sector}</span></span><span className="stock-price"><strong><Price price={q?.price} currency={q?.currency}/></strong>{stale ? <span className="stale-label">이전 자료 · {q ? date(q.tradedAt) : '미확인'}</span> : <Change value={q?.changePercent}/>}</span><ChevronRight className="row-arrow" size={16} aria-hidden="true"/>
            </button></li>;
          })}</ul>
          <p className="list-footnote"><Info size={14} aria-hidden="true"/><span>등락률은 전일 대비입니다. 예상 상승률이 아닙니다.<span className="key-hint"> 목록에서 위·아래 방향키로 종목을 넘겨 볼 수 있습니다.</span></span></p>
          <div className="allocation"><strong>같은 위험에 함께 움직일 수 있습니다.</strong><p>10종목 중 7종목이 AI 투자·반도체 업황에 연결돼 있습니다.</p><div className="allocation-bar" role="img" aria-label="AI 관련 7종목, 바이오 1종목, 우주 2종목"><span/><span/><span/></div><div className="allocation-labels"><span>AI·반도체 7</span><span>바이오 1</span><span>우주 2</span></div></div>
        </section>
        <section id="stock-detail" tabIndex={-1} className={`detail ${mobileOpen ? 'mobile-open' : ''}`} aria-label={`${stock.name} 분석`}>
          <button className="mobile-back text-button" onClick={closeDetail}><X size={18} aria-hidden="true"/> 상세 접기</button>
          <div className="detail-content" key={stock.id}>
            <div className="entry-head">
              <span className="entry-no">No.{String(stock.rank).padStart(2, '0')}</span>
              <span className="market-tag">{stock.market === 'US' ? '미국 · NASDAQ' : '한국'}<span> / </span>{stock.symbol}</span>
              <span className={`risk-tag ${stock.riskLevel === '매우 높음' ? 'risk-very-high' : ''}`}>위험 {stock.riskLevel}</span>
            </div>
            <h2>{stock.name}<a href={item?.quote?.sourceUrl || stock.sources[0].url} target="_blank" rel="noopener noreferrer" aria-label={`${stock.name} 시세 원문 새 창`}><ArrowUpRight size={22} aria-hidden="true"/></a></h2><p className="english-name">{stock.englishName}</p>
            <div className="observed">
              <h3 className="entry-part">관찰한 것<small>시세 · 수집값</small></h3>
              <div className="detail-quote"><strong><Price price={item?.quote?.price} currency={item?.quote?.currency}/></strong><Change value={item?.quote?.changePercent}/></div>
              <p className="quote-time">{item?.quote ? <>{date(item.quote.tradedAt, true)} 기준 · {item.quote.marketStatus === 'OPEN' ? '장중 수집값' : item.quote.marketStatus === 'CLOSE' ? '장 마감 기준' : '최근 제공값'} · Npay 증권</> : '시세를 확인하지 못했습니다.'}{quoteDelayed && <span className="caution-text"> · 이전 수집 자료</span>}</p>
            </div>
            <h3 className="entry-part">해석한 것<small>{stock.reviewedAt.replaceAll('-', '.')} 검토 · 의견</small></h3>
            <p className="thesis-heading">{stock.summary}</p>
            <div className="research-block"><div className="section-icon positive"><ArrowUpRight size={17} aria-hidden="true"/></div><div><h4>상승을 기대하는 이유</h4><p>{stock.thesis}</p></div></div>
            <div className="research-block"><div className="section-icon caution"><Info size={17} aria-hidden="true"/></div><div><h4>전망이 틀릴 수 있는 이유</h4><p>{stock.risk}</p></div></div>
            <div className="watch-next"><Check size={17} aria-hidden="true"/><div><h4>다음에 확인할 것</h4><p>{stock.watch}</p></div></div>
            <div className="source-section"><div className="section-heading"><h3>분석의 근거</h3><span>{stock.reviewedAt.replaceAll('-', '.')} 검토</span></div>{stock.sources.map(source => <a key={source.url} className="source-link" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.date.replaceAll('-', '.')}</small></span><ExternalLink size={15} aria-hidden="true"/></a>)}</div>
            <div className="news-section"><div className="section-heading"><h3>최근 뉴스</h3><span>제목만 수집 · 분석과 구분</span></div>{item?.newsError && <p className="caution-text">뉴스 수집이 지연됐습니다. 이전 자료가 표시될 수 있습니다.</p>}{item?.news.length ? item.news.map(news => <a key={news.url} className="news-link" href={news.url} target="_blank" rel="noopener noreferrer"><span>{news.title}<small>{news.publisher} · {date(news.publishedAt)}</small></span><ArrowUpRight size={16} aria-hidden="true"/></a>) : <div className="empty-news"><img src="/images/empty-page.webp" width="112" height="112" alt="" loading="lazy"/><p>최근 14일 안의 관련 기사를 찾지 못했습니다. 위의 공식 자료를 확인해 주세요.</p></div>}</div>
          </div>
        </section>
      </div>
      <section id="method" className="method"><div><h2>숫자보다, 근거를 먼저.</h2><p>상승 여력과 12월까지 확인할 수 있는 사업 진척을 함께 봅니다. 순위는 정성적 관찰 우선순위이며, 확정 수익률이나 목표주가를 뜻하지 않습니다.</p><p>미국 주가는 달러, 한국 주가는 원화입니다. 환율·세금·배당을 반영한 투자 수익률과 다릅니다. 개인의 자산·손실 감내 수준을 반영한 자문은 아닙니다.</p></div><div><h3>갱신은 이렇게 구분합니다.</h3><dl><div><dt>주가·뉴스</dt><dd>매일 오전 8~9시 수집 예정. 휴장일에는 최근 거래일 가격을 표시합니다.</dd></div><div><dt>추천 근거</dt><dd>매일 오전 9시 검토 예약. 새 실적·공시가 있으면 근거와 위험을 수정하고, 검토 날짜를 남깁니다.</dd></div></dl><p className="method-note">주가·뉴스는 서버에서 갱신합니다. 분석 검토는 작업용 컴퓨터와 Codex가 실행 가능한 상태일 때 진행됩니다. 일정 실행이 지연되면 검토 날짜가 유지됩니다.</p></div></section>
      <details className="review-log"><summary>최근 검토 기록 <ChevronDown size={16} aria-hidden="true"/></summary><p>{research.reviewNote}</p>{research.history.slice(0, 7).map((h, i) => <div key={`${h.date}-${i}`}><time>{h.date}</time><p>{h.text}</p></div>)}</details>
      <footer><span className="footer-brand">12월의 관찰목록</span><span>미국 7 · 한국 3 · 2026년 12월까지</span><a href="#page-title">맨 위로 <ArrowUp size={13} aria-hidden="true"/></a></footer>
    </main>
  </>;
}
