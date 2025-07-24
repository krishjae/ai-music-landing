import React from 'react';

const AboutCard = () => {
  return (
    <div className="group relative h-96 w-72 [perspective:1000px] mx-auto mt-10">
      <div className="absolute duration-1000 w-full h-full [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)]">
        <div className="absolute w-full h-full rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 p-6 text-white [backface-visibility:hidden]">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div className="text-3xl font-bold">Interactive AI</div>
              <div className="text-5xl">🌟</div>
            </div>
            <div className="mt-4">
              <p className="text-lg">
                Explore our cutting-edge AI features — effortless, intuitive, and musical.
              </p>
            </div>
            <div className="mt-auto">
              <p className="text-sm opacity-75">Hover to flip!</p>
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 p-6 text-white [transform:rotateX(180deg)] [backface-visibility:hidden]">
          <div className="flex flex-col h-full">
            <div className="text-2xl font-bold mb-4">More Insights</div>
            <div className="flex-grow">
              <p className="text-lg">
                Dive deeper into how AI revolutionizes learning music in your own flow.
              </p>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                Explore
              </button>
              <span className="text-3xl">✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCard;
