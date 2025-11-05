import React from 'react';

/**
 * Utility function to convert standard YouTube links to the embed format.
 * This makes the VideoCard component robust to different link inputs.
 */
const getEmbedUrl = (link) => {
  if (!link) return null;

  // Check for standard YouTube watch URL pattern: ?v=VIDEO_ID
  const watchMatch = link.match(/[?&]v=([^&]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Check for YouTube share/short URL pattern: youtu.be/VIDEO_ID
  const shortMatch = link.match(/youtu\.be\/([^?]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // If it's already an embed link, return it as is
  return link;
};

/**
 * A reusable component for displaying a video card.
 */
const VideoCard = ({ imageUrl, imageAlt, title, channel, description, videoLink }) => {

  // 1. Process the incoming link to get the reliable embed URL
  console.log("Original Video Link:", videoLink);
  const actualVideoLink = getEmbedUrl(videoLink);
  console.log("Processed Video Link:", actualVideoLink);
  console.log("Processed Video Link:", actualVideoLink);
  // 2. Check if the processed link can be embedded
  // We only embed if the link is specifically a YouTube embed link
  const isEmbedLink = actualVideoLink && actualVideoLink.includes('youtube.com/embed/');

  if (isEmbedLink) {
    // RENDER 1: Embedded Video Player (for YouTube embed links)
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* The 16/9 aspect-ratio trick for responsive video */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={actualVideoLink} // Use the processed, reliable embed link
            title={title}
            frameBorder="0"
            // Ensure necessary permissions are allowed
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">by {channel}</p>
          <p className="text-gray-700 flex-grow">{description}</p>
        </div>
      </div>
    );
  }

  // RENDER 2: Link-out Card (Fallback for links that can't be embedded)
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition duration-300">
      <img src={imageUrl} alt={imageAlt} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">by {channel}</p>
        <p className="text-gray-700 mb-4 flex-grow">{description}</p>
        <iframe
            className="w-full md:w-1/2 aspect-video rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            src={`https://www.youtube.com/embed/${video.key}`}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          Watch Vide
      </div>
    </div>
  );
};

export default VideoCard;



// return (
//     <div className="text-white flex flex-col px-6 md:px-12 space-y-10">
//       {data.map((video) => (
//         <div
//           key={video.id}
//           className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-gray-700 pb-8"
//         >
//           <iframe
//             className="w-full md:w-1/2 aspect-video rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
//             src={`https://www.youtube.com/embed/${video.key}`}
//             title={video.name}
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           />
//           <div className="w-full md:w-1/2">
//             <h3 className="text-xl md:text-2xl font-semibold mb-2">{video.name}</h3>
//             <p className="text-sm text-gray-400">Type: {video.type} | Site: {video.site}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MovieVideos;
