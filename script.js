/* =========================================================
   DEVICE
   Touch phones/tablets have no hover and no mouse cursor,
   so a few interactions switch to tap / scroll versions.
========================================================= */

const isTouch =
  window.matchMedia('(hover: none)').matches ||
  window.matchMedia('(pointer: coarse)').matches;

if (isTouch) {
  document.documentElement.classList.add('touch');
}

/* iOS: let Web Audio play even when the ring/silent switch is on */
try {
  if (navigator.audioSession) {
    navigator.audioSession.type = 'playback';
  }
} catch (error) {}

/* Last input type used (mouse / touch / pen) */
let lastPointerType = 'mouse';

window.addEventListener(
  'pointerdown',
  event => {
    lastPointerType = event.pointerType || 'mouse';
  },
  { capture: true }
);


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


/* =========================================================
   DOM
========================================================= */

const boot = $('#boot');
const intro = $('#intro');
const site = $('#site');

const log = $('#bootLog');
const enterBtn = $('#enterBtn');
const title = $('.hero-logo');

const ambient = $('#ambient');
const preview = $('#preview');
const muteBtn = $('#muteBtn');

const holdFx = $('#holdFx');
const burst = $('#burst');
const flash = $('#flashLayer');

const oracle = $('#oracle');

const trailCanvas = $('#trail');
const trailCtx = trailCanvas.getContext('2d');


/* =========================================================
   GLOBAL STATE
========================================================= */

let mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  nx: 0,
  ny: 0
};

let audioOn = false;

let holding = false;
let holdTimer = null;

let dwell = 0;
let secretUnlocked = false;


/* =========================================================
   BOOT SEQUENCE
========================================================= */

const bootLines = [
  'AUTHENTICATING UNKNOWN USER',
  'SCANNING MEMORY',
  'LOADING VISUAL ENGINE',
  'INITIALISING AUDIO BUS',
  'MOUNTING ARCHIVE',
  'CHECKING CONFESSION PORT',
  'WARNING: UNSTABLE BUILD',
  'OPENING CHURCH GATE',
  'ACCESS GRANTED'
];


(async () => {

  for (const line of bootLines) {

    const row =
      document.createElement('div');

    row.textContent =
      '> ' + line;

    log?.appendChild(row);

    await sleep(
      180 +
      Math.random() * 240
    );

  }

  await sleep(380);

  boot?.classList.add('hidden');
  intro?.classList.remove('hidden');

  cinematicGlitch();

})();


/* =========================================================
   INTRO GLITCH
========================================================= */

function cinematicGlitch() {

  if (!title || !flash || !burst) {
    return;
  }

  let hits = 0;

  const timer =
    setInterval(() => {

      title.classList.add(
        'glitching'
      );

      flash.style.opacity =
        Math.random() > .55
          ? '.75'
          : '0';

      burst.classList.remove(
        'hit'
      );

      void burst.offsetWidth;

      burst.classList.add(
        'hit'
      );

      setTimeout(() => {

        title.classList.remove(
          'glitching'
        );

        flash.style.opacity = 0;

      }, 80 + Math.random() * 130);


      hits++;

      if (hits > 5) {
        clearInterval(timer);
      }

    }, 420);

}


/* =========================================================
   CLOCK
========================================================= */

setInterval(() => {

  const clock = $('#clock');

  if (!clock) return;

  clock.textContent =
    new Date()
      .toLocaleTimeString(
        'en-GB',
        {
          hour12: false
        }
      );

}, 1000);


/* =========================================================
   ENTER CHURCH
========================================================= */

enterBtn?.addEventListener(
  'click',
  async () => {

    audioOn = true;

    if (muteBtn) {
      muteBtn.textContent =
        'AUDIO: ON';
    }

    try {

      ambient.volume = .18;

      await ambient.play();

    } catch (error) {

      console.warn(
        'Ambient autoplay:',
        error
      );

    }


    if (intro) {

      intro.animate(
        [
          {
            opacity: 1,
            transform: 'scale(1)',
            filter:
              'blur(0px) contrast(1)'
          },

          {
            opacity: .5,
            transform: 'scale(1.16)',
            filter:
              'blur(7px) contrast(1.6)'
          },

          {
            opacity: 0,
            transform: 'scale(1.35)',
            filter:
              'blur(28px) contrast(2.2)'
          }
        ],

        {
          duration: 950,
          easing:
            'cubic-bezier(.7,0,.2,1)',
          fill: 'forwards'
        }
      );

    }


    setTimeout(() => {

      intro?.classList.add(
        'hidden'
      );

      site?.classList.remove(
        'hidden'
      );

      window.scrollTo(
        0,
        0
      );

    }, 900);

  }
);


