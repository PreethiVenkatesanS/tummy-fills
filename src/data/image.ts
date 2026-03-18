export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'quick' | 'prebook';
  tag?: string;
}



export const galleryImages = [
  {
    id: 'g1',
    url: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80',
    title: 'Birthday Cake',
  },
  {
    id: 'g2',
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
    title: 'Chocolate Cookies',
  },
  {
    id: 'g3',
    url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80',
    title: 'Macaron Tower',
  },
  {
    id: 'g4',
    url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80',
    title: 'Fresh Pastries',
  },
  {
    id: 'g5',
    url: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600&q=80',
    title: 'Brownie Box',
  },
  {
    id: 'g6',
    url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
    title: 'Cupcakes',
  },
  {
    id: 'g7',
    url: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600&q=80',
    title: 'Puff Pastry',
  },
  {
    id: 'g8',
    url: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80',
    title: 'Layer Cake',
  },
  {
    id: 'g9',
    url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&q=80',
    title: 'Donuts',
  },
];
