/* The wall of finished renders in the film's closing scenes. The design inlines
   these as data URLs (film/tiles.js) so its video exporter can serialize them;
   here they are ordinary static assets. */
export const TILES: Record<string, string> = {
  fourier: "/film/fourier.jpg",
  lorenz: "/film/lorenz.jpg",
  phyllo: "/film/phyllo.jpg",
  mandel: "/film/mandel.jpg",
  julia: "/film/julia.jpg",
  turing: "/film/turing.jpg",
  galaxy: "/film/galaxy.jpg",
  hilbert: "/film/hilbert.jpg",
  apollonian: "/film/apollonian.jpg",
};
