(function () {
  var STORAGE_USER = 'pip_user';
  var STORAGE_NEXT_ID = 'pip_next_user_id';

  function loadUser() {
    var raw = localStorage.getItem(STORAGE_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function saveUser(user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  }

  function ensureUser() {
    var user = loadUser();
    if (user && typeof user.id === 'number') {
      return user;
    }
    var nextId = parseInt(localStorage.getItem(STORAGE_NEXT_ID), 10);
    if (!nextId || nextId < 1) nextId = 1;
    user = {
      id: nextId,
      username: 'Пользователь',
      bio: '',
      avatar: null,
      publications: [],
      likes: []
    };
    localStorage.setItem(STORAGE_NEXT_ID, String(nextId + 1));
    saveUser(user);
    return user;
  }

  function initProfilePage() {
    var elBio = document.getElementById('profile-bio');
    if (!elBio) return;

    var user = ensureUser();

    var elName = document.getElementById('profile-name');
    var elId = document.getElementById('profile-id');
    var elAvatarInput = document.getElementById('avatar-input');
    var elAvatarPreview = document.getElementById('avatar-preview');
    var galleryPosts = document.getElementById('gallery-posts');
    var galleryLikes = document.getElementById('gallery-likes');
    var emptyPosts = document.getElementById('empty-posts');
    var emptyLikes = document.getElementById('empty-likes');

    if (!elName || !elId || !elAvatarInput || !elAvatarPreview || !galleryPosts || !galleryLikes || !emptyPosts || !emptyLikes) {
      return;
    }

    elName.textContent = user.username || 'Пользователь';
    elId.textContent = 'ID: ' + user.id;
    elBio.value = user.bio || '';

    var bioMeasureCtx = document.createElement('canvas').getContext('2d');

    function fitBioSize() {
      var parent = elBio.parentElement;
      if (!parent) return;
      var maxOuterW = parent.clientWidth;
      var minOuterW = 120;
      var cs = window.getComputedStyle(elBio);
      var padX =
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight) +
        parseFloat(cs.borderLeftWidth) +
        parseFloat(cs.borderRightWidth);
      var innerMax = Math.max(0, maxOuterW - padX);
      bioMeasureCtx.font = cs.font;
      var raw = elBio.value;
      var lines = raw.length ? raw.split('\n') : ['\u00a0'];
      var maxLine = 0;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var w = bioMeasureCtx.measureText(line.length ? line : ' ').width;
        if (w > maxLine) maxLine = w;
      }
      var innerW = Math.min(maxLine, innerMax);
      var outerW = Math.max(minOuterW, Math.ceil(innerW + padX));
      if (outerW > maxOuterW) outerW = maxOuterW;
      elBio.style.width = outerW + 'px';

      elBio.style.height = 'auto';
      elBio.style.height = elBio.scrollHeight + 'px';
    }
    fitBioSize();
    window.addEventListener('resize', fitBioSize);
    if (typeof ResizeObserver !== 'undefined' && elBio.parentElement) {
      new ResizeObserver(function () {
        fitBioSize();
      }).observe(elBio.parentElement);
    }

    function applyAvatar(url) {
      if (url) {
        elAvatarPreview.style.setProperty(
          '--profile-avatar-bg',
          'url("' + url.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '")'
        );
      } else {
        elAvatarPreview.style.removeProperty('--profile-avatar-bg');
      }
      elAvatarPreview.classList.toggle('profile-avatar--empty', !url);
    }
    applyAvatar(user.avatar);

    elBio.addEventListener('input', function () {
      user.bio = elBio.value;
      saveUser(user);
      fitBioSize();
    });

    elAvatarInput.addEventListener('change', function () {
      var file = elAvatarInput.files && elAvatarInput.files[0];
      if (!file || file.type.indexOf('image') !== 0) return;
      var reader = new FileReader();
      reader.onload = function () {
        user.avatar = reader.result;
        saveUser(user);
        applyAvatar(user.avatar);
      };
      reader.readAsDataURL(file);
      elAvatarInput.value = '';
    });

    function renderGallery(container, items, emptyEl) {
      container.innerHTML = '';
      if (!items || !items.length) {
        emptyEl.hidden = false;
        return;
      }
      emptyEl.hidden = true;
      items.forEach(function (src) {
        var wrap = document.createElement('div');
        wrap.className = 'profile-thumb';
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        wrap.appendChild(img);
        container.appendChild(wrap);
      });
    }

    function refreshGalleries() {
      var u = loadUser() || user;
      renderGallery(galleryPosts, u.publications || [], emptyPosts);
      renderGallery(galleryLikes, u.likes || [], emptyLikes);
    }

    refreshGalleries();
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_USER) refreshGalleries();
    });

    var tabs = document.querySelectorAll('.profile-tab');
    var panels = {
      posts: document.getElementById('panel-posts'),
      likes: document.getElementById('panel-likes')
    };

    function activateTab(name) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.classList.toggle('profile-tab--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      Object.keys(panels).forEach(function (key) {
        var p = panels[key];
        if (!p) return;
        var on = key === name;
        p.classList.toggle('profile-panel--active', on);
        p.hidden = !on;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-tab'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
  } else {
    initProfilePage();
  }
})();