/* =========================================================
   AUDIO TOGGLE
========================================================= */

muteBtn?.addEventListener(
  'click',
  async () => {

    audioOn = !audioOn;

    muteBtn.textContent =
      `AUDIO: ${
        audioOn
          ? 'ON'
          : 'OFF'
      }`;


    if (audioOn) {

      try {

        await ambient.play();

      } catch (error) {

        console.warn(
          'Audio play:',
          error
        );

      }

    } else {

      ambient.pause();

    }

  }
);


/* =========================================================
   POINTER
========================================================= */

const cursorFlash =
  document.querySelector(
    '#cursorFlash'
  );


window.addEventListener(
  'pointermove',
  event => {

    if (!cursorFlash) {
      return;
    }


    cursorFlash.style.left =
      `${event.clientX}px`;


    cursorFlash.style.top =
      `${event.clientY}px`;

  }
);


window.addEventListener(
  'pointermove',
  event => {

    mouse.x =
      event.clientX;

    mouse.y =
      event.clientY;


    mouse.nx =
      (
        event.clientX /
        innerWidth -
        .5
      ) * 2;


    mouse.ny =
      (
        event.clientY /
        innerHeight -
        .5
      ) * 2;


    document.documentElement
      .style
      .setProperty(
        '--mx',
        event.clientX + 'px'
      );


    document.documentElement
      .style
      .setProperty(
        '--my',
        event.clientY + 'px'
      );


    $$('.scrap')
      .forEach(
        (element, index) => {

          element.style.translate =
            `${
              mouse.nx *
              (index + 1) *
              4
            }px ${
              mouse.ny *
              (index + 1) *
              4
            }px`;

        }
      );

  }
);




/* =========================================================
   HOLD TO SIN
   Works with mouse and touch. On touch, moving your finger
   (scrolling) cancels it, so it only fires on a still press.
========================================================= */

let holdActive = false;
let holdShader = 0;
let holdStart = null;

function startHoldFx() {

  holdActive = true;
  holdShader = 1;

  holdFx?.classList.add('active');

  burst?.classList.remove('hit');

  if (burst) {
    void burst.offsetWidth;
    burst.classList.add('hit');
  }

  if (navigator.vibrate) {
    navigator.vibrate(80);
  }

}

function endHold() {

  holding = false;
  holdActive = false;
  holdShader = 0;
  holdStart = null;

  clearTimeout(holdTimer);

  holdFx?.classList.remove('active');

}

window.addEventListener(
  'pointerdown',
  event => {

    if (
      event.target.closest(
        'a,button,input,iframe,.release,.monitor'
      )
    ) {
      return;
    }

    holding = true;

    holdStart = {
      x: event.clientX,
      y: event.clientY
    };

    /* Mouse: shader distortion starts straight away (as before) */
    if (event.pointerType === 'mouse') {
      holdShader = 1;
    }

    clearTimeout(holdTimer);

    holdTimer =
      setTimeout(() => {

        if (!holding) return;

        startHoldFx();

      }, event.pointerType === 'mouse' ? 350 : 450);

  }
);

window.addEventListener(
  'pointermove',
  event => {

    if (
      !holding ||
      !holdStart ||
      event.pointerType === 'mouse'
    ) {
      return;
    }

    const moved =
      Math.hypot(
        event.clientX - holdStart.x,
        event.clientY - holdStart.y
      );

    /* Finger is scrolling, not holding */
    if (moved > 12) {
      endHold();
    }

  }
);

window.addEventListener('pointerup', endHold);
window.addEventListener('pointercancel', endHold);
window.addEventListener('blur', endHold);

document.addEventListener(
  'visibilitychange',
  () => {
    if (document.hidden) endHold();
  }
);

/* Stop iOS showing its long-press menu while holding */
window.addEventListener(
  'contextmenu',
  event => {
    if (
      isTouch &&
      !event.target.closest('input,textarea')
    ) {
      event.preventDefault();
    }
  }
);


/* =========================================================
   MUSIC PREVIEWS
   Mouse: hover to hear, click to open the link.
   Touch: first tap plays the preview, second tap opens the link.
========================================================= */

const releases = $$('.release');

function stopPreview() {

  preview.pause();

  try {
    preview.currentTime = 0;
  } catch (error) {}

}

let previewClaimed = false;

async function playRelease(card) {

  previewClaimed = true;
  preview.muted = false;

  releases.forEach(other => {
    other.classList.remove('active');
  });

  card.classList.add('active');

  if (!audioOn) {
    return;
  }

  preview.src = card.dataset.audio;

  preview.volume = .52;

  try {
    await preview.play();
  } catch (error) {
    console.warn('Preview:', error);
  }

}

