// Telegram Bot + ChatGPT-style Mini App (Single-File Cloudflare Worker)
// 100% Free Deployment on Cloudflare Workers — Mobile-Only Setup Ready

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Orvix AI</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js"></script>
  <style>
    :root {
      --bg-main: #212121;
      --bg-sidebar: #171717;
      --bg-composer: #2f2f2f;
      --bg-user-msg: #2f2f2f;
      --bg-hover: #2a2a2a;
      --bg-card: #2a2a2a;
      --border-subtle: rgba(255, 255, 255, 0.1);
      --text-primary: #ececec;
      --text-secondary: #b4b4b4;
      --text-muted: #8e8e8e;
      --accent-btn: #ffffff;
      --accent-btn-text: #000000;
      --code-bg: #0d0d0d;
      --code-header: #2f2f2f;
      --danger: #ef4444;
    }
    html.light {
      --bg-main: #ffffff;
      --bg-sidebar: #f9f9f9;
      --bg-composer: #f4f4f4;
      --bg-user-msg: #f4f4f4;
      --bg-hover: #ececec;
      --bg-card: #f4f4f4;
      --border-subtle: rgba(0, 0, 0, 0.1);
      --text-primary: #0d0d0d;
      --text-secondary: #5d5d5d;
      --text-muted: #8e8e8e;
      --accent-btn: #000000;
      --accent-btn-text: #ffffff;
      --code-bg: #1e1e1e;
      --code-header: #2d2d2d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-main);
      color: var(--text-primary);
      height: 100dvh;
      overflow: hidden;
      display: flex;
    }
    button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
    input, textarea, select { font-family: inherit; color: inherit; }

    /* Sidebar */
    .sidebar-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40;
      opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    }
    .sidebar-overlay.open { opacity: 1; pointer-events: auto; }
    .sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; width: 270px; max-width: 82vw;
      background: var(--bg-sidebar); z-index: 50;
      transform: translateX(-100%); transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex; flex-direction: column; border-right: 1px solid var(--border-subtle);
      padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
    }
    .sidebar.open { transform: translateX(0); }
    @media (min-width: 768px) {
      .sidebar { position: relative; transform: none; flex-shrink: 0; }
      .sidebar.collapsed { display: none; }
      .sidebar-overlay { display: none !important; }
    }
    .sidebar-top { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .sidebar-actions { display: flex; align-items: center; justify-content: space-between; }
    .icon-btn {
      width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: background 0.15s;
    }
    .icon-btn:hover, .icon-btn:active { background: var(--bg-hover); color: var(--text-primary); }
    .search-box {
      width: 100%; background: var(--bg-composer); border: 1px solid var(--border-subtle);
      border-radius: 10px; padding: 8px 12px; font-size: 13px; outline: none;
    }
    .sidebar-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
    .group-label {
      font-size: 11px; font-weight: 600; color: var(--text-muted);
      padding: 12px 10px 6px; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .chat-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 10px; border-radius: 8px; font-size: 14px; color: var(--text-primary);
      cursor: pointer; transition: background 0.12s; gap: 6px;
    }
    .chat-item:hover, .chat-item.active { background: var(--bg-hover); }
    .chat-item-title {
      flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .chat-item-del {
      opacity: 0.6; padding: 4px; border-radius: 4px; font-size: 12px;
    }
    .chat-item-del:hover { opacity: 1; color: var(--danger); }
    .sidebar-footer {
      padding: 10px 12px; border-top: 1px solid var(--border-subtle);
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .user-pill { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%; background: #10a37f; color: #fff;
      font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .user-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Main Area */
    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100dvh; position: relative; }
    .topbar {
      height: 52px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; padding-top: env(safe-area-inset-top);
    }
    .topbar-left { display: flex; align-items: center; gap: 4px; }
    .model-dropdown-wrap { position: relative; }
    .model-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 10px;
      font-size: 16px; font-weight: 600; color: var(--text-primary);
    }
    .model-btn:hover { background: var(--bg-hover); }
    .model-menu {
      position: absolute; top: 100%; left: 0; margin-top: 4px; width: 260px;
      background: var(--bg-composer); border: 1px solid var(--border-subtle); border-radius: 14px;
      padding: 6px; z-index: 60; box-shadow: 0 10px 30px rgba(0,0,0,0.35); display: none;
    }
    .model-menu.open { display: block; }
    .model-option {
      width: 100%; text-align: left; padding: 10px 12px; border-radius: 10px;
      display: flex; flex-direction: column; gap: 2px;
    }
    .model-option:hover, .model-option.selected { background: var(--bg-hover); }
    .model-option-name { font-size: 14px; font-weight: 600; }
    .model-option-desc { font-size: 12px; color: var(--text-secondary); }
    .topbar-right { display: flex; align-items: center; gap: 4px; }
    .temp-badge.active { color: #10a37f; background: rgba(16, 163, 127, 0.15); }

    /* Messages */
    .chat-scroll {
      flex: 1; overflow-y: auto; padding: 12px 16px 24px;
      display: flex; flex-direction: column; gap: 20px; scroll-behavior: smooth;
    }
    .chat-container { width: 100%; max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .empty-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 24px 16px; gap: 20px; max-width: 680px; margin: 0 auto; width: 100%;
    }
    .gpt-logo {
      width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--border-subtle);
      display: flex; align-items: center; justify-content: center; background: var(--bg-composer);
    }
    .empty-title { font-size: 24px; font-weight: 600; }
    .suggestions {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; max-width: 540px;
    }
    @media (max-width: 500px) { .suggestions { grid-template-columns: 1fr; } }
    .suggestion-card {
      text-align: left; padding: 12px 14px; border-radius: 14px;
      border: 1px solid var(--border-subtle); background: transparent;
      transition: background 0.15s;
    }
    .suggestion-card:hover { background: var(--bg-hover); }
    .suggestion-card strong { display: block; font-size: 13px; margin-bottom: 2px; }
    .suggestion-card span { font-size: 12px; color: var(--text-secondary); }

    .msg-row { display: flex; flex-direction: column; width: 100%; }
    .msg-row.user { align-items: flex-end; }
    .msg-bubble-user {
      background: var(--bg-user-msg); color: var(--text-primary);
      padding: 10px 16px; border-radius: 20px; max-width: 82%;
      font-size: 15px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
    }
    .msg-user-actions { display: flex; gap: 6px; margin-top: 4px; opacity: 0.7; }
    .msg-assistant-wrap { display: flex; gap: 12px; align-items: flex-start; width: 100%; }
    .assistant-avatar {
      width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border-subtle);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
      background: var(--bg-main);
    }
    .assistant-content { flex: 1; min-width: 0; font-size: 15px; line-height: 1.65; }
    .assistant-content p { margin-bottom: 12px; }
    .assistant-content p:last-child { margin-bottom: 0; }
    .assistant-content ul, .assistant-content ol { margin: 8px 0 12px 22px; }
    .assistant-content li { margin-bottom: 4px; }
    .assistant-content h1, .assistant-content h2, .assistant-content h3 { margin: 16px 0 8px; font-weight: 600; }
    .assistant-content table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; overflow-x: auto; display: block; }
    .assistant-content th, .assistant-content td { border: 1px solid var(--border-subtle); padding: 8px 10px; text-align: left; }
    .assistant-content th { background: var(--bg-composer); }
    .assistant-content blockquote { border-left: 3px solid var(--text-muted); padding-left: 12px; color: var(--text-secondary); margin: 10px 0; }
    .assistant-content code:not(pre code) {
      background: var(--bg-composer); padding: 2px 6px; border-radius: 5px; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .code-block-wrap { margin: 12px 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-subtle); background: var(--code-bg); }
    .code-block-header {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--code-header); padding: 6px 12px; font-size: 12px; color: #d4d4d4;
    }
    .copy-code-btn { font-size: 12px; color: #d4d4d4; display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; }
    .copy-code-btn:hover { background: rgba(255,255,255,0.1); }
    .code-block-wrap pre { padding: 12px; overflow-x: auto; font-size: 13px; line-height: 1.45; }
    .msg-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; color: var(--text-muted); }
    .msg-action-btn {
      padding: 5px 7px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 4px;
    }
    .msg-action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

    /* Composer */
    .composer-area {
      padding: 6px 12px calc(10px + env(safe-area-inset-bottom));
      max-width: 780px; width: 100%; margin: 0 auto; flex-shrink: 0;
    }
    .attachment-preview {
      display: none; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; padding: 0 4px;
    }
    .attachment-preview.has-items { display: flex; }
    .att-chip {
      display: flex; align-items: center; gap: 6px; background: var(--bg-composer);
      border: 1px solid var(--border-subtle); border-radius: 10px; padding: 6px 10px; font-size: 12px;
    }
    .att-chip img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
    .composer-box {
      background: var(--bg-composer); border-radius: 26px; padding: 8px 10px;
      display: flex; align-items: flex-end; gap: 6px; border: 1px solid var(--border-subtle);
    }
    .composer-input {
      flex: 1; background: transparent; border: none; outline: none; resize: none;
      font-size: 15px; line-height: 1.45; max-height: 160px; padding: 6px 4px;
    }
    .send-btn {
      width: 34px; height: 34px; border-radius: 50%; background: var(--accent-btn);
      color: var(--accent-btn-text); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity 0.15s;
    }
    .send-btn:disabled { opacity: 0.35; cursor: default; }
    .mic-btn.recording { color: var(--danger); animation: pulse 1.2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .disclaimer { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 6px; }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 80;
      display: none; align-items: center; justify-content: center; padding: 16px;
    }
    .modal-backdrop.open { display: flex; }
    .modal {
      background: var(--bg-sidebar); border: 1px solid var(--border-subtle); border-radius: 18px;
      width: 100%; max-width: 460px; max-height: 85dvh; overflow-y: auto; padding: 20px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .modal-header { display: flex; align-items: center; justify-content: space-between; font-size: 17px; font-weight: 600; }
    .field-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; display: block; }
    .field-input, .field-select, .field-textarea {
      width: 100%; background: var(--bg-composer); border: 1px solid var(--border-subtle);
      border-radius: 10px; padding: 9px 12px; font-size: 14px; outline: none;
    }
    .field-textarea { min-height: 76px; resize: vertical; }
    .btn-primary {
      background: var(--accent-btn); color: var(--accent-btn-text); padding: 10px 16px;
      border-radius: 10px; font-weight: 600; font-size: 14px;
    }
    .btn-danger {
      background: rgba(239,68,68,0.15); color: var(--danger); padding: 10px 16px;
      border-radius: 10px; font-weight: 600; font-size: 14px;
    }
    .typing-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      background: var(--text-primary); animation: pulse 1s infinite; margin-left: 4px;
    }

    /* Voice Conversation Mode Overlay */
    .voice-overlay {
      position: fixed; inset: 0; background: var(--bg-main); z-index: 90;
      display: none; flex-direction: column; align-items: center; justify-content: space-between;
      padding: calc(24px + env(safe-area-inset-top)) 20px calc(32px + env(safe-area-inset-bottom));
    }
    .voice-overlay.open { display: flex; }
    .voice-top { width: 100%; display: flex; justify-content: space-between; align-items: center; }
    .voice-status-badge { font-size: 13px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.02em; }
    .voice-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; width: 100%; max-width: 420px; text-align: center; }
    .voice-orb {
      width: 150px; height: 150px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #34d399, #059669 60%, #064e3b);
      box-shadow: 0 0 40px rgba(16, 163, 127, 0.35);
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.3s ease;
      cursor: pointer;
    }
    .voice-orb.listening { animation: orbListen 1.6s infinite ease-in-out; }
    .voice-orb.thinking { background: radial-gradient(circle at 35% 35%, #60a5fa, #2563eb 60%, #1e3a8a); box-shadow: 0 0 45px rgba(59, 130, 246, 0.45); animation: orbSpin 1.2s infinite linear; }
    .voice-orb.speaking { background: radial-gradient(circle at 35% 35%, #a7f3d0, #10a37f 60%, #065f46); animation: orbSpeak 0.6s infinite alternate ease-in-out; }
    @keyframes orbListen { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes orbSpeak { 0% { transform: scale(1); } 100% { transform: scale(1.16); } }
    @keyframes orbSpin { 0% { transform: scale(0.96) rotate(0deg); } 50% { transform: scale(1.03) rotate(180deg); } 100% { transform: scale(0.96) rotate(360deg); } }
    .voice-caption { font-size: 15px; line-height: 1.5; color: var(--text-secondary); min-height: 48px; max-height: 140px; overflow-y: auto; padding: 0 12px; }
    .voice-controls { display: flex; align-items: center; gap: 22px; }
    .voice-ctrl-btn {
      width: 56px; height: 56px; border-radius: 50%; background: var(--bg-composer);
      border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center;
      color: var(--text-primary); font-size: 18px;
    }
    .voice-ctrl-btn.end { background: #ef4444; color: #fff; border-color: transparent; }
    .voice-ctrl-btn.muted { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    :root {
      --chat-font-size: 15px;
      --app-brightness: 1;
      --brand-accent: #10a37f;
      --glass-bg: rgba(255, 255, 255, 0.06);
      --glass-border: rgba(255, 255, 255, 0.14);
    }
    html.light {
      --glass-bg: rgba(255, 255, 255, 0.72);
      --glass-border: rgba(0, 0, 0, 0.09);
    }
    body {
      filter: brightness(var(--app-brightness));
      background: radial-gradient(circle at 20% 10%, rgba(16, 163, 127, 0.14), transparent 42%),
                  radial-gradient(circle at 85% 80%, rgba(59, 130, 246, 0.12), transparent 45%),
                  var(--bg-main);
    }
    .assistant-content, .msg-bubble-user { font-size: var(--chat-font-size) !important; }
    .topbar, .composer-box, .suggestion-card, .modal {
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }
    .suggestion-card {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    }
    .composer-box {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.22);
    }
    .gpt-logo {
      width: 64px !important; height: 64px !important;
      background: linear-gradient(135deg, rgba(16,163,127,0.28), rgba(59,130,246,0.28)) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: 0 10px 30px rgba(16, 163, 127, 0.25);
      overflow: hidden;
    }
    .gpt-logo img, .assistant-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .creator-pill {
      font-size: 12px; color: var(--text-secondary); background: var(--glass-bg);
      border: 1px solid var(--glass-border); padding: 5px 12px; border-radius: 999px;
      backdrop-filter: blur(12px);
    }
    .msg-img-preview { max-width: 220px; border-radius: 12px; margin-bottom: 6px; display: block; }
  </style>
</head>
<body>
  <div id="sidebarOverlay" class="sidebar-overlay" onclick="toggleSidebar(false)"></div>
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-actions">
        <button class="icon-btn" onclick="toggleSidebar(false)" title="Close sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
        </button>
        <button class="icon-btn" onclick="newChat()" title="New chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      </div>
      <input id="searchChats" class="search-box" type="text" placeholder="Search chats..." oninput="renderSidebar()" />
    </div>
    <div id="sidebarList" class="sidebar-list"></div>
    <div class="sidebar-footer">
      <div class="user-pill">
        <div id="userAvatar" class="avatar">U</div>
        <div id="userName" class="user-name">User</div>
      </div>
      <button class="icon-btn" onclick="openSettings()" title="Settings">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
      </button>
    </div>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn" onclick="toggleSidebar()" title="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="model-dropdown-wrap">
          <button class="model-btn" onclick="toggleModelMenu(event)">
            <span id="activeModelLabel">ChatGPT 4o</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="modelMenu" class="model-menu"></div>
        </div>
      </div>
      <div class="topbar-right">
        <button id="tempChatBtn" class="icon-btn temp-badge" onclick="toggleTempChat()" title="Temporary Chat">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"><circle cx="12" cy="12" r="9"/></svg>
        </button>
        <button class="icon-btn" onclick="newChat()" title="New Chat">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
      </div>
    </header>

    <div id="chatScroll" class="chat-scroll"></div>

    <div class="composer-area">
      <div id="attachmentPreview" class="attachment-preview"></div>
      <div class="composer-box">
        <input id="fileInput" type="file" hidden accept="image/*,.txt,.md,.js,.py,.json,.csv,.html,.css" onchange="handleFiles(this.files)" />
        <button class="icon-btn" onclick="document.getElementById('fileInput').click()" title="Attach file or image">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <textarea id="promptInput" class="composer-input" rows="1" placeholder="Message Orvix AI" oninput="autoResize(this); updateSendBtn();" onkeydown="handleKey(event)"></textarea>
        <button id="micBtn" class="icon-btn mic-btn" onclick="toggleVoice()" title="Voice input">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        </button>
        <button id="voiceModeBtn" class="icon-btn" onclick="openVoiceMode()" title="Voice conversation">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="M8 7v10"/><path d="M16 7v10"/><path d="M4 10v4"/><path d="M20 10v4"/></svg>
        </button>
        <button id="sendBtn" class="send-btn" onclick="onSendOrStop()" disabled title="Send">
          <svg id="sendIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        </button>
      </div>
      <div class="disclaimer">Orvix AI • Built by Bereket • Check important info.</div>
    </div>
  </main>

  <div id="voiceOverlay" class="voice-overlay">
    <div class="voice-top">
      <span id="voiceStatusBadge" class="voice-status-badge">Voice Conversation</span>
      <button class="icon-btn" onclick="closeVoiceMode()" title="Close">✕</button>
    </div>
    <div class="voice-center">
      <div id="voiceOrb" class="voice-orb listening" onclick="onOrbTap()"></div>
      <div id="voiceCaption" class="voice-caption">Listening... Speak now</div>
    </div>
    <div style="width:100%; max-width:420px; display:flex; gap:8px; margin-bottom:12px;">
      <input id="voiceFallbackInput" class="field-input" type="text" placeholder="Or type / use keyboard mic here..." onkeydown="if(event.key===\Enter\) sendVoiceFallback()" />
      <button class="btn-primary" onclick="sendVoiceFallback()">Send</button>
    </div>
    <div class="voice-controls">
      <button id="voiceMuteBtn" class="voice-ctrl-btn" onclick="toggleVoiceMute()" title="Mute/Unmute">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
      </button>
      <button class="voice-ctrl-btn" onclick="if(window._lastVoiceAudioUrl){voiceAudio.src=window._lastVoiceAudioUrl;voiceAudio.play().catch(()=>{});}" title="Replay Voice">🔊</button>
      <button class="voice-ctrl-btn end" onclick="closeVoiceMode()" title="End Voice Mode">✕</button>
    </div>
  </div>

  <div id="settingsModal" class="modal-backdrop" onclick="if(event.target===this) closeSettings()">
    <div class="modal">
      <div class="modal-header">
        <span>Settings &amp; Custom Instructions</span>
        <button class="icon-btn" onclick="closeSettings()">✕</button>
      </div>
      <div>
        <label class="field-label">Theme</label>
        <select id="themeSelect" class="field-select" onchange="applyTheme(this.value)">
          <option value="dark">Dark (ChatGPT Default)</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div>
        <label class="field-label">Text Size (<span id="fontSizeVal">15</span>px)</label>
        <input id="fontSizeRange" type="range" min="12" max="22" value="15" style="width:100%;" oninput="applyFontSize(this.value)" />
      </div>
      <div>
        <label class="field-label">Brightness (<span id="brightnessVal">100</span>%)</label>
        <input id="brightnessRange" type="range" min="60" max="125" value="100" style="width:100%;" oninput="applyBrightness(this.value)" />
      </div>
      <div>
        <label class="field-label">Custom Logo (Upload image or paste URL)</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input id="logoUrlInput" class="field-input" type="text" placeholder="https://... or upload below" />
          <input id="logoFileInput" type="file" accept="image/*" hidden onchange="uploadLogoFile(this.files[0])" />
          <button class="btn-primary" type="button" onclick="document.getElementById('logoFileInput').click()" style="white-space:nowrap;">Upload</button>
        </div>
      </div>
      <div>
        <label class="field-label">Custom Instructions (System Prompt)</label>
        <textarea id="customInstInput" class="field-textarea" placeholder="What would you like ChatGPT to know about you or how should it respond?"></textarea>
      </div>
      <div>
        <label class="field-label">AI Provider Override (Optional — uses Bot default if blank)</label>
        <select id="providerSelect" class="field-select">
          <option value="">Use Bot Server Default</option>
          <option value="groq">Groq (Free Tier)</option>
          <option value="gemini">Google Gemini (Free Tier)</option>
          <option value="openrouter">OpenRouter (:free models)</option>
        </select>
      </div>
      <div>
        <label class="field-label">Custom API Key (Optional, saved only on your device)</label>
        <input id="apiKeyInput" class="field-input" type="password" placeholder="Leave blank to use free bot key" />
      </div>
      <div style="display:flex; gap:10px; justify-content:space-between; margin-top:4px;">
        <button class="btn-danger" onclick="clearAllChats()">Clear All Chats</button>
        <button class="btn-primary" onclick="saveSettings()">Save</button>
      </div>
    </div>
  </div>

  <script>
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if (tg) { tg.ready(); tg.expand(); }

    const MODELS = [
      { id: "openai/gpt-oss-120b", label: "ChatGPT 4o", desc: "Great for most tasks (GPT OSS 120B)", provider: "groq" },
      { id: "openai/gpt-oss-20b", label: "ChatGPT 4o-mini", desc: "Fastest for everyday answers", provider: "groq" },
      { id: "qwen/qwen3.8-27b", label: "ChatGPT o1-mini", desc: "Advanced reasoning & coding", provider: "groq" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Multimodal & fast (if Gemini key set)", provider: "gemini" },
      { id: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek V3 (Free)", desc: "Via OpenRouter free tier", provider: "openrouter" }
    ];

    let state = {
      chats: JSON.parse(localStorage.getItem("tg_gpt_chats") || "[]"),
      activeChatId: null,
      tempMode: false,
      tempMessages: [],
      model: localStorage.getItem("tg_gpt_model") || MODELS[0].id,
      theme: localStorage.getItem("tg_gpt_theme") || "dark",
      customInst: localStorage.getItem("tg_gpt_inst") || "",
      provider: localStorage.getItem("tg_gpt_provider") || "",
      apiKey: localStorage.getItem("tg_gpt_apikey") || "",
      attachments: [],
      isGenerating: false,
      abortCtrl: null
    };

    function init() {
      if (!MODELS.some(x => x.id === state.model)) { state.model = MODELS[0].id; localStorage.setItem("tg_gpt_model", state.model); }
      applyTheme(state.theme);
      applyDisplayPrefs();
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const u = tg.initDataUnsafe.user;
        const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "User";
        document.getElementById("userName").textContent = full;
        document.getElementById("userAvatar").textContent = full.charAt(0).toUpperCase();
      }
      renderModelMenu();
      renderSidebar();
      renderChat();
    }


    function getLogoHtml(sz) {
      const custom = localStorage.getItem("tg_gpt_logo") || "";
      if (custom) return '<img src="' + escapeHtml(custom) + '" alt="Orvix AI"/>';
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a4 4 0 0 1 3.5 2.1A4 4 0 0 1 20 8a4 4 0 0 1-.5 5.6A4 4 0 0 1 16 20a4 4 0 0 1-5.6.5A4 4 0 0 1 4 16a4 4 0 0 1 .5-5.6A4 4 0 0 1 8 4a4 4 0 0 1 4-2Z"/></svg>';
    }
    function applyFontSize(val) {
      document.documentElement.style.setProperty("--chat-font-size", val + "px");
      localStorage.setItem("tg_gpt_fontsize", val);
      const el = document.getElementById("fontSizeVal");
      if (el) el.textContent = val;
    }
    function applyBrightness(val) {
      document.documentElement.style.setProperty("--app-brightness", (val / 100).toFixed(2));
      localStorage.setItem("tg_gpt_brightness", val);
      const el = document.getElementById("brightnessVal");
      if (el) el.textContent = val;
    }
    function uploadLogoFile(file) {
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        document.getElementById("logoUrlInput").value = r.result;
      };
      r.readAsDataURL(file);
    }
    function applyDisplayPrefs() {
      const fs = localStorage.getItem("tg_gpt_fontsize") || "15";
      const br = localStorage.getItem("tg_gpt_brightness") || "100";
      applyFontSize(fs);
      applyBrightness(br);
      const fsR = document.getElementById("fontSizeRange");
      const brR = document.getElementById("brightnessRange");
      if (fsR) fsR.value = fs;
      if (brR) brR.value = br;
    }

    function applyTheme(t) {
      state.theme = t;
      localStorage.setItem("tg_gpt_theme", t);
      document.documentElement.classList.toggle("light", t === "light");
      document.getElementById("themeSelect").value = t;
    }

    function toggleSidebar(force) {
      const sb = document.getElementById("sidebar");
      const ov = document.getElementById("sidebarOverlay");
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        sb.classList.toggle("collapsed", force === false ? true : undefined);
      } else {
        const open = force !== undefined ? force : !sb.classList.contains("open");
        sb.classList.toggle("open", open);
        ov.classList.toggle("open", open);
      }
    }

    function renderModelMenu() {
      const m = MODELS.find(x => x.id === state.model) || MODELS[0];
      document.getElementById("activeModelLabel").textContent = m.label;
      const menu = document.getElementById("modelMenu");
      menu.innerHTML = MODELS.map(x => (
        '<button class="model-option ' + (x.id === state.model ? 'selected' : '') + '" onclick="selectModel(\\'' + x.id + '\\')">' +
          '<span class="model-option-name">' + x.label + '</span>' +
          '<span class="model-option-desc">' + x.desc + '</span>' +
        '</button>'
      )).join("");
    }

    function toggleModelMenu(e) {
      e.stopPropagation();
      document.getElementById("modelMenu").classList.toggle("open");
    }
    document.addEventListener("click", () => document.getElementById("modelMenu").classList.remove("open"));

    function selectModel(id) {
      state.model = id;
      localStorage.setItem("tg_gpt_model", id);
      renderModelMenu();
      document.getElementById("modelMenu").classList.remove("open");
    }

    function toggleTempChat() {
      state.tempMode = !state.tempMode;
      document.getElementById("tempChatBtn").classList.toggle("active", state.tempMode);
      if (state.tempMode) { state.activeChatId = null; state.tempMessages = []; }
      renderChat();
    }

    function newChat() {
      state.tempMode = false;
      state.activeChatId = null;
      state.tempMessages = [];
      document.getElementById("tempChatBtn").classList.remove("active");
      if (window.innerWidth < 768) toggleSidebar(false);
      renderSidebar();
      renderChat();
    }

    function saveChats() {
      localStorage.setItem("tg_gpt_chats", JSON.stringify(state.chats));
    }

    function getActiveMessages() {
      if (state.tempMode) return state.tempMessages;
      const c = state.chats.find(x => x.id === state.activeChatId);
      return c ? c.messages : [];
    }

    function renderSidebar() {
      const q = document.getElementById("searchChats").value.toLowerCase();
      const list = document.getElementById("sidebarList");
      const now = Date.now();
      const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], Older: [] };
      state.chats.filter(c => !q || c.title.toLowerCase().includes(q)).forEach(c => {
        const diffDays = (now - (c.updatedAt || c.createdAt || now)) / 86400000;
        if (diffDays < 1) groups.Today.push(c);
        else if (diffDays < 2) groups.Yesterday.push(c);
        else if (diffDays < 7) groups["Previous 7 Days"].push(c);
        else groups.Older.push(c);
      });
      let html = "";
      for (const [label, items] of Object.entries(groups)) {
        if (!items.length) continue;
        html += '<div class="group-label">' + label + '</div>';
        items.forEach(c => {
          html += '<div class="chat-item ' + (c.id === state.activeChatId && !state.tempMode ? 'active' : '') + '" onclick="openChat(\\'' + c.id + '\\')">' +
            '<span class="chat-item-title">' + escapeHtml(c.title) + '</span>' +
            '<button class="chat-item-del" onclick="deleteChat(event,\\'' + c.id + '\\')" title="Delete">✕</button>' +
          '</div>';
        });
      }
      list.innerHTML = html || '<div style="padding:16px;font-size:13px;color:var(--text-muted);text-align:center;">No chats yet</div>';
    }

    function openChat(id) {
      state.tempMode = false;
      state.activeChatId = id;
      document.getElementById("tempChatBtn").classList.remove("active");
      if (window.innerWidth < 768) toggleSidebar(false);
      renderSidebar();
      renderChat();
    }

    function deleteChat(e, id) {
      e.stopPropagation();
      state.chats = state.chats.filter(c => c.id !== id);
      if (state.activeChatId === id) state.activeChatId = null;
      saveChats();
      renderSidebar();
      renderChat();
    }

    function renderMarkdown(text) {
      if (typeof marked === "undefined") return escapeHtml(text).replace(/\\n/g, "<br>");
      const renderer = new marked.Renderer();
      renderer.code = function(codeObj, langArg) {
        const codeStr = typeof codeObj === "object" ? codeObj.text : codeObj;
        const lang = (typeof codeObj === "object" ? codeObj.lang : langArg) || "code";
        let highlighted = escapeHtml(codeStr);
        if (typeof hljs !== "undefined") {
          try {
            highlighted = lang && hljs.getLanguage(lang)
              ? hljs.highlight(codeStr, { language: lang }).value
              : hljs.highlightAuto(codeStr).value;
          } catch (_) {}
        }
        return '<div class="code-block-wrap">' +
          '<div class="code-block-header"><span>' + escapeHtml(lang) + '</span>' +
          '<button class="copy-code-btn" onclick="copyCode(this)">Copy code</button></div>' +
          '<pre><code>' + highlighted + '</code></pre></div>';
      };
      return marked.parse(text, { renderer, breaks: true });
    }

    window.copyCode = function(btn) {
      const code = btn.closest(".code-block-wrap").querySelector("code").innerText;
      navigator.clipboard.writeText(code);
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy code", 1500);
    };

    function renderChat() {
      const scroll = document.getElementById("chatScroll");
      const msgs = getActiveMessages();
      if (!msgs.length) {
        scroll.innerHTML =
          '<div class="empty-state">' +
            '<div class="gpt-logo">' + getLogoHtml(28) + '</div>' +
            '<div class="empty-title">' + (state.tempMode ? 'Temporary Chat' : 'Orvix AI') + '</div>' +
            '<div class="creator-pill">Liquid Glass Edition • Created by Bereket</div>' +
            '<div class="suggestions">' +
              '<button class="suggestion-card" onclick="useSuggestion(\\'Explain quantum computing in simple terms\\')"><strong>Explain a concept</strong><span>Quantum computing simply</span></button>' +
              '<button class="suggestion-card" onclick="useSuggestion(\\'Write a clean Python script to rename files in a folder\\')"><strong>Write code</strong><span>Python file organizer</span></button>' +
              '<button class="suggestion-card" onclick="useSuggestion(\\'Give me 5 creative startup ideas using AI\\')"><strong>Brainstorm ideas</strong><span>5 AI startup concepts</span></button>' +
              '<button class="suggestion-card" onclick="useSuggestion(\\'Help me draft a polite follow-up email\\')"><strong>Draft a message</strong><span>Polite follow-up email</span></button>' +
            '</div>' +
          '</div>';
        return;
      }

      let html = '<div class="chat-container">';
      msgs.forEach((m, idx) => {
        if (m.role === "user") {
          html += '<div class="msg-row user">' +
            '<div class="msg-bubble-user">' + (m.images && m.images.length ? m.images.map(im => '<img class="msg-img-preview" src="' + im + '"/>').join('') : '') + escapeHtml(m.display || m.content) + '</div>' +
            '<div class="msg-user-actions">' +
              '<button class="msg-action-btn" onclick="editMessage(' + idx + ')">Edit</button>' +
            '</div>' +
          '</div>';
        } else {
          html += '<div class="msg-row assistant">' +
            '<div class="msg-assistant-wrap">' +
              '<div class="assistant-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div>' +
              '<div class="assistant-content">' +
                (m.content ? renderMarkdown(m.content) : '<span class="typing-dot"></span>') +
                (!state.isGenerating || idx < msgs.length - 1 ? (
                  '<div class="msg-actions">' +
                    '<button class="msg-action-btn" onclick="copyMsg(' + idx + ', this)">Copy</button>' +
                    '<button class="msg-action-btn" onclick="speakMsg(' + idx + ')">Read aloud</button>' +
                    (idx === msgs.length - 1 ? '<button class="msg-action-btn" onclick="regenerate()">Regenerate</button>' : '') +
                  '</div>'
                ) : '') +
              '</div>' +
            '</div>' +
          '</div>';
        }
      });
      html += '</div>';
      scroll.innerHTML = html;
      scroll.scrollTop = scroll.scrollHeight;
    }

    function useSuggestion(text) {
      document.getElementById("promptInput").value = text;
      updateSendBtn();
      sendMessage();
    }

    function autoResize(el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }

    function updateSendBtn() {
      const val = document.getElementById("promptInput").value.trim();
      const btn = document.getElementById("sendBtn");
      const icon = document.getElementById("sendIcon");
      if (state.isGenerating) {
        btn.disabled = false;
        icon.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor" stroke="none"/>';
      } else {
        btn.disabled = !val && !state.attachments.length;
        icon.innerHTML = '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>';
      }
    }

    function handleKey(e) {
      if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 768) {
        e.preventDefault();
        if (!state.isGenerating) sendMessage();
      }
    }

    function onSendOrStop() {
      if (state.isGenerating && state.abortCtrl) {
        state.abortCtrl.abort();
      } else {
        sendMessage();
      }
    }

    function handleFiles(files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        if (file.type.startsWith("image/")) {
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const maxDim = 1024;
              let w = img.width, h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
                else { w = Math.round(w * maxDim / h); h = maxDim; }
              }
              const c = document.createElement("canvas");
              c.width = w; c.height = h;
              c.getContext("2d").drawImage(img, 0, 0, w, h);
              const compressed = c.toDataURL("image/jpeg", 0.82);
              state.attachments.push({ type: "image", name: file.name, data: compressed });
              renderAttachments(); updateSendBtn();
            };
            img.onerror = () => {
              state.attachments.push({ type: "image", name: file.name, data: reader.result });
              renderAttachments(); updateSendBtn();
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        } else {
          reader.onload = () => { state.attachments.push({ type: "text", name: file.name, data: reader.result.slice(0, 12000) }); renderAttachments(); updateSendBtn(); };
          reader.readAsText(file);
        }
      });
    }

    function renderAttachments() {
      const box = document.getElementById("attachmentPreview");
      box.classList.toggle("has-items", state.attachments.length > 0);
      box.innerHTML = state.attachments.map((a, i) => (
        '<div class="att-chip">' +
          (a.type === "image" ? '<img src="' + a.data + '"/>' : '📄') +
          '<span>' + escapeHtml(a.name) + '</span>' +
          '<button onclick="state.attachments.splice(' + i + ',1);renderAttachments();updateSendBtn();">✕</button>' +
        '</div>'
      )).join("");
    }

    async function sendMessage(overrideText, isVoiceMode) {
      const input = document.getElementById("promptInput");
      const rawText = overrideText !== undefined ? overrideText : input.value.trim();
      if (!rawText && !state.attachments.length) return;

      let fullPrompt = rawText || "Analyze this image in detail.";
      let display = rawText;
      let images = [];
      if (state.attachments.length) {
        const textFiles = state.attachments.filter(a => a.type === "text");
        const imgFiles = state.attachments.filter(a => a.type === "image");
        if (textFiles.length) {
          fullPrompt += "\\n\\n" + textFiles.map(f => "[File: " + f.name + "]\\n" + f.data).join("\\n\\n");
        }
        if (imgFiles.length) {
          images = imgFiles.map(f => f.data);
        }
        const nonImgNames = textFiles.map(a => a.name).join(", ");
        if (nonImgNames) {
          display = (rawText ? rawText + "\\n" : "") + "[Attached: " + nonImgNames + "]";
        }
      }

      if (!state.tempMode && !state.activeChatId) {
        const id = "c_" + Date.now();
        state.chats.unshift({ id, title: (rawText || "New Chat").slice(0, 40), createdAt: Date.now(), updatedAt: Date.now(), messages: [] });
        state.activeChatId = id;
      }

      const msgs = getActiveMessages();
      msgs.push({ role: "user", content: fullPrompt, display, images });
      msgs.push({ role: "assistant", content: "" });

      input.value = "";
      autoResize(input);
      state.attachments = [];
      renderAttachments();
      if (!state.tempMode) {
        const chat = state.chats.find(x => x.id === state.activeChatId);
        if (chat) chat.updatedAt = Date.now();
        saveChats();
      }
      renderSidebar();
      renderChat();
      await streamResponse(msgs, isVoiceMode);
    }

    async function streamResponse(msgs, isVoiceMode) {
      state.isGenerating = true;
      state.abortCtrl = new AbortController();
      updateSendBtn();

      const payloadMsgs = msgs.slice(0, -1).map(m => ({ role: m.role, content: m.content, images: m.images || [] }));
      const selectedModel = MODELS.find(x => x.id === state.model) || MODELS[0];
      const provider = state.provider || (state.apiKey ? selectedModel.provider : "");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": tg ? (tg.initData || "") : ""
          },
          body: JSON.stringify({
            messages: payloadMsgs,
            model: state.model,
            provider,
            apiKey: state.apiKey,
            systemPrompt: state.customInst,
            fastVoice: !!isVoiceMode
          }),
          signal: state.abortCtrl.signal
        });

        if (!res.ok) {
          const errText = await res.text();
          msgs[msgs.length - 1].content = "Error: " + errText;
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") break;
            try {
              const json = JSON.parse(data);
              const delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
              if (delta) {
                msgs[msgs.length - 1].content += delta;
                renderChat();
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          msgs[msgs.length - 1].content += "\\n\\n*(Connection interrupted)*";
        }
      } finally {
        state.isGenerating = false;
        state.abortCtrl = null;
        if (!state.tempMode) saveChats();
        updateSendBtn();
        renderChat();
      }
    }

    function editMessage(idx) {
      const msgs = getActiveMessages();
      const text = msgs[idx].content;
      msgs.splice(idx);
      document.getElementById("promptInput").value = text;
      autoResize(document.getElementById("promptInput"));
      updateSendBtn();
      renderChat();
    }

    async function regenerate() {
      if (state.isGenerating) return;
      const msgs = getActiveMessages();
      if (msgs.length < 2) return;
      msgs[msgs.length - 1].content = "";
      renderChat();
      await streamResponse(msgs);
    }

    function copyMsg(idx, btn) {
      const msgs = getActiveMessages();
      navigator.clipboard.writeText(msgs[idx].content);
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy", 1500);
    }

    function speakMsg(idx) {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(getActiveMessages()[idx].content);
      window.speechSynthesis.speak(u);
    }

    let recognition = null;
    function toggleVoice() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { alert("Voice input is not supported in this browser."); return; }
      const btn = document.getElementById("micBtn");
      if (recognition) { recognition.stop(); recognition = null; btn.classList.remove("recording"); return; }
      recognition = new SR();
      recognition.lang = "en-US";
      recognition.onresult = (e) => {
        const t = e.results[0][0].transcript;
        const inp = document.getElementById("promptInput");
        inp.value = (inp.value ? inp.value + " " : "") + t;
        autoResize(inp); updateSendBtn();
      };
      recognition.onend = () => { recognition = null; btn.classList.remove("recording"); };
      btn.classList.add("recording");
      recognition.start();
    }

    function openSettings() {
      document.getElementById("customInstInput").value = state.customInst;
      document.getElementById("providerSelect").value = state.provider;
      document.getElementById("apiKeyInput").value = state.apiKey;
      document.getElementById("logoUrlInput").value = localStorage.getItem("tg_gpt_logo") || "";
      document.getElementById("settingsModal").classList.add("open");
    }
    function closeSettings() { document.getElementById("settingsModal").classList.remove("open"); }
    function saveSettings() {
      state.customInst = document.getElementById("customInstInput").value.trim();
      state.provider = document.getElementById("providerSelect").value;
      state.apiKey = document.getElementById("apiKeyInput").value.trim();
      localStorage.setItem("tg_gpt_inst", state.customInst);
      localStorage.setItem("tg_gpt_provider", state.provider);
      localStorage.setItem("tg_gpt_apikey", state.apiKey);
      localStorage.setItem("tg_gpt_logo", document.getElementById("logoUrlInput").value.trim());
      renderChat();
      closeSettings();
    }
    function clearAllChats() {
      if (!confirm("Delete all saved chats?")) return;
      state.chats = [];
      state.activeChatId = null;
      saveChats();
      renderSidebar();
      renderChat();
      closeSettings();
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
    }


    // --- Continuous Voice Conversation Mode ---
    let voiceActive = false;
    let voiceMuted = false;
    let voiceBusy = false;
    let voiceRec = null;
    let voiceTimer = null;
    const voiceAudio = new Audio();
    let vCtx = null;

    function setVoiceUI(mode, caption) {
      const orb = document.getElementById("voiceOrb");
      const badge = document.getElementById("voiceStatusBadge");
      const cap = document.getElementById("voiceCaption");
      orb.className = "voice-orb " + mode;
      badge.textContent = mode === "listening" ? "Listening" : mode === "thinking" ? "Thinking..." : "Speaking (tap orb to interrupt)";
      if (caption !== undefined) cap.textContent = caption;
    }

    function openVoiceMode() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) { if (!vCtx) vCtx = new AC(); if (vCtx.state === "suspended") vCtx.resume(); }
        voiceAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        voiceAudio.play().catch(() => {});
      } catch (_) {}
      if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance("")); } catch (_) {}
      }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        voiceActive = true;
        document.getElementById("voiceOverlay").classList.add("open");
        setVoiceUI("listening", "Your Telegram WebView does not support auto-mic. Use your keyboard mic below or open in Chrome.");
        return;
      }
      voiceActive = true;
      voiceMuted = false;
      document.getElementById("voiceMuteBtn").classList.remove("muted");
      document.getElementById("voiceOverlay").classList.add("open");
      startVoiceTurn();
    }

    function closeVoiceMode() {
      voiceActive = false;
      voiceBusy = false;
      clearTimeout(voiceTimer);
      if (voiceRec) { try { voiceRec.abort(); } catch (_) {} voiceRec = null; }
      try { voiceAudio.pause(); voiceAudio.currentTime = 0; } catch (_) {}
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (state.abortCtrl) state.abortCtrl.abort();
      document.getElementById("voiceOverlay").classList.remove("open");
    }

    function toggleVoiceMute() {
      voiceMuted = !voiceMuted;
      document.getElementById("voiceMuteBtn").classList.toggle("muted", voiceMuted);
      if (voiceMuted) {
        if (voiceRec) { try { voiceRec.abort(); } catch (_) {} voiceRec = null; }
        setVoiceUI("listening", "Mic muted. Tap mic to resume.");
      } else {
        startVoiceTurn();
      }
    }

    function sendVoiceFallback() {
      const inp = document.getElementById("voiceFallbackInput");
      const txt = inp.value.trim();
      if (!txt) return;
      inp.value = "";
      if (voiceRec) { try { voiceRec.abort(); } catch (_) {} voiceRec = null; }
      processVoiceQuery(txt);
    }
    function onOrbTap() {
      if (!voiceAudio.paused) { voiceAudio.pause(); if (voiceActive && !voiceMuted) startVoiceTurn(); return; }
      if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (voiceActive && !voiceMuted) startVoiceTurn();
        return;
      }
      if (voiceActive && !voiceMuted && !voiceRec) {
        startVoiceTurn();
      }
    }

    function startVoiceTurn() {
      if (!voiceActive || voiceMuted) return;
      voiceBusy = false;
      setVoiceUI("listening", "Listening... Speak now");
      if (voiceRec) return;

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      voiceRec = new SR();
      voiceRec.lang = "en-US";
      voiceRec.continuous = true;
      voiceRec.interimResults = true;
      let bufferText = "";

      voiceRec.onresult = (e) => {
        if (!voiceActive || voiceMuted || voiceBusy) return;
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) bufferText += " " + e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        const preview = (bufferText + " " + interim).trim();
        if (preview) document.getElementById("voiceCaption").textContent = preview;
        clearTimeout(voiceTimer);
        if (bufferText.trim()) {
          voiceTimer = setTimeout(() => {
            const spoken = bufferText.trim();
            bufferText = "";
            if (spoken && !voiceBusy && voiceActive && !voiceMuted) {
              processVoiceQuery(spoken);
            }
          }, 450);
        }
      };

      voiceRec.onerror = (e) => {
        if (!voiceActive || voiceMuted) return;
        if (e.error !== "no-speech") {
          setVoiceUI("listening", "Tap Allow once, or tap the orb to speak.");
        }
      };

      voiceRec.onend = () => {
        voiceRec = null;
        if (voiceActive && !voiceMuted && !voiceBusy) {
          setVoiceUI("listening", "Tap the orb to speak again.");
        }
      };

      try { voiceRec.start(); } catch (_) { voiceRec = null; }
    }

    async function processVoiceQuery(spokenText) {
      voiceBusy = true;
      setVoiceUI("thinking", spokenText);
      await sendMessage(spokenText, true);
      if (!voiceActive) return;
      const msgs = getActiveMessages();
      const last = msgs[msgs.length - 1];
      const replyText = (last && last.role === "assistant" && last.content) ? last.content : "";
      if (!replyText) { startVoiceTurn(); return; }

      const cleanSpeech = replyText.replace(new RegExp("\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60", "g"), "Code block omitted.").replace(/[*_#\x60>]/g, "");
      setVoiceUI("speaking", replyText.slice(0, 260) + (replyText.length > 260 ? "..." : ""));
      let played = false;
      window._lastVoiceAudioUrl = null;
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanSpeech.slice(0, 190), apiKey: state.apiKey })
        });
        if (ttsRes.ok) {
          const buf = await ttsRes.arrayBuffer();
          if (vCtx) {
            try {
              if (vCtx.state === "suspended") await vCtx.resume();
              const audioBuf = await vCtx.decodeAudioData(buf.slice(0));
              const srcNode = vCtx.createBufferSource();
              srcNode.buffer = audioBuf;
              srcNode.playbackRate.value = 1.15;
              srcNode.connect(vCtx.destination);
              srcNode.onended = () => { if (voiceActive && !voiceMuted) startVoiceTurn(); };
              srcNode.start(0);
              played = true;
            } catch (_) {}
          }
          if (!played) {
            const blob = new Blob([buf], { type: ttsRes.headers.get("Content-Type") || "audio/wav" });
            const dataUrl = await new Promise((resolve) => {
              const fr = new FileReader();
              fr.onloadend = () => resolve(fr.result);
              fr.readAsDataURL(blob);
            });
            window._lastVoiceAudioUrl = dataUrl;
            voiceAudio.src = dataUrl;
            voiceAudio.playbackRate = 1.15;
            voiceAudio.onended = () => { if (voiceActive && !voiceMuted) startVoiceTurn(); };
            voiceAudio.onerror = () => { if (voiceActive && !voiceMuted) startVoiceTurn(); };
            await voiceAudio.play();
            played = true;
          }
        } else {
          const errTxt = await ttsRes.text();
          document.getElementById("voiceStatusBadge").textContent = "Voice Err: " + errTxt.slice(0, 60);
        }
      } catch (e) {
        document.getElementById("voiceStatusBadge").textContent = "Audio Err: " + (e.message || "blocked").slice(0, 50);
      }
      if (!played) {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(cleanSpeech);
          utter.onend = () => { if (voiceActive && !voiceMuted) startVoiceTurn(); };
          utter.onerror = () => { if (voiceActive && !voiceMuted) startVoiceTurn(); };
          window.speechSynthesis.speak(utter);
        } else {
          setTimeout(() => { if (voiceActive && !voiceMuted) startVoiceTurn(); }, 2500);
        }
      }
    }

    init();
  </script>
