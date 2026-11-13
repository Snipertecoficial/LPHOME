/* Prazo do projeto em dias úteis (feriados nacionais + Carnaval e Corpus Christi). */
(function (root) {
  'use strict';

  var HOLIDAYS = [
    '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25',
    '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-26', '2027-04-21',
    '2027-05-01', '2027-05-27', '2027-09-07', '2027-10-12', '2027-11-02',
    '2027-11-15', '2027-11-20', '2027-12-25'
  ];

  function key(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function addDays(d, n) {
    var r = new Date(d.getTime());
    r.setDate(r.getDate() + n);
    return r;
  }

  function isBusinessDay(d) {
    var wd = d.getDay();
    return wd !== 0 && wd !== 6 && HOLIDAYS.indexOf(key(d)) === -1;
  }

  /* Moves n business days forward from date (date itself not counted). */
  function addBusinessDays(date, n) {
    var d = new Date(date.getTime());
    while (n > 0) {
      d = addDays(d, 1);
      if (isBusinessDay(d)) n--;
    }
    return d;
  }

  /* First business Monday strictly after today + 2 business days. */
  function nextStart(today) {
    var d = addBusinessDays(today, 2);
    do { d = addDays(d, 1); } while (d.getDay() !== 1);
    while (!isBusinessDay(d)) d = addDays(d, 1);
    return d;
  }

  /* Start counts as day 1, so day 20 is 19 business days later. */
  function launchDate(today) {
    return addBusinessDays(nextStart(today), 19);
  }

  function beforeChristmas(today) {
    var l = launchDate(today);
    return l.getFullYear() === today.getFullYear() && l.getMonth() === 11 && l.getDate() <= 24;
  }

  /* Last calendar day (from today, within 60 days) whose acceptance still launches before Christmas; null if none. */
  function acceptDeadline(today) {
    var last = null;
    for (var i = 0; i <= 60; i++) {
      var d = addDays(today, i);
      if (d.getFullYear() !== today.getFullYear()) break;
      if (beforeChristmas(d)) last = d; else if (last) break;
    }
    return last;
  }

  function fmt(d) {
    var day = d.getDate(), m = d.getMonth() + 1;
    return (day < 10 ? '0' : '') + day + '/' + (m < 10 ? '0' : '') + m;
  }

  root.LPPrazo = {
    isBusinessDay: isBusinessDay,
    addBusinessDays: addBusinessDays,
    nextStart: nextStart,
    launchDate: launchDate,
    beforeChristmas: beforeChristmas,
    acceptDeadline: acceptDeadline,
    fmt: fmt
  };
})(window);
