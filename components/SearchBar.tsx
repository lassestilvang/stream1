"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSearchStore } from "../state/store";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { type, setType, search, loading } = useSearchStore();

  const handleSearch = async () => {
    if (query.trim()) {
      await search(query);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Search for movies or TV shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Select
        value={type}
        onValueChange={(value: "movie" | "tv") => setType(value)}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="movie">Movie</SelectItem>
          <SelectItem value="tv">TV Show</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={handleSearch}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};