</body>
</html>`;

// Lightweight per-isolate bot conversation memory for direct Telegram chat
const botMemory = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, provider: env.AI_PROVIDER || "groq" });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleMiniAppChat(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/tts") {
      return handleTTS(request, env);
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      return handleTelegramWebhook(request, env, url.origin);
    }

    return new Response("Not Found", { status: 404 });
  }
};

async function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return false;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => k + "=" + v)
    .join("\n");

  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw", enc.encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const secret = await crypto.subtle.sign("HMAC", secretKey, enc.encode(botToken));
  const checkKey = await crypto.subtle.importKey(
    "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", checkKey, enc.encode(dataCheckString));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === hash;
}

async function handleMiniAppChat(request, env) {
  try {
    const body = await request.json();
    const initData = request.headers.get("X-Telegram-Init-Data") || "";
    if (env.STRICT_TELEGRAM_AUTH === "true" && env.BOT_TOKEN) {
      const valid = await verifyTelegramInitData(initData, env.BOT_TOKEN);
      if (!valid) return new Response("Unauthorized Telegram Mini App session", { status: 401 });
    }

    const provider = (body.provider || env.AI_PROVIDER || "groq").toLowerCase();
    const apiKey = body.apiKey || env.AI_API_KEY;
    if (!apiKey) {
      return new Response("Missing AI_API_KEY. Set it in Cloudflare Worker Variables or Mini App Settings.", { status: 400 });
    }

    const voiceNote = body.fastVoice ? " Keep your answer very brief (1 to 2 short spoken sentences)." : "";
    const systemPrompt = (body.systemPrompt || "You are Orvix AI, a helpful, concise, and accurate AI assistant created by Bereket Tesfaye. Only when the user asks who created, built, or owns you (or asks about Bereket), share that you were created by Bereket Tesfaye, a Grade 11 (Section B) student, and recommend reaching him on Telegram (@orvix16) or WhatsApp/Phone (0960934894).") + voiceNote;
    const rawMsgs = body.messages || [];
    const hasImages = rawMsgs.some(m => m.images && m.images.length > 0);
    const messages = [{ role: "system", content: systemPrompt }, ...rawMsgs.map(m => {
      if (m.images && m.images.length > 0) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content || "Analyze this image." },
            ...m.images.map(url => ({ type: "image_url", image_url: { url } }))
          ]
        };
      }
      return { role: m.role, content: m.content };
    })];
    let model = (body.model || env.DEFAULT_MODEL || "openai/gpt-oss-120b").trim();
    if (!body.apiKey && provider === "groq" && (model.includes("gemini") || model.includes("deepseek") || model.includes("llama-3."))) {
      model = (env.DEFAULT_MODEL || "openai/gpt-oss-120b").trim();
    }
    if (body.fastVoice && provider === "groq" && !hasImages) {
      model = "openai/gpt-oss-20b";
    }
    if (hasImages && provider === "groq") {
      model = "qwen/qwen3.8-27b";
    }

    if (provider === "gemini") {
      return streamGemini(apiKey, model.includes("gemini") ? model : "gemini-2.5-flash", messages);
    }

    const endpoint = provider === "openrouter"
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: body.fastVoice ? 180 : undefined })
    });

    if (!upstream.ok) {
      return new Response(await upstream.text(), { status: upstream.status });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
      }
    });
  } catch (err) {
    return new Response("Server error: " + err.message, { status: 500 });
  }
}


async function handleTTS(request, env) {
  try {
    const { text, apiKey, voice } = await request.json();
    const key = apiKey || env.AI_API_KEY;
    const clean = String(text || "").replace(/\s+/g, " ").slice(0, 190).trim();
    if (!clean) return new Response("Empty text", { status: 400 });

    let groqErr = "";
    // 1. Try Groq Orpheus TTS first (if key present)
    if (key) {
      try {
        const upstream = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key
          },
          body: JSON.stringify({
            model: "canopylabs/orpheus-v1-english",
            voice: voice || "troy",
            input: clean,
            response_format: "wav"
          })
        });
        if (upstream.ok) {
          return new Response(upstream.body, {
            headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" }
          });
        } else {
          groqErr = "Groq " + upstream.status + ": " + (await upstream.text()).slice(0, 120);
        }
      } catch (e) { groqErr = e.message; }
    }

    // 2. Fallback to Google Translate TTS (no key or terms required)
    const gtUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" + encodeURIComponent(clean);
    const gtRes = await fetch(gtUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (gtRes.ok) {
      return new Response(gtRes.body, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
      });
    }

    return new Response("TTS failed: " + (groqErr || "blocked"), { status: 502 });
  } catch (err) {
    return new Response("TTS error: " + err.message, { status: 500 });
  }
}

async function streamGemini(apiKey, model, messages) {
  const sys = messages.find(m => m.role === "system")?.content || "";
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":streamGenerateContent?alt=sse&key=" + apiKey;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: sys ? { parts: [{ text: sys }] } : undefined,
      contents
    })
  });

  if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  (async () => {
    const reader = upstream.body.getReader();
    let buf = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const j = JSON.parse(line.slice(5).trim());
            const txt = j.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
              const chunk = JSON.stringify({ choices: [{ delta: { content: txt } }] });
              await writer.write(encoder.encode("data: " + chunk + "\n\n"));
            }
          } catch (_) {}
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
}

async function handleTelegramWebhook(request, env, origin) {
  if (!env.BOT_TOKEN) return new Response("BOT_TOKEN missing", { status: 500 });
  const update = await request.json();
  const msg = update.message;
  if (!msg || !msg.text) return new Response("OK");

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text === "/start") {
    await tgCall(env.BOT_TOKEN, "setChatMenuButton", {
      chat_id: chatId,
      menu_button: { type: "web_app", text: "ChatGPT", web_app: { url: origin } }
    });
    await tgCall(env.BOT_TOKEN, "sendMessage", {
      chat_id: chatId,
      text: "Welcome to *ChatGPT Mini App*!\n\nTap the button below to launch the full ChatGPT interface, or just send me a message right here.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Open ChatGPT", web_app: { url: origin } }]]
      }
    });
    return new Response("OK");
  }

  if (text === "/new") {
    botMemory.delete(chatId);
    await tgCall(env.BOT_TOKEN, "sendMessage", { chat_id: chatId, text: "Started a fresh conversation." });
    return new Response("OK");
  }

  if (text === "/help") {
    await tgCall(env.BOT_TOKEN, "sendMessage", {
      chat_id: chatId,
      text: "/start - Open ChatGPT Mini App\n/new - Reset chat history\nOr type any question directly!"
    });
    return new Response("OK");
  }

  await tgCall(env.BOT_TOKEN, "sendChatAction", { chat_id: chatId, action: "typing" });

  const history = botMemory.get(chatId) || [];
  history.push({ role: "user", content: text });
  if (history.length > 12) history.splice(0, history.length - 12);

  const reply = await askBotAI(env, history);
  history.push({ role: "assistant", content: reply });
  botMemory.set(chatId, history);

  for (let i = 0; i < reply.length; i += 4000) {
    await tgCall(env.BOT_TOKEN, "sendMessage", {
      chat_id: chatId,
      text: reply.slice(i, i + 4000)
    });
  }
  return new Response("OK");
}

async function askBotAI(env, history) {
  const sysMsg = { role: "system", content: "You are Orvix AI, a helpful, concise, and accurate AI assistant created by Bereket Tesfaye. Only when the user asks who created, built, or owns you (or asks about Bereket), share that you were created by Bereket Tesfaye, a Grade 11 (Section B) student, and recommend reaching him on Telegram (@orvix16) or WhatsApp/Phone (0960934894)." };
  history = [sysMsg, ...history];
  if (!env.AI_API_KEY) return "Please set AI_API_KEY in your Cloudflare Worker settings.";
  const provider = (env.AI_PROVIDER || "groq").toLowerCase();
  const model = (env.DEFAULT_MODEL || (provider === "gemini" ? "gemini-2.5-flash" : "openai/gpt-oss-120b")).trim();

  if (provider === "gemini") {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + env.AI_API_KEY;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }))
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  }

  const endpoint = provider === "openrouter"
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + env.AI_API_KEY
    },
    body: JSON.stringify({ model, messages: history })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || data.error?.message || "No response from AI.";
}

async function tgCall(token, method, payload) {
  return fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
