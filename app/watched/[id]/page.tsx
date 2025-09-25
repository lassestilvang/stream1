"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { useWatchedStore } from "../../../state/store";

export default function EditWatchedPage() {
  const params = useParams();
  const router = useRouter();
  const { items, loading, fetchWatched, updateWatched } = useWatchedStore();

  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [saving, setSaving] = useState(false);

  const id = parseInt(params.id as string);
  const item = items.find((i) => i.id === id);

  useEffect(() => {
    if (!item) {
      fetchWatched();
    } else {
      setRating(item.rating.toString());
      setNotes(item.notes || "");
      setWatchedDate(item.watchedDate);
    }
  }, [item, fetchWatched]);

  const handleSave = async () => {
    if (!item) return;

    setSaving(true);
    try {
      await updateWatched(item.id, {
        rating: parseInt(rating) || 0,
        notes,
        watchedDate,
      });
      router.push("/watched");
    } catch (error) {
      console.error("Failed to update watched item:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Watched item not found.</p>
        <Button onClick={() => router.push("/watched")} className="mt-4">
          Back to Watched
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Edit Watched Item</h1>
        <p className="text-muted-foreground">
          Update your rating, notes, and watch date
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="rating">Rating (1-10)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="watchedDate">Watched Date</Label>
          <Input
            id="watchedDate"
            type="date"
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add your thoughts about this movie/TV show..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button onClick={() => router.push("/watched")} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
