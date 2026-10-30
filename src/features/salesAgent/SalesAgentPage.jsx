import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, Save, RotateCcw, Send, Loader2, ImagePlus, Trash2, FileText, Video, Sparkles,
  MessageSquareText, BookOpen, Images, SlidersHorizontal, RefreshCw, CheckCircle2, AlertTriangle, Upload, Link2,
} from 'lucide-react';
import { salesAgentApi, mediaSrc } from '../../api/salesAgentApi.js';

const TABS = [
  { key: 'prompt', label: 'Sales prompt', icon: Sparkles },
  { key: 'welcome', label: 'Welcome message', icon: MessageSquareText },
  { key: 'knowledge', label: 'Product & pricing', icon: BookOpen },
  { key: 'media', label: 'Sales images', icon: Images },
  { key: 'behaviour', label: 'Behaviour', icon: SlidersHorizontal },
];

const PROFILE_LABELS = {
  language: 'Language', name: 'Name', businessName: 'Business', businessType: 'Business type', city: 'City',
  leadVolume: 'Leads / month', teamSize: 'Team size', currentProcess: 'Current process', mainChallenge: 'Challenge',
  requiredFeatures: 'Wants', pricingStatus: 'Pricing', demoInterest: 'Demo interest',
  preferredDemoDate: 'Demo date', preferredDemoTime: 'Demo time', email: 'Email',
};

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <span>
        <span className="block text-sm font-semibold text-ink-900 dark:text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-5 text-ink-500">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-300 dark:bg-ink-700'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-ink-600 dark:text-ink-300">{children}</label>;
}

