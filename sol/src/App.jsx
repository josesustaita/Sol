import { useEffect, useRef, useState } from "react";
import "./App.css";
const initial = {
  name: "Immokalee",
  country: "US",
  temp: 78,
  feels: 80,
  humidity: 62,
  low: 72,
  high: 84,
  description: "A little sunshine, a little possibility",
  sample: true,
};
export default function App() {
  const [weather, setWeather] = useState(initial),
    [city, setCity] = useState("Immokalee"),
    [unit, setUnit] = useState("imperial"),
    [shownUnit, setShownUnit] = useState("imperial"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  async function search(event) {
    event.preventDefault();
    if (!city.trim()) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city.trim())}&units=${unit}`,
        { signal: controller.signal },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "The forecast took a rain check. Try again.",
        );
      setWeather(data);
      setShownUnit(unit);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      if (active.current === controller) setLoading(false);
    }
  }
  const degree = shownUnit === "metric" ? "°C" : "°F";
  return (
    <main className="shell">
      <header className="top">
        <a className="wordmark" href="/" aria-label="Sol home">
          sol<span>✳</span>
        </a>
        <span className="top-note">a brighter little weather ritual</span>
      </header>
      <div className="intro">
        <p className="eyebrow">A MOMENT TO LOOK UP</p>
        <h1>
          What's the sky
          <br />
          got in store?
        </h1>
        <p>A change of scenery starts with a little curiosity.</p>
      </div>
      <section className="weather-layout" aria-label="Weather explorer">
        <div className="weather-card">
          <div className="card-top">
            <span>
              {weather.name}, {weather.country}
            </span>
            <span className="source">
              {weather.sample ? "SAMPLE WEATHER" : "LIVE WEATHER"}
            </span>
          </div>
          <div className="sun-scene" aria-hidden="true">
            <div className="sun-rays" />
            <div className="sun">
              <span>· ᴗ ·</span>
            </div>
            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />
          </div>
          <div className="temperature">
            {Math.round(weather.temp)}
            <span>{degree}</span>
          </div>
          <p className="description">{weather.description}</p>
          <dl className="details">
            <div>
              <dt>Feels like</dt>
              <dd>
                {Math.round(weather.feels)}
                {degree}
              </dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{weather.humidity}%</dd>
            </div>
            <div>
              <dt>Low / high</dt>
              <dd>
                {Math.round(weather.low)}° / {Math.round(weather.high)}°
              </dd>
            </div>
          </dl>
        </div>
        <aside className="explore">
          <span className="small-star" aria-hidden="true">
            ✦
          </span>
          <h2>
            Your next little
            <br />
            weather check.
          </h2>
          <p>
            At home or somewhere you've been dreaming about. Let's take a peek.
          </p>
          <form onSubmit={search}>
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              maxLength="80"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              placeholder="Where to?"
            />
            <fieldset>
              <legend>Temperature</legend>
              <label>
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={unit === "imperial"}
                  onChange={(e) => setUnit(e.target.value)}
                />{" "}
                Fahrenheit °F
              </label>
              <label>
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={unit === "metric"}
                  onChange={(e) => setUnit(e.target.value)}
                />{" "}
                Celsius °C
              </label>
            </fieldset>
            <button type="submit" disabled={loading}>
              {loading ? "Checking the sky…" : "Find my forecast"}
              <span aria-hidden="true"> ↗</span>
            </button>
          </form>
          <div aria-live="polite" className="feedback">
            {error ? (
              <p role="alert" className="error">
                {error}
              </p>
            ) : (
              <p>
                {loading
                  ? "One moment, looking up…"
                  : weather.sample
                    ? "Sample mode: try Immokalee, London, or Tokyo."
                    : "Forecast provided by OpenWeather via RapidAPI."}
              </p>
            )}
          </div>
        </aside>
      </section>
      <footer>
        Made for curious days. <span>Built by Jose Sustaita ↗</span>
      </footer>
    </main>
  );
}