/* Safari (Mac and iPhone) only lets an audio element play on
   hover once it has been started by a click or tap. So start it
   silently when the visitor clicks [ ENTER ], then stop it. */
enterBtn?.addEventListener(
  'click',
  () => {

    if (!preview || !releases.length) return;

    try {

      preview.muted = true;
      preview.src = releases[0].dataset.audio;

      const unlock = preview.play();

      if (unlock && unlock.then) {

        unlock
          .then(() => {
            if (previewClaimed) return;
            preview.pause();
            preview.currentTime = 0;
            preview.muted = false;
          })
          .catch(() => {
            preview.muted = false;
          });

      }

    } catch (error) {
      preview.muted = false;
    }

  }
);

releases.forEach(card => {

  card.addEventListener(
    'pointerenter',
    event => {
      if (event.pointerType !== 'mouse') return;
      playRelease(card);
    }
  );

  card.addEventListener(
    'pointerleave',
    event => {
      if (event.pointerType !== 'mouse') return;
      stopPreview();
      card.classList.remove('active');
    }
  );

  card.addEventListener(
    'click',
    event => {

      if (lastPointerType === 'mouse') {
        return;
      }

      /* Second tap on the playing release: follow the link */
      if (card.classList.contains('active')) {
        return;
      }

      event.preventDefault();

      playRelease(card);

    }
  );

});

/* Touch: stop the preview when tapping elsewhere */
document.addEventListener(
  'click',
  event => {

    if (lastPointerType === 'mouse') return;

    if (event.target.closest('.release')) return;

    if (!releases.some(card => card.classList.contains('active'))) return;

    stopPreview();

    releases.forEach(card => {
      card.classList.remove('active');
    });

  }
);


/* =========================================================
   FILMS
   Mouse: hover to play.
   Touch: each film plays (muted) while it is on screen.
========================================================= */

const monitors = $$('.monitor');

function setMonitor(monitor, live) {

  const video = monitor.querySelector('video');
  const status = monitor.querySelector('i');

  if (!video) return;

  if (live) {

    if (!video.src) {
      video.src = monitor.dataset.video;
    }

    if (status) status.textContent = 'LIVE';

    video.play().catch(() => {});

  } else {

    if (status) status.textContent = 'NO SIGNAL';

    video.pause();

    if (!isTouch) {
      try {
        video.currentTime = 0;
      } catch (error) {}
    }

  }

}

monitors.forEach(monitor => {

  const video = monitor.querySelector('video');

  if (!video) return;

  video.muted = true;
  video.playsInline = true;
  video.preload = isTouch ? 'none' : 'auto';

  if (!isTouch) {
    video.src = monitor.dataset.video;
  }

  monitor.addEventListener(
    'pointerenter',
    event => {
      if (event.pointerType !== 'mouse') return;
      setMonitor(monitor, true);
    }
  );

  monitor.addEventListener(
    'pointerleave',
    event => {
      if (event.pointerType !== 'mouse') return;
      setMonitor(monitor, false);
    }
  );

});

if (isTouch && 'IntersectionObserver' in window) {

  const filmObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setMonitor(
            entry.target,
            entry.isIntersecting
          );
        });
      },
      { threshold: .6 }
    );

  monitors.forEach(monitor => {
    filmObserver.observe(monitor);
  });

}

/* Touch-friendly instruction text */
if (isTouch) {

  const videoHint = $('#video .section-title small');

  if (videoHint) {
    videoHint.textContent =
      'SURVEILLANCE ARCHIVE // SCROLL TO ACTIVATE';
  }

  const musicHint = $('#music .section-title small');

  if (musicHint) {
    musicHint.textContent =
      'TAP TO HEAR // TAP AGAIN TO OPEN';
  }

  const hudHint = $('.hud-corner.bl');

  if (hudHint) {
    hudHint.textContent =
      'TAP + HOLD // SCROLL';
  }

}



/* =========================================================
   CONFESS
========================================================= */

const verdicts = [
  'ABSOLVED.',
  'UNFORGIVABLE.',
  'RECEIVED.',
  'SAINTED.',
  'ERASED.',
  'DO IT AGAIN.'
];


$('#confessForm')
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const input =
        $('#confession');


      const verdict =
        $('#verdict');


      if (
        !input ||
        !verdict ||
        !input.value.trim()
      ) {
        return;
      }


      const output =
        verdicts[
          Math.floor(
            Math.random() *
            verdicts.length
          )
        ];


      verdict.textContent = '';


      for (
        const character
        of output
      ) {

        verdict.textContent +=
          character;


        await sleep(
          45 +
          Math.random() * 60
        );

      }


      input.value = '';


      burst?.classList.remove(
        'hit'
      );


      if (burst) {

        void burst.offsetWidth;

        burst.classList.add(
          'hit'
        );

      }

    }
  );


