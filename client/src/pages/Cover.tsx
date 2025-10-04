import React from "react";

export const Cover = (): JSX.Element => {
  return (
    <div className="bg-indigo-500 overflow-hidden w-full min-w-[1920px] min-h-[960px] flex gap-14">
      <section className="mt-14 w-[800px] h-[2701px] relative ml-[143px]">
        <img
          className="top-[424px] left-[2841px] h-[901px] absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-3.png"
        />

        <img
          className="top-[900px] left-0 h-1 absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-4.png"
        />

        <img
          className="top-0 left-0 h-[900px] absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-5.png"
        />
      </section>

      <section className="mt-[-1797px] w-[800px] h-[2701px] relative">
        <img
          className="top-[1800px] left-0 h-[901px] absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-3.png"
        />

        <img
          className="top-[1797px] left-0 h-[3px] absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-4.png"
        />

        <img
          className="top-[2277px] left-[1985px] h-[900px] absolute w-[800px] object-cover"
          alt="Image"
          src="/figmaAssets/image-5.png"
        />
      </section>
    </div>
  );
};
