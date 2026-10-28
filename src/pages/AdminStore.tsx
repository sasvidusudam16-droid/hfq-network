import { useEffect, useMemo, useState, useCallback, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Copy, ImagePlus, LogOut, Newspaper, Plus, Save, ShieldCheck, Trash2, X } from "lucide-react";

type ProductGroup = "ranks" | "upgrades" | "keys" | "shards";
type AdminSection = ProductGroup | "news" | "images";

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

type NewsTag = "Update" | "Event" | "Season" | "Store";
type NewsPost = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  tag: NewsTag;
  image: string;
  url?: string;
};

type UploadedImage = {
  filename: string;
  url: string;
  size: number;
  created: number;
};

const productGroups: { id: ProductGroup; label: string }[] = [
  { id: "ranks", label: "Ranks" },
  { id: "upgrades", label: "Upgrades" },
  { id: "keys", label: "Crate keys" },
  { id: "shards", label: "Shards" },
];

const newsTags: NewsTag[] = ["Update", "Event", "Season", "Store"];
const emptyCatalog: Catalog = { ranks: [], upgrades: [], keys: [], shards: [] };
const newId = () => `product-${crypto.randomUUID().slice(0, 8)}`;
const newNumId = (posts: NewsPost[]) => (posts.reduce((max, p) => Math.max(max, p.id), 0)) + 1;
const today = () => new Date().toISOString().slice(0, 10);

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: options?.body instanceof File || options?.body instanceof Blob
      ? options.headers
      : { "Content-Type": "application/json", ...options?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}

