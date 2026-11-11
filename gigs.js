/* =========================================================
   LIVE DATES (Bandsintown)
   Pulls upcoming shows from Bandsintown and draws them in
   the LIVE section. Add or remove shows on Bandsintown and
   the site updates by itself; no code change needed.
========================================================= */

(function () {

  var box = document.getElementById('gigs');
  if (!box) return;

  var ARTIST = box.dataset.artist;        // e.g. id_15674764
  var APP_ID = box.dataset.app;
  var PROFILE = box.dataset.profile;      // Bandsintown page (Track button)

  var list = document.getElementById('gigList');
  var status = document.getElementById('gigStatus');
  var city = document.getElementById('liveCity');
  var headline = document.getElementById('liveHeadline');
  var detail = document.getElementById('liveDetail');

  function up(text) {
    return String(text || '').toUpperCase();
  }

  /* "2027-03-14T19:00:00" -> "14.03.27" (venue's local date, no time-zone shifts) */
  function shortDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1].slice(2) : '--.--.--';
  }

  function place(venue) {
    var parts = venue ? [venue.city, venue.country].filter(Boolean) : [];
    return parts.length ? up(parts.join(', ')) : 'LOCATION LOCKED';
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function ticketLink(event) {

    var offers = event.offers || [];
    var ticket = offers.filter(function (o) { return o && o.url; })[0];
    var soldOut = offers.some(function (o) { return /sold/i.test(o && o.status); });

    var a = el('a', 'gig-cta');
    a.target = '_blank';
    a.rel = 'noopener';

    if (ticket && !soldOut) {
      a.href = ticket.url;
      a.textContent = '[ TICKETS ]';
    } else if (soldOut) {
      a.href = event.url || PROFILE;
      a.textContent = '[ SOLD OUT ]';
      a.classList.add('is-soldout');
    } else {
      a.href = event.url || PROFILE;
      a.textContent = '[ INFO ]';
    }

    return a;
  }

  function render(events) {

    list.textContent = '';

    if (!events.length) {
      status.textContent = 'NO SIGNALS SCHEDULED // TRACK TO BE ALERTED';
      box.classList.add('is-empty');
      return;
    }

    box.classList.remove('is-empty');

    events.forEach(function (event) {

      var venue = event.venue || {};
      var row = el('li', 'gig');

      row.appendChild(el('span', 'gig-date', shortDate(event.datetime)));
      row.appendChild(el('span', 'gig-place', place(venue)));
      row.appendChild(el('span', 'gig-venue', up(event.title && !venue.name ? event.title : venue.name)));
      row.appendChild(ticketLink(event));

      list.appendChild(row);
    });

    status.textContent =
      events.length + (events.length === 1 ? ' SIGNAL' : ' SIGNALS') + ' DETECTED';

    /* Radar shows the next show */
    var next = events[0];
    var nv = next.venue || {};

    if (city) city.textContent = up(nv.city || 'LOCATION LOCKED');
    if (headline) headline.textContent = 'NEXT SIGNAL // ' + shortDate(next.datetime);
    if (detail) detail.textContent = up(nv.name || 'VENUE LOCKED');
  }

  function fail() {
    status.textContent = 'SIGNAL LOST // SEE BANDSINTOWN FOR DATES';
    box.classList.add('is-empty');
  }

  var url =
    'https://rest.bandsintown.com/artists/' +
    encodeURIComponent(ARTIST) +
    '/events?app_id=' + encodeURIComponent(APP_ID) +
    '&date=upcoming';

  fetch(url, { headers: { Accept: 'application/json' } })
    .then(function (r) {
      if (!r.ok) throw new Error('Bandsintown ' + r.status);
      return r.json();
    })
    .then(function (data) {

      if (!Array.isArray(data)) throw new Error('Unexpected response');

      var events = data
        .filter(function (e) { return e && e.datetime; })
        .sort(function (a, b) { return a.datetime < b.datetime ? -1 : 1; });

      render(events);
    })
    .catch(function (error) {
      console.warn('LIVE DATES:', error);
      fail();
    });

})();
