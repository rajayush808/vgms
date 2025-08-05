import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Search from "./components/Search";
import GameCard from "./components/GameCard";
import useFetch from "./hooks/useFetch";
import { fetchGames } from "./api";
import Spinner from "./components/Spinner";
import GameDetails from "./components/GameDetails";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Header from "./components/Header";   // ← NEW

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);

  const { data, loading, fetchData } = useFetch(() =>
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
    <main className="w-full p-2 flex flex-col items-center">
      <div className="flex items-center">
        <h1 className="text-gradient text-4xl font-bold">VGMS</h1>
        <img src="./public/logo.png" className="w-25 h-25" />
      </div>
      <div className="w-full max-w-4xl">
        <Search
          query={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="w-full">
          {!loading && !showGameDetails ? (
            <>
              {data && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.results.map(
                    (game) =>
                      game.added > 30 && (
                        <GameCard
                          key={game.slug}
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

              {data && data.results.length === 0 && (
                <div className="w-full flex flex-col justify-center items-center">
                  <img src="./no-results-found.png" className="size-52" />
                  <p className="text-gray-300 text-2xl">No games found!</p>
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
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />               {/* ← NEW */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