/* =========================================================
   ORACLE
========================================================= */

const oracleLines = [
  'THE SYSTEM IS WATCHING.',
  'YOU HAVE BEEN HERE BEFORE.',
  'DO NOT TRUST THE ARCHIVE.',
  'SOME FILES OPEN ONLY AFTER MIDNIGHT.',
  'THE CHURCH REMEMBERS.',
  'KEEP GOING.'
];


setInterval(() => {

  if (
    !oracle ||
    site?.classList.contains(
      'hidden'
    )
  ) {
    return;
  }


  oracle.textContent =
    oracleLines[
      Math.floor(
        Math.random() *
        oracleLines.length
      )
    ];

}, 7000);


/* =========================================================
   PROGRESSIVE CORRUPTION
========================================================= */

setInterval(() => {

  if (
    site?.classList.contains(
      'hidden'
    )
  ) {
    return;
  }


  dwell++;


  if (dwell === 45) {

    document.body
      .classList
      .add('decay1');

  }


  if (dwell === 90) {

    document.body
      .classList
      .add('decay2');

  }


  if (dwell === 150) {

    document.body
      .classList
      .add('decay3');

  }


  if (dwell === 210) {

    document.body
      .classList
      .add('decay4');

    unlockPrivate();

  }

}, 1000);


function unlockPrivate() {

  if (secretUnlocked) {
    return;
  }


  secretUnlocked = true;


  const button =
    $('#privateUnlock');


  if (!button) {
    return;
  }


  button.textContent =
    '[ PRIVATE ACCESS ]';


  button.style.cursor =
    'pointer';


  button.style.color =
    '#fff';


  button.style.borderColor =
    '#555';


  button.addEventListener(
    'click',
    () => {

      const privateSection =
        $('#private');


      privateSection
        ?.classList
        .remove('hidden');


      privateSection
        ?.scrollIntoView({
          behavior: 'smooth'
        });

    }
  );

}


/* =========================================================
   SMOOTH INTERNAL NAV
========================================================= */

$$('a[href^="#"]')
  .forEach(link => {

    link.addEventListener(
      'click',
      event => {

        const target =
          $(
            link.getAttribute(
              'href'
            )
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: 'smooth'
        });

      }
    );

  });


// ====================================
// PIXEL CURSOR FLASH + TRAIL
// ====================================

const tc = $('#trail');
const tctx = tc.getContext('2d');

let trail = [];

function resizeTrail() {

  tc.width =
    innerWidth *
    devicePixelRatio;

  tc.height =
    innerHeight *
    devicePixelRatio;

  tc.style.width =
    innerWidth + 'px';

  tc.style.height =
    innerHeight + 'px';

  tctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );

}

if (!isTouch) {

  window.addEventListener(
    'resize',
    resizeTrail
  );

  resizeTrail();

}


window.addEventListener(
  'pointermove',
  e => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    trail.push({
      x: e.clientX,
      y: e.clientY,
      life: 1
    });

  }
);


function drawTrail() {

  tctx.clearRect(
    0,
    0,
    innerWidth,
    innerHeight
  );


  /* ==============================
     SMALL FADING TRAIL
  ============================== */

  trail =
    trail.slice(-18);

  trail.forEach(
    (point, index) => {

      point.life *= .82;

      const size =
        index === trail.length - 1
          ? 2
          : 1;

      tctx.fillStyle =
        `rgba(
          255,
          255,
          255,
          ${point.life * .45}
        )`;

      tctx.fillRect(
        Math.round(point.x),
        Math.round(point.y),
        size,
        size
      );

    }
  );


  /* ==============================
     FLASH UNDER CURSOR
  ============================== */

  const time =
    performance.now();

  /*
     Square-wave style pulse rather
     than a smooth modern animation.
  */

  const flashOn =
    Math.floor(
      time / 110
    ) % 2 === 0;


  if (flashOn) {

    /*
       Main white pixel.
       This is exactly at the hotspot
       of the CSS cursor.
    */

    tctx.fillStyle =
      'rgba(255,255,255,1)';

    tctx.fillRect(
      Math.round(mouse.x),
      Math.round(mouse.y),
      3,
      3
    );


    /*
       Small CRT glow around it.
    */

    tctx.fillStyle =
      'rgba(255,255,255,.30)';

    tctx.fillRect(
      Math.round(mouse.x) - 2,
      Math.round(mouse.y) - 2,
      7,
      7
    );


    /*
       Bright centre again so it
       doesn't get washed out.
    */

    tctx.fillStyle =
      '#ffffff';

    tctx.fillRect(
      Math.round(mouse.x),
      Math.round(mouse.y),
      2,
      2
    );

  }


  requestAnimationFrame(
    drawTrail
  );

}


