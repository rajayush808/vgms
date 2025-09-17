import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { fetchGameData } from "../api";
import ScreenshotCarousel from "./ScreenshotCarousel";
import Spinner from "./Spinner";

function createParagraphs(inputString) {
  // Split the string into sentences using regex to match sentence-ending punctuation (., !, ?)
  const sentences = inputString.match(/[^.!?]+[.!?]+/g) || [];

  // Initialize an array to hold the paragraphs
  const paragraphs = [];

  // Loop through the sentences and create paragraphs with a max of 3 sentences
  for (let i = 0; i < sentences.length; i += 3) {
    // Join the next 3 sentences to form a paragraph
    const paragraph = sentences
      .slice(i, i + 3)
      .join(" ")
      .trim();
    paragraphs.push(paragraph);
  }

  return paragraphs;
}

export default function GameDetails({ currentGame, goBack }) {
  const [description, setDescription] = useState([]);
  const [gameStatus, setGameStatus] = useState(() => {
    // Load status from localStorage if exists
    return localStorage.getItem(`gameStatus-${currentGame.slug}`) || "";
  });

  const { data, loading, fetchData, error, reset } = useFetch(() =>
    fetchGameData({ gameSlug: currentGame.slug })
  );

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  useEffect(() => {
    if (data) {
      const rawDescription = data.description_raw;
      const paragraphs = createParagraphs(rawDescription);

      setDescription(paragraphs);
    }
  }, [data]);

  const handleStatusChange = (e) => {
    setGameStatus(e.target.value);
    localStorage.setItem(`gameStatus-${currentGame.slug}`, e.target.value);
  };

  return (
    <section>
      <button className="main-button flex bg-red-700 text-white hover:bg-red-800" onClick={goBack}>
        <img src="./back-arrow.svg" /> <span className="mx-2">Go Back</span>
      </button>

      {loading ? (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      ) : (
        <div className="mt-4">
          <div className="w-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-80"></div>
            <h1 className="text-red-300 text-2xl absolute top-5 left-5">
              {currentGame.name}
            </h1>
            <img
              className="w-full h-40 object-cover rounded-md"
              src={currentGame.background_image}
            />
          </div>
          <div className="">
            {data && (
              <div className="text-red-200">
                {description.map((paragraph, index) => (
                  <p className="mt-2" key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <div className="w-full flex flex-col items-center p-4 h-96">
              {currentGame.short_screenshots.length !== 0 && (
                <ScreenshotCarousel
                  screenshots={currentGame.short_screenshots.slice(0)}
                />
              )}
            </div>

            <div className="grid grid-cols-2 py-4">
              <div className="flex flex-col">
                <h2 className="text-red-300 text-xl">Genres</h2>
                <ul className="flex flex-wrap gap-2 py-2">
                  {currentGame.genres.map((genre) => (
                    <li className="genre-pill bg-red-800 text-white" key={genre.name}>
                      {genre.name}
                    </li>
                  ))}
                </ul>
                <h2 className="text-red-300 text-xl">Platforms</h2>
                <ul className="flex flex-wrap gap-2 py-2">
                  {currentGame.platforms.map((platform) => (
                    <li key={platform.platform.name} className="platform-pill bg-red-800 text-white">
                      {platform.platform.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center items-center">
                <button
                  className="main-button flex items-center bg-red-700 text-white hover:bg-red-800"
                  onClick={() =>
                    window.open(
                      `https://google.com/search?q=where+to+buy+${currentGame.name}`,
                      "_blank"
                    )
                  }
                >
                  <span className="ml-4 mr-2">Purchase</span>
                  <img src="./shopping-cart.svg" className="size-6 mr-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label htmlFor="game-status" className="text-red-300">
                Status:
              </label>
              <select
                id="game-status"
                value={gameStatus}
                onChange={handleStatusChange}
                className="main-button px-2 py-1 bg-red-900 text-white"
              >
                <option value="">Select status</option>
                <option value="currently-playing">Currently Playing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}