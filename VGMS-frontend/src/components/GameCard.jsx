export default function GameCard({
  coverLink,
  name,
  playtime,
  genres,
  onClick,
}) {
  return (
    <div className="flex-col relative" onClick={onClick}>
      <img
        src={coverLink}
        loading="lazy"
        className="w-full h-40 object-cover rounded-md"
      />

      <h1 className="p-2 text-gray-300 text-lg">{name}</h1>
      {playtime !== 0 && (
        <div className="flex items-center gap-2 mx-2 bg-gray-800 p-2 absolute top-2 right-0 rounded-md">
          <img
            src="./clock-fill.svg"
            className="text-gray-300 max-w-xs max-h-xs"
          />
          <p className=" text-gray-300 text-sm whitespace-nowrap">
            {playtime} Hours
          </p>
        </div>
      )}

      <li className="flex flex-row flex-wrap gap-2 m-2 mt-auto">
        {genres.map((genre) => (
          <ul className="genre-pill" key={genre.name}>
            {genre.name}
          </ul>
        ))}
      </li>
    </div>
  );
}