/* No cursor on touch screens, so skip the trail there */
if (!isTouch) {
  drawTrail();
}


/* =========================================================
   AUDIO ANALYSER
========================================================= */

let analyser = null;
let analyserData = null;
let audioContext = null;
let sourceNode = null;


async function initAnalyser() {

  if (analyser) {
    return;
  }


  try {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();


    sourceNode =
      audioContext
        .createMediaElementSource(
          ambient
        );


    analyser =
      audioContext
        .createAnalyser();


    analyser.fftSize =
      256;


    analyserData =
      new Uint8Array(
        analyser
          .frequencyBinCount
      );


    sourceNode.connect(
      analyser
    );


    analyser.connect(
      audioContext.destination
    );


  } catch (error) {

    console.error(
      'AUDIO ANALYSER ERROR:',
      error
    );

  }

}


enterBtn?.addEventListener(
  'click',
  initAnalyser,
  {
    once: true
  }
);


function getAmplitude() {

  if (
    !analyser ||
    !analyserData
  ) {
    return 0;
  }


  analyser
    .getByteFrequencyData(
      analyserData
    );


  let total = 0;


  for (
    let i = 0;
    i < 40;
    i++
  ) {

    total +=
      analyserData[i];

  }


  return (
    total / 40
  ) / 255;

}


/* =========================================================
   THREE.JS SCENE
   Loaded separately so the rest of the site still works if
   the 3D library can't load (older iPhones, bad signal).
========================================================= */

async function initScene() {

const THREE =
  await import('three');

const { GLTFLoader } =
  await import('three/addons/loaders/GLTFLoader.js');

const { RoomEnvironment } =
  await import('three/addons/environments/RoomEnvironment.js');

/* Phones: lighter rendering so it stays smooth */
const maxPixelRatio =
  isTouch ? 1.5 : 2;

const host =
  $('#webgl');


const scene =
  new THREE.Scene();


scene.fog =
  new THREE.FogExp2(
    0x000000,
    .035
  );


/* =========================================================
   CAMERA
========================================================= */

const camera =
  new THREE.PerspectiveCamera(
    60,
    innerWidth /
    innerHeight,
    .1,
    200
  );


camera.position.set(
  0,
  0,
  16
);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
  new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference:
      'high-performance'
  });


renderer.outputColorSpace =
  THREE.SRGBColorSpace;


renderer.toneMapping =
  THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
  1.2;


renderer.setPixelRatio(
  Math.min(
    devicePixelRatio,
    maxPixelRatio
  )
);


renderer.setSize(
  innerWidth,
  innerHeight
);


host.appendChild(
  renderer.domElement
);


/* =========================================================
   ENVIRONMENT MAP

   This is the part that makes the material embedded
   inside the GLB read properly as metal / patina.
========================================================= */

const pmremGenerator =
  new THREE.PMREMGenerator(
    renderer
  );


const roomEnvironment =
  new RoomEnvironment();


const environment =
  pmremGenerator.fromScene(
    roomEnvironment,
    .04
  );


scene.environment =
  environment.texture;


scene.environmentIntensity =
  .8;


roomEnvironment.dispose();

pmremGenerator.dispose();


/* =========================================================
   SHRINE LIGHTING
========================================================= */

const shrineAmbient =
  new THREE.AmbientLight(
    0xffffff,
    1.5
  );


scene.add(
  shrineAmbient
);


const shrineKey =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );


shrineKey.position.set(
  4,
  6,
  8
);


scene.add(
  shrineKey
);


const shrineFill =
  new THREE.DirectionalLight(
    0x551111,
    1.25
  );


shrineFill.position.set(
  -5,
  1,
  -4
);


scene.add(
  shrineFill
);


const shrineRim =
  new THREE.PointLight(
    0xffffff,
    8,
    30
  );


shrineRim.position.set(
  0,
  5,
  -5
);


scene.add(
  shrineRim
);

const shrineFront =
  new THREE.PointLight(
    0xffffff,
    18,
    40
  );

shrineFront.position.set(
  0,
  1,
  10
);

scene.add(
  shrineFront
);


/* =========================================================
   THREE SWORDS SHRINE
========================================================= */

let shrine = null;


const shrineGroup =
  new THREE.Group();


scene.add(
  shrineGroup
);


