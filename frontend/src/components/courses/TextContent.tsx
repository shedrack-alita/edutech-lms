'use client'

interface TextContentProps {
    content: string;
}

export default function TextContent({ content }: TextContentProps) {
    return (
        <div className="bg-white rounded-lg p-8 shadow-sm">
            <div
                className="prose prose-slate max-w-none
          prose-headings:text-[#1b161f] 
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
          prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-[#9f2c0f] prose-a:no-underline hover:prose-a:underline
          prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
          prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
          prose-li:text-gray-700 prose-li:mb-1
          prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
          prose-blockquote:border-l-4 prose-blockquote:border-[#9f2c0f] prose-blockquote:pl-4 prose-blockquote:italic
        "
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
}