export default function AdminStore() {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Store
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [savedCatalog, setSavedCatalog] = useState<Catalog>(emptyCatalog);
  const [group, setGroup] = useState<ProductGroup>("ranks");
  const [selectedId, setSelectedId] = useState("");

  // News
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [savedNews, setSavedNews] = useState<NewsPost[]>([]);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  // UI
  const [section, setSection] = useState<AdminSection>("ranks");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Derived
  const products = catalog[group];
  const selected = products.find((p) => p.id === selectedId);
  const storeDirty = JSON.stringify(catalog) !== JSON.stringify(savedCatalog);
  const newsDirty = JSON.stringify(newsPosts) !== JSON.stringify(savedNews);
  const selectedNews = newsPosts.find((p) => p.id === selectedNewsId) ?? null;
  const count = useMemo(() => Object.values(catalog).reduce((t, items) => t + items.length, 0), [catalog]);

  // ── Boot ──────────────────────────────────────────────────────────────────

  const loadCatalog = async () => {
    const data = await api<Catalog>("/api/store/products");
    setCatalog(data);
    setSavedCatalog(data);
  };

  const loadNews = async () => {
    const data = await api<NewsPost[]>("/api/news");
    setNewsPosts(data);
    setSavedNews(data);
  };

  const loadImages = async () => {
    setImagesLoading(true);
    try {
      const data = await api<UploadedImage[]>("/api/admin/images");
      setImages(data);
    } catch {
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/session").then((r) => r.ok),
      api<Catalog>("/api/store/products"),
      fetch("/api/news").then((r) => r.ok ? r.json() : []),
    ]).then(([isAuth, catalog, news]) => {
      if (!active) return;
      setAuthenticated(isAuth as boolean);
      setCatalog(catalog as Catalog);
      setSavedCatalog(catalog as Catalog);
      setNewsPosts(news as NewsPost[]);
      setSavedNews(news as NewsPost[]);
    }).catch(() => {
      if (active) setError("The store API is not available. Start the API server and reload this page.");
    }).finally(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, []);

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (section === "news" && newsDirty && !busy) saveNews();
        else if (section !== "news" && section !== "images" && storeDirty && !busy) saveStore();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── Store actions ─────────────────────────────────────────────────────────

  const updateProduct = (key: keyof Product, value: string | boolean | string[]) => {
    if (!selected) return;
    setCatalog((c) => ({ ...c, [group]: c[group].map((p) => p.id === selected.id ? { ...p, [key]: value } : p) }));
  };

  const chooseGroup = (next: ProductGroup) => {
    setGroup(next);
    setSelectedId("");
    setSection(next);
    clearFeedback();
  };

  const addProduct = () => {
    const p: Product = group === "upgrades"
      ? { id: newId(), from: catalog.ranks[0]?.id || "", to: catalog.ranks[1]?.id || "", price: "$0.00", description: "", url: "https://discord.gg/yourinvite", perks: [] }
      : { id: newId(), name: "New product", price: "$0.00", description: "", color: "#6fb5c4", dark: "#2c5561", image: "", url: "https://discord.gg/yourinvite", popular: false, tag: "", perks: [] };
    setCatalog((c) => ({ ...c, [group]: [...c[group], p] }));
    setSelectedId(p.id);
    clearFeedback();
  };

  const duplicateProduct = () => {
    if (!selected) return;
    const clone: Product = { ...selected, id: newId(), name: selected.name ? `${selected.name} (copy)` : undefined };
    const idx = catalog[group].findIndex((p) => p.id === selected.id);
    setCatalog((c) => {
      const list = [...c[group]];
      list.splice(idx + 1, 0, clone);
      return { ...c, [group]: list };
    });
    setSelectedId(clone.id);
    clearFeedback();
  };

  const moveProduct = (dir: "up" | "down") => {
    if (!selected) return;
    const idx = catalog[group].findIndex((p) => p.id === selected.id);
    const next = dir === "up" ? idx - 1 : idx + 1;
    if (next < 0 || next >= catalog[group].length) return;
    setCatalog((c) => {
      const list = [...c[group]];
      [list[idx], list[next]] = [list[next], list[idx]];
      return { ...c, [group]: list };
    });
  };

  const deleteProduct = () => {
    if (!selected) return;
    setCatalog((c) => ({ ...c, [group]: c[group].filter((p) => p.id !== selected.id) }));
    setSelectedId("");
    setNotice("Product removed. Save changes to publish.");
  };

  const discardStore = () => {
    setCatalog(savedCatalog);
    setSelectedId("");
    clearFeedback();
    setNotice("Changes discarded.");
  };

  const saveStore = async () => {
    setBusy(true);
    clearFeedback();
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

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selected) return;
    setBusy(true);
    clearFeedback();
    try {
      const result = await api<{ url: string }>("/api/admin/images", { method: "POST", body: file, headers: { "Content-Type": file.type } });
      updateProduct("image", result.url);
      setNotice("Image uploaded. Save changes to publish.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  // ── News actions ──────────────────────────────────────────────────────────

  const updateNews = (key: keyof NewsPost, value: string | number) => {
    if (!selectedNews) return;
    setNewsPosts((ps) => ps.map((p) => p.id === selectedNews.id ? { ...p, [key]: value } : p));
  };

  const addNewsPost = () => {
    const p: NewsPost = { id: newNumId(newsPosts), title: "New post", excerpt: "", date: today(), tag: "Update", image: "", url: "" };
    setNewsPosts((ps) => [p, ...ps]);
    setSelectedNewsId(p.id);
    clearFeedback();
  };

  const deleteNewsPost = () => {
    if (!selectedNews) return;
    setNewsPosts((ps) => ps.filter((p) => p.id !== selectedNews.id));
    setSelectedNewsId(null);
    setNotice("Post removed. Save changes to publish.");
  };

  const moveNews = (dir: "up" | "down") => {
    if (!selectedNews) return;
    const idx = newsPosts.findIndex((p) => p.id === selectedNews.id);
    const next = dir === "up" ? idx - 1 : idx + 1;
    if (next < 0 || next >= newsPosts.length) return;
    setNewsPosts((ps) => {
      const list = [...ps];
      [list[idx], list[next]] = [list[next], list[idx]];
      return list;
    });
  };

  const discardNews = () => {
    setNewsPosts(savedNews);
    setSelectedNewsId(null);
    clearFeedback();
    setNotice("Changes discarded.");
  };

  const saveNews = async () => {
    setBusy(true);
    clearFeedback();
    try {
      await api("/api/admin/news", { method: "PUT", body: JSON.stringify(newsPosts) });
      setSavedNews(newsPosts);
      setNotice("News changes are live.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "News could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const uploadNewsImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedNews) return;
    setBusy(true);
    clearFeedback();
    try {
      const result = await api<{ url: string }>("/api/admin/images", { method: "POST", body: file, headers: { "Content-Type": file.type } });
      updateNews("image", result.url);
      setNotice("Image uploaded. Save changes to publish.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  // ── Image gallery actions ─────────────────────────────────────────────────

  const deleteImage = async (filename: string) => {
    try {
      await api(`/api/admin/images/${filename}`, { method: "DELETE", body: "{}" });
      setImages((imgs) => imgs.filter((i) => i.filename !== filename));
      setNotice("Image deleted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete image.");
    }
  };

  const copyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => setNotice(`Copied: ${url}`));
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      setAuthenticated(true);
      await Promise.all([loadCatalog(), loadNews()]);
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  const clearFeedback = () => { setNotice(""); setError(""); };

  const switchSection = (next: AdminSection) => {
    setSection(next);
    clearFeedback();
    if (next === "news") { setSelectedId(""); }
    else if (next === "images") { setSelectedId(""); setSelectedNewsId(null); loadImages(); }
    else { setGroup(next as ProductGroup); setSelectedId(""); setSelectedNewsId(null); }
  };

  // ── Render: loading ───────────────────────────────────────────────────────

  if (checking) return <main className="admin-shell"><div className="admin-loading">Connecting to the store…</div></main>;

  // ── Render: login ─────────────────────────────────────────────────────────

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
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            {loginError && <p className="admin-error" role="alert">{loginError}</p>}
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary admin-login-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="admin-security-note">Protected by a server-side session. Admin credentials are never stored in this website.</p>
        </div>
      </main>
    );
  }

  // ── Render: admin panel ───────────────────────────────────────────────────

  const isNews = section === "news";
  const isImages = section === "images";
  const isStore = !isNews && !isImages;

  const dirty = isNews ? newsDirty : isStore ? storeDirty : false;

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" to="/store">
          <span className="admin-mark"><ShieldCheck size={20} /></span>
          <span>HFQ <small>Admin</small></span>
        </Link>
        <div className="admin-top-actions">
          <Link to="/store" className="admin-quiet-link">View store <ArrowLeft size={15} className="admin-arrow-out" /></Link>
          <button className="admin-logout" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-heading-row">
          <div>
            <p className="admin-eyebrow">HFQ Network</p>
            <h1>{isNews ? "News posts" : isImages ? "Uploaded images" : "Store products"}</h1>
            <p className="admin-intro">
              {isNews ? "Edit news posts shown on the home page." : isImages ? "Manage images uploaded to the server." : "Edit what players see, from product images to purchase links."}
            </p>
          </div>
          <div className="admin-summary">
            <strong>{isNews ? newsPosts.length : isImages ? images.length : count}</strong>
            <span>{isNews ? "posts" : isImages ? "images" : "products"}</span>
          </div>
        </div>

        <nav className="admin-tabs" aria-label="Admin sections">
          {productGroups.map((item) => (
            <button key={item.id} className={section === item.id ? "is-active" : ""} onClick={() => switchSection(item.id)}>
              {item.label}<span>{catalog[item.id].length}</span>
            </button>
          ))}
          <button className={isNews ? "is-active" : ""} onClick={() => switchSection("news")}>
            News<span>{newsPosts.length}</span>
          </button>
          <button className={isImages ? "is-active" : ""} onClick={() => switchSection("images")}>
            Images<span>{images.length}</span>
          </button>
        </nav>

        {/* ── Store products ───────────────────────────────────────────────── */}
        {isStore && (
          <div className="admin-workspace">
            <section className="admin-list" aria-label={`${productGroups.find((g) => g.id === group)?.label} list`}>
              <div className="admin-list-heading">
                <div>
                  <h2>{productGroups.find((g) => g.id === group)?.label}</h2>
                  <p>Select a product to edit its details.</p>
                </div>
                <button className="admin-add" onClick={addProduct}><Plus size={16} /> Add</button>
              </div>
              {products.length === 0
                ? <div className="admin-empty"><p>No products yet.</p><button onClick={addProduct}>Add your first product</button></div>
                : <ul>
                  {products.map((product) => (
                    <li key={product.id}>
                      <button
                        className={`admin-product-row ${selectedId === product.id ? "is-selected" : ""}`}
                        onClick={() => { setSelectedId(product.id); clearFeedback(); }}
                      >
                        {product.image ? <img src={product.image} alt="" /> : <span className="admin-product-placeholder">{(product.name || "↗").slice(0, 1)}</span>}
                        <span className="admin-row-copy">
                          <strong>{product.name || `${catalog.ranks.find((r) => r.id === product.from)?.name || "Rank"} → ${catalog.ranks.find((r) => r.id === product.to)?.name || "Rank"}`}</strong>
                          <small>{product.price}</small>
                        </span>
                        <span className="admin-row-arrow" aria-hidden="true">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              }
            </section>

            <section className="admin-editor" aria-label="Product editor">
              {!selected
                ? <div className="admin-editor-empty"><span><Check size={22} /></span><h2>Choose a product</h2><p>Product details and image controls will appear here.</p></div>
                : <>
                  <div className="admin-editor-heading">
                    <div><p>Editing {selected.id}</p><h2>{selected.name || "Rank upgrade"}</h2></div>
                    <div className="admin-editor-actions">
                      <button className="admin-icon-btn" onClick={() => moveProduct("up")} title="Move up" aria-label="Move up"><ChevronUp size={16} /></button>
                      <button className="admin-icon-btn" onClick={() => moveProduct("down")} title="Move down" aria-label="Move down"><ChevronDown size={16} /></button>
                      <button className="admin-icon-btn" onClick={duplicateProduct} title="Duplicate" aria-label="Duplicate product"><Copy size={15} /></button>
                      <button className="admin-delete" onClick={deleteProduct} aria-label="Remove product"><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="admin-fields">
                    {group !== "upgrades"
                      ? <Field label="Product name"><input value={selected.name || ""} onChange={(e) => updateProduct("name", e.target.value)} maxLength={80} /></Field>
                      : <div className="admin-field-pair">
                        <Field label="Current rank"><select value={selected.from || ""} onChange={(e) => updateProduct("from", e.target.value)}>{catalog.ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
                        <Field label="New rank"><select value={selected.to || ""} onChange={(e) => updateProduct("to", e.target.value)}>{catalog.ranks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
                      </div>
                    }
                    <div className="admin-field-pair">
                      <Field label="Price"><input value={selected.price} onChange={(e) => updateProduct("price", e.target.value)} maxLength={40} placeholder="$4.99" /></Field>
                      {group === "ranks"
                        ? <label className="admin-checkbox"><input type="checkbox" checked={Boolean(selected.popular)} onChange={(e) => updateProduct("popular", e.target.checked)} /><span>Show "Most Popular" badge</span></label>
                        : group !== "upgrades"
                          ? <Field label="Badge text (optional)"><input value={selected.tag || ""} onChange={(e) => updateProduct("tag", e.target.value)} maxLength={40} placeholder="Best value" /></Field>
                          : <span />
                      }
                    </div>
                    <Field label="Description"><textarea rows={3} value={selected.description || ""} onChange={(e) => updateProduct("description", e.target.value)} maxLength={280} placeholder="A short explanation shown with the product." /></Field>
                    {group !== "upgrades" && <>
                      <div className="admin-field-pair">
                        <Field label="Accent colour"><div className="admin-color-input"><input type="color" value={selected.color || "#6fb5c4"} onChange={(e) => updateProduct("color", e.target.value)} /><input value={selected.color || ""} onChange={(e) => updateProduct("color", e.target.value)} maxLength={7} aria-label="Accent colour hex" /></div></Field>
                        <Field label="Outline colour"><div className="admin-color-input"><input type="color" value={selected.dark || "#2c5561"} onChange={(e) => updateProduct("dark", e.target.value)} /><input value={selected.dark || ""} onChange={(e) => updateProduct("dark", e.target.value)} maxLength={7} aria-label="Outline colour hex" /></div></Field>
                      </div>
                      <Field label="Product image">
                        <div className="admin-image-field">
                          <div className="admin-image-preview">{selected.image ? <img src={selected.image} alt="Product preview" /> : <ImagePlus size={25} />}</div>
                          <div className="admin-image-controls">
                            <input value={selected.image || ""} onChange={(e) => updateProduct("image", e.target.value)} placeholder="/images/store/product.png" aria-label="Product image URL" />
                            <label className="admin-upload"><ImagePlus size={15} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadImage} disabled={busy} /></label>
                            <small>PNG, JPG, WebP or GIF · 8 MB max</small>
                          </div>
                        </div>
                      </Field>
                    </>}
                    <Field label="Purchase link"><input type="url" value={selected.url} onChange={(e) => updateProduct("url", e.target.value)} maxLength={500} placeholder="https://…" /></Field>
                    <Field label="What's included"><textarea rows={5} value={selected.perks.join("\n")} onChange={(e) => updateProduct("perks", e.target.value.split("\n").slice(0, 30))} placeholder="One perk per line" /></Field>
                  </div>
                  <div className="admin-savebar">
                    <SaveStatus error={error} notice={notice} dirty={storeDirty} />
                    <div className="admin-savebar-actions">
                      {storeDirty && <button className="admin-discard" onClick={discardStore} disabled={busy}>Discard</button>}
                      <button className="admin-primary" onClick={saveStore} disabled={!storeDirty || busy}><Save size={16} />{busy ? "Saving…" : "Save changes"}</button>
                    </div>
                  </div>
                </>
              }
            </section>
          </div>
        )}

        {/* ── News ────────────────────────────────────────────────────────────── */}
        {isNews && (
          <div className="admin-workspace">
            <section className="admin-list" aria-label="News posts list">
              <div className="admin-list-heading">
                <div><h2>Posts</h2><p>Select a post to edit it.</p></div>
                <button className="admin-add" onClick={addNewsPost}><Plus size={16} /> Add</button>
              </div>
              {newsPosts.length === 0
                ? <div className="admin-empty"><p>No posts yet.</p><button onClick={addNewsPost}>Add your first post</button></div>
                : <ul>
                  {newsPosts.map((post) => (
                    <li key={post.id}>
                      <button
                        className={`admin-product-row ${selectedNewsId === post.id ? "is-selected" : ""}`}
                        onClick={() => { setSelectedNewsId(post.id); clearFeedback(); }}
                      >
                        {post.image ? <img src={post.image} alt="" /> : <span className="admin-product-placeholder"><Newspaper size={14} /></span>}
                        <span className="admin-row-copy">
                          <strong>{post.title}</strong>
                          <small>{post.date} · {post.tag}</small>
                        </span>
                        <span className="admin-row-arrow" aria-hidden="true">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              }
            </section>

            <section className="admin-editor" aria-label="News post editor">
              {!selectedNews
                ? <div className="admin-editor-empty"><span><Newspaper size={22} /></span><h2>Choose a post</h2><p>Post details and image controls will appear here.</p></div>
                : <>
                  <div className="admin-editor-heading">
                    <div><p>Post #{selectedNews.id}</p><h2>{selectedNews.title}</h2></div>
                    <div className="admin-editor-actions">
                      <button className="admin-icon-btn" onClick={() => moveNews("up")} title="Move up"><ChevronUp size={16} /></button>
                      <button className="admin-icon-btn" onClick={() => moveNews("down")} title="Move down"><ChevronDown size={16} /></button>
                      <button className="admin-delete" onClick={deleteNewsPost} aria-label="Delete post"><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="admin-fields">
                    <Field label="Title"><input value={selectedNews.title} onChange={(e) => updateNews("title", e.target.value)} maxLength={120} /></Field>
                    <Field label="Excerpt"><textarea rows={3} value={selectedNews.excerpt} onChange={(e) => updateNews("excerpt", e.target.value)} maxLength={400} placeholder="A short summary shown on the home page." /></Field>
                    <div className="admin-field-pair">
                      <Field label="Date"><input type="date" value={selectedNews.date} onChange={(e) => updateNews("date", e.target.value)} /></Field>
                      <Field label="Tag">
                        <select value={selectedNews.tag} onChange={(e) => updateNews("tag", e.target.value as NewsTag)}>
                          {newsTags.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Image">
                      <div className="admin-image-field">
                        <div className="admin-image-preview">{selectedNews.image ? <img src={selectedNews.image} alt="" /> : <ImagePlus size={25} />}</div>
                        <div className="admin-image-controls">
                          <input value={selectedNews.image} onChange={(e) => updateNews("image", e.target.value)} placeholder="/images/news/post.webp" aria-label="Post image URL" />
                          <label className="admin-upload"><ImagePlus size={15} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadNewsImage} disabled={busy} /></label>
                          <small>PNG, JPG, WebP or GIF · 8 MB max</small>
                        </div>
                      </div>
                    </Field>
                    <Field label="Link (optional)"><input type="url" value={selectedNews.url || ""} onChange={(e) => updateNews("url", e.target.value)} maxLength={300} placeholder="https://… or /page" /></Field>
                  </div>
                  <div className="admin-savebar">
                    <SaveStatus error={error} notice={notice} dirty={newsDirty} />
                    <div className="admin-savebar-actions">
                      {newsDirty && <button className="admin-discard" onClick={discardNews} disabled={busy}>Discard</button>}
                      <button className="admin-primary" onClick={saveNews} disabled={!newsDirty || busy}><Save size={16} />{busy ? "Saving…" : "Save changes"}</button>
                    </div>
                  </div>
                </>
              }
            </section>
          </div>
        )}

        {/* ── Image gallery ────────────────────────────────────────────────── */}
        {isImages && (
          <div className="admin-images-section">
            {error && <p className="admin-error" role="alert">{error}</p>}
            {notice && <p className="admin-success">{notice}</p>}
            {imagesLoading
              ? <p className="admin-loading">Loading images…</p>
              : images.length === 0
                ? <div className="admin-empty"><p>No uploaded images yet.</p><p>Upload images via the product or news editors.</p></div>
                : <ul className="admin-image-grid">
                  {images.map((img) => (
                    <li key={img.filename} className="admin-image-card">
                      <img src={img.url} alt={img.filename} />
                      <div className="admin-image-card-info">
                        <span className="admin-image-filename">{img.filename}</span>
                        <span className="admin-image-size">{(img.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="admin-image-card-actions">
                        <button onClick={() => copyImageUrl(img.url)} title="Copy URL"><Copy size={14} /></button>
                        <button onClick={() => deleteImage(img.filename)} title="Delete image" className="admin-image-delete"><X size={14} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
            }
          </div>
        )}

        {!isImages && <p className="admin-footnote">Changes are saved on the server and appear immediately. Press <kbd>Ctrl+S</kbd> to save.</p>}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

function SaveStatus({ error, notice, dirty }: { error: string; notice: string; dirty: boolean }) {
  return (
    <div aria-live="polite">
      {error ? <span className="admin-error">{error}</span>
        : notice ? <span className="admin-success">{notice}</span>
        : dirty ? <span className="admin-unsaved">Unsaved changes</span>
        : <span className="admin-saved"><Check size={15} /> All changes saved</span>}
    </div>
  );
}