const shrineLoader =
  new GLTFLoader();


shrineLoader.load(

  'assets/three-swords-shrine.glb',


  gltf => {

    shrine =
      gltf.scene;


    shrineGroup.add(
      shrine
    );


    shrine.visible = true;

    shrineGroup.visible = true;


    /*
      IMPORTANT:
      Do NOT replace obj.material here.

      The GLB already contains the texture/material.
    */

    shrine.traverse(
      object => {

        if (
          !object.isMesh
        ) {
          return;
        }


        object.frustumCulled =
          false;


        const materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [object.material];


        materials.forEach(
          material => {

            if (!material) {
              return;
            }


            material.needsUpdate =
              true;


            if (
              'envMapIntensity'
              in material
            ) {

              material.envMapIntensity =
                1.15;

            }

          }
        );

      }
    );


    /* -----------------------------
       CENTRE MODEL
    ----------------------------- */

    const box =
      new THREE.Box3()
        .setFromObject(
          shrine
        );


    const center =
      box.getCenter(
        new THREE.Vector3()
      );


    shrine.position.sub(
      center
    );


    /* -----------------------------
       FIT MODEL
    ----------------------------- */

    const size =
      box.getSize(
        new THREE.Vector3()
      );


    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    const calculatedScale =
      11 /
      maxDimension;


    /*
      0.72 keeps the shrine near the size
      you had visually working before.
    */

    shrine.userData.desktopScale =
      calculatedScale *
      .90;

    shrine.userData.sizeW =
      Math.max(size.x, size.z);

    shrine.userData.sizeH =
      size.y;

    fitShrine();


    shrine.scale.setScalar(
      shrine.userData.baseScale
    );


    shrineGroup.position.set(
      0,
      0,
      0
    );


    console.log(
      'SHRINE OBJECT:',
      shrine
    );


    console.log(
      'SHRINE SCALE:',
      shrine.userData.baseScale
    );


    console.log(
      'SAINT_OS // SHRINE LOADED'
    );

  },


  xhr => {

    if (!xhr.total) {
      return;
    }


    console.log(
      'SHRINE',
      Math.round(
        xhr.loaded /
        xhr.total *
        100
      ) + '%'
    );

  },


  error => {

    console.error(
      'SHRINE LOAD ERROR:',
      error
    );

  }

);


/* =========================================================
   BACKGROUND PARTICLES
========================================================= */

const particleGeometry =
  new THREE.BufferGeometry();


const particleCount =
  isTouch ? 3500 : 7000;


const particlePositions =
  new Float32Array(
    particleCount * 3
  );


for (
  let i = 0;
  i < particleCount;
  i++
) {

  const radius =
    7 +
    Math.random() * 22;


  const theta =
    Math.random() *
    Math.PI *
    2;


  const phi =
    Math.acos(
      2 *
      Math.random() -
      1
    );


  particlePositions[
    i * 3
  ] =
    radius *
    Math.sin(phi) *
    Math.cos(theta);


  particlePositions[
    i * 3 + 1
  ] =
    radius *
    Math.sin(phi) *
    Math.sin(theta);


  particlePositions[
    i * 3 + 2
  ] =
    radius *
    Math.cos(phi);

}


particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(
    particlePositions,
    3
  )
);


const particleMaterial =
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: .025,
    transparent: true,
    opacity: .5
  });


const stars =
  new THREE.Points(
    particleGeometry,
    particleMaterial
  );


scene.add(
  stars
);


/* =========================================================
   OFFSCREEN RENDER TARGET
========================================================= */

const pixelRatio =
  Math.min(
    devicePixelRatio,
    maxPixelRatio
  );


const renderTarget =
  new THREE.WebGLRenderTarget(
    innerWidth *
    pixelRatio,
    innerHeight *
    pixelRatio
  );


/* =========================================================
   GLSL POST PROCESSING
========================================================= */

const postScene =
  new THREE.Scene();


const postCamera =
  new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    1
  );


const postUniforms = {

  tDiffuse: {
    value:
      renderTarget.texture
  },

  uTime: {
    value: 0
  },

  uAmp: {
    value: 0
  },

  uMouse: {
    value:
      new THREE.Vector2(
        .5,
        .5
      )
  },

  uScroll: {
    value: 0
  },

  uHold: {
    value: 0
  },

  uDecay: {
    value: 0
  },

  uScene: {
    value: 0
  }

};


