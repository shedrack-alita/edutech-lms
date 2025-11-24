'use client'

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
    // Extract YouTube video ID if it's a YouTube URL
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const youtubeId = getYouTubeId(videoUrl);

    // If it's a YouTube URL, use YouTube embed
    if (youtubeId) {
        return (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    // For other video URLs (direct links, Vimeo, etc.)
    return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video
                className="w-full h-full"
                controls
                src={videoUrl}
                title={title}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}