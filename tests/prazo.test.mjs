// node proposta-lp/tests/prazo.test.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../js/prazo.js', import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const P = ctx.window.LPPrazo;
const d = (s) => new Date(s + 'T12:00:00');
const iso = (x) => x.toISOString().slice(0, 10);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('20/11/2026 (Consciência Negra) is not a business day', () => assert.equal(P.isBusinessDay(d('2026-11-20')), false));
t('weekend is not a business day', () => assert.equal(P.isBusinessDay(d('2026-11-21')), false));
t('nextStart from 13/11/2026 is Monday 23/11/2026', () => assert.equal(iso(P.nextStart(d('2026-11-13'))), '2026-11-23'));
t('launch from start 23/11/2026 is 18/12/2026', () => assert.equal(iso(P.launchDate(d('2026-11-13'))), '2026-12-18'));
t('nextStart from 25/11/2026 is Monday 30/11/2026', () => assert.equal(iso(P.nextStart(d('2026-11-25'))), '2026-11-30'));
t('launch from 25/11/2026 skips Christmas -> 28/12/2026', () => assert.equal(iso(P.launchDate(d('2026-11-25'))), '2026-12-28'));
t('fmt gives dd/mm', () => assert.equal(P.fmt(d('2026-12-18')), '18/12'));
t('beforeChristmas true when launch <= 24/12', () => assert.equal(P.beforeChristmas(d('2026-11-13')), true));
t('beforeChristmas false when launch after 24/12', () => assert.equal(P.beforeChristmas(d('2026-11-25')), false));
t('acceptDeadline from 13/11/2026 is 17/11/2026', () => assert.equal(iso(P.acceptDeadline(d('2026-11-13'))), '2026-11-17'));
t('acceptDeadline after the Christmas window is null', () => assert.equal(P.acceptDeadline(d('2026-11-18')), null));
t('beforeChristmas false in January (launch in February is not before Christmas)', () => assert.equal(P.beforeChristmas(d('2027-01-10')), false));
t('acceptDeadline in January is null', () => assert.equal(P.acceptDeadline(d('2027-01-10')), null));
console.log(`${n} passed`);
