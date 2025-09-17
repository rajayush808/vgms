import { useEffect, useState } from "react";
import Search from "../components/Search";
import GameCard from "../components/GameCard";
import useFetch from "../hooks/useFetch";
import { fetchGames } from "../api";
import Spinner from "../components/Spinner";
import GameDetails from "../components/GameDetails";

export default function Games() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);

  const { data, loading, error, fetchData } = useFetch(() =>
    fetchGames({ query: searchQuery })
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setShowGameDetails(false);
        setCurrentGame(null);
        await fetchData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="w-full p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Discover Games
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Search through thousands of games and build your perfect collection
            </p>
          </div>

          <Search
            query={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="w-full mt-8">
            {!loading && !showGameDetails ? (
              <>
                {data && data.results && Array.isArray(data.results) && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.results.map(
                      (game) =>
                        game.added > 30 && (
                          <GameCard
                            key={game.slug}
                            game={game}
                            name={game.name}
                            coverLink={game.background_image}
                            playtime={game.playtime}
                            genres={game.genres}
                            onClick={() => {
                              setCurrentGame(game);
                              setShowGameDetails(true);
                            }}
                          />
                        )
                    )}
                  </div>
                )}

                {data && (!data.results || data.results.length === 0) && (
                  <div className="w-full flex flex-col justify-center items-center py-16">
                    <img src="/no-results-found.png" className="size-52" alt="No results" />
                    <p className="text-gray-300 text-2xl mt-4">No games found!</p>
                    <p className="text-gray-500 mt-2">Try a different search term</p>
                  </div>
                )}

                {error && (
                  <div className="w-full flex flex-col justify-center items-center py-16">
                    <div className="text-red-500 text-center">
                      <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
                      <p className="text-gray-400">Failed to fetch games. Please try again.</p>
                    </div>
                  </div>
                )}

                {!data && !loading && !error && (
                  <div className="text-center py-16">
                    <h3 className="text-xl text-gray-400 mb-4">Start searching for games!</h3>
                    <p className="text-gray-500">Type in the search box above to discover amazing games</p>
                  </div>
                )}
              </>
            ) : showGameDetails ? (
              <GameDetails
                currentGame={currentGame}
                goBack={() => {
                  setShowGameDetails(false);
                  setCurrentGame(null);
                }}
              />
            ) : (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
