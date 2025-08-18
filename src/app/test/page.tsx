// pages/index.tsx
export default function Home() {
  return (
    <div
      className="h-screen overflow-y-scroll scroll-snap-y scroll-smooth"
    >

      <section className="h-screen bg-blue-300 scroll-snap-start flex items-center justify-center">
        <h1 className="text-4xl font-bold">Section 1</h1>
      </section>

      <section className="h-screen bg-green-300 scroll-snap-start flex items-center justify-center">
        <h1 className="text-4xl font-bold">Section 2</h1>
      </section>

      <section className="h-screen bg-pink-300 scroll-snap-start flex items-center justify-center">
        <h1 className="text-4xl font-bold">Section 3</h1>
      </section>

      <section className="h-screen bg-gray-300 scroll-snap-start flex items-center justify-center">
        <h1 className="text-4xl font-bold">Section 4</h1>
      </section>
    </div>
  );
}
