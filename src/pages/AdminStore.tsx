import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, ImagePlus, LogOut, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";

type ProductGroup = "ranks" | "upgrades" | "keys" | "shards";
type Product = {
  id: string;
  name?: string;
  from?: string;
  to?: string;
  price: string;
  description?: string;
  color?: string;
  dark?: string;
  image?: string;
  url: string;
  popular?: boolean;
  tag?: string;
  perks: string[];
};
type Catalog = Record<ProductGroup, Product[]>;

const groups: { id: ProductGroup; label: string }[] = [
  { id: "ranks", label: "Ranks" },
  { id: "upgrades", label: "Upgrades" },
  { id: "keys", label: "Crate keys" },
  { id: "shards", label: "Shards" },
];

const emptyCatalog: Catalog = { ranks: [], upgrades: [], keys: [], shards: [] };
const newId = () => `product-${crypto.randomUUID().slice(0, 8)}`;

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: options?.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options?.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}

export default function AdminStore() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [savedCatalog, setSavedCatalog] = useState<Catalog>(emptyCatalog);
  const [group, setGroup] = useState<ProductGroup>("ranks");
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const products = catalog[group];
  const selected = products.find((product) => product.id === selectedId);
  const dirty = JSON.stringify(catalog) !== JSON.stringify(savedCatalog);
  const count = useMemo(() => Object.values(catalog).reduce((total, items) => total + items.length, 0), [catalog]);

  const loadCatalog = async () => {
    const data = await api<Catalog>("/api/store/products");
    setCatalog(data);
    setSavedCatalog(data);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/session").then((response) => response.ok),
      api<Catalog>("/api/store/products"),
    ]).then(([isAuthenticated, data]) => {
      if (!active) return;
      setAuthenticated(isAuthenticated);
      setCatalog(data);
      setSavedCatalog(data);
    }).catch(() => {
      if (active) setError("The store API is not available. Start the API server and reload this page.");
    }).finally(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, []);

  const updateProduct = (key: keyof Product, value: string | boolean | string[]) => {
    if (!selected) return;
    setCatalog((current) => ({
      ...current,
      [group]: current[group].map((product) => product.id === selected.id ? { ...product, [key]: value } : product),
    }));
  };

  const chooseGroup = (next: ProductGroup) => {
    setGroup(next);
    setSelectedId("");
    setNotice("");
    setError("");
  };

  const addProduct = () => {
    const product: Product = group === "upgrades"
      ? { id: newId(), from: catalog.ranks[0]?.id || "", to: catalog.ranks[1]?.id || "", price: "$0.00", description: "", url: "https://discord.gg/yourinvite", perks: [] }
      : { id: newId(), name: "New product", price: "$0.00", description: "", color: "#6fb5c4", dark: "#2c5561", image: "", url: "https://discord.gg/yourinvite", popular: false, tag: "", perks: [] };
    setCatalog((current) => ({ ...current, [group]: [...current[group], product] }));
    setSelectedId(product.id);
    setNotice("");
    setError("");
  };

  const deleteProduct = () => {
    if (!selected) return;
    setCatalog((current) => ({ ...current, [group]: current[group].filter((product) => product.id !== selected.id) }));
    setSelectedId("");
    setNotice("Product removed from your draft. Save changes to publish it.");
    setError("");
  };

  const saveChanges = async () => {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      await api("/api/admin/store/products", { method: "PUT", body: JSON.stringify(catalog) });
      setSavedCatalog(catalog);
      setNotice("Store changes are live.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Changes could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      setAuthenticated(true);
      await loadCatalog();
    } catch (reason) {
      setLoginError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    setAuthenticated(false);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selected) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ url: string }>("/api/admin/images", { method: "POST", body: file, headers: { "Content-Type": file.type } });
      updateProduct("image", result.url);
      setNotice("Image uploaded. Save changes to publish the product update.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) return <main className="admin-shell"><div className="admin-loading">Connecting to the store…</div></main>;

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <div className="admin-login">
          <Link className="admin-back" to="/store"><ArrowLeft size={16} /> Back to store</Link>
          <div className="admin-mark"><ShieldCheck size={23} /></div>
          <h1>Store admin</h1>
          <p>Sign in with the admin password configured on your server.</p>
          <form onSubmit={signIn}>
            <label htmlFor="admin-password">Admin password</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
            {loginError && <p className="admin-error" role="alert">{loginError}</p>}
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary admin-login-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="admin-security-note">Protected by a server-side session. Admin credentials are never stored in this website.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" to="/store"><span className="admin-mark"><ShieldCheck size={20} /></span><span>HFQ <small>Store admin</small></span></Link>
        <div className="admin-top-actions">
          <Link to="/store" className="admin-quiet-link">View store <ArrowLeft size={15} className="admin-arrow-out" /></Link>
          <button className="admin-logout" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-heading-row">
          <div><p className="admin-eyebrow">HFQ Network</p><h1>Store products</h1><p className="admin-intro">Edit what players see, from product images to purchase links.</p></div>
          <div className="admin-summary"><strong>{count}</strong><span>products</span></div>
        </div>

        <nav className="admin-tabs" aria-label="Product categories">
          {groups.map((item) => <button key={item.id} className={group === item.id ? "is-active" : ""} onClick={() => chooseGroup(item.id)}>{item.label}<span>{catalog[item.id].length}</span></button>)}
        </nav>

        <div className="admin-workspace">
          <section className="admin-list" aria-label={`${groups.find((item) => item.id === group)?.label} list`}>
            <div className="admin-list-heading"><div><h2>{groups.find((item) => item.id === group)?.label}</h2><p>Select a product to edit its details.</p></div><button className="admin-add" onClick={addProduct}><Plus size={16} /> Add</button></div>
            {products.length === 0 ? <div className="admin-empty"><p>No products in this category yet.</p><button onClick={addProduct}>Add your first product</button></div> : <ul>
              {products.map((product) => <li key={product.id}><button className={`admin-product-row ${selectedId === product.id ? "is-selected" : ""}`} onClick={() => { setSelectedId(product.id); setNotice(""); setError(""); }}>
                {product.image ? <img src={product.image} alt="" /> : <span className="admin-product-placeholder">{(product.name || "↗").slice(0, 1)}</span>}
                <span className="admin-row-copy"><strong>{product.name || `${catalog.ranks.find((rank) => rank.id === product.from)?.name || "Rank"} → ${catalog.ranks.find((rank) => rank.id === product.to)?.name || "Rank"}`}</strong><small>{product.price}</small></span>
                <span className="admin-row-arrow" aria-hidden="true">›</span>
              </button></li>)}
            </ul>}
          </section>

          <section className="admin-editor" aria-label="Product editor">
            {!selected ? <div className="admin-editor-empty"><span><Check size={22} /></span><h2>Choose a product</h2><p>Product details and image controls will appear here.</p></div> : <>
              <div className="admin-editor-heading"><div><p>Editing {selected.id}</p><h2>{selected.name || "Rank upgrade"}</h2></div><button className="admin-delete" onClick={deleteProduct} aria-label="Remove product"><Trash2 size={17} /></button></div>
              <div className="admin-fields">
                {group !== "upgrades" ? <Field label="Product name"><input value={selected.name || ""} onChange={(event) => updateProduct("name", event.target.value)} maxLength={80} /></Field> : <div className="admin-field-pair">
                  <Field label="Current rank"><select value={selected.from || ""} onChange={(event) => updateProduct("from", event.target.value)}>{catalog.ranks.map((rank) => <option key={rank.id} value={rank.id}>{rank.name}</option>)}</select></Field>
                  <Field label="New rank"><select value={selected.to || ""} onChange={(event) => updateProduct("to", event.target.value)}>{catalog.ranks.map((rank) => <option key={rank.id} value={rank.id}>{rank.name}</option>)}</select></Field>
                </div>}

                <div className="admin-field-pair">
                  <Field label="Price"><input value={selected.price} onChange={(event) => updateProduct("price", event.target.value)} maxLength={40} placeholder="$4.99" /></Field>
                  {group === "ranks" ? <label className="admin-checkbox"><input type="checkbox" checked={Boolean(selected.popular)} onChange={(event) => updateProduct("popular", event.target.checked)} /><span>Show “Most Popular” badge</span></label> : group !== "upgrades" ? <Field label="Badge text (optional)"><input value={selected.tag || ""} onChange={(event) => updateProduct("tag", event.target.value)} maxLength={40} placeholder="Best value" /></Field> : <span />}
                </div>

                <Field label="Description"><textarea rows={3} value={selected.description || ""} onChange={(event) => updateProduct("description", event.target.value)} maxLength={280} placeholder="A short explanation shown with the product." /></Field>

                {group !== "upgrades" && <>
                  <div className="admin-field-pair">
                    <Field label="Accent colour"><div className="admin-color-input"><input type="color" value={selected.color || "#6fb5c4"} onChange={(event) => updateProduct("color", event.target.value)} /><input value={selected.color || ""} onChange={(event) => updateProduct("color", event.target.value)} maxLength={7} aria-label="Accent colour hex value" /></div></Field>
                    <Field label="Outline colour"><div className="admin-color-input"><input type="color" value={selected.dark || "#2c5561"} onChange={(event) => updateProduct("dark", event.target.value)} /><input value={selected.dark || ""} onChange={(event) => updateProduct("dark", event.target.value)} maxLength={7} aria-label="Outline colour hex value" /></div></Field>
                  </div>
                  <Field label="Product image"><div className="admin-image-field">
                    <div className="admin-image-preview">{selected.image ? <img src={selected.image} alt="Product preview" /> : <ImagePlus size={25} />}</div>
                    <div className="admin-image-controls"><input value={selected.image || ""} onChange={(event) => updateProduct("image", event.target.value)} placeholder="/images/store/product.png" aria-label="Product image URL or path" /><label className="admin-upload"> <ImagePlus size={15} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadImage} disabled={busy} /></label><small>PNG, JPG, WebP or GIF · 8 MB maximum</small></div>
                  </div></Field>
                </>}

                <Field label="Purchase link"><input type="url" value={selected.url} onChange={(event) => updateProduct("url", event.target.value)} maxLength={500} placeholder="https://…" /></Field>
                <Field label="What’s included"><textarea rows={5} value={selected.perks.join("\n")} onChange={(event) => updateProduct("perks", event.target.value.split("\n").slice(0, 30))} placeholder="One perk per line" /></Field>
              </div>
              <div className="admin-savebar">
                <div aria-live="polite">{error ? <span className="admin-error">{error}</span> : notice ? <span className="admin-success">{notice}</span> : dirty ? <span className="admin-unsaved">Unsaved changes</span> : <span className="admin-saved"><Check size={15} /> All changes saved</span>}</div>
                <button className="admin-primary" onClick={saveChanges} disabled={!dirty || busy}><Save size={16} /> {busy ? "Saving…" : "Save changes"}</button>
              </div>
            </>}
          </section>
        </div>
        <p className="admin-footnote">Changes are saved on the server and appear in the store immediately.</p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}
