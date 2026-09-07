import React, { useState, useEffect } from 'react';

export default function Diagnostics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDiagnostics() {
      const results = {};

      // 1. Basic Document Info
      results.url = window.location.href;
      results.userAgent = navigator.userAgent;
      results.readyState = document.readyState;
      results.baseURI = document.baseURI;
      results.devicePixelRatio = window.devicePixelRatio;
      results.screenSize = `${window.innerWidth}x${window.innerHeight} (Screen: ${window.screen.width}x${window.screen.height})`;

      // 2. DOM Stylesheet Elements
      const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      results.linkElements = linkElements.map(el => ({
        hrefAttr: el.getAttribute('href'),
        resolvedHref: el.href,
        media: el.media || 'all',
        disabled: el.disabled,
        crossOrigin: el.crossOrigin || 'none',
        outerHTML: el.outerHTML
      }));

      // 3. document.styleSheets API Inspection
      results.styleSheetsCount = document.styleSheets.length;
      results.styleSheetsList = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        const sheetInfo = {
          index: i,
          href: sheet.href,
          disabled: sheet.disabled,
          type: sheet.type,
          media: sheet.media ? sheet.media.mediaText : '',
          cssRulesAccessible: false,
          ruleCount: 0,
          error: null
        };
        try {
          if (sheet.cssRules) {
            sheetInfo.cssRulesAccessible = true;
            sheetInfo.ruleCount = sheet.cssRules.length;
          }
        } catch (err) {
          sheetInfo.cssRulesAccessible = false;
          sheetInfo.error = err.message || String(err);
        }
        results.styleSheetsList.push(sheetInfo);
      }

      // 4. Computed Styles
      const bodyStyle = window.getComputedStyle(document.body);
      results.computedBody = {
        backgroundColor: bodyStyle.backgroundColor,
        color: bodyStyle.color,
        fontFamily: bodyStyle.fontFamily,
        margin: bodyStyle.margin,
        padding: bodyStyle.padding
      };

      const testCardEl = document.getElementById('diag-test-card');
      if (testCardEl) {
        const cardStyle = window.getComputedStyle(testCardEl);
        results.computedTestCard = {
          backgroundColor: cardStyle.backgroundColor,
          color: cardStyle.color,
          fontFamily: cardStyle.fontFamily,
          padding: cardStyle.padding,
          borderRadius: cardStyle.borderRadius,
          borderColor: cardStyle.borderColor,
          boxShadow: cardStyle.boxShadow
        };
      }

      const probeEl = document.getElementById('css-probe');
      if (probeEl) {
        const probeStyle = window.getComputedStyle(probeEl);
        results.computedProbe = {
          backgroundColor: probeStyle.backgroundColor,
          color: probeStyle.color,
          position: probeStyle.position,
          top: probeStyle.top,
          left: probeStyle.left,
          zIndex: probeStyle.zIndex,
          display: probeStyle.display
        };
      }

      // 5. Fetch CSS Asset & Test Responses
      const firstCssUrl = linkElements[0]?.href;
      results.targetCssUrl = firstCssUrl || 'NO_CSS_LINK_FOUND';

      if (firstCssUrl) {
        // Normal Fetch
        try {
          const normalRes = await fetch(firstCssUrl);
          results.normalFetch = {
            status: normalRes.status,
            contentType: normalRes.headers.get('content-type'),
            contentLength: normalRes.headers.get('content-length'),
            etag: normalRes.headers.get('etag'),
            cacheControl: normalRes.headers.get('cache-control'),
            xVercelCache: normalRes.headers.get('x-vercel-cache')
          };
          const text = await normalRes.text();
          results.normalFetch.bodyLength = text.length;
          results.normalFetch.isCSS = text.includes('{') || text.includes(';');
          results.normalFetch.snippet = text.slice(0, 150);

          results.selectorChecks = {
            hasGlassCard: text.includes('glass-card'),
            hasGlassPanel: text.includes('glass-panel'),
            hasDarkClass: text.includes('.dark'),
            hasDarkHex: text.includes('#070a12'),
            hasRounded2xl: text.includes('rounded-2xl'),
            hasTextWhite: text.includes('text-white'),
            hasProbeRules: text.includes('css-probe')
          };
        } catch (err) {
          results.normalFetch = { error: err.message || String(err) };
        }

        // No-Store Cache Fetch
        try {
          const noStoreRes = await fetch(firstCssUrl, { cache: 'no-store' });
          results.noStoreFetch = {
            status: noStoreRes.status,
            contentType: noStoreRes.headers.get('content-type'),
            contentLength: noStoreRes.headers.get('content-length'),
            xVercelCache: noStoreRes.headers.get('x-vercel-cache')
          };
          const text = await noStoreRes.text();
          results.noStoreFetch.bodyLength = text.length;
        } catch (err) {
          results.noStoreFetch = { error: err.message || String(err) };
        }
      }

      // 6. Security & Meta Check
      results.htmlClassList = Array.from(document.documentElement.classList).join(' ');

      setData(results);
      setLoading(false);
    }

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-mono text-xs space-y-6 max-w-4xl mx-auto">
      
      {/* CSS PROBE ELEMENT REQUIRED BY PROMPT */}
      <div 
        id="css-probe" 
        className="fixed top-2 left-2 z-[999999] bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xl border-2 border-white pointer-events-none"
      >
        CSS-PROBE: VISIBLE
      </div>

      <div className="border border-cyan-500/30 rounded-2xl p-4 bg-slate-900/90 shadow-xl space-y-3">
        <h1 className="text-base font-extrabold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
          <span>IERT HUB — REAL-TIME BROWSER DIAGNOSTICS</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {loading ? 'RUNNING...' : 'COMPLETE'}
          </span>
        </h1>
        <p className="text-[11px] text-slate-400">
          This live diagnostic panel captures browser-side DOM state, CSS loading, computed styles, and HTTP response metadata directly on mobile and desktop devices.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Analyzing browser DOM, stylesheets, and network headers...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">

          {/* 1. ENVIRONMENT & DEVICE METRICS */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 space-y-2">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. Environment & Device Context
            </h2>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-300">
              <div><strong className="text-slate-400">URL:</strong> {data.url}</div>
              <div><strong className="text-slate-400">Base URI:</strong> {data.baseURI}</div>
              <div><strong className="text-slate-400">User Agent:</strong> {data.userAgent}</div>
              <div><strong className="text-slate-400">Ready State:</strong> {data.readyState}</div>
              <div><strong className="text-slate-400">Viewport & Screen:</strong> {data.screenSize} (DPR: {data.devicePixelRatio})</div>
              <div><strong className="text-slate-400">&lt;html&gt; classList:</strong> [{data.htmlClassList}]</div>
            </div>
          </div>

          {/* 2. DOM STYLESHEET ELEMENTS */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 space-y-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2. DOM &lt;link rel="stylesheet"&gt; Elements ({data.linkElements.length})
            </h2>
            {data.linkElements.length === 0 ? (
              <div className="text-rose-400 font-bold">CRITICAL: No &lt;link rel="stylesheet"&gt; tags found in DOM!</div>
            ) : (
              data.linkElements.map((el, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px]">
                  <div><strong className="text-slate-400">href attr:</strong> {el.hrefAttr}</div>
                  <div><strong className="text-slate-400">Resolved href:</strong> {el.resolvedHref}</div>
                  <div><strong className="text-slate-400">Media:</strong> {el.media} | <strong className="text-slate-400">Disabled:</strong> {String(el.disabled)}</div>
                  <div className="text-[10px] text-slate-500 font-mono overflow-x-auto">{el.outerHTML}</div>
                </div>
              ))
            )}
          </div>

          {/* 3. document.styleSheets API */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. document.styleSheets API (Length: {data.styleSheetsCount})
            </h2>
            {data.styleSheetsList.map((sheet, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px]">
                <div><strong className="text-slate-400">Sheet [{sheet.index}]:</strong> {sheet.href || '(Inline / Embedded)'}</div>
                <div><strong className="text-slate-400">Disabled:</strong> {String(sheet.disabled)} | <strong className="text-slate-400">Media:</strong> {sheet.media || 'none'}</div>
                <div>
                  <strong className="text-slate-400">cssRules Accessible:</strong>{' '}
                  {sheet.cssRulesAccessible ? (
                    <span className="text-emerald-400 font-bold">YES ({sheet.ruleCount} rules)</span>
                  ) : (
                    <span className="text-rose-400 font-bold">NO - {sheet.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 4. ASSET FETCH & SELECTOR AUDIT */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 space-y-3">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              4. CSS Asset Fetch & Payload Inspection
            </h2>
            <div className="text-[11px] text-slate-300">
              <div><strong className="text-slate-400">Target Asset URL:</strong> {data.targetCssUrl}</div>
            </div>

            {data.normalFetch && !data.normalFetch.error ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-cyan-300 font-bold">Normal Browser Fetch:</div>
                <div>Status: <span className="font-bold text-emerald-400">{data.normalFetch.status}</span></div>
                <div>Content-Type: <span className="font-bold text-white">{data.normalFetch.contentType}</span></div>
                <div>Body Length: <span className="font-bold text-white">{data.normalFetch.bodyLength} bytes</span></div>
                <div>x-vercel-cache: {data.normalFetch.xVercelCache || 'N/A'} | Cache-Control: {data.normalFetch.cacheControl}</div>
                <div className="pt-1 text-[10px] text-slate-400">
                  First 100 chars: <span className="font-mono text-slate-200">{data.normalFetch.snippet}</span>
                </div>
              </div>
            ) : (
              <div className="text-rose-400 font-bold">Normal Fetch Error: {data.normalFetch?.error}</div>
            )}

            {data.noStoreFetch && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-amber-300 font-bold">Cache-Control: no-store Fetch:</div>
                <div>Status: <span className="font-bold text-emerald-400">{data.noStoreFetch.status}</span></div>
                <div>Content-Type: {data.noStoreFetch.contentType}</div>
                <div>Body Length: {data.noStoreFetch.bodyLength} bytes</div>
              </div>
            )}

            {data.selectorChecks && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-cyan-300 font-bold mb-1">Payload Class Selector Verification:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div>.glass-card: <strong className={data.selectorChecks.hasGlassCard ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasGlassCard)}</strong></div>
                  <div>.glass-panel: <strong className={data.selectorChecks.hasGlassPanel ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasGlassPanel)}</strong></div>
                  <div>.dark: <strong className={data.selectorChecks.hasDarkClass ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasDarkClass)}</strong></div>
                  <div>#070a12: <strong className={data.selectorChecks.hasDarkHex ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasDarkHex)}</strong></div>
                  <div>.rounded-2xl: <strong className={data.selectorChecks.hasRounded2xl ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasRounded2xl)}</strong></div>
                  <div>text-white: <strong className={data.selectorChecks.hasTextWhite ? 'text-emerald-400' : 'text-rose-400'}>{String(data.selectorChecks.hasTextWhite)}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* 5. COMPUTED STYLES & TEST ELEMENTS */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/60 space-y-3">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              5. Computed Styles Inspection (window.getComputedStyle)
            </h2>

            {/* Test Card Element */}
            <div id="diag-test-card" className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/80 text-white space-y-1">
              <div className="font-bold text-cyan-400">#diag-test-card (Test Target Element)</div>
              <div className="text-[10px] text-slate-400">Sample glassmorphism test card element used for computed style assertion.</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-300">document.body Computed:</div>
                <div>background-color: <span className="font-mono text-cyan-300">{data.computedBody.backgroundColor}</span></div>
                <div>color: <span className="font-mono text-cyan-300">{data.computedBody.color}</span></div>
                <div>font-family: <span className="font-mono text-slate-300">{data.computedBody.fontFamily}</span></div>
              </div>

              {data.computedTestCard && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-300">#diag-test-card Computed:</div>
                  <div>background-color: <span className="font-mono text-cyan-300">{data.computedTestCard.backgroundColor}</span></div>
                  <div>color: <span className="font-mono text-cyan-300">{data.computedTestCard.color}</span></div>
                  <div>border-radius: <span className="font-mono text-cyan-300">{data.computedTestCard.borderRadius}</span></div>
                  <div>padding: <span className="font-mono text-cyan-300">{data.computedTestCard.padding}</span></div>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