const postMaterial =
  new THREE.ShaderMaterial({

    uniforms:
      postUniforms,


    vertexShader: `

      varying vec2 vUv;

      void main() {

        vUv = uv;

        gl_Position =
          vec4(
            position,
            1.0
          );

      }

    `,


    fragmentShader: `

      precision highp float;

      uniform sampler2D tDiffuse;

      uniform float
        uTime,
        uAmp,
        uScroll,
        uHold,
        uDecay,
        uScene;

      uniform vec2 uMouse;

      varying vec2 vUv;


      float hash(vec2 p) {

        return fract(
          sin(
            dot(
              p,
              vec2(
                127.1,
                311.7
              )
            )
          ) *
          43758.5453123
        );

      }


      void main() {

        vec2 uv =
          vUv;


        vec2 centre =
          uv - .5;


        float distanceFromCentre =
          length(
            centre
          );


        vec2 direction =
          normalize(
            centre +
            .0001
          );


        float wave =

          (
            sin(
              uv.y *
              20.0 +
              uTime *
              1.4
            )

            +

            sin(
              uv.x *
              13.0 -
              uTime *
              .8
            )

          ) *

          .0014;


        float tear =

          sin(
            (
              uv.y +
              uTime *
              .06
            ) *
            820.0
          )

          *

          .0013

          *

          (
            .3 +
            uDecay +
            uHold *
            3.0
          );


        uv +=

          direction *

          wave *

          (
            1.0 -
            distanceFromCentre
          )

          *

          (
            1.0 +
            uAmp *
            8.0 +
            uHold *
            10.0 +
            uDecay *
            3.0
          );


        uv.x +=
          tear;


        /*
          Reduced RGB separation so
          the shrine texture remains readable.
        */

        float aberration =

          .00035 +

          uAmp *
          .002 +

          uHold *
          .01 +

          uDecay *
          .002 +

          uScene *
          .0002;


        float red =

          texture2D(
            tDiffuse,

            uv +
            vec2(
              aberration,
              0.0
            )

          ).r;


        float green =

          texture2D(
            tDiffuse,
            uv
          ).g;


        float blue =

          texture2D(
            tDiffuse,

            uv -
            vec2(
              aberration,
              0.0
            )

          ).b;


        vec3 colour =
          vec3(
            red,
            green,
            blue
          );


        float noise =

          (
            hash(
              uv *
              vec2(
                900.0,
                600.0
              ) +
              uTime
            )

            -

            .5
          )

          *

          (
            .025 +
            uDecay *
            .08
          );


        colour +=
          noise;


        float vignette =

          1.0 -

          smoothstep(
            .35,
            .92,
            distanceFromCentre
          );


        colour *=

          mix(
            .50,
            1.0,
            vignette
          );


        colour *=

          1.0 +
          uAmp *
          .24;


        if (
          uHold > .5
        ) {

          float band =

            step(
              .91,

              fract(
                uv.y *
                16.0 +
                uTime *
                8.0
              )
            );


          colour =

            mix(
              colour,
              colour.bgr,
              band *
              .9
            );


          colour *=
            1.16;

        }


        gl_FragColor =

          vec4(
            colour,
            1.0
          );

      }

    `

  });


const postPlane =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      2,
      2
    ),
    postMaterial
  );


postScene.add(
  postPlane
);



/* =========================================================
   KEEP THE SHRINE INSIDE THE SCREEN
   On a tall phone screen the shrine is scaled down so it
   isn't cropped at the sides. Desktop size is unchanged.
========================================================= */

function fitShrine() {

  if (
    !shrine ||
    !shrine.userData.desktopScale
  ) {
    return;
  }

  const visibleHeight =
    2 *
    camera.position.z *
    Math.tan(
      THREE.MathUtils.degToRad(
        camera.fov / 2
      )
    );

  const visibleWidth =
    visibleHeight *
    camera.aspect;

  const fitWidth =
    visibleWidth * .85 /
    shrine.userData.sizeW;

  const fitHeight =
    visibleHeight * .8 /
    shrine.userData.sizeH;

  shrine.userData.baseScale =
    Math.min(
      shrine.userData.desktopScale,
      fitWidth,
      fitHeight
    );

  shrine.scale.setScalar(
    shrine.userData.baseScale
  );

}


/* =========================================================
   CURRENT SECTION
========================================================= */

let ultraDecay = 0;
let ultraScene = 0;


const trackedSections =
  [
    ...document.querySelectorAll(
      'section'
    )
  ];


const sceneNames = [
  'home',
  'music',
  'films',
  'live',
  'archive',
  'confess',
  'private'
];


const sectionObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(
        entry => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }


          const id =
            entry.target.id ||
            '';


          const index =
            sceneNames.indexOf(
              id
            );


          ultraScene =
            Math.max(
              0,
              index
            );

        }
      );

    },

    {
      threshold: .5
    }

  );


