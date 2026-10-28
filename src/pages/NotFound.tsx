import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-shell page-surface">
      <div className="page-content">
        <p className="page-kicker">404 · Wrong turn</p>
        <h1 className="page-title">We can’t find that page.</h1>
        <p className="page-copy">
          The link may be out of date, or the page may have moved. Head back home and we’ll get
          you pointed in the right direction.
        </p>
        <Link className="page-action" to="/">Back to HFQ</Link>
      </div>
    </section>
  );
}
