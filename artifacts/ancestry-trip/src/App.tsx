import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, Check, ChevronRight, Menu, Printer, Send, ShieldCheck, X } from 'lucide-react';
import {
  useCreateCheckout,
  useCreateSupportTicket,
  useCreateTripPreview,
  useGetAdminSummary,
  useGetExampleTrip,
  useGetReport,
  useListArticles,
  getGetReportQueryKey,
} from '@workspace/api-client-react';
import type { CheckoutInputProduct, TripPreview, TripPreviewInput } from '@workspace/api-client-react';

const nav = [
  ['/how-it-works', 'How it works'],
  ['/example', 'Example journey'],
  ['/pricing', 'Pricing'],
  ['/faq', 'FAQ'],
] as const;
const queryClient = new QueryClient();

function Brand() {
  return <Link href="/" className="brand" data-testid="link-brand"><span className="brand-mark" aria-hidden="true" /><span className="brand-name">Ancestry<em>Trip</em></span></Link>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main navigation">
        {nav.map(([href, label]) => <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
        <Link href="/about" data-testid="link-nav-about">Our approach</Link>
      </nav>
      <div className="header-actions">
        <Link href="/create" className="button button-primary" data-testid="link-header-create">Start with a clue <ArrowRight size={15} /></Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{open ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Brand /><p className="footer-copy">A thoughtful starting point for journeys shaped by family history, imperfect records, and the places that remain.</p></div>
      <div className="footer-links"><strong>Explore</strong><Link href="/create">Build a trip</Link><Link href="/example">See an example</Link><Link href="/pricing">Plans</Link><Link href="/how-it-works">Our method</Link></div>
      <div className="footer-links"><strong>Good to know</strong><Link href="/about">About AncestryTrip</Link><Link href="/faq">Questions</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} AncestryTrip</span><span>Made for the curious branches of every family tree.</span></div>
  </footer>;
}

function Layout({ children }: { children: ReactNode }) {
  return <div className="app-shell"><Header />{children}<Footer /></div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="page-intro"><div className="container"><div className="eyebrow">{eyebrow}</div><h1 className="display">{title}</h1><p>{copy}</p></div></section>;
}

function MapCard() {
  return <div className="map-card" aria-label="Illustrated route from a family clue to a destination">
    <div className="map-card-content">
      <div className="eyebrow">Field note / 04.17.1928</div>
      <div className="map-route">
        <svg viewBox="0 0 400 280" fill="none" aria-hidden="true">
          <path d="M26 208 C85 197 83 129 143 152 S216 220 250 149 S313 74 374 46" stroke="#bd6a46" strokeWidth="2" strokeDasharray="5 8" />
          <circle cx="26" cy="208" r="7" fill="#1f565b" /><circle cx="143" cy="152" r="7" fill="#1f565b" /><circle cx="250" cy="149" r="7" fill="#1f565b" /><circle cx="374" cy="46" r="9" fill="#bd6a46" />
          <path d="M26 242h89M26 248h50M290 90l38-22M328 68l-5 14M328 68l-13 3" stroke="#1f565b" strokeWidth="1" opacity=".6" />
        </svg>
      </div>
      <div className="map-caption"><div><small>Tracing</small><strong>O'Rourke / Galway</strong></div><div className="mono">53°N 9°W</div></div>
    </div>
  </div>;
}

function Home() {
  return <Layout>
    <>
      <main>
        <section className="hero"><div className="container hero-grid">
          <div><div className="eyebrow">A beginning, not a verdict</div><h1 className="display">Your family left clues. Start there.</h1><p className="hero-copy">AncestryTrip turns the names, dates, and half-remembered places in your family story into a considered travel brief — with context, gentle questions, and room for what you do not yet know.</p><div className="hero-actions"><Link href="/create" className="button button-light" data-testid="link-hero-create">Build a free preview <ArrowRight size={16} /></Link><Link href="/example" className="button button-ghost" style={{ color: 'hsl(39 38% 93%)', borderColor: 'hsl(39 38% 93% / .4)' }} data-testid="link-hero-example">Read a real example</Link></div><div className="hero-meta"><div><strong>3 min</strong> to begin</div><div><strong>$0</strong> for your first brief</div><div><strong>100%</strong> yours to keep</div></div></div>
          <MapCard />
        </div></section>
        <section className="section"><div className="container"><div className="section-heading"><div className="eyebrow">Not a search result</div><h2 className="display">A travel idea with a little more gravity.</h2><p>We help you move from “maybe they were from here” to a day you can actually imagine walking through. It is research-aware, beautifully edited, and honest about the gaps.</p></div><div className="three-column">
          <div><span className="feature-number">01 / Gather</span><h3>Begin with the fragment</h3><p>A surname in a ledger. A town written on the back of a photograph. Tell us what you have, even if it is incomplete.</p></div>
          <div><span className="feature-number">02 / Interpret</span><h3>Read between the records</h3><p>We connect your clues to places, historical context, and questions worth carrying into an archive or a conversation.</p></div>
          <div><span className="feature-number">03 / Go gently</span><h3>Make room for discovery</h3><p>Get a route that leaves space for the unexpected — because an ancestor’s life rarely fits neatly into an itinerary.</p></div>
        </div></div></section>
        <section className="quote-band"><div className="container"><blockquote className="serif">“The best heritage trip is not a hunt for a perfect answer. It is a way of standing closer to the question.”</blockquote><cite>AncestryTrip field note</cite></div></section>
        <section className="section section-tint"><div className="container"><div className="article-grid"><div className="article-card large"><div><div className="eyebrow">A small invitation</div><h3 className="serif">What would you follow if you had one week?</h3><p>Give us a place, a name, and the shape of the trip you want. Your free preview arrives with one sample day, a few promising places, and a clearer next step.</p></div><div><Link href="/create" className="button button-light" data-testid="link-home-bottom-create">Follow the clue <ChevronRight size={16} /></Link></div></div><div className="article-card"><div><div className="eyebrow">Our promise</div><h3 className="serif">Useful before it is certain.</h3><p>We never present an inference as a fact. Confidence levels and source trails stay visible, so your curiosity stays yours.</p></div><ShieldCheck size={28} color="hsl(24 63% 55%)" /></div></div></div></section>
      </main>
    </>
  </Layout>;
}

type FormState = { country: string; region: string; city: string; surname: string; firstName: string; birthYear: string; deathYear: string; destination: string; tripLength: string; budget: string; interests: string[] };
const initialForm: FormState = { country: '', region: '', city: '', surname: '', firstName: '', birthYear: '', deathYear: '', destination: '', tripLength: '5', budget: 'comfortable', interests: ['family history'] };
const interestOptions = ['family history', 'architecture', 'food & markets', 'landscape', 'archives & museums', 'living traditions'];

function Create() {
  const [, setLocation] = useLocation();
  const createPreview = useCreateTripPreview();
  const [form, setForm] = useState<FormState>(initialForm);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggleInterest = (value: string) => setForm((current) => ({ ...current, interests: current.interests.includes(value) ? current.interests.filter((item) => item !== value) : [...current.interests, value] }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.country.trim() || !form.destination.trim() || form.interests.length === 0) return;
    const payload: TripPreviewInput = { country: form.country.trim(), region: form.region || null, city: form.city || null, surname: form.surname || null, firstName: form.firstName || null, birthYear: form.birthYear ? Number(form.birthYear) : null, deathYear: form.deathYear ? Number(form.deathYear) : null, destination: form.destination.trim(), tripLength: Number(form.tripLength), budget: form.budget, interests: form.interests };
    createPreview.mutate({ data: payload }, { onSuccess: (preview) => { sessionStorage.setItem('ancestry-trip-preview', JSON.stringify(preview)); setLocation('/preview'); } });
  };
  return <Layout><main><PageIntro eyebrow="The first page of the journey" title="Give us the clues you have." copy="No genealogy degree required. Start with the details that feel most alive — and tell us what kind of travel would make the story worth following." /><section className="section"><div className="container split-layout"><form className="form-card" onSubmit={submit} data-testid="form-create-trip"><h2 className="serif">Your family thread</h2><p className="muted" style={{ marginTop: 0, marginBottom: 28 }}>A little is enough. You can leave anything blank.</p>{createPreview.isError && <div className="form-error" role="alert" data-testid="status-create-error">We could not make that preview just now. Please check the required fields and try again.</div>}<div className="form-grid">
    <div className="field wide"><label htmlFor="country">Country of origin *</label><input id="country" value={form.country} onChange={(e) => update('country', e.target.value)} placeholder="Ireland, Japan, Ghana…" required data-testid="input-country" /></div>
    <div className="field"><label htmlFor="region">Region or county</label><input id="region" value={form.region} onChange={(e) => update('region', e.target.value)} placeholder="Connacht" data-testid="input-region" /></div>
    <div className="field"><label htmlFor="city">Town or city</label><input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Galway" data-testid="input-city" /></div>
    <div className="field"><label htmlFor="surname">Surname</label><input id="surname" value={form.surname} onChange={(e) => update('surname', e.target.value)} placeholder="O'Rourke" data-testid="input-surname" /></div>
    <div className="field"><label htmlFor="firstName">First name</label><input id="firstName" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Nora" data-testid="input-first-name" /></div>
    <div className="field"><label htmlFor="birthYear">Birth year</label><input id="birthYear" type="number" min="1600" max="2025" value={form.birthYear} onChange={(e) => update('birthYear', e.target.value)} placeholder="1884" data-testid="input-birth-year" /></div>
    <div className="field"><label htmlFor="deathYear">Death year</label><input id="deathYear" type="number" min="1600" max="2025" value={form.deathYear} onChange={(e) => update('deathYear', e.target.value)} placeholder="1961" data-testid="input-death-year" /></div>
    <div className="field wide"><label htmlFor="destination">Where would you like to go? *</label><input id="destination" value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Galway and the west coast" required data-testid="input-destination" /><span className="field-note">This can be specific or aspirational. “Somewhere in northern Italy” is welcome.</span></div>
    <div className="field"><label htmlFor="tripLength">Trip length</label><select id="tripLength" value={form.tripLength} onChange={(e) => update('tripLength', e.target.value)} data-testid="select-trip-length"><option value="3">3 days</option><option value="5">5 days</option><option value="7">7 days</option><option value="10">10 days</option></select></div>
    <div className="field"><label htmlFor="budget">Travel rhythm</label><select id="budget" value={form.budget} onChange={(e) => update('budget', e.target.value)} data-testid="select-budget"><option value="curious">Curious and simple</option><option value="comfortable">Comfortable</option><option value="considered">Considered splurge</option></select></div>
    <div className="field wide"><label>What should the trip make room for? *</label><div className="check-list">{interestOptions.map((interest) => <label className="check-option" key={interest}><input type="checkbox" checked={form.interests.includes(interest)} onChange={() => toggleInterest(interest)} data-testid={`checkbox-interest-${interest.replaceAll(' ', '-')}`} /><span>{interest}</span></label>)}</div></div>
  </div><div className="form-footer"><span className="field-note">Your preview is private and free.</span><button className="button button-primary" type="submit" disabled={createPreview.isPending} data-testid="button-generate-preview">{createPreview.isPending ? 'Reading the clues…' : <>Generate my preview <ArrowRight size={15} /></>}</button></div></form><aside className="side-note"><div className="eyebrow">A note on uncertainty</div><h3 className="serif">The blank spaces matter.</h3><p>Family stories are full of crossed-out names, changed borders, and details carried by memory. AncestryTrip treats those gaps as invitations for research, not problems to hide.</p><ul><li><Check size={15} style={{ verticalAlign: 'middle', marginRight: 8 }} />No account needed to begin</li><li><Check size={15} style={{ verticalAlign: 'middle', marginRight: 8 }} />No claim stronger than its source</li><li><Check size={15} style={{ verticalAlign: 'middle', marginRight: 8 }} />A useful next step, every time</li></ul></aside></div></section></main></Layout>;
}

function Preview() {
  const [, setLocation] = useLocation();
  const [preview, setPreview] = useState<TripPreview | null>(null);
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState<CheckoutInputProduct>('heritage-trip');
  const [checkoutDone, setCheckoutDone] = useState(false);
  const checkout = useCreateCheckout();
  useEffect(() => { const stored = sessionStorage.getItem('ancestry-trip-preview'); if (stored) { try { setPreview(JSON.parse(stored) as TripPreview); } catch { sessionStorage.removeItem('ancestry-trip-preview'); } } }, []);
  if (!preview) return <Layout><main className="not-found"><div className="eyebrow">No trip in progress</div><h1 className="display">Start with a clue.</h1><p className="body-copy">Your preview lives in this browser while you explore it.</p><Link href="/create" className="button button-primary" data-testid="link-preview-empty-create">Build my preview <ArrowRight size={15} /></Link></main></Layout>;
   const submitCheckout = (event: FormEvent) => { event.preventDefault(); if (!email.includes('@')) return; checkout.mutate({ data: { previewId: preview.id, product, email } }, { onSuccess: (session) => { if (session.demoMode) setLocation(session.checkoutUrl); else window.location.assign(session.checkoutUrl); } }); };
  return <Layout><main><section className="preview-header"><div className="container"><div className="eyebrow">Your free field brief / {preview.tripLength} days</div><h1 className="display" data-testid="text-preview-title">{preview.title}</h1><p>{preview.locationLabel} · Prepared {new Date(preview.generatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p></div></section><section className="container preview-layout"><div className="preview-main"><div className="preview-section"><div className="eyebrow">The thread</div><h2 className="serif">What the clues suggest</h2><p data-testid="text-preview-interpretation">{preview.interpretation}</p></div><div className="preview-section"><div className="eyebrow">Places to begin</div><h2 className="serif">A first sense of place</h2><div className="place-list">{preview.places.map((place, index) => <div className="place-row" key={`${place.name}-${index}`} data-testid={`card-place-${index}`}><div><div className="place-type">{place.type}</div><h3>{place.name}</h3></div><p>{place.description}</p><div className="certainty">{place.certainty}</div></div>)}</div></div><div className="preview-section"><div className="eyebrow">A sample day</div><h2 className="serif">Walk it slowly</h2><div className="day-list">{preview.sampleDay.map((item, index) => <div className="day-item" key={`${item.time}-${index}`}><div className="day-time">{item.time} / {item.category}</div><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></div><div className="preview-section"><div className="eyebrow">Context</div><h2 className="serif">The wider story</h2><p>{preview.historicalContext}</p><h3 className="serif" style={{ fontSize: 27, marginBottom: 8 }}>Research to carry with you</h3><ul className="body-copy">{preview.researchChecklist.map((item, index) => <li key={index}>{item}</li>)}</ul><p className="disclaimer">{preview.disclaimer}</p></div></div><aside className="preview-rail"><div className="upgrade-card"><div className="eyebrow" style={{ color: 'hsl(39 38% 96% / .8)' }}>Keep going</div><h2 className="serif">Turn the thread into a trip.</h2><p>Choose a fuller, printable report with day-by-day pacing, deeper context, and a research plan built around this particular family story.</p><div className="price-row"><span className="price">{product === 'heritage-trip' ? '$19' : '$49'}</span><span>one-time, yours to keep</span></div><div style={{ display: 'flex', gap: 5, marginBottom: 16 }}><button className="button" style={{ flex: 1, background: product === 'heritage-trip' ? 'hsl(39 38% 96%)' : 'transparent', color: 'hsl(191 43% 29%)', borderColor: 'hsl(39 38% 96% / .45)', fontSize: 11 }} onClick={() => setProduct('heritage-trip')} data-testid="button-product-heritage">Heritage / $19</button><button className="button" style={{ flex: 1, background: product === 'deep-heritage-trip' ? 'hsl(39 38% 96%)' : 'transparent', color: 'hsl(191 43% 29%)', borderColor: 'hsl(39 38% 96% / .45)', fontSize: 11 }} onClick={() => setProduct('deep-heritage-trip')} data-testid="button-product-deep">Deep / $49</button></div>{checkoutDone ? <div className="form-success" style={{ background: 'hsl(39 38% 96% / .8)', border: 0 }} data-testid="status-checkout-success">Your demo report is ready. We will send the private link to {email}.</div> : <form onSubmit={submitCheckout}><div className="field"><label htmlFor="checkout-email">Where should we send it?</label><input id="checkout-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-checkout-email" /></div><button className="button button-primary button-full" style={{ marginTop: 12 }} disabled={checkout.isPending} data-testid="button-checkout">{checkout.isPending ? 'Preparing your report…' : 'Continue securely'}</button></form>}<div className="upgrade-note">No subscription. No hidden renewal.</div></div><p className="body-copy" style={{ fontSize: 12, marginTop: 18 }}>Want to change the clues? <button className="text-button" onClick={() => setLocation('/create')} data-testid="button-edit-clues">Start again</button></p></aside></section></main></Layout>;
}

function HowItWorks() {
  return <Layout><main><PageIntro eyebrow="The method" title="A little research. A lot of respect." copy="AncestryTrip is designed for the space between a family story and a real place. We help you move through that space without flattening it." /><section className="section"><div className="container"><div className="steps">{[['01', 'Bring what you know', 'A few names, a country, a date, or a story told over Sunday lunch. We start with the evidence you actually have.', 'The fragments are enough.'], ['02', 'We map the possibilities', 'Your clues become a travel-shaped interpretation: places connected to the story, context for the era, and details to investigate next.', 'Sources stay visible.'], ['03', 'You choose the depth', 'A free preview gives you the first page. A paid report adds pacing, practical shape, and a deeper research checklist.', 'One-time purchase.'], ['04', 'You go with better questions', 'The destination is not a final answer. It is a new vantage point — somewhere to listen, look, and ask with care.', 'Curiosity over certainty.']].map(([num, title, body, aside]) => <div className="step" key={num}><div className="step-no">{num}</div><div><h3>{title}</h3><p>{body}</p></div><div className="step-aside">{aside}</div></div>)}</div></div></section><section className="section section-tint"><div className="container"><div className="trust-strip"><div><strong>Research-aware</strong>We distinguish a likely connection from a confirmed record.</div><div><strong>Human-sized</strong>Short, useful briefs instead of an avalanche of possible ancestors.</div><div><strong>Private by default</strong>Your family clues are used to make your trip, not to build a public tree.</div></div></div></section></main></Layout>;
}

function Example() {
  const { data, isLoading, isError } = useGetExampleTrip();
  return <Layout><main><PageIntro eyebrow="Featured journey" title="A week in the west of Ireland." copy="A fictionalized example built from a very real kind of clue: a surname, an old departure story, and the feeling that there is more to find." /><section className="section"><div className="container">{isLoading ? <Loading /> : isError || !data ? <ErrorState label="The featured journey is resting. Try again shortly." /> : <ExampleTrip preview={data} />}</div></section></main></Layout>;
}

function ExampleTrip({ preview }: { preview: TripPreview }) {
  return <div className="split-layout"><div><div className="eyebrow">The O'Rourke thread</div><h2 className="display" style={{ fontSize: 'clamp(45px, 6vw, 78px)', margin: '15px 0 25px' }}>{preview.title}</h2><p className="body-copy">{preview.interpretation}</p><div className="preview-section"><div className="eyebrow">A place to stand</div><h2 className="serif">{preview.places[0]?.name}</h2><p>{preview.places[0]?.description}</p></div><Link href="/create" className="button button-primary" data-testid="link-example-create">Make my own preview <ArrowRight size={15} /></Link></div><div className="map-card" style={{ transform: 'rotate(-1deg)', minHeight: 430 }}><div className="map-card-content"><div className="eyebrow">Sample route / County Galway</div><div className="map-route"><svg viewBox="0 0 400 280" fill="none" aria-hidden="true"><path d="M39 218 C91 178 91 92 162 137 S220 229 290 160 S334 112 373 58" stroke="#bd6a46" strokeWidth="2" strokeDasharray="5 8" /><circle cx="39" cy="218" r="7" fill="#1f565b" /><circle cx="162" cy="137" r="7" fill="#1f565b" /><circle cx="290" cy="160" r="7" fill="#1f565b" /><circle cx="373" cy="58" r="9" fill="#bd6a46" /></svg></div><div className="map-caption"><div><small>Location label</small><strong>{preview.locationLabel}</strong></div><div className="mono">7 DAYS</div></div></div></div></div>;
}

function Pricing() {
  return <Layout><main><PageIntro eyebrow="Simple, one-time plans" title="Choose how far you want to follow it." copy="Start free. Pay once when the first page gives you somewhere worth going. No memberships, no auto-renewals, no pressure to know more than you do." /><section className="section"><div className="container pricing-grid"><div className="price-card"><div className="eyebrow">The first step</div><h2>Heritage Trip</h2><p>A beautifully edited trip brief for a meaningful first visit.</p><div className="price-big">$19 <small>one time</small></div><ul className="included"><li>5–10 day suggested route</li><li>Historical and cultural context</li><li>Handpicked places with confidence notes</li><li>Research checklist to take further</li><li>Printable PDF report</li></ul><Link href="/create" className="button button-ghost" data-testid="link-pricing-heritage">Start with a clue <ArrowRight size={15} /></Link></div><div className="price-card featured"><div className="eyebrow" style={{ color: 'hsl(29 74% 72%)' }}>For the deeper thread</div><h2>Deep Heritage Trip</h2><p>More context, more connective tissue, and a report you can share with family.</p><div className="price-big">$49 <small>one time</small></div><ul className="included"><li>Everything in Heritage Trip</li><li>Deeper historical interpretation</li><li>Day-by-day pacing and alternatives</li><li>Expanded archive and source prompts</li><li>Shareable private report link</li></ul><Link href="/create" className="button button-light" data-testid="link-pricing-deep">Follow the thread <ArrowRight size={15} /></Link></div></div></section><section className="section section-tint"><div className="narrow"><div className="eyebrow">The fine print, plainly</div><h2 className="display" style={{ fontSize: 52, margin: '15px 0 18px' }}>You are buying a starting point, not a certainty.</h2><p className="body-copy">Reports are generated from the clues you provide and publicly available context. They do not replace an archive, a local historian, or your own judgment. If your report is not useful, write to us within 14 days and we will make it right.</p></div></section></main></Layout>;
}

function FAQ() {
  const questions = [['Is AncestryTrip a genealogy service?', 'No. It is a travel product shaped by family history. We help you turn clues into a place-based journey; we do not build a verified family tree or make claims about your lineage.'], ['What if I only know a country and a surname?', 'That is a perfectly good beginning. The preview will make reasonable, clearly labeled suggestions and give you a short list of questions that could narrow the story.'], ['How do you handle uncertainty?', 'Every place and interpretation is accompanied by language that reflects its confidence. A possibility is never dressed up as a fact.'], ['What do I receive when I pay?', 'A private, printable report with your preview, the expanded trip sections, context, a day-by-day route, and a research checklist. The Deep Heritage Trip includes additional connective context and shareable formatting.'], ['Is my family information private?', 'Your clues are used to create your requested preview and report. We do not publish family stories or sell them to advertisers. See our privacy page for the full, plain-language policy.'], ['Can I get a refund?', 'Yes. If the report does not give you a useful next step, contact us within 14 days of purchase. We will review the request and refund the report purchase.']]; return <Layout><main><PageIntro eyebrow="Questions, answered" title="The careful version of the FAQ." copy="If you are trusting us with a family story, you deserve clear answers about what we can do, what we cannot, and what happens to your information." /><section className="section"><div className="narrow faq-list">{questions.map(([question, answer], index) => <details className="faq-item" key={question} data-testid={`faq-item-${index}`}><summary>{question}</summary><div className="faq-answer">{answer}</div></details>)}</div></section><section className="quote-band"><div className="container"><blockquote className="serif">Still wondering about your particular story?</blockquote><cite><Link href="/contact" style={{ textDecoration: 'underline' }} data-testid="link-faq-contact">Ask us directly</Link></cite></div></section></main></Layout>;
}

function About() {
  return <Layout><main><PageIntro eyebrow="Why this exists" title="Travel can be a form of remembering." copy="AncestryTrip was made for the moment when a family-history question stops being abstract and starts asking for a place." /><section className="section"><div className="container split-layout"><div><div className="eyebrow">Our position</div><h2 className="display" style={{ fontSize: 'clamp(45px, 5vw, 70px)', margin: '15px 0 24px' }}>We do not fill in the blanks for you.</h2><p className="body-copy">We make the blanks easier to approach. That means giving a possible village the dignity of being a possibility, a historical context the care of being specific, and your family story the room to change as you learn.</p><p className="body-copy">The result is a trip with a point of view — but not a false sense of closure. You might find the house. You might find a different town. You might find the question your family has been carrying all along.</p></div><div className="side-note"><div className="eyebrow">The editorial rule</div><h3 className="serif">Useful, specific, honest.</h3><p>Every suggestion should earn its place by helping you decide where to go, what to look for, or what to ask next.</p></div></div></section><section className="section section-dark"><div className="container"><div className="section-heading"><div className="eyebrow">What you can expect</div><h2 className="display">A companion, not an oracle.</h2><p>Our work sits between a good travel editor and a thoughtful research assistant.</p></div><div className="three-column"><div><span className="feature-number">01</span><h3>Clear confidence</h3><p>We separate evidence, inference, and open questions so you can decide what to trust.</p></div><div><span className="feature-number">02</span><h3>Enough detail</h3><p>Specific streets, museums, records, and rituals are more useful than a grand but vague story.</p></div><div><span className="feature-number">03</span><h3>Respectful tone</h3><p>Migration, loss, and inheritance deserve better than a gamified treasure hunt.</p></div></div></div></section><Articles /></main></Layout>;
}

function Contact() {
  const ticket = useCreateSupportTicket();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const submit = (event: FormEvent) => { event.preventDefault(); ticket.mutate({ data: form }, { onSuccess: () => setForm({ name: '', email: '', message: '' }) }); };
  return <Layout><main><PageIntro eyebrow="A real person reads this" title="Bring us the knotty question." copy="Whether a report missed the mark, a place needs a second look, or you simply want to tell us what you found, we would like to hear from you." /><section className="section"><div className="container split-layout"><form className="form-card" onSubmit={submit} data-testid="form-contact"><h2 className="serif">Send a note</h2>{ticket.isSuccess && <div className="form-success" data-testid="status-contact-success">Your note is on its way. We will reply as soon as we can.</div>}{ticket.isError && <div className="form-error" data-testid="status-contact-error">That message did not send. Please try again.</div>}<div className="form-grid"><div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-contact-name" /></div><div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-contact-email" /></div><div className="field wide"><label htmlFor="contact-message">Your message</label><textarea id="contact-message" required minLength={10} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you are trying to trace…" data-testid="textarea-contact-message" /></div></div><div className="form-footer"><span className="field-note">Usually answered within two working days.</span><button className="button button-primary" disabled={ticket.isPending} data-testid="button-send-contact">{ticket.isPending ? 'Sending…' : <>Send message <Send size={15} /></>}</button></div></form><aside className="side-note"><div className="eyebrow">Before you write</div><h3 className="serif">The more particular, the better.</h3><p>If you are asking about a report, include its title or the email used at checkout. Please do not send sensitive documents or financial information.</p></aside></div></section></main></Layout>;
}

function Articles() {
  const { data, isLoading } = useListArticles();
  if (isLoading) return <Loading />;
  if (!data?.length) return null;
  return <section className="section section-tint"><div className="container"><div className="eyebrow">From the field journal</div><h2 className="display" style={{ fontSize: 50, margin: '12px 0 30px' }}>Further reading</h2><div className="article-grid">{data.slice(0, 3).map((article, index) => <article className={`article-card ${index === 0 ? 'large' : ''}`} key={article.slug} data-testid={`article-card-${article.slug}`}><div><div className="eyebrow">{article.category} / {article.readTime}</div><h3>{article.title}</h3><p>{article.excerpt}</p></div><small className="mono">{new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</small></article>)}</div></div></section>;
}

function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  return <Layout><main><PageIntro eyebrow="Plain-language policy" title={privacy ? 'Privacy, without the fog.' : 'Terms for a thoughtful trip.'} copy={privacy ? 'A short, readable overview of what happens to the clues you share with AncestryTrip.' : 'The practical details behind previews, paid reports, purchases, and refunds.'} /><section className="section"><div className="narrow"><div className="preview-section"><h2 className="serif">{privacy ? 'What we collect' : 'Using the service'}</h2><p>{privacy ? 'We collect the family-history and travel details you enter to generate your requested preview or report. If you contact us, we also receive the name, email, and message you submit. Payment details are handled by our payment provider; we do not store full card numbers.' : 'You may use AncestryTrip to explore and plan personal heritage travel. The generated material is an interpretive starting point, not professional genealogy, legal advice, or a promise that a place or relationship is historically confirmed.'}</p></div><div className="preview-section"><h2 className="serif">{privacy ? 'What we do with it' : 'Purchases and refunds'}</h2><p>{privacy ? 'We use your information to provide the service, respond to support requests, prevent abuse, and understand broad product performance. We do not sell family stories to advertisers or publish them as public trees.' : 'Heritage Trip is $19 and Deep Heritage Trip is $49, each a one-time purchase. If the report is not useful, contact us within 14 days of purchase with the email used at checkout. We will review the request and, where appropriate, issue a refund.'}</p></div><div className="preview-section"><h2 className="serif">{privacy ? 'Your choices' : 'A final word'}</h2><p>{privacy ? 'You can ask what personal information we hold, request correction, or ask us to remove it, subject to records we need to keep for legal or payment reasons. Write to hello@ancestrytrip.example.' : 'Routes, sources, businesses, and public records change. Please verify practical details before travel and treat the report as a well-researched companion to your own judgment.'}</p></div><p className="field-note">Last updated: October 2024. This is a product placeholder policy and should be reviewed before launch.</p></div></section></main></Layout>;
}

function Report() {
  const { token = '' } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useGetReport(token, { query: { enabled: Boolean(token), queryKey: getGetReportQueryKey(token) } });
  if (isLoading) return <div className="report-page"><div className="container"><Loading /></div></div>;
  if (isError || !data) return <div className="report-page"><div className="container"><div className="not-found"><div className="eyebrow">Private report</div><h1 className="display">This link has gone quiet.</h1><p className="body-copy">The report may have expired or the token may be incomplete.</p><Link href="/" className="button button-primary" data-testid="link-report-error-home">Return home</Link></div></div></div>;
  return <div className="report-page"><div className="container report-toolbar"><Brand /><button className="button button-ghost" onClick={() => window.print()} data-testid="button-print-report"><Printer size={15} /> Print report</button></div><article className="report-paper"><div className="eyebrow">{data.product === 'deep-heritage-trip' ? 'Deep Heritage Trip' : 'Heritage Trip'} / Private report</div><h1 className="display" data-testid="text-report-title">{data.title}</h1><p className="muted">{data.preview.locationLabel} · Created {new Date(data.createdAt).toLocaleDateString()}</p><div className="report-section"><div className="eyebrow">The thread</div><h2>{data.preview.interpretation}</h2><p>{data.preview.historicalContext}</p></div>{data.sections.map((section, index) => <div className="report-section" key={`${section.title}-${index}`}><div className="eyebrow">Section {String(index + 1).padStart(2, '0')}</div><h2>{section.title}</h2><p>{section.body}</p>{section.items.length > 0 && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</div>)}<div className="report-section"><div className="eyebrow">A note before you go</div><p>{data.preview.disclaimer}</p></div></article></div>;
}

function Admin() {
  const { data, isLoading, isError } = useGetAdminSummary();
  return <Layout><main><section className="section"><div className="container">{isLoading ? <Loading /> : isError || !data ? <ErrorState label="Admin summary unavailable. Please try again." /> : <><div className="admin-top"><div><div className="eyebrow">Owner view / private</div><h1 className="display">Morning briefing.</h1></div><div className="mono muted" style={{ fontSize: 11 }}>Live summary</div></div><div className="metrics"><Metric label="Revenue" value={`$${data.revenue.toLocaleString()}`} /><Metric label="Orders" value={data.orders.toLocaleString()} /><Metric label="Conversion" value={`${data.conversionRate.toFixed(1)}%`} /><Metric label="Visitors" value={data.visitors.toLocaleString()} /></div><div className="admin-columns"><div className="admin-panel"><h2>Where people arrive</h2>{data.topSources.map((item, index) => <div className="bar-row" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><div className="bar"><span style={{ width: `${Math.min(100, (item.value / Math.max(...data.topSources.map((source) => source.value), 1)) * 100)}%` }} /></div></div>)}</div><div className="admin-panel"><h2>Destinations in motion</h2>{data.topDestinations.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><div className="bar"><span style={{ width: `${Math.min(100, (item.value / Math.max(...data.topDestinations.map((destination) => destination.value), 1)) * 100)}%` }} /></div></div>)}</div></div><div className="admin-panel" style={{ marginTop: 18 }}><h2>Briefing notes</h2><div className="briefing">{data.briefing.map((item, index) => <div className="briefing-item" key={`${item.label}-${index}`}><strong>{item.label} / {item.tone}</strong>{item.body}</div>)}</div></div><div className="trust-strip" style={{ marginTop: 18 }}><div><strong>{data.previews}</strong> previews started</div><div><strong>{data.failedReports}</strong> reports needing a look</div><div><strong>Private</strong> owner dashboard</div></div></>}</div></section></main></Layout>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="metric" data-testid={`metric-${label.toLowerCase()}`}><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong></div>; }
function Loading() { return <div className="loading-stack" data-testid="status-loading"><div className="skeleton loading-line" style={{ width: '35%' }} /><div className="skeleton loading-line" style={{ width: '90%', height: 42 }} /><div className="skeleton loading-line" style={{ width: '72%' }} /></div>; }
function ErrorState({ label }: { label: string }) { return <div className="form-error" role="alert" data-testid="status-error">{label}</div>; }
function NotFound() { return <Layout><main className="not-found"><div className="eyebrow">404 / off the map</div><h1 className="display">Nothing here yet.</h1><p className="body-copy">The page you are looking for may have taken a different road.</p><Link href="/" className="button button-primary" data-testid="link-not-found-home">Return home <ArrowRight size={15} /></Link></main></Layout>; }

function Router() {
  return <Switch>
    <Route path="/" component={Home} /><Route path="/create" component={Create} /><Route path="/preview" component={Preview} /><Route path="/how-it-works" component={HowItWorks} /><Route path="/example" component={Example} /><Route path="/pricing" component={Pricing} /><Route path="/faq" component={FAQ} /><Route path="/about" component={About} /><Route path="/contact" component={Contact} /><Route path="/privacy"><Legal kind="privacy" /></Route><Route path="/terms"><Legal kind="terms" /></Route><Route path="/report/:token" component={Report} /><Route path="/admin" component={Admin} /><Route component={NotFound} />
  </Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><Router /></QueryClientProvider>;
}

export default App;