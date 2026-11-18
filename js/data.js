/* Datos de ejemplo — editá acá el catálogo de la maqueta. Solo se venden pantalones. */
const COLORS = {
  celeste: { n: "Celeste", h: "#69BEFF" },
  rosa:    { n: "Rosa",    h: "#FF8FF4" },
  gris:    { n: "Gris",    h: "#D9D9D9" },
  negro:   { n: "Negro",   h: "#000000" },
  blanco:  { n: "Blanco",  h: "#FFFFFF" },
  verde:   { n: "Verde",   h: "#69A559" }
};

// Estilos de pantalón (orden = orden del menú)
const STYLES = {
  vivo:       "Vivo lateral",
  lisos:      "Lisos",
  manchados:  "Manchados",
  camuflados: "Camuflados"
};
const PUBLICO = { adultos: "Adultos", ninos: "Niños" };
const SIZES = { adultos: ["S", "M", "L", "XL"], ninos: ["4", "6", "8", "10", "12"] };

// price = precio de lista · old = precio anterior · tr = precio por transferencia
const PRODUCTS = [
  { id: 1,  name: "Pantalon de danza",  pub: "adultos", style: "lisos",      price: 30000, old: 34000, tr: 28000, colors: ["celeste", "rosa", "gris"],   pop: 1 },
  { id: 2,  name: "Pantalon recto",     pub: "adultos", style: "lisos",      price: 26000,            tr: 24200, colors: ["negro", "blanco", "verde"],  pop: 1 },
  { id: 3,  name: "Pantalon con vivo",  pub: "adultos", style: "vivo",       price: 32000, old: 36000, tr: 29800, colors: ["negro", "rosa", "celeste"],  pop: 1 },
  { id: 4,  name: "Vivo bicolor",       pub: "ninos", style: "vivo",       price: 34000,            tr: 31600, colors: ["negro", "blanco", "verde"],  pop: 1 },
  { id: 5,  name: "Manchado clasico",  pub: "adultos", style: "manchados",  price: 31000, old: 35000, tr: 28800, colors: ["gris", "negro", "celeste"],  look: 1 },
  { id: 6,  name: "Manchado urbano",    pub: "ninos", style: "manchados",  price: 33000,            tr: 30700, colors: ["negro", "gris", "rosa"],     look: 1 },
  { id: 7,  name: "Camuflado clasico",  pub: "adultos", style: "camuflados", price: 35000, old: 39000, tr: 32500, colors: ["verde", "gris", "negro"],    pop: 1 },
  { id: 8,  name: "Camuflado cargo",    pub: "adultos", style: "camuflados", price: 38000,            tr: 35300, colors: ["verde", "negro", "gris"],    look: 1 },
  { id: 9,  name: "Pantalon jogger",    pub: "adultos", style: "lisos",      price: 28000, old: 32000, tr: 26000, colors: ["gris", "negro", "blanco"],   look: 1 },
  { id: 10, name: "Vivo clasico",       pub: "ninos", style: "vivo",       price: 30000,            tr: 27900, colors: ["negro", "celeste", "rosa"],  look: 1 },
  { id: 11, name: "Manchado suave",     pub: "adultos", style: "manchados",  price: 29000, old: 33000, tr: 27000, colors: ["rosa", "celeste", "gris"] },
  { id: 12, name: "Camuflado gris",     pub: "ninos", style: "camuflados", price: 36000,            tr: 33400, colors: ["gris", "negro", "verde"] }
];

// Orden de las filas del inicio (las dos filas arrancan desde la primera tarjeta)
const HOME_POPULAR = [1, 2, 3, 4, 7];
const HOME_PUESTA = [5, 6, 8, 10];

const STORE = {
  name: "DF urbano",
  address: "Yerbal 2816",
  city: "Caba, Buenos Aires",
  hours: "Lun a Vie 9 a 18:30",
  wa: "5491100000000",           // número de ejemplo
  shipping: 4500,
  freeShippingFrom: 80000
};
