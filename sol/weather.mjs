const samples = {
  immokalee: {
    name: "Immokalee",
    country: "US",
    temp: 78,
    feels: 80,
    humidity: 62,
    low: 72,
    high: 84,
    description: "A little sunshine, a little possibility",
  },
  london: {
    name: "London",
    country: "GB",
    temp: 59,
    feels: 57,
    humidity: 76,
    low: 54,
    high: 63,
    description: "Cloudy with a chance of a cozy afternoon",
  },
  tokyo: {
    name: "Tokyo",
    country: "JP",
    temp: 73,
    feels: 74,
    humidity: 58,
    low: 68,
    high: 77,
    description: "A bright day for a new discovery",
  },
};
export async function forecast(
  city,
  units,
  { key = process.env.WEATHER_API_KEY, fetcher = fetch } = {},
) {
  if (typeof city !== "string" || !city.trim() || city.length > 80)
    return {
      status: 400,
      body: { error: "Enter a city name (up to 80 characters)." },
    };
  if (!["imperial", "metric"].includes(units))
    return { status: 400, body: { error: "Choose Fahrenheit or Celsius." } };
  if (!key) {
    const sample = samples[city.trim().toLowerCase()];
    if (!sample)
      return {
        status: 404,
        body: {
          error:
            "Sample mode has Immokalee, London, and Tokyo. Try one of those cities.",
        },
      };
    const body = { ...sample, sample: true };
    if (units === "metric")
      for (const name of ["temp", "feels", "low", "high"])
        body[name] = ((body[name] - 32) * 5) / 9;
    return { status: 200, body };
  }
  try {
    const url = new URL(
      "https://community-open-weather-map.p.rapidapi.com/weather",
    );
    url.searchParams.set("q", city.trim());
    url.searchParams.set("units", units);
    const response = await fetcher(url, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": url.host },
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404)
      return {
        status: 404,
        body: {
          error:
            "That city is hiding from us. Check the spelling and try again.",
        },
      };
    if (!response.ok) throw new Error("upstream");
    const data = await response.json();
    if (
      !data.name ||
      !data.sys?.country ||
      !data.weather?.[0]?.description ||
      !["temp", "feels_like", "humidity", "temp_min", "temp_max"].every((k) =>
        Number.isFinite(data.main?.[k]),
      )
    )
      throw new Error("invalid weather");
    return {
      status: 200,
      body: {
        name: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        feels: data.main.feels_like,
        humidity: data.main.humidity,
        low: data.main.temp_min,
        high: data.main.temp_max,
        description: data.weather[0].description,
        sample: false,
      },
    };
  } catch {
    return {
      status: 502,
      body: { error: "Weather is taking a rain check. Try again shortly." },
    };
  }
}
