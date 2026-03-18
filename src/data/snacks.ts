export interface Snack {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Cookies' | 'Chips' | 'Sweets' | 'Savories' | 'Sandwich' | 'Fries' | 'Brownies' | 'Rolls';
  image: string;
  isPopular?: boolean;
}

export const snacks: Snack[] = [
  {
    id: '1',
    name: 'Veg Sandwich',
    description: 'Double-decker sandwich with fresh veggies, cheese, and our secret sauce.',
    price: 150,
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    isPopular: false
  },
  {
    id: '2',
    name: 'Panner Sandwich',
    description: 'Double-decker sandwich with fresh veggies, cheese, and our secret sauce.',
    price: 150,
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    isPopular: true
  },
  {
    id: '3',
    name: 'Cheese Toast',
    description: 'Double-decker sandwich with fresh veggies, cheese, and our secret sauce.',
    price: 150,
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    isPopular: false
  },
  {
    id: '4',
    name: 'Cheese Chili Toast',
    description: 'Double-decker sandwich with fresh veggies, cheese, and our secret sauce.',
    price: 150,
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    isPopular: false
  },
  {
    id: '5',
    name: 'Egg Sandwich',
    description: 'Double-decker sandwich with fresh veggies, cheese, and our secret sauce.',
    price: 150,
    category: 'Sandwich',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
    isPopular: false
  },
  {
    id:'6',
    name:'French Fries',
    description:'Golden crispy fries seasoned with sea salt and herbs.',
    price:90,
    category:'Fries',
    image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
    isPopular:false,
  },
  {
    id:'7',
    name:'Masala Fries',
    description:'Golden crispy fries seasoned with sea salt and herbs.',
    price:90,
    category:'Fries',
    image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
    isPopular:false
  },
  {
    id:'8',
    name:'Browine',
    description:'Golden crispy fries seasoned with sea salt and herbs.',
    price:90,
    category:'Brownies',
    image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
    isPopular:true
  },
  {
    id:'9',
    name:'Paneer Tikka Roll',
    description:'Soft paratha rolled with spicy grilled paneer and mint chutney.',
    price:130,
    category:'Rolls',
    image:'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&q=80&w=400',
    isPopular:false,
  },
  {
    id:'10',
    name:'Veg Roll',
    description:'Soft paratha rolled with spicy grilled paneer and mint chutney.',
    price:130,
    category:'Rolls',
    image:'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&q=80&w=400',
    isPopular:false,
  },
  {
    id:'11',
    name:'Corn Roll',
    description:'Soft paratha rolled with spicy grilled paneer and mint chutney.',
    price:130,
    category:'Rolls',
    image:'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&q=80&w=400',
    isPopular:false,
  }
];