/** Renders WhatsApp-style *bold* and _italic_ safely. */
function WaText({ text }) {
  const parts = String(text || '').split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  return parts.map((p, i) => {
    if (/^\*[^*]+\*$/.test(p)) return <strong key={i}>{p.slice(1, -1)}</strong>;
    if (/^_[^_]+_$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

function MediaThumb({ item, className = '' }) {
  if (item.type === 'image') {
    return <img src={mediaSrc(item.url)} alt={item.title} className={`object-cover ${className}`} loading="lazy" />;
  }
  const Icon = item.type === 'video' ? Video : FileText;
  return (
    <div className={`flex items-center justify-center bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-200 ${className}`}>
      <Icon size={28} />
    </div>
  );
}

// ───────────────────────────────── Test chat ─────────────────────────────────
function TestChat({ draft, media }) {
  const [messages, setMessages] = useState([]); // { role, text, quickReplies?, media? }
  const [profile, setProfile] = useState({});
  const [mediaSent, setMediaSent] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);

  const send = async (text) => {
    const clean = String(text || '').trim();
    if (!clean || busy) return;
    const next = [...messages, { role: 'user', text: clean }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const { data } = await salesAgentApi.testChat({
        messages: next.map((m) => ({ role: m.role, text: m.text })),
        profile,
        mediaSent,
        draft: { ...draft, media },
      });
      const reply = { role: 'model', text: data.reply, quickReplies: data.quickReplies || [], media: data.media || [] };
      setMessages((cur) => [...cur, reply]);
      setProfile(data.profile || {});
      setMediaSent((cur) => [...new Set([...cur, ...(data.media || []).map((m) => m.key)])]);
      setMeta({ model: data.model, ms: data.ms, fallback: data.usedFallback, noApiKey: data.noApiKey, stage: data.stage, leadClass: data.leadClass });
    } catch (err) {
      setError(err?.response?.data?.message || 'Test reply nahi aaya. Backend chal raha hai? Dobara try karein.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setMessages([]); setProfile({}); setMediaSent([]); setMeta(null); setError(''); };
  const lastModel = [...messages].reverse().find((m) => m.role === 'model');
  const learned = Object.entries(PROFILE_LABELS).filter(([k]) => profile[k]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-brand-950 px-4 py-3 text-white dark:border-ink-800">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-400"><Bot size={18} /></span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Test chat</p>
            <p className="text-[11px] text-brand-100/70">{busy ? 'typing…' : 'Uses your unsaved edits'}</p>
          </div>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-100 hover:bg-white/10">
          <RefreshCw size={13} /> New chat
        </button>
      </div>

      <div className="min-h-[300px] flex-1 space-y-3 overflow-y-auto bg-[#EEF3FB] xl:min-h-0 p-4 dark:bg-ink-950">
        {!messages.length && (
          <div className="mx-auto max-w-xs py-10 text-center">
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">Prospect ki tarah message bhejein</p>
            <p className="mt-1 text-xs leading-5 text-ink-500">Jaise “Hi” — agent welcome message aur language buttons ke saath shuru karega, bilkul WhatsApp ki tarah.</p>
            <button type="button" onClick={() => send('Hi')} className="btn-primary mt-4 !py-2 text-xs">Start with “Hi”</button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${m.role === 'user' ? 'rounded-tr-md bg-brand-600 text-white' : 'rounded-tl-md bg-white text-ink-800 dark:bg-ink-800 dark:text-ink-100'}`}>
              <WaText text={m.text} />
            </div>
            {m.media?.map((item) => (
              <figure key={item.key} className="mt-2 w-56 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-ink-800">
                <MediaThumb item={item} className="h-56 w-56" />
                {item.caption && <figcaption className="px-3 py-2 text-xs text-ink-600 dark:text-ink-300">{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        ))}
        {busy && (
          <div className="flex items-start"><div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm dark:bg-ink-800"><Loader2 size={16} className="animate-spin text-brand-600" /></div></div>
        )}
        <div ref={endRef} />
      </div>

      {lastModel?.quickReplies?.length > 0 && !busy && (
        <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900">
          {lastModel.quickReplies.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
              {q}
            </button>
          ))}
        </div>
      )}

      {error && <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-ink-100 p-3 dark:border-ink-800">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input-field !rounded-full" placeholder="Type as the prospect…" aria-label="Test message" />
        <button type="submit" disabled={busy || !input.trim()} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50" aria-label="Send test message">
          <Send size={16} />
        </button>
      </form>

      <div className="max-h-40 overflow-y-auto border-t border-ink-100 px-4 py-3 text-xs dark:border-ink-800">
        {meta && (
          <p className="mb-2 text-ink-500">
            {meta.noApiKey ? <span className="font-semibold text-amber-600">No Gemini key — scripted replies. Add the key in Settings.</span>
              : meta.fallback ? <span className="font-semibold text-amber-600">Gemini busy on all models — scripted reply used.</span>
              : meta.model ? <>Replied by <b className="text-ink-700 dark:text-ink-200">{meta.model}</b> in {(meta.ms / 1000).toFixed(1)}s</> : 'Welcome message (no AI call)'}
            {meta.leadClass && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 font-semibold capitalize text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">{meta.leadClass}</span>}
          </p>
        )}
        <p className="mb-1.5 font-semibold text-ink-700 dark:text-ink-200">What the agent learned</p>
        {learned.length ? (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
            {learned.map(([k, label]) => (
              <div key={k} className="min-w-0"><dt className="inline text-ink-400">{label}: </dt><dd className="inline font-medium text-ink-700 dark:text-ink-200">{profile[k]}</dd></div>
            ))}
          </dl>
        ) : <p className="text-ink-400">Nothing yet — answers fill in here as you chat.</p>}
      </div>
    </div>
  );
}

// ───────────────────────────────── Page ─────────────────────────────────
export default function SalesAgentPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [media, setMedia] = useState([]);
  const [tab, setTab] = useState('prompt');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const savedRef = useRef('');

  const apply = useCallback((payload) => {
    setData(payload);
    setDraft(payload.salesAgent);
    setMedia(payload.media.map(({ resolvedUrl, ...m }) => m));
    savedRef.current = JSON.stringify({ d: payload.salesAgent, m: payload.media.map(({ resolvedUrl, ...m }) => m) });
  }, []);

  useEffect(() => {
    salesAgentApi.get()
      .then((r) => apply(r.data))
      .catch((err) => setNotice({ type: 'error', text: err?.response?.data?.message || 'Sales agent settings load nahi ho paayi.' }))
      .finally(() => setLoading(false));
  }, [apply]);

  const dirty = useMemo(() => draft && JSON.stringify({ d: draft, m: media }) !== savedRef.current, [draft, media]);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const r = await salesAgentApi.save({ salesAgent: draft, media });
      apply(r.data);
      setNotice({ type: 'ok', text: 'Saved. The WhatsApp agent uses these changes from the next message.' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Save nahi ho paaya. Dobara try karein.' });
    } finally {
      setSaving(false);
    }
  };

  const resetField = (field) => {
    if (!data) return;
    if (field === 'media') setMedia(data.defaults.media.map(({ resolvedUrl, ...m }) => m));
    else set(field, data.defaults[field]);
    setNotice({ type: 'info', text: 'Default restored in the editor. Click “Save changes” to apply it.' });
  };

  const updateMedia = (idx, patch) => setMedia((list) => list.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  const removeMedia = (idx) => setMedia((list) => list.filter((_, i) => i !== idx));

  const uploadFor = async (file, idx = null) => {
    if (!file) return;
    const key = idx === null ? 'new' : idx;
    setUploadingKey(key);
    setNotice(null);
    try {
      const r = await salesAgentApi.upload(file);
      const { url, type, storage } = r.data;
      if (idx === null) {
        const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'New image';
        setMedia((list) => [...list, { key: `media_${Date.now().toString(36)}`, title: base, type, url, caption: '', whenToSend: '', active: true }]);
      } else {
        updateMedia(idx, { url, type });
      }
      if (storage === 'local') setNotice({ type: 'info', text: 'Uploaded to the server. Set API_PUBLIC_URL in the backend .env so WhatsApp can download it.' });
    } catch (err) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Upload nahi ho paaya.' });
    } finally {
      setUploadingKey(null);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 p-8 text-sm text-ink-500"><Loader2 size={16} className="animate-spin" /> Loading sales agent…</div>;
  }
  if (!draft) {
    return <div className="card text-sm text-red-700">{notice?.text || 'Sales agent settings could not be loaded.'}</div>;
  }

  const textArea = (field, rows, hint, mono = false) => (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-sm leading-6 text-ink-500">{hint}</p>
        <button type="button" onClick={() => resetField(field)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          <RotateCcw size={13} /> Reset to default
        </button>
      </div>
      <textarea
        value={draft[field] || ''}
        onChange={(e) => set(field, e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`input-field !rounded-xl leading-relaxed ${mono ? 'font-mono !text-[12.5px]' : ''}`}
        aria-label={field}
      />
      <p className="mt-1.5 text-right text-[11px] text-ink-400">{(draft[field] || '').length.toLocaleString()} characters</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Sales Agent</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${draft.enabled && !data.aiPaused ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'bg-amber-50 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${draft.enabled && !data.aiPaused ? 'bg-brand-600' : 'bg-amber-500'}`} />
              {draft.enabled && !data.aiPaused ? 'Replying on WhatsApp' : data.aiPaused ? 'AI paused in Settings' : 'Turned off'}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">Prompt, welcome message, pricing aur sales images yahan se badlein. Right side par test chat se turant check karein.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
          <button type="button" onClick={save} disabled={saving || !dirty} className="btn-primary gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save changes
          </button>
        </div>
      </div>

      {!data.geminiKeyConfigured && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> Gemini API key set nahi hai. Agent abhi sirf scripted questions bhejega — key Settings → AI & Business mein add karein.
        </div>
      )}
      {notice && (
        <div role="status" className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : notice.type === 'ok' ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-700'}`}>
          {notice.type === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : notice.type === 'error' ? <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> : null}
          {notice.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="min-w-0">
          <div className="flex flex-wrap gap-1 rounded-xl border border-ink-100 bg-white p-1 dark:border-ink-800 dark:bg-ink-900" role="tablist">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} role="tab" aria-selected={tab === key} type="button" onClick={() => setTab(key)}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${tab === key ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="card mt-4">
            {tab === 'prompt' && textArea('systemPrompt', 26,
              'Yeh agent ka master prompt hai — role, sales flow, objections, pricing rules. Jo likhenge, agent wahi follow karega. Language, prospect details aur image list code apne-aap jod deta hai.', true)}

            {tab === 'welcome' && (
              <>
                {textArea('welcomeMessage', 9, 'Naye prospect ko sabse pehla message. Iske neeche Hindi / Hinglish / English buttons apne-aap lagte hain. *bold* aur _italic_ WhatsApp style mein chalta hai.')}
                <div className="mt-4 rounded-2xl bg-[#EEF3FB] p-4 dark:bg-ink-950">
                  <p className="mb-2 text-xs font-semibold text-ink-500">Preview</p>
                  <div className="max-w-sm whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm dark:bg-ink-800 dark:text-ink-100"><WaText text={draft.welcomeMessage} /></div>
                  <div className="mt-2 flex max-w-sm gap-2">
                    {data.questionOptions.language.map((l) => <span key={l} className="flex-1 rounded-xl bg-white py-2 text-center text-xs font-semibold text-brand-700 shadow-sm dark:bg-ink-800 dark:text-brand-200">{l}</span>)}
                  </div>
                </div>
              </>
            )}

            {tab === 'knowledge' && textArea('knowledgeBase', 20,
              'Product facts aur approved pricing. Agent sirf yahi numbers bolega — jo yahan nahi hai, uske liye bolega ki team confirm karegi. Region (India / UAE) phone number se pata chalta hai.', true)}

            {tab === 'media' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-2xl text-sm leading-6 text-ink-500">
                    Sales baat-cheet ke beech agent yeh images bhejta hai. “Kab bhejna hai” mein simple words mein likhein — agent usi hisaab se sahi image chunega. Real product screenshots upload karke default templates replace kar sakte hain.
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => resetField('media')} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
                      <RotateCcw size={13} /> Default templates
                    </button>
                    <label className="btn-primary cursor-pointer gap-2 !py-2 text-xs">
                      {uploadingKey === 'new' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Add image / file
                      <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4" className="sr-only" onChange={(e) => { uploadFor(e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>

                {!media.length && <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">Koi image nahi hai. “Add image / file” se upload karein ya default templates wapas laayein.</p>}

                <div className="grid gap-4 2xl:grid-cols-2">
                  {media.map((m, idx) => (
                    <article key={m.key} className={`flex gap-4 rounded-2xl border p-3 ${m.active ? 'border-ink-100 dark:border-ink-800' : 'border-dashed border-ink-200 opacity-60 dark:border-ink-700'}`}>
                      <div className="relative w-28 flex-shrink-0">
                        <MediaThumb item={m} className="h-32 w-28 rounded-xl" />
                        <label className="absolute inset-x-1 bottom-1 flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-black/60 py-1 text-[10px] font-semibold text-white hover:bg-black/75">
                          {uploadingKey === idx ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />} Replace
                          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4" className="sr-only" onChange={(e) => { uploadFor(e.target.files?.[0], idx); e.target.value = ''; }} />
                        </label>
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={m.title} onChange={(e) => updateMedia(idx, { title: e.target.value })} className="input-field !py-1.5 font-semibold" aria-label="Title" />
                          <button type="button" onClick={() => removeMedia(idx)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${m.title}`}><Trash2 size={15} /></button>
                        </div>
                        <input value={m.caption} onChange={(e) => updateMedia(idx, { caption: e.target.value })} className="input-field !py-1.5 text-xs" placeholder="Caption sent with the image" aria-label="Caption" />
                        <textarea value={m.whenToSend} onChange={(e) => updateMedia(idx, { whenToSend: e.target.value })} rows={2} className="input-field !py-1.5 text-xs" placeholder="Kab bhejna hai? e.g. jab prospect follow-up ki problem bataye" aria-label="When to send" />
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <select value={m.type} onChange={(e) => updateMedia(idx, { type: e.target.value })} className="rounded-lg border border-ink-200 px-2 py-1 dark:border-ink-700 dark:bg-ink-800" aria-label="Type">
                            <option value="image">Image</option><option value="document">PDF brochure</option><option value="video">Video</option>
                          </select>
                          <label className="inline-flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
                            <input type="checkbox" checked={m.active !== false} onChange={(e) => updateMedia(idx, { active: e.target.checked })} className="rounded border-ink-300 text-brand-600" /> Active
                          </label>
                          <details className="text-ink-500">
                            <summary className="inline-flex cursor-pointer items-center gap-1"><Link2 size={11} /> URL</summary>
                            <input value={m.url} onChange={(e) => updateMedia(idx, { url: e.target.value })} className="input-field mt-1 !py-1 font-mono !text-[11px]" aria-label="Media URL" />
                          </details>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {tab === 'behaviour' && (
              <div className="space-y-3">
                <Toggle checked={draft.enabled} onChange={(v) => set('enabled', v)} label="Sales agent ON" hint="Band karne par agent WhatsApp par reply nahi karega (leads score hote rahenge)." />
                <Toggle checked={draft.useButtons} onChange={(v) => set('useButtons', v)} label="Quick-reply buttons" hint="Options ko tappable WhatsApp buttons / list ki tarah bhejta hai. Prospect ke liye reply karna aasaan." />
                <Toggle checked={draft.autoSendImages} onChange={(v) => set('autoSendImages', v)} label="Sales images automatically bhejein" hint="Pitch ke time relevant image (lead scoring, follow-ups, demo invite…) chat mein bhejta hai." />
                <div className="grid gap-4 rounded-xl border border-ink-100 p-4 sm:grid-cols-2 dark:border-ink-800">
                  <div>
                    <FieldLabel htmlFor="agentName">Agent name</FieldLabel>
                    <input id="agentName" value={draft.agentName} onChange={(e) => set('agentName', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="maxImg">Max images per reply</FieldLabel>
                    <select id="maxImg" value={draft.maxImagesPerReply} onChange={(e) => set('maxImagesPerReply', Number(e.target.value))} className="input-field">
                      {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="handoff">Team WhatsApp number for alerts (optional)</FieldLabel>
                    <input id="handoff" value={draft.handoffPhone} onChange={(e) => set('handoffPhone', e.target.value)} className="input-field" placeholder="91XXXXXXXXXX" />
                    <p className="mt-1 text-xs text-ink-500">Demo request ya “human se baat karni hai” par is number par alert jaata hai (dashboard notification hamesha aata hai).</p>
                  </div>
                </div>
                <div className="rounded-xl bg-ink-50 p-4 text-xs leading-6 text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                  <p className="font-semibold text-ink-800 dark:text-ink-100">Gemini models (auto fallback)</p>
                  <p>Agar pehla model busy ho (503 / 429), agent turant agle model par chala jaata hai: <b>{data.models.join(' → ')}</b>. Sab busy ho to bhi prospect ko scripted reply jaata hai — chat kabhi atakti nahi.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="xl:sticky xl:top-0 xl:h-[calc(100vh-8.5rem)]">
          <TestChat draft={draft} media={media} />
        </aside>
      </div>
    </div>
  );
}
