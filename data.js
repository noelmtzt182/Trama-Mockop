/* Catálogo de ejemplo. Lo usan el sitio (window.TRAMA) y la función /api/ia (require). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TRAMA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var BRANDS = [
    { id: 'casa-norte', name: 'Casa Norte', city: 'Monterrey', color: '#B5461F', bio: 'Básicos de lino y algodón en lotes pequeños.' },
    { id: 'hilo-y-barro', name: 'Hilo y Barro', city: 'Guadalajara', color: '#2F4B3C', bio: 'Joyería con barro y metal reciclado.' },
    { id: 'mezquite', name: 'Mezquite Studio', city: 'Saltillo', color: '#7A5C2E', bio: 'Bolsos y cinturones de piel curtida vegetal.' },
    { id: 'patitas', name: 'Patitas del Norte', city: 'Monterrey', color: '#3B4A7A', bio: 'Accesorios y snacks para perros y gatos.' },
    { id: 'sazon', name: 'Sazón de Barrio', city: 'Puebla', color: '#A8322D', bio: 'Salsas, mermeladas y botanas artesanales.' },
    { id: 'rincon-verde', name: 'Rincón Verde', city: 'Querétaro', color: '#4C6B3A', bio: 'Macetas de barro y velas de soya.' }
  ];

  var PRODUCTS = [
    { id: 'p1', brand: 'casa-norte', name: 'Camisa de lino Arena', cat: 'Moda', price: 890, sizes: ['S', 'M', 'L'], tone: '#E3D3B4', tags: 'lino camisa fresca verano hombre mujer' },
    { id: 'p2', brand: 'casa-norte', name: 'Playera de algodón Noche', cat: 'Moda', price: 420, sizes: ['S', 'M', 'L', 'XL'], tone: '#C9CFE0', tags: 'algodon playera camiseta basica' },
    { id: 'p3', brand: 'casa-norte', name: 'Overshirt Ladrillo', cat: 'Moda', price: 1190, sizes: ['M', 'L'], tone: '#E5B9A5', tags: 'overshirt chamarra ligera otono' },
    { id: 'p4', brand: 'hilo-y-barro', name: 'Anillo Cántaro', cat: 'Joyería', price: 380, sizes: ['6', '7', '8'], tone: '#D9E3D2', tags: 'anillo joya barro regalo mujer' },
    { id: 'p5', brand: 'hilo-y-barro', name: 'Aretes Olla', cat: 'Joyería', price: 290, sizes: ['Único'], tone: '#F0DDB8', tags: 'aretes arracadas joya regalo mujer' },
    { id: 'p6', brand: 'hilo-y-barro', name: 'Collar Gota', cat: 'Joyería', price: 520, sizes: ['Único'], tone: '#E9D2D2', tags: 'collar dije joya regalo mujer' },
    { id: 'p7', brand: 'mezquite', name: 'Bolso Tote Curtido', cat: 'Accesorios', price: 1450, sizes: ['Único'], tone: '#E0C9A6', tags: 'bolso tote piel cuero bolsa mujer' },
    { id: 'p8', brand: 'mezquite', name: 'Cinturón Trenzado', cat: 'Accesorios', price: 560, sizes: ['85', '95', '105'], tone: '#D8B58E', tags: 'cinturon cinto piel hombre regalo' },
    { id: 'p9', brand: 'mezquite', name: 'Cartera Doblez', cat: 'Accesorios', price: 480, sizes: ['Único'], tone: '#CDB8A0', tags: 'cartera billetera piel hombre mujer regalo' },
    { id: 'p10', brand: 'patitas', name: 'Collar de lona para perro', cat: 'Mascotas', price: 240, sizes: ['Chico', 'Mediano', 'Grande'], tone: '#C4CCE3', tags: 'perro collar lona paseo' },
    { id: 'p11', brand: 'patitas', name: 'Cama redonda para gato', cat: 'Mascotas', price: 650, sizes: ['Chica', 'Grande'], tone: '#E6D5E0', tags: 'gato cama descanso' },
    { id: 'p12', brand: 'patitas', name: 'Galletas de avena para perro', cat: 'Mascotas', price: 120, sizes: ['Bolsa 200 g', 'Bolsa 500 g'], tone: '#EBDCB9', tags: 'perro galletas premio snack avena' },
    { id: 'p13', brand: 'sazon', name: 'Salsa macha', cat: 'Alimentos', price: 150, sizes: ['Frasco 220 ml'], tone: '#EBB9A8', tags: 'picante salsa chile morita macha botana' },
    { id: 'p14', brand: 'sazon', name: 'Mermelada de higo', cat: 'Alimentos', price: 130, sizes: ['Frasco 250 g'], tone: '#E0C4D3', tags: 'dulce mermelada higo desayuno regalo' },
    { id: 'p15', brand: 'sazon', name: 'Botana de nopal', cat: 'Alimentos', price: 90, sizes: ['Bolsa 80 g'], tone: '#CFE0C0', tags: 'botana snack nopal saludable' },
    { id: 'p16', brand: 'rincon-verde', name: 'Maceta de barro Mini', cat: 'Hogar', price: 210, sizes: ['Chica', 'Mediana'], tone: '#E3C8B0', tags: 'planta maceta barro decoracion regalo' },
    { id: 'p17', brand: 'rincon-verde', name: 'Vela de soya Cedro', cat: 'Hogar', price: 280, sizes: ['Único'], tone: '#DAE2CB', tags: 'vela soya aroma cedro regalo relajante decoracion' }
  ];

  var CATS = ['Moda', 'Joyería', 'Accesorios', 'Mascotas', 'Alimentos', 'Hogar'];

  return { BRANDS: BRANDS, PRODUCTS: PRODUCTS, CATS: CATS };
});