trackedSections.forEach(
  section => {

    sectionObserver.observe(
      section
    );

  }
);

/* =========================================================
   ANIMATION
========================================================= */

function animate() {

  requestAnimationFrame(
    animate
  );


  const now =
    performance.now();


  const time =
    now / 1000;


  const amplitude =
    getAmplitude();


  /* -----------------------------
     SHADER
  ----------------------------- */

  ultraDecay =
    Math.min(
      1,
      time / 240
    );


  postUniforms.uTime.value =
    time;


  postUniforms.uAmp.value =
    amplitude * 4;


  postUniforms.uHold.value =
    holdShader;


  postUniforms.uDecay.value =
    ultraDecay;


  postUniforms.uScene.value =
    ultraScene;


  postUniforms.uMouse.value.set(

    mouse.x /
    innerWidth,

    1 -
    mouse.y /
    innerHeight

  );


  postUniforms.uScroll.value =

    window.scrollY /

    Math.max(

      1,

      document
        .documentElement
        .scrollHeight -

      innerHeight

    );


  /* -----------------------------
     PARTICLES
  ----------------------------- */

  stars.rotation.y -=
    .00045;


  stars.rotation.x +=
    .00012;


  particleMaterial.opacity =
    .35 +
    amplitude *
    .65;


  /* -----------------------------
     SHRINE
  ----------------------------- */

  if (
    shrine &&
    shrineGroup
  ) {

    shrine.visible =
      true;


    shrineGroup.visible =
      true;


    /*
      Slow autonomous rotation.
    */

    const idleRotation =
      now *
      .00008;


    /*
      Cursor controls rotation,
      but with smooth easing.
    */

    const targetRotationY =
      mouse.nx *
      .28 +
      idleRotation;


    const targetRotationX =
      -mouse.ny *
      .50;


    shrineGroup.rotation.y +=

      (
        targetRotationY -
        shrineGroup.rotation.y
      )

      *

      .035;


    shrineGroup.rotation.x +=

      (
        targetRotationX -
        shrineGroup.rotation.x
      )

      *

      .035;


    /*
      Very slight vertical float.
    */

    shrineGroup.position.x =
      0;


    shrineGroup.position.y =

      Math.sin(
        now *
        .001
      )

      *

      .10;


    shrineGroup.position.z =
      0;


    /*
      Very subtle breathing
      with ambient audio.
    */

    if (
      shrine.userData.baseScale
    ) {

      const pulse =

        1 +

        amplitude *
        .035;


      shrine.scale.setScalar(

        shrine
          .userData
          .baseScale

        *

        pulse

      );

    }

  }


  /* -----------------------------
     CAMERA PARALLAX
  ----------------------------- */

  camera.position.x +=

    (
      mouse.nx *
      2.2 -

      camera.position.x
    )

    *

    .015;


  camera.position.y +=

    (
      -mouse.ny *
      1.4 -

      camera.position.y
    )

    *

    .015;


  camera.lookAt(
    0,
    0,
    0
  );


  /* -----------------------------
     RENDER SCENE TO TEXTURE
  ----------------------------- */

  renderer.setRenderTarget(
    renderTarget
  );


  renderer.render(
    scene,
    camera
  );


  /* -----------------------------
     RENDER GLSL OUTPUT
  ----------------------------- */

  renderer.setRenderTarget(
    null
  );


  renderer.render(
    postScene,
    postCamera
  );

}


animate();

/* =========================================================
   RESIZE
   iPhone Safari fires "resize" every time the address bar
   slides in or out while scrolling. Rebuilding the 3D canvas
   each time causes flicker, so small height-only changes
   are ignored (the canvas simply stretches slightly).
========================================================= */

let lastWidth = innerWidth;
let lastHeight = innerHeight;
let resizeTimer = null;

function applyResize() {

  const widthChanged =
    innerWidth !== lastWidth;

  const heightChange =
    Math.abs(
      innerHeight - lastHeight
    );

  if (
    !widthChanged &&
    heightChange < 160
  ) {
    return;
  }

  lastWidth = innerWidth;
  lastHeight = innerHeight;

  camera.aspect =
    innerWidth /
    innerHeight;

  camera
    .updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  const ratio =
    Math.min(
      devicePixelRatio,
      maxPixelRatio
    );

  renderTarget.setSize(
    innerWidth * ratio,
    innerHeight * ratio
  );

  fitShrine();

}

window.addEventListener(
  'resize',
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyResize, 150);
  }
);

}


initScene()
  .catch(error => {
    console.error(
      'SAINT_OS // 3D SCENE UNAVAILABLE:',
      error
    );
  });
