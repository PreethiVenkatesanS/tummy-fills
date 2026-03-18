import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-12 border-t border-zinc-100 bg-gray-200 p-5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-brand-dark mb-2 font-outfit">
              Tummy <span className="text-orange-500">Fills</span>
            </h2>
            <p className="text-zinc-500 font-poppins text-sm italic">"Baking memories, one treat at a time."</p>
          </div>
          
          {/* <div className="flex gap-6">
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
              <span className="font-bold">Ig</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
              <span className="font-bold">Fb</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
              <span className="font-bold">Tw</span>
            </a>
          </div> */}
        </div>

        <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-400">
          <p>© 2026 Tummy Fills Cloud Kitchen. All rights reserved.</p>
          {/* <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Contact Support</a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
