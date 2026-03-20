import {
  benefits,
  faqs,
  featuredProducts,
  roomCollections,
  testimonials,
} from "@/mocks/home-data";

export default function Home() {
  return (
    <div className="bg-[#f5f2ee] text-[#1f1f1f]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-xl font-semibold tracking-tight">FurniSphere</p>
        <nav className="hidden gap-6 text-sm text-[#575757] md:flex">
          <a href="#">Inicio</a>
          <a href="#">Coleccion</a>
          <a href="#">Productos</a>
          <a href="#">Contacto</a>
        </nav>
        <button className="rounded-full bg-[#1f1f1f] px-4 py-2 text-sm text-white">
          Login
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-16 sm:px-6 lg:px-8">
        <section
          className="relative overflow-hidden rounded-[2rem] p-8 text-white sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.50), rgba(0,0,0,0.20)), url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[#f4f4f4]">
              Muebles premium
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Encuentra el mueble perfecto para completar tu hogar
            </h1>
            <p className="mt-4 max-w-xl text-sm text-[#ececec] sm:text-base">
              Diseno elegante, acabados premium y confort real para sala,
              dormitorio y oficina.
            </p>
            <button className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f1f1f]">
              Comprar ahora
            </button>
          </div>
        </section>

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold">Nuevas colecciones</h2>
            <p className="mt-2 text-[#666]">
              Productos seleccionados para elevar el estilo de tus espacios.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <article
                key={product.name}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="mb-4 h-44 overflow-hidden rounded-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="inline-block rounded-full bg-[#efefef] px-3 py-1 text-xs">
                  {product.tag}
                </p>
                <h3 className="mt-3 font-medium">{product.name}</h3>
                <p className="mt-1 text-lg font-semibold">{product.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold">Productos recomendados</h2>
            <p className="mt-2 text-[#666]">
              Explora ambientes completos con una propuesta visual moderna.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {roomCollections.map((room) => (
              <article
                key={room.title}
                className="group relative h-72 overflow-hidden rounded-2xl"
              >
                <img
                  src={room.image}
                  alt={room.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <h3 className="text-2xl font-semibold text-white">
                    {room.title}
                  </h3>
                  <button className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1f1f1f]">
                    Ver productos
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-6 text-center text-3xl font-semibold">
            Lo que ofrecemos
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="rounded-2xl bg-[#f6f5f3] p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#666]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-center text-3xl font-semibold">
            Clientes felices
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="rounded-2xl bg-white p-5">
                <p className="text-sm text-[#4f4f4f]">{item.text}</p>
                <p className="mt-4 text-sm font-semibold">{item.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8">
          <h2 className="mb-6 text-center text-3xl font-semibold">
            Preguntas frecuentes
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((question) => (
              <div
                key={question}
                className="rounded-xl border border-[#e7e3dc] px-4 py-3 text-sm"
              >
                {question}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-[#1d1d1d] py-10 text-[#d3d3d3]">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 px-4 text-sm sm:px-6 md:flex-row lg:px-8">
          <p>FurniSphere - Muebles para cada espacio de tu hogar.</p>
          <p>Suscribete al newsletter para ofertas semanales.</p>
        </div>
      </footer>
    </div>
  );
}
