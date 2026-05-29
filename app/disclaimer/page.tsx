"use client";
import React, { memo } from "react";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

export default memo(function Page() {
  return (
    <div className="bg-[#f3e9dd]">

      {/* HERO SECTION */}
      <VideoHeroSection className="min-h-[70vh]">
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-60">
          <h1 className="text-5xl font-bold mb-2">Disclaimer</h1>
          <p className="text-lg max-w-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Facilis excepturi sed ab aut tempora vitae.
          </p>
        </div>
      </VideoHeroSection>

      {/* CONTENT SECTION */}
      <div className="max-w-screen-2xl mx-auto py-10 px-12">
        <h2 className="font-bold text-3xl mb-4">Disclaimer</h2>

        <p className="mb-4">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
          Mollitia laborum laboriosam vero eaque. Corporis ipsam omnis asperiores sint rem? Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum atque ea iure saepe nobis accusamus magnam sint magni doloribus at! Quasi amet similique neque sunt ad laboriosam ipsam qui, quaerat aperiam nulla ab odio sequi nemo velit explicabo temporibus adipisci veniam voluptates sed quas? Magni, dolores. Ex molestias dolorem quo, magni unde, voluptatum doloremque ab, praesentium aliquam dicta atque reiciendis autem suscipit incidunt odio! Perferendis, iste voluptates est, quia cupiditate porro in veritatis iure neque voluptate odio! Vitae natus sapiente corporis voluptatibus rerum neque itaque, consequatur excepturi suscipit! Laborum nesciunt deleniti, ut voluptatum quas pariatur doloribus nihil itaque iure error.
        </p>

        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
          Ad autem earum eligendi excepturi fugit voluptates dignissimos.
        </p>

        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. 
          Labore deleniti totam sunt in illo itaque sed neque perferendis.
        </p>
      </div>

    </div>
  );
});
