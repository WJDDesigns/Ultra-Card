<?php
/**
 * Shared head chrome for Ultra Card account pages (add-preset, dashboard).
 * Expects $ucp_page_title (string) optionally set by the caller.
 *
 * @package UltraCardIntegration
 */
if (!defined('ABSPATH')) {
    exit;
}
$ucp_page_title = isset($ucp_page_title) ? $ucp_page_title : 'Ultra Card';
?>
<style>
.l-section.wpb_row{padding-top:0!important;padding-bottom:0!important}
.l-main{background:#0e1015!important}
.l-canvas,.l-main .l-section,.l-main .l-section-h{background:transparent!important}
.post_navigation,.l-section.height_small{display:none!important}
.ucp{--ucp-header-offset:140px}
body.admin-bar .ucp{--ucp-header-offset:172px}
@media (max-width:782px){body.admin-bar .ucp{--ucp-header-offset:186px}}
@media (max-width:600px){.ucp{--ucp-header-offset:120px}body.admin-bar .ucp{--ucp-header-offset:166px}}
</style>
<style id="ucp-shared-css">
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css");
.ucp{--uc-blue:#29b6f6;--uc-purple:#8017A2;--uc-pink:#ff2d78;--uc-gold:#ffc233;
  --uc-bg:#0e1015;--uc-bg2:#14171d;--uc-card:#1a1e26;--uc-line:rgba(255,255,255,.09);
  --uc-txt:#eef1f6;--uc-dim:#9aa3b2;--uc-r:14px;--uc-ok:#4ade80;--uc-warn:#fbbf24;--uc-bad:#f87171;
  background:var(--uc-bg);color:var(--uc-txt);font-family:'Open Sans',system-ui,sans-serif;
  line-height:1.55;overflow-x:clip;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
  min-height:70vh;padding-bottom:120px}
.ucp *,.ucp *::before,.ucp *::after{box-sizing:border-box}
.ucp .ucp-wrap{max-width:1240px;margin:0 auto;padding:0 24px}
.ucp h1,.ucp h2,.ucp h3{margin:0;color:#fff;line-height:1.15}
.ucp p{margin:0}
.ucp a{text-decoration:none;color:inherit}
.ucp button,.ucp input,.ucp textarea,.ucp select{font-family:inherit}
.ucp button{cursor:pointer;border:0;background:none;color:inherit}
.ucp .mdi{line-height:1;vertical-align:middle}
.ucp-hero{position:relative;padding:calc(var(--ucp-header-offset,140px) + 48px) 0 48px;overflow:hidden}
.ucp-hero-glow{position:absolute;inset:-40% -20% auto;height:130%;pointer-events:none;
  background:radial-gradient(45% 60% at 30% 20%,rgba(41,182,246,.22),transparent 70%),
             radial-gradient(45% 60% at 72% 15%,rgba(128,23,162,.3),transparent 70%)}
.ucp-eyebrow{position:relative;display:inline-flex;align-items:center;gap:9px;font-size:12.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--uc-dim);border:1px solid var(--uc-line);border-radius:999px;
  padding:6px 14px;background:rgba(255,255,255,.04)}
.ucp-pulse{width:8px;height:8px;border-radius:50%;background:var(--uc-ok);box-shadow:0 0 0 0 rgba(74,222,128,.6);animation:ucpPulse 2s infinite}
@keyframes ucpPulse{70%{box-shadow:0 0 0 9px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}
.ucp-h1{position:relative;font-size:clamp(28px,4.5vw,44px);font-weight:800;margin:16px 0 10px;letter-spacing:-.02em}
.ucp-grad-text{background:linear-gradient(92deg,var(--uc-blue),#b44ce0 55%,var(--uc-pink));-webkit-background-clip:text;background-clip:text;color:transparent}
.ucp-sub{position:relative;max-width:640px;color:var(--uc-dim);font-size:15.5px}
.ucp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:14.5px;border-radius:12px;
  padding:12px 22px;transition:transform .15s,box-shadow .15s,background .15s,opacity .15s;color:#fff;border:1px solid transparent}
.ucp-btn:hover{transform:translateY(-1px);color:#fff}
.ucp-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.ucp-btn .mdi{font-size:18px}
.ucp-btn-blue{background:linear-gradient(135deg,#1e88e5,var(--uc-blue));box-shadow:0 8px 24px rgba(41,182,246,.25)}
.ucp-btn-pro{background:linear-gradient(135deg,var(--uc-purple),var(--uc-pink));box-shadow:0 8px 24px rgba(128,23,162,.28)}
.ucp-btn-ghost{background:rgba(255,255,255,.04);border-color:var(--uc-line)}
.ucp-btn-ghost:hover{border-color:rgba(255,255,255,.28)}
.ucp-btn-danger{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.35);color:#fecaca}
.ucp-card{background:var(--uc-card);border:1px solid var(--uc-line);border-radius:var(--uc-r);padding:18px}
.ucp-field{display:flex;flex-direction:column;gap:7px;margin-bottom:16px}
.ucp-field label{font-size:13.5px;font-weight:700;color:#fff}
.ucp-field .req{color:var(--uc-pink);margin-left:3px}
.ucp-field input[type=text],.ucp-field input[type=email],.ucp-field input[type=search],
.ucp-field textarea,.ucp-field select{
  width:100%;background:rgba(0,0,0,.28);border:1px solid var(--uc-line);border-radius:10px;
  color:#fff;padding:12px 14px;font-size:15px;outline:0;transition:border-color .15s}
.ucp-field textarea{min-height:110px;resize:vertical;line-height:1.45}
.ucp-field textarea.code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;min-height:220px}
.ucp-field input:focus,.ucp-field textarea:focus,.ucp-field select:focus{border-color:var(--uc-blue)}
.ucp-field.invalid input,.ucp-field.invalid textarea,.ucp-field.invalid .ucp-cat-chips{border-color:var(--uc-bad)!important}
.ucp-hint{font-size:12.5px;color:var(--uc-dim)}
.ucp-err{font-size:12.5px;color:var(--uc-bad)}
.ucp-cat-chips{display:flex;flex-wrap:wrap;gap:8px}
.ucp-cat-chip{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;font-size:13px;font-weight:600;
  border:1px solid var(--uc-line);background:rgba(255,255,255,.03);color:var(--uc-dim);transition:all .15s}
.ucp-cat-chip:hover{color:#fff;border-color:rgba(255,255,255,.28)}
.ucp-cat-chip.active{color:#fff;border-color:var(--uc-blue);background:rgba(41,182,246,.14)}
.ucp-cat-chip .mdi{font-size:16px}
.ucp-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:700;letter-spacing:.02em}
.ucp-badge-ok{background:rgba(74,222,128,.14);color:var(--uc-ok)}
.ucp-badge-pend{background:rgba(251,191,36,.14);color:var(--uc-warn)}
.ucp-badge-warn{background:rgba(251,191,36,.14);color:var(--uc-warn)}
.ucp-badge-bad{background:rgba(248,113,113,.14);color:var(--uc-bad)}
.ucp-badge-info{background:rgba(41,182,246,.14);color:var(--uc-blue)}
.ucp-badge-pro{background:linear-gradient(135deg,rgba(128,23,162,.35),rgba(255,45,120,.25));color:#fff}
.ucp-alert{padding:12px 14px;border-radius:10px;border:1px solid var(--uc-line);background:rgba(255,255,255,.03);margin-bottom:14px;font-size:14px}
.ucp-alert-error{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);color:#fecaca}
.ucp-alert-ok{border-color:rgba(74,222,128,.35);background:rgba(74,222,128,.08);color:#bbf7d0}
.ucp-empty{text-align:center;padding:40px 16px;color:var(--uc-dim)}
.ucp-empty .mdi{font-size:42px;opacity:.5;display:block;margin-bottom:10px}
@media (prefers-reduced-motion:reduce){
  .ucp *,.ucp *::before,.ucp *::after{animation-duration:.01s!important;transition-duration:.01s!important}
}
</style>
