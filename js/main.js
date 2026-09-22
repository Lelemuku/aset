/* ============================================================
   Lelemuku Assets — main.js
   Berisi seluruh JS murni dari template Blogger
   Version: 20260923
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Dark Mode Toggle ---------- */
  window.darkMode = function () {
    var cur = localStorage.getItem('mode');
    var next = cur === 'darkmode' ? 'light' : 'darkmode';
    localStorage.setItem('mode', next);
    var el = document.querySelector('#mainContent');
    if (!el) return;
    if (next === 'darkmode') el.classList.add('dark-mode');
    else el.classList.remove('dark-mode');
  };

  /* ---------- List Mode Toggle ---------- */
  window.listMode = function () {
    var cur = localStorage.getItem('list');
    var next = cur === 'listmode' ? 'grid' : 'listmode';
    localStorage.setItem('list', next);
    var el = document.querySelector('#Blog00');
    if (!el) return;
    if (next === 'listmode') el.classList.add('list-mode');
    else el.classList.remove('list-mode');
  };

  /* ---------- Change Font Size ---------- */
  window.changeFont = function () {
    var x = document.getElementById('post-font');
    if (!x) return;
    if (x.classList) {
      x.classList.toggle('active');
    } else {
      var z = x.className.split(' ');
      var t = z.indexOf('active');
      if (t >= 0) z.splice(t, 1);
      else z.push('active');
      x.className = z.join(' ');
    }
  };

  /* ---------- Copy Link to Clipboard ---------- */
  window.copyFunction = function () {
    var el = document.getElementById('getlink');
    if (el) {
      el.select();
      try { document.execCommand('copy'); } catch (e) {}
    }
    var n = document.getElementById('share-notif');
    if (n) n.innerHTML = '<span>Link copied!</span>';
  };

  /* ---------- Read Time Estimator ---------- */
  function getText(el) {
    var ret = '';
    if (!el || !el.childNodes) return ret;
    var len = el.childNodes.length;
    for (var i = 0; i < len; i++) {
      var node = el.childNodes[i];
      if (node.nodeType !== 8) {
        ret += node.nodeType !== 1 ? node.nodeValue : getText(node);
      }
    }
    return ret;
  }

  function initReadTime() {
    var elBody = document.getElementById('post-body');
    if (!elBody) return;
    var words = getText(elBody);
    var count = words.split(' ').length;
    var avg = 200;
    var maincount = Math.round(count / avg);
    var rt = document.getElementById('read-time');
    if (rt) rt.innerHTML = maincount + ' minute read';
  }

  /* ---------- Strip ?m=1 from URL ---------- */
  function stripM1() {
    var uri = window.location.toString();
    if (uri.indexOf('?m=1') > 0) {
      var clean = uri.substring(0, uri.indexOf('?m=1'));
      window.history.replaceState({}, document.title, clean);
    }
  }

  /* ---------- Load More Posts (Infinite Scroll) ---------- */
  function initLoadMore() {
    var container = document.querySelector('.blog-posts');
    var btn = document.getElementById('load-more-btn');
    if (!container || !btn) return;

    var isLoading = false;
    var nextUrl = btn.getAttribute('href');
    if (!nextUrl) return;

    function show(msg, type) {
      btn.innerHTML = msg;
      btn.className = 'js-load ' + (type || 'info');
      btn.removeAttribute('href');
    }

    function load() {
      if (isLoading || !nextUrl) return;
      isLoading = true;
      btn.classList.add('loading');
      btn.innerHTML = 'Loading...';

      fetch(nextUrl)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var posts = doc.querySelectorAll('.blog-posts > .post-outer, .blog-posts > article');
          var nextLink = doc.querySelector('.blog-pager .older-link, .older-link');
          if (posts.length === 0) throw new Error('No posts');

          var existing = Array.prototype.map.call(
            container.querySelectorAll('.post-outer, article'),
            function (p) {
              var a = p.querySelector('h2 a, h3 a');
              return a ? a.href : '';
            }
          );

          Array.prototype.forEach.call(posts, function (post) {
            var a = post.querySelector('h2 a, h3 a');
            var link = a ? a.href : '';
            if (link && existing.indexOf(link) === -1) container.appendChild(post);
          });

          nextUrl = nextLink ? nextLink.href : null;
          if (!nextUrl) show('No more posts', 'loaded');
          else {
            btn.className = 'js-load';
            btn.innerHTML = 'Load more posts';
          }
        })
        .catch(function (err) {
          console.error('Infinite Scroll Error:', err);
          show('Sorry, failed to load', 'error');
        })
        .then(function () {
          isLoading = false;
          btn.classList.remove('loading');
        });
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      load();
    });

    var t;
    window.addEventListener('scroll', function () {
      if (isLoading || !nextUrl) return;
      clearTimeout(t);
      t = setTimeout(function () {
        var rect = btn.getBoundingClientRect();
        if (rect.top < window.innerHeight + 300) load();
      }, 100);
    });
  }

  /* ---------- Initialize on DOM Ready ---------- */
  function boot() {
    stripM1();

    // Apply dark mode from localStorage as early as possible
    var saved = localStorage.getItem('mode');
    var main = document.querySelector('#mainContent');
    if (main && saved === 'darkmode') main.classList.add('dark-mode');

    // Apply list mode
    var savedList = localStorage.getItem('list');
    var blog = document.querySelector('#Blog00');
    if (blog && savedList === 'listmode') blog.classList.add('list-mode');

    initReadTime();
    initLoadMore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
