import { FHECounterDemo } from "./_components/FHECounterDemo";
import { FHECounterDemoNew } from "./_components/FHECounterDemoNew";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
      {/* New Universal FHEVM SDK API Demo */}
      <FHECounterDemoNew />

      {/* Separator */}
      <div className="w-full max-w-6xl mx-auto my-8 border-t-4 border-dashed border-gray-300" />

      {/* Original API Demo (for comparison) */}
      <div className="w-full opacity-50">
        <div className="text-center mb-4">
          <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">
            Original API (Legacy)
          </span>
        </div>
        <FHECounterDemo />
      </div>
    </div>
  );
}
