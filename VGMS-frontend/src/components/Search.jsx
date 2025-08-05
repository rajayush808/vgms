export default function Search({ query, onChange }) {
  return (
    <div className="w-full   mb-4">
      <div className="flex my-2 rounded-md shadow-xl bg-gray-800 p-4">
        <img
          className="relative top-0.5 h-5 w-5"
          src="./search.svg"
          alt="search"
        />
        <input
          className="w-full focus:outline-none ml-2 text-gray-300"
          type="text"
          placeholder="Search a game"
          value={query}
          onChange={onChange}
        />
      </div>
    </div>
  );
}