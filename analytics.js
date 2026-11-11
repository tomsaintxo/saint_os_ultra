/* =========================================================
   VISITOR STATS (GoatCounter)
   Page visits are counted by GoatCounter's own script.
   This file also counts clicks on the things that matter.
   See the numbers at https://gothheartthrob.goatcounter.com
   (clicks appear in the list with a "click/" name).
========================================================= */

(function () {

  function send(name, title) {
    var gc = window.goatcounter;
    if (!gc || !gc.count) return;   // not loaded / blocked / local preview
    try {
      gc.count({ path: 'click/' + name, title: title || name, event: true });
    } catch (e) {}
  }

  function slug(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }

  document.addEventListener('click', function (event) {

    var t = event.target;
    if (!t || !t.closest) return;

    var a;

    if ((a = t.closest('#enterBtn'))) {
      return send('enter', 'Pressed ENTER');
    }

    if ((a = t.closest('.channels-list a'))) {
      var platform = a.textContent.replace(/^\s*\d+/, '').trim();
      return send('social/' + slug(platform), 'Social: ' + platform);
    }

    if ((a = t.closest('a[href="press.html"]'))) {
      return send('press-kit', 'Opened press kit');
    }

    if ((a = t.closest('#contactEmail'))) {
      return send('booking-email', 'Booking / press email');
    }

    if ((a = t.closest('.release > a'))) {
      var title = (a.querySelector('.release-copy b') || {}).textContent || 'release';
      return send('listen/' + slug(title), 'Listen: ' + title.trim());
    }

    if ((a = t.closest('.monitor'))) {
      var film = (a.querySelector('.monitor-meta b') || {}).textContent || 'film';
      return send('video/' + slug(film), 'Video: ' + film.trim());
    }

    if ((a = t.closest('.gig-cta'))) {
      var row = a.closest('.gig');
      var date = row ? (row.querySelector('.gig-date') || {}).textContent : '';
      return send('tickets/' + slug(date + '-' + a.textContent), 'Tickets: ' + date + ' ' + a.textContent.trim());
    }

    if ((a = t.closest('.gig-foot a'))) {
      return send('bandsintown-track', 'Track on Bandsintown');
    }

  }, true);

  /* Mailing-list sign-up attempts */
  document.addEventListener('submit', function (event) {
    if (event.target && event.target.closest && event.target.closest('.signal-form')) {
      send('mailing-list-signup', 'Mailing list sign-up');
    }
    if (event.target && event.target.id === 'confessForm') {
      send('confession', 'Confession submitted');
    }
  }, true);

  /* Stem player (inside its frame): presses of START ALL */
  var frame = document.getElementById('stemPlayer');
  var hooked = false;

  function hookStemPlayer() {
    if (hooked) return;
    try {
      var doc = frame.contentDocument;
      var play = doc && doc.getElementById('btn-play');
      if (!play) return;
      hooked = true;
      play.addEventListener('click', function () {
        send('stem-player-play', 'Stem player: play');
      });
    } catch (e) {}
  }

  if (frame) {
    frame.addEventListener('load', hookStemPlayer);
    hookStemPlayer();   // in case it had already loaded
  }

})();
