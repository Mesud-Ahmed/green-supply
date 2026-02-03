import { Upload, X } from "lucide-react";
import { useState } from "react";

interface Props {
  onFilesSelected: (files: File[]) => void;
  onClear: () => void;
}

export default function ImageUploader({ onFilesSelected, onClear }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
      onFilesSelected(newFiles);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Product Photos</label>
      <input type="file" multiple accept="image/*" onChange={handleSelect} className="hidden" id="file-upload" />
      
      <label htmlFor="file-upload" className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-green-500 transition-all cursor-pointer">
        <Upload size={32} className="mb-2" />
        <span className="font-bold text-sm">Tap to Select Photos</span>
      </label>

      {previews.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {previews.map((url, i) => (
            <div key={i} className="relative w-20 h-20 flex-shrink-0">
              <img src={url} className="w-full h-full object-cover rounded-lg border" />
            </div>
          ))}
          <button type="button" onClick={() => { setPreviews([]); onClear(); }} className="text-xs text-red-500 font-bold underline p-2">Clear All</button>
        </div>
      )}
    </div>
  );
}